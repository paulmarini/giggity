const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const { default: local } = require('@feathersjs/authentication-local');
const oauth2 = require('@feathersjs/authentication-oauth2');
const Auth0Strategy = require('passport-auth0');
const EmailFirstOAuth2Verifier = require('./verifiers/oAuthVerifier');

module.exports = function(app) {
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  app.configure(local());

  app.configure(oauth2(Object.assign({
    name: 'auth0',
    Strategy: Auth0Strategy,
    Verifier: EmailFirstOAuth2Verifier
  }, config.auth0)));

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies),
        async (context) => {
          const { payload } = context.params;
          const { userId } = payload;
          const { project } = await context.app.service('api/users').get(userId, { query: { $select: ['project'] } })
          payload.project = project
          const members = await context.app.service('api/members')._find({ query: { user: userId } });

          payload.projects = members.reduce((obj, item) => {
            if (item.project === project) {
              payload.member_id = item._id;
            }
            obj[item.project] = item.role;
            return obj;
          }, {});

          // context.params.payload.projects = member.map(p => p.project);
          return context;
        }
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    }
  });
};
