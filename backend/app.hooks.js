// Application hooks that run for every service
const log = require('./hooks/log');
// const auth = require('./hooks/log');
// const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
  before: {
    all: [
      log(),
      context => {
        if (context.path !== 'projects' && context.path !== 'authentication' && context.params.user) {
          context.params.query.project = context.params.user.project;
          if (context.data) {
            context.data.project = context.params.user.project;
          }
          // console.log('hereiam!!!');
          // authenticate('jwt');
        }
        // console.log(context.app.services.authentication.hooks);
        // context.app.services.authentication.hooks.authenticate('jwt');
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      context => {
        console.error(`Error in '${context.path}' service method '${context.method}'`, context.error.stack);
      },
      log()
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
