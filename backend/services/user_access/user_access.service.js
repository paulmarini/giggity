// Initializes the `user_access` service on path `/user-access`
const createService = require('feathers-mongoose');
const createModel = require('../../models/user_access.model');
const hooks = require('./user_access.hooks');

module.exports = function(app) {
  const Model = createModel(app);

  const options = {
    Model,
  };

  // Initialize our service with any options it requires
  app.use('/api/user-access', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('api/user-access');

  service.hooks(hooks);
};
