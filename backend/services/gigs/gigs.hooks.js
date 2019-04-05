const { authenticate } = require('@feathersjs/authentication').hooks;


module.exports = {
  before: {
    all: [
      authenticate('jwt')
    ],
    find: [],
    get: [
      ({ app, params: { connection }, id }) => {
        console.log('join', `gigs/${id}`);
        console.log(app.channels);
        app.channels.forEach(channel => {
          if (channel.match('gigs/')) {
            app.channel(channel).leave(connection);
          }
        });
        app.channel(`gigs/${id}`).join(connection);
      }
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
