const { authenticate } = require('@feathersjs/authentication').hooks;
const moment = require('moment');
const { removeRelated } = require('../../hooks/customHooks');
const { restrictToRole, restrictFields } = require('../../hooks/customHooks');

const mailGigUpdate = async context => {
  if (!context.app.get('mail').enabled) {
    return context;
  }

  const gig = context.result;
  if (gig.status === 'Draft') {
    return;
  }

  const filter = context.method === 'create' ? 'added' : 'updated';
  const project = await context.app.service('api/projects').get(gig.project);
  const users = await context.app.service('api/members').find({ query: { project: gig.project, $populate: 'user', [`preferences.email.gig_${filter}`]: true } });
  await Promise.all(users.map(({ user }) => {
    return context.app.service('api/mail').create({
      template: 'gigUpdate',
      message: {
        to: user.email // FIXME user.email
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

const updateCalendar = async context => {
  if (!context.app.get('calendar').enabled) {
    return context;
  }
  const gig = context.result;
  gig.calendar = gig.calendar || {};
  const project = await context.app.service('api/projects').get(gig.project);
  const remove = context.method === 'remove' || gig.status === 'Draft';
  const calendar = await context.app.service('api/calendar').updateEvent(project.calendar, gig, remove);
  if (calendar.id !== gig.calendar.id || calendar.public_id !== gig.calendar.public_id) {
    gig.calendar = calendar;
    await context.app.service('api/gigs')._patch(gig._id, { calendar });
  }
  return context;
}

module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      // preUpdate
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
    create: [restrictToRole('Manager')],
    update: [],
    patch: [restrictToRole('Manager'), restrictFields({ Manager: ['project'] })],
    remove: [restrictToRole('Manager'), removeRelated('api/gig-availability', 'gig')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [mailGigUpdate, updateCalendar],
    update: [],
    patch: [mailGigUpdate, updateCalendar],
    remove: [updateCalendar]
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
