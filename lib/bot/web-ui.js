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

var request = require('request');
var fs = require('fs');
var debug = require('debug')('bot:channel:web-ui');
var http = require('http');


module.exports = function (app, controller) {
  debug('web-ui initialized');
  app.post('/api/message', function(req, res, next) {

    // debug('message: %s', JSON.stringify(req.body));
    controller.processMessage(req.body, function(err, response) {
      if (err) {
        res.status(err.code || 400).json({error: err.error || err.message});
      } else {
        res.json(response);
        // if(response.input.text){
        //   var payloadToHistory = {
        //     intents: response.intents,
        //     input: response.input.text,
        //     output: response.output.text
        //   }
        // request.post('http://senac-mvp-api.mybluemix.net/history', {form:payloadToHistory} );
        // }

      }
    })
  });

  app.get('/api/sccd/getstatus/:id', function(req, res, next){

    if(!req.params.id)
      res.status(500).send('Wrong ticket number format');
    var options = {
       host: '192.168.51.58',
       port: 80,
       path: '/maxrest/rest/os/mxsr/?ticketid=~eq~'+req.params.id+'&_format=json',
       // authentication headers
       headers: {
          'Authorization': 'Basic ' + new Buffer('certsys.narzio' + ':' + 'J4i4n4n4n4').toString('base64')
       }   
    };

    request = http.get(options, function(response){
       var body = "";
       response.on('data', function(data) {
          body += data;
       });
       response.on('end', function() {
        //here we have the full response, html or json object
          var bodyParsed = JSON.parse(body);
          if (bodyParsed.QueryMXSRResponse.rsCount) {
            var resObj = { statuscode: bodyParsed.QueryMXSRResponse.MXSRSet.SR[0].Attributes.STATUS.content, status: bodyParsed.QueryMXSRResponse.MXSRSet.SR[0].Attributes.STATUSDESCPT.content.toLowerCase() };
            if (bodyParsed.QueryMXSRResponse.MXSRSet.SR[0].Attributes.STATUS.content === "")
              resObj["solution"] = bodyParsed.QueryMXSRResponse.MXSRSet.SR[0].Attributes.
            res.send({});
          } else {
            res.status(404).send('Ticket not found!');
          }
       })
       response.on('error', function(e) {
          res.status(500).send(e.message);
       });
      });
  });

  app.post('/api/feedback', function(req, res, next){
    // request.post('http://senac-mvp-api.mybluemix.net/feedback', {form:req.body}, function(error, response, body) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     var bodyParsed = JSON.parse(body);
    //     return response;
    //   }
    // });
  });
  app.post('/api/finalfeedback', function(req, res, next){
    // request.post('http://senac-mvp-api.mybluemix.net/pesquisasatisfacao', {form:req.body}, function(error, response, body) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     return response;
    //   }
    // });
  });
  app.get('/api/talk', function(req, res, next){
    var params = {
      text: req.query.text,
      voice: 'pt-BR_IsabelaVoice',
      accept: 'audio/wav'
      // customization_id: 'be995937-ad92-4885-b1b4-ed59875cbba3'
    };
    
    // Pipe the synthesized text to a file.
    controller.synthesizeMessage(params, res);    
      
    });
}