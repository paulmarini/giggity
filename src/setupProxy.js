const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/socket.io/', { target: 'http://localhost:3030/socket.io', ws: true }));
  app.use(proxy('/auth/', { target: 'http://localhost:3030' }))
};
