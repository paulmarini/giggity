
const { authenticate } = require('@feathersjs/authentication').hooks;
const { protect } = require('@feathersjs/authentication-local').hooks;

const removeCalendarAcls = async context => {
  if (!context.app.get('calendar').enabled) {
    return context;
  }
  const user_access = await context.service.get(context.id);
  if (user_access.user) {
    const project = await context.app.service('api/projects').get(user_access.project);
    const user = await context.app.service('api/users').get(user_access.user);
    await context.app.service('api/calendar').removeACLs(project.calendar, { email: user.email, calendar_acls: user_access.calendar_acls });
  }
}

const updateCalendarAcls = async context => {
  if (!context.app.get('calendar').enabled) {
    return context;
  }
  const user_access = context.result;
  const project = await context.app.service('api/projects').get(user_access.project);
  const user = await context.app.service('api/users').get(user_access.user);
  const calendars = await context.app.service('api/calendar').updateACLs(project.calendar, { email: user.email, calendar_acls: user_access.calendar_acls });
  if (!user_access.calendar_acls) {
    await context.service._patch(user_access._id, { calendars });
  }
}

const removeOrphanedUser = async context => {
  const { user } = context.result;
  const access = await context.service.find({ query: { user } });
  if (access.length === 0) {
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
    all: [protect('user.password', 'user.auth0Id')],
    find: [],
    get: [],
    create: [updateCalendarAcls],
    update: [updateCalendarAcls],
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
