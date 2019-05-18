
const { authenticate } = require('@feathersjs/authentication').hooks;
const { protect } = require('@feathersjs/authentication-local').hooks;

const removeCalendarAcls = async context => {
  if (!context.app.get('calendar').enabled) {
    return context;
  }
  const members = await context.service.get(context.id);
  if (members.user) {
    const project = await context.app.service('api/projects').get(members.project);
    const user = await context.app.service('api/users').get(members.user);
    await context.app.service('api/calendar').removeACLs(project.calendar, { email: user.email, calendar_acls: members.calendar_acls });
  }
}

const updateCalendarAcls = async context => {
  if (!context.app.get('calendar').enabled) {
    return context;
  }
  const members = context.result;
  const project = await context.app.service('api/projects').get(members.project);
  const user = await context.app.service('api/users').get(members.user);
  const calendars = await context.app.service('api/calendar').updateACLs(project.calendar, { email: user.email, calendar_acls: members.calendar_acls });
  if (!members.calendar_acls) {
    await context.service._patch(members._id, { calendars });
  }
}

const removeOrphanedUser = async context => {
  const { user } = context.result;
  const members = await context.service.find({ query: { user } });
  if (members.length === 0) {
    await context.app.service('api/users').remove(user);
  }
}

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [removeCalendarAcls]
  },

  after: {
    all: [protect('user.password', 'user.auth0Id', 'user.__v', 'user.createdAt', 'user.updatedAt')],
    find: [],
    get: [],
    create: [updateCalendarAcls],
    update: [],
    patch: [updateCalendarAcls],
    remove: [removeOrphanedUser]
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
