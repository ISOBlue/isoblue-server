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

var ISOBUS_PARSE = (function() {

  var pgnref;
  var pgnarray;
  var config;

  //----- Exported functions ------
  var _configure = function(configuration){
    pgnref = {};
    pgnarray = [];
    config = configuration;
    for (var i in config) {
      pgnarray.push(config[i].pgn);
      if(typeof pgnref[config[i].pgn] == 'undefined'){
        pgnref[config[i].pgn] = [];
      }
      pgnref[config[i].pgn].push(i);
    }
  };

  var parseArray = function(input) {
    var obj = {};
    var message_list = [];
    for (var i = 0; i < input.length; i++) {
      message_list = [];
      if (pgnarray.indexOf(input[i].pgn) > -1) {
        message_list = pgnref[input[i].pgn];
        for (var j = 0; j < message_list.length; j++) {
          if(typeof obj[message_list[j]] == 'undefined'){
            obj[message_list[j]] = [];
          }
          obj[message_list[j]].push({timestamp: input[i].timestamp, measurement: parseData(input[i].data, config[message_list[j]].low, config[message_list[j]].high, config[message_list[j]].mul, config[message_list[j]].add)});  
        }
      }  
    }
    return obj;
  };

  var _getBytes = function(payload) {
    // function returns an 8-byte array from a hex string payload (padded with 0 bytes if necessary)
    var data = [];
    var str = payload;
    while (str.length > 0) {
      if (str.length == 1) {
        data.push(h2d(str)); 
        str = str.substring(1, str.length);
      } else {
        data.push(h2d(str.substring(0, 2)));
        str = str.substring(2, str.length);
      }
    }
    // pad with 0 bytes
    while (data.length < 8) {
      data.push(0);
    }
    return data;
  };


  //---- Helper functions -----
  function parseData(data, smallbyte, bigbyte, mul, add) {
    // data is an array of 8 bytes  
    // smallbyte and bigbyte specify the region of bytes to parse.
    // i.e. smallbyte=0, bigbyte=2 would parse the first 3 bytes in the data word
    // mul and add represent factors to multiply and add to the parsed byte sequence
    // function makes no assumption about endianness of data
    // Note this function will fail if caller tries to retrieve too many bytes (js uses only 53 bits in numbers).
    var ret = 0x0;
    for (var i = smallbyte; i <= bigbyte; i++) {
      ret += data[i] * Math.pow(256, i - smallbyte); 
    }
    ret *= mul;
    ret += add;
    return ret;
  }
  
  // Convert hex string into decimal number
  function h2d(h) {return parseInt(h,16);}


  return {
    configure: _configure,
    parse: parseArray,
    getBytes: _getBytes
  };
}());

module.exports = ISOBUS_PARSE;
