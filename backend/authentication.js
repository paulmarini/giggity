const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const { default: local, Verifier } = require('@feathersjs/authentication-local');
const oauth2 = require('@feathersjs/authentication-oauth2');
const Auth0Strategy = require('passport-auth0');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const { omit } = require('lodash');

const Debug = require('debug');
const debug = Debug('@feathersjs/authentication-local:verify');


class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and
  // return values as a vanilla passport strategy
  _comparePassword(entity, password) {
    console.log(entity, password);
    return Promise.resolve(entity);
  }
  // verify(req, username, password, done) {
  //   console.log(req, username, password);
  //   // do your custom stuff. You can call internal Verifier methods
  //   // and reference this.app and this.options. This method must be implemented.
  //
  //   // the 'user' variable can be any truthy value
  //   // the 'payload' is the payload for the JWT access token that is generated after successful authentication
  //   done(null, user, payload);
  // }
  verify(req, username, password, done) {
    debug('Checking credentials', username, password);

    const id = this.service.id;
    const usernameField = this.options.entityUsernameField || this.options.usernameField;
    const params = Object.assign({
      'query': {
        [usernameField]: username,
        '$limit': 1
      }
    }, omit(req.params, 'query', 'provider', 'headers', 'session', 'cookies'));

    if (id === null || id === undefined) {
      debug('failed: the service.id was not set');
      return done(new Error('the `id` property must be set on the entity service for authentication'));
    }

    // Look up the entity
    this.service.find(params)
      .then(response => {
        const results = response.data || response;
        if (!results.length) {
          debug(`a record with ${usernameField} of '${username}' did not exist`);
        }
        return this._normalizeResult(response);
      })
      .then(entity => this._comparePassword(entity, password))
      .then(entity => {
        const id = entity[this.service.id];
        const payload = { [`${this.options.entity}Id`]: id, project: entity.project };
        done(null, entity, payload);
      })
      .catch(error => error ? done(error) : done(null, error, { message: 'Invalid login' }));
  }
}

module.exports = function(app) {
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  // app.configure(local());
  app.configure(local({ Verifier: CustomVerifier }));

  // app.configure(oauth2(Object.assign({
  //   name: 'auth0',
  //   Strategy: Auth0Strategy
  // }, config.auth0)));
  //
  // app.configure(oauth2(Object.assign({
  //   name: 'google',
  //   Strategy: GoogleStrategy
  // }, config.google)));
  //
  // app.configure(oauth2(Object.assign({
  //   name: 'facebook',
  //   Strategy: FacebookStrategy
  // }, config.facebook)));

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies),
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    }
  });
};
