const { authenticate } = require('@feathersjs/authentication').hooks;
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const errors = require('@feathersjs/errors');
const { restrictToRole, generateCode } = require('../../hooks/customHooks');

const switchProject = context => {
  if (context.params.provider && context.data && context.data.project && context.params.user) {
    const { projects } = context.params.user;
    if (!projects.includes(context.data.project)) {
      throw new errors.BadRequest(`User is not a member of the project ${context.data.project}`)
    } else {
      context.params.user.project = context.data.project;
      context.app.channels.forEach(channel => {
        if (channel.match('/projects/') || channel.match('/gigs/')) {
          context.app.channel(channel).leave(context.params.connection);
        }
      });
      context.app.channel(`/projects/${context.data.project}`).join(context.params.connection);
    }
  }
  return context;
}

const createUser = async context => {
  if (!context.params.provider) {
    return;
  }
  context.data.accessCode = await generateCode();
  context.data.password = context.data.accessCode;
  return context;
}

const customizeAuthResponse = async context => {
  // if (context.data.google) {
  //   context.data.email = context.data.google.profile.emails[0].value;
  //   context.data.name = context.data.google.profile.displayName;
  //   context.data.photo = context.data.google.profile.photos.length ? context.data.google.profile.photos[0].value : '';
  //   context.data.googleId = context.data.google.profile.id;
  // }
  if (context.data.auth0) {
    const user = await context.app.service('users').get(context.id);
    const data = context.data.auth0.profile;
    if (!user.auth0Id) {
      context.data.email = data.emails[0].value;
      context.data.name = data.displayName;
      context.data.photo = data.picture;
      context.data.auth0Id = data.id;
    }
  }

  return context;
}

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [restrictToRole('Admin'), createUser, customizeAuthResponse, hashPassword()],
    update: [restrictToRole('Admin'), customizeAuthResponse, hashPassword(), switchProject],
    patch: [restrictToRole('Admin'), customizeAuthResponse, hashPassword(), switchProject],
    remove: []
  },

  after: {
    all: [protect('password', 'auth0Id')],
    find: [],
    get: [],
    create: [async (context) => {
      await context.app.service('user-access').create({ project: context.params.user.project, user: context.result._id });
    }],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
