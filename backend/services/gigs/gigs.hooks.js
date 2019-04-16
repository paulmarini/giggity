const { authenticate } = require('@feathersjs/authentication').hooks;
const moment = require('moment');

const mailGigUpdate = async context => {
  const gig = context.result;

  // normally filter this for preferences
  const project = await context.app.service('api/projects').get(gig.project);
  const users = await context.app.service('api/users').find({ query: { project: gig.project } });

  await Promise.all(users.data.map(user => {
    return context.app.service('api/mail').create({
      template: 'gigUpdate',
      message: {
        to: 'greg@primate.net' // FIXME user.email
      },
      locals: {
        type: context.method === 'create' ? 'new' : 'updated',
        user,
        gig,
        project,
        date: moment(gig.date).format('M/D/YY')
      }
    });
  }))
}

module.exports = {
  before: {
    all: [
      authenticate('jwt')
    ],
    find: [],
    get: [
      ({ app, params: { connection }, id }) => {
        app.channels.forEach(channel => {
          if (channel.match('/gigs/')) {
            app.channel(channel).leave(connection);
          }
        });
        app.channel(`/gigs/${id}`).join(connection);
      }
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [mailGigUpdate],
    update: [mailGigUpdate],
    patch: [mailGigUpdate],
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
