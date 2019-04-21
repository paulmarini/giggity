// Initializes the `calendar` service on path `/api/calendar`
const createService = require('./calendar.class.js');
const hooks = require('./calendar.hooks');

module.exports = function(app) {

  const calendar = app.get('calendar');
  const google = app.get('google');

  const options = {
    calendar,
    google
  };

  // Initialize our service with any options it requires
  app.use('/api/calendar', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('api/calendar');

  service.hooks(hooks);
};
