const errors = require('@feathersjs/errors');
const randomNumber = require("random-number-csprng");

const roles = ['Root', 'Admin', 'Manager', 'Member', 'Read-Only'];

module.exports = {
  generateCode: async () => {
    const int = await randomNumber(1, 999999);
    return String(int)
      .padStart(6, 0)
      .slice(0, 6);
  },
  restrictToRole: allowedRole => context => {
    if (
      !allowedRole || // No role defined
      !context.params.provider || // method was not called by external client
      (
        // Ok for users to update themselves
        context.id === context.params.user._id &&
        context.method !== 'remove'
      )
    ) {
      return context;
    }

    const userRole = context.params.user.projects[context.params.user.project];
    const roleIndex = roles.indexOf(allowedRole);
    const userIndex = roles.indexOf(userRole);

    if (userIndex > roleIndex) {
      throw new errors.BadRequest(`Only users with the role ${allowedRole} or above can perform this operation`);
    }
    return context;
  },

  removeRelated: (service, field) => async context => {
    const related = await context.app.service(service)
      .find({ query: { [field]: context.id, $select: '_id' } });
    await Promise.all(
      related.data.map(
        ({ _id }) => context.app.service(service).remove(_id)
      )
    );
  }

}
