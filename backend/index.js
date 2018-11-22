const express = require('express');
const model = require('./model');
const sockets = require('./sockets');
const routes = require('./routes');
const path = require('path');

const app = express();

app
  .disable('x-powered-by')
  .use(express.static('./build'))
  .use(express.urlencoded({extended: true}))
  .use(express.json())
  .use('/api', routes)
  .get('*', (req, res) => res.sendFile(path.resolve('./build/index.html')));


const server = app.listen(process.env.PORT || 9000, (error) => {
  if (error) {
    console.error(error)
  }
  console.log('🚀 started')
});

sockets.initSocket(server);
app.locals.sockets = sockets;
app.locals.model = model;
