// Initializes the `mail` service on path `/mail`
const createService = require('./mail.class.js');
const hooks = require('./mail.hooks');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
module.exports = function(app) {

  const transport = app.get('mail');

  const options = {
    transport,
    views: { root: './backend/emails/' },
    subjectPrefix: env === 'production' ? false : `[${env.toUpperCase()}] `,
    juiceResources: {
      webResources: {
        relativeTo: path.resolve('./backend/emails/')
      }
    },
    // textOnly: true,
    // htmlToText: true
  };

  // Initialize our service with any options it requires
  app.use('/mail', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('mail');

  service.hooks(hooks);
};
