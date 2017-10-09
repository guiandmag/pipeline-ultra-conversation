// The Api module is designed to handle all interactions with the server
/* global XMLHttpRequest*/

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';
  var feedbackEndpoint = '/api/feedback';
  var finalFeedbackEndpoint = '/api/finalfeedback';
  var audioEndpoint = '/api/talk/';


  function sendTextToAudio(){ 
    var latestResponse = Api.getResponsePayload();
    var html = latestResponse.output.text;
    var texto = sanitizeText(html);
    var audio = document.getElementById('myAudioElement') || new Audio();
    audio.src = document.URL + "api/talk?text=" + texto;
    audio.onload = function(evt) {
        URL.revokeObjectUrl(objectUrl);
      };
    audio.play();
  }

  function sanitizeText(html){
    var textWithoutTags = removeHTMLTags(html);
    console.log(textWithoutTags);
    return removeSpecialCharacters(textWithoutTags);
  }

  function removeHTMLTags(html){
    var div = document.createElement("div");
    div.innerHTML = html;
    var texto = div.textContent || div.innerText || "";
    return texto;
  } 

  function removeSpecialCharacters(text){
    text = text + "";
    var texto = text.replace(/[()]/g, '');
    texto = texto.replace(/:\n]/g, '<break time="300ms"/>');
    texto = texto.replace(/1 [-] /g, 'Número um <break time="300ms"/>');
    texto = texto.replace(/2 [-] /g, 'Número dois <break time="300ms"/>');
    texto = texto.replace(/3 [-] /g, 'Número três <break time="300ms"/>');
    texto = texto.replace(/4 [-] /g, 'Número quatro <break time="300ms"/>');
    texto = texto.replace(/5 [-] /g, 'Número cinco <break time="300ms"/>');
    texto = texto.replace(/6 [-] /g, 'Número seis <break time="300ms"/>');
    texto = texto.replace(/7 [-] /g, 'Número sete <break time="300ms"/>');
    texto = texto.replace(/8 [-] /g, 'Número oito <break time="300ms"/>');
    texto = texto.replace(/9 [-] /g, 'Número nove <break time="300ms"/>');
    texto = texto.replace(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi, 'o link na página');
    texto = texto.replace(/:/g, '<break time="300ms"/>');
    texto = texto.replace(/;/g, '<break time="400ms"/>');
    texto = texto.replace(/-/g, '');
    texto = texto.replace(/\/inscrição/g, ',');
    texto = texto.replace(/login/g, 'loguin');
    texto = texto.replace(/;]/g, '; ');
    texto = texto.replace(/[.]/g, '<break time="500ms"/>');
    texto = texto.replace(/[,]/g, '<break time="300ms"/>');
    texto = texto.replace(/[\,][A-Z]/g, 'O');
    return texto;
  }

  function sendFeedback(thumbup){
    var latestResponse = Api.getResponsePayload();
    var payloadToFeedback = {
        intents: latestResponse.intents,
        input: latestResponse.input.text,
        output: latestResponse.output.text,
        feedback: thumbup
    }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', feedbackEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    var params = JSON.stringify(payloadToFeedback);
    http.send(params);

  }

  function enviarFeedback(div) {
    var http = new XMLHttpRequest();
    var payloadToFeedback = { pesquisaText: div.pesquisaText.value, pesquisaCheck: div.pesquisaCheck.value, ta: (endTime-startTime) };
    http.open('POST', finalFeedbackEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    var params = JSON.stringify(payloadToFeedback);
    http.send(params);
  }

  //Send a message request to the server
  function sendRequest(text, context) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;
    }
    //payloadToWatson.user = uuid;
    
    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);

    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setResponsePayload(http.responseText);
      }
    };
  }

  // Publicly accessible methods defined
  return {
    sendFeedback: sendFeedback,
    sendRequest: sendRequest,
    enviarFeedback: enviarFeedback,
    sendTextToAudio: sendTextToAudio,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
    }
  };

}());
