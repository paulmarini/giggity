// Initializes the `registration` service on path `/registration`
const createService = require('feathers-mongoose');
const createModel = require('../../models/registration.model');
const hooks = require('./registration.hooks');

module.exports = function(app) {
  const Model = createModel(app);

  const options = {
    Model,
    multi: ['patch']
  };

  // Initialize our service with any options it requires
  app.use('/api/registration', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('api/registration');

  service.hooks(hooks);
};
