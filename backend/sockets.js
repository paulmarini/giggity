const socketio = require('socket.io');
const controllers = require('./controllers');

const auth = require('./auth');

let io = {};

const initializeSocket = (socket) => {
  console.log('@@@', 'a user connected');
  console.log('@@@', socket.request.user);
  const project = socket.request.user.data.project;

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('error', (error) => {
    console.error(error)
  });

  socket.join(project);
  socket.join(`${project}-user-${socket.request.user.user}`);

  socket.on('fetchGigs', () => {
    return controllers.fetchGigs(project)
      .then(gigs => sockets.gigsUpdated(project, gigs))
      .then(() => controllers.fetchUserAvailability({project, userId: socket.request.user.user}))
  });

  socket.on('fetchGig', (id) => {
    Object.keys(socket.rooms)
      .filter(room => room.match(/-gig-/))
      .forEach(room => socket.leave(room))
    socket.join(`${project}-gig-${id}`);
    return controllers.fetchGig(project, id)
      .then(gig => sockets.gigUpdated(project, gig))
      .then(() => controllers.fetchGigAvailability({project, gigId: id}))
  });

  socket.on('fetchUsers', () => {
    return controllers.fetchUsers(project)
      .then(users => sockets.usersUpdated(project, users));
  });

  socket.on('fetchUser', (id) => {
    return controllers.fetchUser(project, id)
      .then(user => sockets.userUpdated(project, user));
  });
  socket.on('updateAvailability', ({gigId, userId, status}) => {
    console.log(gigId, userId, status);
    return controllers.updateAvailability({project, gigId, userId, status})
  })
}

const sockets = {
  io: () => io,
  gigsUpdated: (project, gigs) => {
    console.log('gigsupdated', gigs)
    io.to(project).emit(`gigsUpdated`, gigs);
    return Promise.resolve(gigs);
  },
  gigUpdated: (project, gig) => {
    console.log('GIGUPDATED', `${project}-gig-${gig.id}`)
    io.to(`${project}-gig-${gig.id}`).emit(`gig-${gig.id}-updated`, gig);
    return Promise.resolve(gig);
  },
  usersUpdated: (project, users) => {
    console.log('usersupdated', users)
    io.to(project).emit(`usersUpdated`, users);
    return Promise.resolve(users);
  },
  userUpdated: (project, user) => {
    io.to(project).emit(`user-${user.id}-updated`, user);
    return Promise.resolve(user);
  },
  gigAvailabilityUpdated: (project, gigId, availability) => {
    console.log('####gigAvail', gigId, availability)
    io.to(`${project}-gig-${gigId}`).emit(`gig-${gigId}-availabilityUpdated`, availability);
    return Promise.resolve(availability);
  },
  userAvailabilityUpdated: (project, userId, availability) => {
    console.log('####userAvailabilityUpdated', userId, availability)
    io.to(`${project}-user-${userId}`).emit(`user-${userId}-availabilityUpdated`, availability);
    return Promise.resolve(availability);
  },

  initSocket: server => {
    io = socketio.listen(server);
    io.use(auth.socketVerify())
    controllers.initController(sockets);
    io.on('connection', initializeSocket);
  }
}

module.exports = sockets;
