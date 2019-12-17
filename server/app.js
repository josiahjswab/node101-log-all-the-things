const express = require('express');
const fs = require('fs');
const app = express();
const csv = require('csvtojson');

app.use(logAllTheThings);

var log = [];

/**
 *  Custom logger middleware.
 *  Previous log is erased so as not to append to old array data.
 *  Date().toISOString was a requirment to pass the test.
 *  req.protocol.toUpperCase was used to pass the test.
 */
function logAllTheThings(req, res, next) {

  log = [];
  log.push(req.header('user-agent').replace(/,/g, ' '));
  log.push(new Date().toISOString()); 
  log.push(req.method);
  log.push(req.originalUrl);
  log.push(`${req.protocol.toUpperCase()}/${req.httpVersion}`); 
  log.push(res.statusCode);

  fs.appendFile(
    'server/log.csv', `\n ${log.toString()}`,
    (err) => {if(err) throw err, console.log(err); else console.log("Traffic added to log.")});
  next();
};

// This console.log(log.toString()) is necessary to pass tests.
app.get('/', (req, res) => {
  res.status(200).send("ok");
  console.log(log.toString());
});

// Endpoint that views log.csv.
app.get('/logs', (req, res) => {
  csv()
    .fromFile('server/log.csv')
    .then((logData) => {
      res.status(200).send(logData);
    });
});

module.exports = app;
