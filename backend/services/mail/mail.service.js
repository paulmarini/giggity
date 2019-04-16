// Initializes the `mail` service on path `/mail`
const aws = require('aws-sdk');
const path = require('path');
const hooks = require('./mail.hooks');
const createService = require('./mail.class.js');

const env = process.env.NODE_ENV || 'development';

module.exports = function(app) {

  const options = {
    transport: app.get('mail') || {},
    views: { root: './backend/emails/' },
    subjectPrefix: env === 'production' ? false : `[${env.toUpperCase()}] `,
    juiceResources: {
      webResources: {
        relativeTo: path.resolve('./backend/emails/')
      }
    },
  };

  if (env !== 'development') {
    // configure AWS SDK
    aws.config.loadFromPath('/home/bitnami/aws-creds');
    aws.config.update({ region: 'us-west-2' });
    options.transport = {
      SES: new aws.SES({
        apiVersion: '2010-12-01'
      }),
      sendingRate: 1
    };
    options.message = {
      from: 'giggity@giggity.info'
    }
  }


  // Initialize our service with any options it requires
  app.use('/mail', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('mail');

  service.hooks(hooks);
};
