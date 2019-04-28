// Initializes the `projects` service on path `/projects`
const createService = require('feathers-mongoose');
const createModel = require('../../models/projects.model');
const hooks = require('./projects.hooks');

module.exports = function(app) {
  const Model = createModel(app);

  const options = {
    Model
  };

  // Initialize our service with any options it requires
  app.use('/api/projects', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('api/projects');

  service.hooks(hooks);
};
