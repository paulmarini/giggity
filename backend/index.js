/* eslint-disable no-console */
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');

const logger = require('./logger');
const app = require('./app');
const port = app.get('port');
let server;

console.log(`starting in ${process.env.NODE_ENV} mode on port ${port}`);

if (port === '443') {
  console.log('setting up ssl', app.get('keyFile'), app.get('certFile'));
  server = https.createServer({
    key: fs.readFileSync(app.get('keyFile')),
    cert: fs.readFileSync(app.get('certFile'))
  }, app).listen(443);
  app.setup(server);

  const httpApp = express()
    .set('port', 80)
    .get("*", function(req, res, next) {
      res.redirect("https://" + req.headers.host + "/" + req.path);
    })
  http.createServer(httpApp).listen(httpApp.get('port'), function() {
    console.log('Express HTTP server listening on port ' + httpApp.get('port'));
  });
} else {
  server = app.listen(port);
}

var timeout;
fs.watch(app.get('certFile'), () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
		console.log('reloading SSL certs');
        server._sharedCreds.context.setCert(fs.readFileSync(app.get('certFile')));
        server._sharedCreds.context.setKey(fs.readFileSync(app.get('keyFile')));
    }, 1000);
});


process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  console.log('Feathers application started on http://%s:%d', app.get('host'), port)
  //logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);
