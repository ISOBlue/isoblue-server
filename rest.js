/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var REST = (function() {

  var express = require('express');
  var _config = express.Router();
  var _data = express.Router();
  var _resources = express.Router();


  var isobusParser = require('./oada_parse');
  var database = require('./database');
  var pgnConfig = require('./config/streamConfig.json');
  var streamTypes = require('./config/streamTypes.json'); //TODO remove

  var _init = function(callback){
    //Do everything we need to do before we start listening to requests.
    database.init(callback);

    //Configuure isobusParser
    isobusParser.configure(pgnConfig);

    //Load streams types from db (hardcoded with require for now)
  };

  //Get the url and pgns to post
  _config.get('/*', function(req, res, next) {
    console.log('Getting config for udid: ' + req.path.substr(1));
    if(req.path.length > 1){
      var toSend = {
        url: req.protocol+'://'+ req.get('host') + '/data' + req.path,
        pgns:[1234,5678,9123]
      };
      res.json(toSend);
    } else {
      res.sendStatus(400);
    }
  });

  //Get the posted data
  _data.get('/*', function(req, res, next) {
    console.log('Request for data with udid: ' + req.path.substr(1));

    console.log(req.query);

    var view = null;
    if(typeof req.query.view != 'undefined'){
      try {
        view = JSON.parse(req.query.view);
      } catch(exception) {
        res.sendStatus(400);
        return;
      }
    }

    if(view !== null){
      //TODO process view syntax
      if(view['$each'] !== undefined){
        view = view['$each'];
      } else {
        res.sendStatus(400);
        return;
      }
      console.log(JSON.stringify(view));
    }

    database.get(req.path.substr(1), view, function(docs){
      res.json(docs);
    });

  });

  //Post resource
  _data.post('/*', function(req, res, next) {
    console.log('Post recieved from ' + req.path.substr(1) + 
      ' with data: ' + JSON.stringify(req.body));

    var udid = req.path.substr(1); //Used as collection

    var messages = req.body;
    //Insert messages into ISOBus database
    database.insert(udid, messages, function(inserted){
      //Success now save into streamData collection

      //Parse messages with our pgnConfig file
      //Convert messages to array if it is just one message
      if(!(req.body instanceof Array)) {
        //Convert single message to an array
        messages = [messages];
      }

      console.log('Messages:' + JSON.stringify(messages));

      for(var msg in messages){
        if(typeof messages[msg].timestamp != 'number'){
          //Convert timestamp from hex.hex to decimal.decimal
          var decPos = messages[msg].timestamp.indexOf('.');
          if (decPos == -1) {
            messages[msg].timestamp = parseInt(messages[msg].timestamp,16);
          } else {
            var beforeD = messages[msg].timestamp.substr(0,decPos);
            var afterD = null;
            if (messages[msg].timestamp.length > (decPos + 1)) {
              afterD = messages[msg].timestamp.substr(decPos+1);
            }
            messages[msg].timestamp = parseInt(beforeD,16);
            if(afterD !== null){
              messages[msg].timestamp = messages[msg].timestamp + (parseInt(afterD,16) / 1000000);
            }
          }
        }
        //Convert pgn from hex to decimal
        messages[msg].pgn = parseInt(messages[msg].pgn,16);
        //Convert data from hex string to byte array
        messages[msg].data = isobusParser.getBytes(messages[msg].data);
      }

      var streams = isobusParser.parse(messages);

      console.log('Streams:' + JSON.stringify(streams));
      if(Object.keys(streams).length > 0){
        for(var stream in streams){
          //Save messages from each stream in database
          for(msg in streams[stream]){
            //Add keys to each 
            streams[stream][msg].machine = udid;
            //TODO check if this stream type exists, if not add another to db
            streams[stream][msg].stream = streamTypes[stream];
          }
          database.insert('streamData', streams[stream]);
        }
      }
    });

    res.sendStatus(200);
  });

  //OADA rest
  _resources.get('/*', function(req, res, next) {
    var resId = req.path.substr(1);
    console.log('Request for /resources resId: ' + resId);

    //TODO resId's are hardcoded at the moment.
    if (resId == '123') {
      //Return streams resource

    } else {
      //Check this resId in our streams resource

    }
  });

  return {
    init: _init,
    config: _config,
    data: _data,
    resources: _resources
  };

}());

module.exports = REST;