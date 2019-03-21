// Initializes the `GigAvailability` service on path `/gig-availability`
const createService = require('feathers-mongoose');
const createModel = require('../../models/gig-availability.model');
const hooks = require('./gig-availability.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/gig-availability', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('gig-availability');

  service.hooks(hooks);
};
