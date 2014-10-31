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

var Database = function(resources) {
  var express = require('express');
  var MongoClient = require('mongodb').MongoClient
  var assert = require('assert');

  var _get = function(collectionName, find, callback) {
    //Returns resource with _id
    connect(function(db){
      // Get the documents collection
      var collection = db.collection(collectionName);

      if(find == null) {
        find = {};
      }
      // Find some documents
      collection.find(find).toArray(function(err, docs) {
        assert.equal(err, null);
        console.log("Found "+ docs.length + " records");
        db.close();
        callback(docs);
      }); 
    });
  };

  var _delete = function(_id, callback) {
    callback();
  };

  var _insert = function(collectionName, documents, callback) {
    connect(function(db){
      // Get the documents collection
      var collection = db.collection(collectionName);
      // Insert some documents
      collection.insert(documents, function(err, records) {
        assert.equal(err, null);
        console.log("Inserted documents into the document collection");
        db.close(); 
        if (typeof(callback) == 'function') {
          callback(result);
        }
      });
    });
  }

  var connect = function(callback) {
    // Connection URL
    var url =  process.env.MONGO_URL || 'mongodb://localhost:27017/isoblue';
    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to server");
      callback(db);
    });
  }

  return {
    insert: _insert,
    get: _get,
    delete: _delete
  };
}();

module.exports = Database;
