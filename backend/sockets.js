const socketio = require('socket.io');
const controllers = require('./controllers');

let io = {};

const initializeSocket = (socket) => {
  console.log('a user connected', socket.id);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('error', (error) => {
    console.error(error)
  });

  socket.on('fetchGigs', () => {
    return controllers.fetchGigs()
      .then(sockets.gigsUpdated);
  });

  socket.on('fetchGig', (id) => {
    return controllers.fetchGig(id)
      .then(sockets.gigUpdated);
  });
}

const sockets = {
  io: () => io,
  gigsUpdated: gigs => {
    console.log('gigsupdated', gigs)
    io.emit('gigsUpdated', gigs);
    return Promise.resolve(gigs);
  },
  gigUpdated: gig => {
    io.emit('gigUpdated', gig);
    return Promise.resolve(gig);
  },
  initSocket: server => {
    io = socketio.listen(server);
    controllers.initController(sockets);
    io.on('connection', initializeSocket);
  }
}

module.exports = sockets;
