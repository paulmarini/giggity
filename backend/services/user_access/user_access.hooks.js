
const { authenticate } = require('@feathersjs/authentication').hooks;

const removeCalendarAcls = async context => {
  const user_access = context.service.get(context.id);
  const project = await context.app.service('api/projects').get(user_access.project);
  const user = await context.app.service('api/users').get(user_access.user);
  await context.app.service('api/calendar').removeACLs(project.calendar, { email: user.email, calendar_acls: user_access.calendar_acls });
}

const updateCalendarAcls = async context => {
  const user_access = context.result;
  const project = await context.app.service('api/projects').get(user_access.project);
  const user = await context.app.service('api/users').get(user_access.user);
  const calendars = await context.app.service('api/calendar').updateACLs(project.calendar, { email: user.email, calendar_acls: user_access.calendar_acls });
  if (!user_access.calendar_acls) {
    await context.service._patch(user_access._id, { calendars });
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
    all: [],
    find: [],
    get: [],
    create: [updateCalendarAcls],
    update: [updateCalendarAcls],
    patch: [updateCalendarAcls],
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
