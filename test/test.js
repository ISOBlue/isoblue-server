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

var expect = require('chai').expect;
var should = require('chai').should();
var supertest = require('supertest');
var request = supertest('http://127.0.0.1:9000'); //Pass URL or express app

describe('Isoblue server', function() {
  it('Test GET on /config endpoint', function(done) {
    request
        .get('/config/MacAddress')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          res.body.url.should.be.a('string');
          console.log(res.body);
          done();
        });
  });

  it('Test POST to /data endpoint', function(done) {
    var isodata = {
      timestamp: '1414782625',
      pgn: "pgn",
      src:"a",
      dst:"b",
      bus:1,
      data: "SomeDataToUpload"
    };

    request
        .post('/data/MacAddress')
        .send(isodata)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
  });

  it('Test GET on /data endpoint', function(done) {
    request
        .get('/data/MacAddress')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          console.log(res.body);
          done();
        });
  });


});
