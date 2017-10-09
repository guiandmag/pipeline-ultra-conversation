// The Common module is designed as an auxiliary module
// to hold functions that are used in multiple other modules
/* eslint no-unused-vars: "off" */
/* global document*/
/* exported Common*/

!function(a,b){"use strict";"function"==typeof define&&define.amd?define([],b):"object"==typeof exports?module.exports=b():a.Timer=b()}(this,function(){"use strict";function a(){c.call(this),this._.status="stopped",b.call(this,"onend")}function b(a){var b=this._.options[a],c=[].slice.call(arguments,1);"function"==typeof b&&b.apply(this,c)}function c(a){clearTimeout(this._.timeout),clearInterval(this._.interval),a===!0&&(this._.duration=0)}var d={tick:1,onstart:null,ontick:null,onpause:null,onstop:null,onend:null},e=function(a){if(!(this instanceof e))return new e(a);this._={id:+new Date,options:{},duration:0,status:"initialized",start:0,measures:[]};for(var b in d)this._.options[b]=d[b];this.options(a)};return e.prototype.start=function(c){return+c||this._.duration?(c&&(c*=1e3),this._.timeout&&"started"===this._.status?this:(this._.duration=c||this._.duration,this._.timeout=setTimeout(a.bind(this),this._.duration),"function"==typeof this._.options.ontick&&(this._.interval=setInterval(function(){b.call(this,"ontick",this.getDuration())}.bind(this),1e3*+this._.options.tick)),this._.start=+new Date,this._.status="started",b.call(this,"onstart",this.getDuration()),this)):this},e.prototype.pause=function(){return"started"!==this._.status?this:(this._.duration-=+new Date-this._.start,c.call(this,!1),this._.status="paused",b.call(this,"onpause"),this)},e.prototype.stop=function(){return/started|paused/.test(this._.status)?(c.call(this,!0),this._.status="stopped",b.call(this,"onstop"),this):this},e.prototype.getDuration=function(){return"started"===this._.status?this._.duration-(+new Date-this._.start):"paused"===this._.status?this._.duration:0},e.prototype.getStatus=function(){return this._.status},e.prototype.options=function(a,b){if(a&&b&&(this._.options[a]=b),!b&&"object"==typeof a)for(var c in a)this._.options.hasOwnProperty(c)&&(this._.options[c]=a[c]);return this},e.prototype.on=function(a,b){return"string"!=typeof a||"function"!=typeof b?this:(/^on/.test(a)||(a="on"+a),this._.options.hasOwnProperty(a)&&(this._.options[a]=b),this)},e.prototype.off=function(a){return"string"!=typeof a?this:(a=a.toLowerCase(),"all"===a?(this._.options=d,this):(/^on/.test(a)||(a="on"+a),this._.options.hasOwnProperty(a)&&(this._.options[a]=d[a]),this))},e.prototype.measureStart=function(a){return this._.measures[a||""]=+new Date,this},e.prototype.measureStop=function(a){return+new Date-this._.measures[a||""]},e});

var startTime;
var endTime;
var lastTime = Date.now();
var timer = new Timer();
var tempoInatividade = 600; // 300s = 5min

// Verificação por tempo
function finalizarInatividade() {
  // Encerrar
  endTime = Date.now();
  swal({
        title: "<span style='font-size: 25px; color: #00478b;'>Conversa finalizada</span>",
        html: "<span style='color: #00478b;'>A conversa foi finalizada devido ao tempo de inatividade.</span>",
        confirmButtonColor: "#f79125",
        allowOutsideClick: false,
        imageUrl: "../images/atencao.gif"
  }).then(function() {
    onClickPesquisa(true);
  });
}

function finalizarTchau() {
  // Encerrar
  endTime = Date.now();
  if (timer.getStatus() == 'started') {
    timer.stop();
  }
  swal({
        title: "<span style='font-size: 25px; color: #00478b;'>Conversa finalizada</span>",
        html: "<span style='color: #00478b;'>O Senac agradece seu contato!</span>",
        confirmButtonColor: "#f79125",
        allowOutsideClick: false
  }).then(function() {
    onClickPesquisa(true);
  });
}


