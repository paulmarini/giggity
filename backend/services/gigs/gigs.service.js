// Initializes the `Gigs` service on path `/gigs`
const createService = require('feathers-mongoose');
const createModel = require('../../models/gigs.model');
const hooks = require('./gigs.hooks');

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get('paginate')
  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/api/gigs', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('api/gigs');

  service.hooks(hooks);
};
