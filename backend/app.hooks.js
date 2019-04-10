// Application hooks that run for every service
const log = require('./hooks/log');
// const auth = require('./hooks/log');
// const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
  before: {
    all: [
      log(),
      context => {
        if (context.path !== 'projects' && !context.path.match('authentication') && context.params.user) {
          if (context.path === 'users' && context.method === 'patch') {
            return;
          }
          context.params.query.project = context.params.user.project;
          if (context.data) {
            context.data.project = context.params.user.project;
          }
        }
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
    all: [log()],
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
