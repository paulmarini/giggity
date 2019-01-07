const express = require('express');
const model = require('./model');
const sockets = require('./sockets');
const routes = require('./routes');
const config = require('./config');
const path = require('path');

const app = express();

app
  .disable('x-powered-by')
  .use((req, res, next) => {
    res.locals.project = req.subdomains[0];
    console.error(res.locals);
    console.error(req.headers);
    next();
  })
  .use(express.static('./build'))
  .use(express.urlencoded({extended: true}))
  .use(express.json())
  .use('/api', routes)
  .get('*', (req, res) => res.sendFile(path.resolve('./build/index.html')));

const server = app.listen(config.socket_port, (error) => {
  if (error) {
    console.error(error)
  }
  console.log(`🚀 started on port ${config.socket_port}`)
});

sockets.initSocket(server);
app.locals.sockets = sockets;
app.locals.model = model;
