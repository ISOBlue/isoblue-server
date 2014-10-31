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

var express = require('express');
var app = express();
var objectAssign = require('object-assign');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var morgan = require('morgan');

var env = process.env.NODE_ENV || 'development';
app.set('port', process.env.PORT || 9000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('X-HTTP-Method-Override'));

var rest = require('./rest');

app.use('/config', rest.config);
app.use('/data', rest.data);

app.listen(app.get('port'), function() {
  console.log('Example API listening on port ' + app.get('port')
    + ', running in ' + app.settings.env + ' mode.');
});

if ('development' == env) {
  app.use(morgan('dev'));
  app.use(errorhandler());
}
