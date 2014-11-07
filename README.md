isoblue-server
==========

Overview
--------
isoblue-server is a test server that ISOBlue can send data to. It stores data in a mongo database at the url defined in environment variable 'MONGO_URL'. If 'MONGO_URL' is not set, then it defaults to 'mongodb://localhost:27017/isoblue'.

Endpoints
-----
ISOBlue should do a GET request to <url>/config/<udid> where <udid> is a universal identifier for that ISOBlue. 

The response will be the following:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "url":"http://www.example.com/data/1234",
  "pgns":[1234,5678,9123]
}
```

It contains a 'url' key which is the url the ISOblue should post data to and a 'pgns' key which is the list of pgns the ISOBlue should filter on.

Data the ISOBlue sends to the POST url should look like the following:

```json
{
  "timestamp": "1414782625",
  "pgn": "1234",
  "src":"a",
  "dst":"b",
  "bus":1,
  "data": "SomeDataToUpload"
}
```

Or if multiple messages are batched together:

```json
[
{
  "timestamp": "1414782625",
  "pgn": "1234",
  "src":"a",
  "dst":"b",
  "bus":1,
  "data": "SomeDataToUpload"
},
{
  "timestamp": "1414782625",
  "pgn": "5678",
  "src":"a",
  "dst":"b",
  "bus":1,
  "data": "Moredata"
},
{
  "timestamp": "1414782625",
  "pgn": "9123",
  "src":"a",
  "dst":"b",
  "bus":1,
  "data": "LotsOfdata"
}
]
```

To retrieve data you do a GET request to the same URL the ISOBlue is POSTing data to. All data is returned. There is no method to filter the response at this time.

Usage
-----
Make sure mongo is running. If on your local machine:
- mongod

Run the server:
- node server.js

Coming soon
-----
- Response filtering by timestamp and PGN.
- Security
- A key added in the config response to specify how many messages to batch.
- Accept parameters in the GET request to /config to tell what API version the device supports.


