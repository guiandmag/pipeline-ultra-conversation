// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true*/

const ConversationPanel = (function () {
  const settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.from-user',
      fromWatson: '.from-watson',
      latest: '.latest',
    },
    authorTypes: {
      user: 'user',
      watson: 'watson',
    },
  };

  // Publicly accessible methods defined
  return {
    init,
    inputKeyDown,
    inputSend
  };

  // Initialize the module
  function init() {
    chatUpdateSetup();
    Api.sendRequest('', null);
    setupInputBox();
  }
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup() {
    const currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function (newPayloadStr) {
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.user);
    };

    const currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function (newPayloadStr) {
      currentResponsePayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.watson);
    };
  }

// Set up the input box to underline text as it is typed
  // This is done by creating a hidden dummy version of the input box that
  // is used to determine what the width of the input text should be.
  // This value is then used to set the new width of the visible input box.
  function setupInputBox() {
    const input = document.getElementById('textInput');
    let dummy = document.getElementById('textInputDummy');
    const minFontSize = 14;
    const maxFontSize = 16;
    const minPadding = 4;
    const maxPadding = 6;

    // If no dummy input box exists, create one
    if (dummy === null) {
      const dummyJson = {
        tagName: 'div',
        attributes: [{
          name: 'id',
          value: 'textInputDummy',
        }],
      };

      dummy = Common.buildDomElement(dummyJson);
      document.body.appendChild(dummy);
    }


    // Any time the input changes, or the window resizes, adjust the size of the input box


    // Trigger the input event once to set up the input box and dummy element
    Common.fireEvent(input, 'input');
  }

  // Display a user or Watson message that has just been sent/received
  function displayMessage(newPayload, typeValue) {
    const isUser = isUserMessage(typeValue);
    const textExists = (newPayload.input && newPayload.input.text)
      || (newPayload.output && newPayload.output.text);
    if (isUser !== null && textExists) {
      // Create new message DOM element
      const messageDivs = buildMessageDomElements(newPayload, isUser);
      const chatBoxElement = document.querySelector(settings.selectors.chatBox);
      const previousLatest = chatBoxElement.querySelectorAll((isUser
              ? settings.selectors.fromUser : settings.selectors.fromWatson)
              + settings.selectors.latest);
      // Previous "latest" message is no longer the most recent
      if (previousLatest) {
        Common.listForEach(previousLatest, (element) => {
          element.classList.remove('latest');
        });
      }

      messageDivs.forEach((currentDiv) => {
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
    let textArray = isUser ? newPayload.input.text : newPayload.output.text;
    if (Object.prototype.toString.call(textArray) !== '[object Array]') {
      textArray = [textArray];
    }
    const messageArray = [];

    textArray.forEach((currentText) => {
      if (currentText) {
        const messageJson = {
          // <div class='segments'>
          tagName: 'div',
          classNames: ['segments'],
          children: [{
            // <div class='from-user/from-watson latest'>
            tagName: 'div',
            classNames: [(isUser ? 'from-user' : 'from-watson'), 'latest', ((messageArray.length === 0) ? 'top' : 'sub')],
            children: [{
              // <div class='message-inner'>
              tagName: 'div',
              classNames: ['message-inner'],
              children: [{
                // <p>{messageText}</p>
                tagName: 'p',
                text: currentText,
              }],
            }],
          }],
        };
        messageArray.push(Common.buildDomElement(messageJson));
      }
    });

    return messageArray;
  }

  // Scroll to the bottom of the chat window (to the most recent messages)
  // Note: this method will bring the most recent user message into view,
  //   even if the most recent message is from Watson.
  //   This is done so that the "context" of the conversation is maintained in the view,
  //   even if the Watson message is long.
  function scrollToChatBottom() {
    const scrollingChat = document.querySelector('#scrollingChat');

    // Scroll to the latest message sent by the user
    const scrollEl = scrollingChat.querySelector(settings.selectors.fromUser
            + settings.selectors.latest);
    if (scrollEl) {
      scrollingChat.scrollTop = scrollEl.offsetTop;
    }
  }

  function inputSend(inputBox) {
    if (inputBox.value.trim()) {
      // Retrieve the context from the previous server response
      let context;
      const latestResponse = Api.getResponsePayload();
      if (latestResponse) {
        context = latestResponse.context;
      }

      // Send the user message
      Api.sendRequest(inputBox.value, context);

      // Clear input box for further messages
      inputBox.value = '';
      Common.fireEvent(inputBox, 'input');
    }
  }

  // Handles the submission of input
  function inputKeyDown(event, inputBox) {
    // Submit on enter key, dis-allowing blank messages
    if (event.keyCode === 13) {
      inputSend(inputBox);
    }
  }
}());