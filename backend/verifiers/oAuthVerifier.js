const Debug = require('debug');
const { Verifier } = require('@feathersjs/authentication-oauth2');
const decode = require('jwt-decode');

const debug = Debug('feathers-authentication-emailfirstoauth2:verify');

class EmailFirstOAuth2Verifier extends Verifier {

  constructor(app, options = {}) {
    options.emailField = options.emailField || 'email';
    super(app, options);
  }

  verify(req, accessToken, refreshToken, profile, done) {
    debug('Checking credentials');
    const options = this.options;
    let query = {
      $or: [
        { '_id': profile.userId },
        { [options.idField]: profile.id },
        { [options.emailField]: { $in: profile.emails.map(emailObj => emailObj.value) } }
      ],
      $limit: 1
    };
    const data = { profile, accessToken, refreshToken };
    let existing;
    if (this.service.id === null || this.service.id === undefined) {
      debug('failed: the service.id was not set');
      return done(new Error('the `id` property must be set on the entity service for authentication'));
    }

    if (req.cookies && req.cookies['feathers-jwt']) {
      const jwt = decode(req.cookies['feathers-jwt']);
      profile.userId = jwt.userId;
      existing = { _id: jwt.userId };
      query = {
        _id: jwt.userId,
        $limit: 1
      };
    }
    // Check request object for an existing entity
    if (req && req[options.entity]) {
      existing = req[options.entity];
    }

    // Check the request that came from a hook for an existing entity
    if (!existing && req && req.params && req.params[options.entity]) {
      existing = req.params[options.entity];
    }

    // If there is already an entity on the request object (ie. they are
    // already authenticated) attach the profile to the existing entity
    // because they are likely "linking" social accounts/profiles.
    if (existing) {
      return this._updateEntity(existing, data)
        .then(entity => this._setPayloadAndDone(entity, done))
        .catch(error => error ? done(error) : done(null, error));
    }

    // Find or create the user since they could have signed up via facebook.
    this.service
      .find({ query })
      .then(this._normalizeResult)
      .then(entity => {
        if (!entity) {
          throw new Error(`Could not locate user matching ${(profile.emails || [{}])[0].value} `)
        }
        return this._updateEntity(entity, data);
      })
      .then(entity => this._setPayloadAndDone(entity, done))
      .catch(error => error ? done(error) : done(null, error));
  }
}

module.exports = EmailFirstOAuth2Verifier;
