// Application hooks that run for every service
const log = require('./hooks/log');
// const auth = require('./hooks/log');
const { disable, disallow } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [
      log(),
      disable('rest'), // FIXME
      context => {
        if (context.path !== 'api/projects' && !context.path.match('authentication') && context.params.user) {
          if (context.path === 'api/users' && context.method === 'patch') {
            return;
          }
          context.params.query.project = context.params.user.project;
          if (context.data) {
            if (context.method === 'patch') {
              delete context.data.project;
            } else {
              context.data.project = context.params.user.project;
            }
          }
          return context;
        }
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
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
