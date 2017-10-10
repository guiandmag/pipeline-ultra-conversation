// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true*/
/* global document, window*/
/* exported ConversationPanel*/
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

var initial = true;
var contextoLocal = {};

var escape = function(str) {
  return (str.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;')
        .replace(/`/g, '&#96;'));
}

var ConversationPanel = (function() {
  var settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.from-user',
      fromWatson: '.from-watson',
      latest: '.latest',
      textInputLocation: '#textInputLocation',
      loginSection: '#loginSection',
      conversationSection: '#conversationSection',
      textInputOne: '#textInputOne'
    },
    authorTypes: {
      user: 'user',
      watson: 'watson'
    }
  };

  // Publicly accessible methods defined
  return {
    init: init,
    inputKeyDown: inputKeyDown,
    btnClicked: btnClicked,
    menuClicked: menuClicked
  };

  // Initialize the module
  function init() {
    chatUpdateSetup();
    Api.sendRequest( null, null );

    initial = false;
    setupInputBox();
  }
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup() {
    var currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function(newPayloadStr) {
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.user);
    };

    var currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function(newPayloadStr) {
      currentResponsePayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.watson);
    };
  }

  function setupInputBox() {
    var input = document.getElementById('textInput');
    var dummy = document.getElementById('textInputDummy');
    var padding = 3;

    if (dummy === null) {
      var dummyJson = {
        'tagName': 'div',
        'attributes': [{
          'name': 'id',
          'value': 'textInputDummy'
        }]
      };

      dummy = Common.buildDomElement(dummyJson);
      ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'].forEach(function(index) {
            if(input !== null) {
               dummy.style[index] = window.getComputedStyle( input, null ).getPropertyValue( index );
            }
      });

      document.body.appendChild(dummy);
    }

    if(input !== null) {
        input.addEventListener('input', function() {
              if (this.value === '') {
                this.classList.remove('underline');
                this.setAttribute('style', 'width:' + '100%');
                this.style.width = '100%';
              } else {
                this.classList.add('underline');
                var txtNode = document.createTextNode(escape(this.value));
                dummy.textContent = escape(txtNode.textContent);
                var widthValue = ( dummy.offsetWidth + padding) + 'px';
                this.setAttribute('style', 'width:' + widthValue);
                this.style.width = widthValue;
              }
            });
        Common.fireEvent(input, 'input');
    }
  }

  // Display a user or Watson message that has just been sent/received
  function displayMessage(newPayload, typeValue) {
    if (initial)
      return;
    var isUser = isUserMessage(typeValue);
    var textExists = (newPayload.input && newPayload.input.text)
      || (newPayload.output && newPayload.output.text);
    if (isUser !== null && textExists) {
      // Create new message DOM element
      var messageDivs = buildMessageDomElements(newPayload, isUser);
      var chatBoxElement = document.querySelector(settings.selectors.chatBox);
      var previousLatest = chatBoxElement.querySelectorAll((isUser
              ? settings.selectors.fromUser : settings.selectors.fromWatson)
              + settings.selectors.latest);
      // Previous "latest" message is no longer the most recent
      if (previousLatest) {
        Common.listForEach(previousLatest, function(element) {
          element.classList.remove('latest');
        });
      }

      messageDivs.forEach(function(currentDiv) {
        chatBoxElement.appendChild(currentDiv);
        // Class to start fade in animation
        currentDiv.classList.add('load');
      });
      // Move chat to the most recent messages when new messages are added
      scrollToChatBottom();
    }
  }

  // Checks if the given typeValue matches with the user "name", the Watson "name", or neither
  // Returns true if user, false if Watson, and null if neither
  // Used to keep track of whether a message was from the user or Watson
  function isUserMessage(typeValue) {
    if (typeValue === settings.authorTypes.user) {
      return true;
    } else if (typeValue === settings.authorTypes.watson) {
      return false;
    }
    return null;
  }

  // Constructs new DOM element from a message payload
  function buildMessageDomElements(newPayload, isUser) {
    var currentText = isUser ? newPayload.input.text : newPayload.output.text;
    if (Array.isArray(currentText)) {
		//currentText = currentText.join('<br/>');
		//FIX for empty string at UI
		currentText = currentText.filter(function (val) {return val;}).join('<br/>');
    }
    var messageArray = [];
    var summary = '&nbsp';
    var antigo = document.getElementsByClassName("feedback-container");
    if (antigo.length > 0) {
      if (antigo[0].parentElement)
        antigo[0].parentElement.removeChild(antigo[0]);
    }
      if (currentText) {
        var messageJson = {
          // <div class='segments'>
          'tagName': 'div',
          'classNames': ['segments'],
          'children': [{
            // <div class='from-user/from-watson latest'>
            'tagName': 'div',
            'classNames': [(isUser ? 'from-user' : 'from-watson'), 'latest', ((messageArray.length === 0) ? 'top' : 'sub')],
            'children': [{
                'tagName': 'div',
                'classNames': ['summary'],
                'text': summary
              }, {
              // <div class='message-inner'>
              'tagName': 'div',
              'classNames': ['message-inner'],
              'children': [{
                  // <p>{messageText}</p>
                  'tagName': 'p',
                  // Luis Hansen
                  'text': isUser ? escape(currentText) : currentText
              }, (newPayload.intents) ? {
                // <div id='feedback'>
                'tagName': 'div',
                'classNames': ['feedback-container'],
                'children': [
                  (newPayload.intents.length > 0) ?
                  {
                    'tagName': 'span',
                    'text': "Essa resposta foi útil? ",
                    'classNames': ['span-text', 'feedback']
                  }:{},


                  {
                    //<div class='thumbsup'>
                    'tagName': 'div',
                    'classNames': (!isUser && newPayload.intents.length > 0) ? ['feedback', 'thumbsup'] : []
                  },
                  {
                    //<div class='thumbsdown'>
                    'tagName': 'div',
                    'classNames': (!isUser && newPayload.intents.length > 0) ? ['feedback', 'thumbsdown'] : []
                  }
                ]
              } : {} ]
            }
            ]
          }]
        };
        messageArray.push(Common.buildDomElement(messageJson));
        // console.log(messageArray);
        // if (newPayload.output && newPayload.output.text[0] === "O procedimento é o seguinte: manualferias") {
        //   console.log("eita");
        //     var element = document.createElement("a");
        //     element.setAttribute("href", "/manuais/ferias.pdf");
        //     element.innerHTML="Manual";
        //     console.log(element);
        //   console.log("oi");

        //   messageArray.push(element);
        //   console.log(messageArray);
        //   // messageArray.push(() => {
        //   //   var element = document.createElement("a");
        //   //   element.setAttribute("href", "/manuais/ferias.pdf");
        //   //   element.innerHTML="Manual";
        //   //   console.log(element);
        //   //   return element
        //   // });
        // }
    }

    return messageArray;
  }

  // Scroll to the bottom of the chat window (to the most recent messages)
  // Note: this method will bring the most recent user message into view,
  //   even if the most recent message is from Watson.
  //   This is done so that the "context" of the conversation is maintained in the view,
  //   even if the Watson message is long.
  function scrollToChatBottom() {
    var scrollingChat = document.querySelector('#scrollingChat');

    // Scroll to the latest message sent by the user
    var scrollEl = scrollingChat.querySelector(settings.selectors.fromUser + settings.selectors.latest);
    if (scrollEl) {
      scrollingChat.scrollTop = scrollEl.offsetTop;
    }
  }

  // Handles the submission of input
  function inputKeyDown(event, inputBox) {
    // Submit on enter key, dis-allowing blank messages
    if (contextoLocal.encerrar)
          return
    var value = inputBox.value.trim().replace(/\n/g, "");
    if (event.keyCode === 13 && value) {
      if (!startTime)
        startTime = new Date();

      if (timer.getStatus() == 'started') {
        timer.stop();
        timer.start(tempoInatividade).on('end', function() {
          finalizarInatividade();
        });
      } else {
        timer.start(tempoInatividade).on('end', function() {
          finalizarInatividade();
        });
      }
      


      // Retrieve the context from the previous server response;
      var latestResponse = Api.getResponsePayload();
      if (latestResponse) {
        contextoLocal = latestResponse.context;
      }
      
      // Send the user message
      Api.sendRequest(value, contextoLocal);

      // Clear input box for further messages
      Common.fireEvent(inputBox, 'input');
      setTimeout(function(){
        inputBox.value = '';
      }, 1);
    }
  }

  //Handles the click event of login
  function btnClicked(event) {
    if (event.keyCode === undefined || event.keyCode === 13) {
      /*if(settings.selectors.textInputLocation.value === '') {
        return;
      }*/
      settings.selectors.loginSection.classList.add('hide');
      settings.selectors.conversationSection.classList.remove('hide');
      settings.selectors.textInputOne.focus();
    }
  }

  //Handles the click event of Menu button
  function menuClicked(event) {
    var drawer = document.getElementsByClassName('drawer')[0],
    closeDrawer = document.getElementsByClassName('close-drawer')[0];

    event.preventDefault();
      if (drawer.classList.contains('open')) {
          drawer.classList.remove('open');
      } else {
          drawer.classList.add('open');
          drawer.classList.remove('close');
      }

      closeDrawer.addEventListener('click', function(e) {
          e.preventDefault();
          drawer.classList.remove('open');
      });

  }

}());