(function($){

  var enviaTexto = {
    interface : {
      botaoEnviarTexto : function() {
        $('#enviarTexto').click(function(){
          ConversationPanel.inputKeyDown({keyCode : 13}, document.getElementsByClassName("query-input")[0]);
        });
      }
    }
  }

  var finalizarConversa = {
    interface : {
      clicarBotao : function() {
        $('#finalizar').click(function(){
          swal({
          title: "<span style='font-size: 25px; color: #00478b;'>Você tem certeza que deseja encerrar o chat?</span>",
          showCancelButton: true,
          confirmButtonColor: "#f79125",
          confirmButtonText: "ENCERRAR",
          cancelButtonText: "VOLTAR",
          cancelButtonColor: "#113B65",
          imageUrl: "../images/atencao.gif",
          html: false
          }).then(function() {
            onClickPesquisa();
          });
        });
      }
    }
  }

  var falarTexto = {
    interface : {
      clicarBotaoAudio : function() {
        $(".speaker").click(function(){
        console.log($(".speaker"));
          // onClickBotaoAudio();
        });
      }
    }
  }

  $('.audiojs').hide();
  $('.modal').modal();

  enviaTexto.interface.botaoEnviarTexto();
  finalizarConversa.interface.clicarBotao(); 
  falarTexto.interface.clicarBotaoAudio(); 

}(jQuery));

function onClickPesquisa(end) {
  if ( end == undefined || end == false ) {
    timer.stop();
    endTime = new Date();
  }
  $('.chat-column').hide();
  $('.fixed-column').hide();
  var pesquisa = $('.template#pesquisa').clone();
  pesquisa.removeClass('template');
  $('#chat-column-holder').append(pesquisa);
}

function enviarFeedback(div) {
  event.preventDefault()
  Api.enviarFeedback(div);
  location.reload();
}

function onClickBotaoAudioPause() {
  var audio = document.getElementById('myAudioElement');

  $('.speaker-onclick').toggleClass('speaker-onclick speaker-hide');
  $('.speaker').show();
  audio.pause();
}

function onClickBotaoAudio(){
  Api.sendTextToAudio();
  var audio = document.getElementById('myAudioElement');

  $('.speaker').hide();
  $('.speaker-hide').toggleClass('speaker-hide speaker-onclick');

  audio.play();
  audio.onended = function(){
      $('.speaker-onclick').toggleClass('speaker-onclick speaker-hide');
      $('.speaker').show();
  }
}

var Common = (function() {


  // Take in JSON object and build a DOM element out of it
  // (Limited in scope, cannot necessarily create arbitrary DOM elements)
  // JSON Example:
  //  {
  //    "tagName": "div",
  //    "text": "Hello World!",
  //    "className": ["aClass", "bClass"],
  //    "attributes": [{
  //      "name": "onclick",
  //      "value": "alert("Hi there!")"
  //    }],
  //    "children: [{other similarly structured JSON objects...}, {...}]
  //  }
  function buildDomElementFromJson(domJson) {
    // Create a DOM element with the given tag name
    var feedback = false;
    var element = document.createElement(domJson.tagName);


    // Fill the "content" of the element
    if (domJson.text) {
      element.innerHTML = domJson.text;
    } else if (domJson.html) {
      element.insertAdjacentHTML('beforeend', domJson.html);
    }

    // Add classes to the element
    if (domJson.classNames) {
      for (var i = 0; i < domJson.classNames.length; i++) {
        if(domJson.classNames[i] === 'feedback') feedback = true;
        element.classList.add(domJson.classNames[i]);
      }
    }
    // Add attributes to the element
    if (domJson.attributes) {
      for (var j = 0; j < domJson.attributes.length; j++) {
        var currentAttribute = domJson.attributes[j];
        element.setAttribute(currentAttribute.name, currentAttribute.value);
      }
    }
    // Add children elements to the element
    if (domJson.children) {
      for (var k = 0; k < domJson.children.length; k++) {
        var currentChild = domJson.children[k];
        element.appendChild(buildDomElementFromJson(currentChild));
      }
    }
    if(feedback) {
      element.addEventListener("click", onFeedbackClick);
    }
    return element;
  }

  function onFeedbackClick (){
    var thumbsup = false;
    var classList = this.className.split(/\s+/);
    for (var i = 0; i < classList.length; i++) {
      if (classList[i] === 'thumbsup') {
          thumbsup = true;
      }
    }
    var feedback = document.getElementsByClassName("feedback");
    for(var i = feedback.length; i > 0 ; i--){
      feedback[i-1].style.display = 'none';
    }
    Api.sendFeedback(thumbsup);
  }
  // Trigger an event to fire
  function fireEvent(element, event) {
    var evt;
    if (document.createEventObject) {
      // dispatch for IE
      evt = document.createEventObject();
      return element.fireEvent('on' + event, evt);
    }
    // otherwise, dispatch for Firefox, Chrome + others
    evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, true, true); // event type,bubbling,cancelable
    return !element.dispatchEvent(evt);
  }

  // A function that runs a for each loop on a List, running the callback function for each one
  function listForEach(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback.call(null, list[i]);
    }
  }
  
  //Publicly accessible methods defined
  return {
    buildDomElement: buildDomElementFromJson,
    fireEvent: fireEvent,
    listForEach: listForEach
  };
}());
