const {gigModel, userModel, model} = require('../model');
const auth = require('../auth');
let sockets = null;

const controllers = {
  initController: (newSocket) => {
    sockets = newSocket;
  },
  auth: (user, password, project) => {
    return auth.authenticate(user, password, {project});
  },
  validateAuth: token => {

  },
  getSocket: () => sockets,
  addGig: (project, gig) => {
    console.log('add', gig);
    return gigModel.nextId(project)
      .then(id => {
        gig.id = id;
        return gigModel.update(project, gig)
      })
  },
  updateGig: (project, gig) => {
    console.error('update', gig);

    const method = gig.id == null ? controllers.addGig: gigModel.update;
    return method(project, gig)
      .then(gig => sockets.gigUpdated(project, gig))
      .then(() => controllers.fetchGigs(project))
      .then(gigs => sockets.gigsUpdated(project, gigs))
      .then(() => gig)
  },
  deleteGig: (project, id) => {
    return gigModel.delete(project, id)
      .then(() => controllers.fetchGigs(project))
      .then(gigs => sockets.gigsUpdated(project, gigs))
      .then(() => id)
  },
  fetchGig: (project, id) => {
    console.log('**', project, id)
    return Promise.all([
      gigModel.fetch(project, id),
      controllers.fetchUsers(project)
    ])
      .then(([gig, users]) => {
        console.log('###', gig, users)
        gig.users = users;
        return gig;
      })
  },
  fetchGigs: project => {
    return gigModel.fetchAll(project)
      .then(res => {
        const gigs = Object.values(res);
        return gigs;
      });
  },
  addUser: (project, user) => {
    console.log('add', user);
    return userModel.nextId(project)
      .then(id => {
        user.id = id;
        return userModel.update(project, user)
      })
  },
  updateUser: (project, user) => {
    console.error('update', user);
    const method = user.id == null ? controllers.addUser: userModel.update;
    return method(project, user)
      .then(user => sockets.userUpdated(project, user))
      .then(() => controllers.fetchUsers(project))
      .then(users => sockets.usersUpdated(project, users))
      .then(() => user)
  },
  deleteUser: (project, id) => {
    return userModel.delete(project, id)
      .then(() => controllers.fetchUsers(project))
      .then(users => sockets.usersUpdated(project, users))
      .then(() => id)
  },
  fetchUser: (project, id) => {
    return userModel.fetch(project, id)
  },
  fetchUsers: project => {
    return userModel.fetchAll(project)
      .then(res => {
        console.log('!!!users', res);
        const users = Object.values(res);
        return users;
      });
  },
  fetchGigAvailability: ({project, gigId}) => {
    return model.fetchGigAvailability({project, gigId})
      .then(res => sockets.gigAvailabilityUpdated(project, gigId, res)
    );
  },
  fetchUserAvailability: ({project, userId}) => {
    return model.fetchUserAvailability({project, userId})
      .then(res => sockets.userAvailabilityUpdated(project, userId, res)
    );
  },
  updateAvailability: ({project, gigId, userId, status}) => {
    return model.updateAvailability({project, gigId, userId, status})
      .then(() => Promise.all([
        controllers.fetchGigAvailability({project, gigId}),
        controllers.fetchUserAvailability({project, userId}),
      ]))
  }
};

module.exports = controllers;
