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

var extend = require('extend');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');

// Separação de workspaces:

var conversation_limbo = new ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  version_date: '2016-07-01',
  path: {
    workspace_id: process.env.WORKSPACE_ID_LIMBO
  }
});

var conversation_faq = new ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  version_date: '2016-07-01',
  path: {
    workspace_id: process.env.WORKSPACE_ID_FAQ
  }
});

var conversation_status = new ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  version_date: '2016-07-01',
  path: {
    workspace_id: process.env.WORKSPACE_ID_STATUS
  }
});

var conversation_chamado = new ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  version_date: '2016-07-01',
  path: {
    workspace_id: process.env.WORKSPACE_ID_CHAMADO
  }
});

var debug = require('debug')('bot:api:conversation');


module.exports = {
  /**
   * Sends a message to the conversation. If context is null it will start a new conversation
   * @param  {Object}   params   The conversation payload. See: http://www.ibm.com/watson/developercloud/conversation/api/v1/?node#send_message
   * @param  {Function} callback The callback
   * @return {void}
   */
  message: function(params, callback) {
    var context;
    var _params = extend({}, params);
    if (!_params.context) {
      _params.context = {};
      _params.context.system = {
        dialog_stack: ['root'],
        dialog_turn_counter: 0,
        dialog_request_counter: 0
      }
    }
    var workspace = ( _params.context && _params.context.alternar) ? _params.context.alternar : "limbo";
    var newMessage = extend(true, _params, {context: context});
    switch (workspace) {

      case "limbo":
        console.log("workspace L.I.M.B.O.");
        conversation_limbo.message(newMessage, function(err, response) {
          debug('message:', newMessage);
          if (err) {
            callback(err);
          } else {
            debug('response:', response);
            callback(null, response);
          }
        });
      break;

      case "faq":
        console.log("workspace de FAQ");
        conversation_faq.message(newMessage, function(err, response) {
          debug('message:', newMessage);
          if (err) {
            callback(err);
          } else {
            debug('response:', response);
            callback(null, response);
          }
        });
      break;

      case "status":
        console.log("workspace de status");
        conversation_status.message(newMessage, function(err, response) {
          debug('message:', newMessage);
          if (err) {
            callback(err);
          } else {
            debug('response:', response);
            callback(null, response);
          }
        });
      break;

      case "chamado":
        console.log("workspace de abertura de chamado");
        conversation_chamado.message(newMessage, function(err, response) {
          debug('message:', newMessage);
          if (err) {
            callback(err);
          } else {
            debug('response:', response);
            callback(null, response);
          }
        });
      break;
    }

    // callback(null,{input:{}, entities:[], context: {palavroes: 0}, output:{text:"Testando o bot"}});
  }
}
