/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
var debug = require('debug')('bot:controller');
var extend = require('extend');
var Promise = require('bluebird');
var conversation = require('./api/conversation');
var textToSpeech = require('./api/text-to-speech');
var APIParser = require('./api/integracao');

var sendMessageToConversation = Promise.promisify(conversation.message.bind(conversation));

function processMessage(_message, callback) {
    var message = extend({ input: {text: _message.text} }, _message);
    var input = message.text ? { text: validator.escape(message.text) } : message.input;
    return sendMessageToConversation(message)
    .then(function(messageToUser) {
      if (messageToUser.context.reenviar) {
        messageToUser.context.reenviar = false;
        processMessage({context: messageToUser.context, input: messageToUser.input}, callback);
      } else {
        APIParser(messageToUser, callback);
      }
  })
    .catch(function (error) {
      debug(error);
      callback(error);
    });
  }

module.exports = {
  /**
   * Process messages from a channel and send a response to the user
   * @param  {Object}   message.user  The user
   * @param  {Object}   message.input The user meesage
   * @param  {Object}   message.context The conversation context
   * @param  {Function} callback The callback
   * @return {void}
   */
  processMessage: processMessage,
  synthesizeMessage: function(params, res){
    return textToSpeech.talk(params, res);
  }
}
