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

var REST = function() {

  var express = require('express');
  var _config = express.Router();
  var _data = express.Router();
  var database = require('./database');

  var postId = 0;

  //Get the resource list
  _config.get('/*', function(req, res, next) {
    console.log('Getting resource from udid: ' + req.path.substr(1));

    var toSend = {
      url:'http://www.cyrusbowman.com/data/'+req.path.substr(1),
      pgns:[1234,5678,9123]
    }

    res.json(toSend);
  });

  //Get the resource list
  _data.get('/*', function(req, res, next) {
    console.log('Request for data with udid: ' + req.path.substr(1));
    database.get(req.path.substr(1), null, function(docs){
      res.json(docs);
    });
  });

  //Post resource
  _data.post('/*', function(req, res, next) {
    console.log('Post recieved from ' + req.path.substr(1) + ' with data: ' + JSON.stringify(req.body));

    var udid = req.path.substr(1); //Used as collection
    database.insert(udid, req.body);
    res.sendStatus(200);
  });

  return {
    config: _config,
    data: _data
  };
}();

module.exports = REST;
