const errors = require('@feathersjs/errors');
const randomNumber = require("random-number-csprng");
const { existsByDot, deleteByDot } = require("feathers-hooks-common");

module.exports = {
  generateCode: async () => {
    const int = await randomNumber(1, 999999);
    return String(int)
      .padStart(6, 0)
      .slice(0, 6);
  },
  restrictToRole: (allowedRole) => context => {
    if (
      !allowedRole || // No role defined
      !context.params.provider // method was not called by external client
    ) {
      return context;
    }
    const roles = context.app.get('roles')
    const userRole = context.params.user.projects[context.params.user.project];
    const role_index = roles.indexOf(allowedRole);
    const userIndex = roles.indexOf(userRole);
    const ids = [context.params.user._id.toString(), context.params.user.member_id]
    const isSelf = context.method === 'patch' &&
      (
        ids.includes(context.id) ||
        (context.data.member && ids.includes(context.data.member))
      )

    if (!isSelf && userIndex > role_index) {
      throw new errors.BadRequest(`Only users with the role ${allowedRole} or above can perform this operation`);
    }
    context.params.allowedRole = isSelf ? 'self' : allowedRole;
    return context;
  },

  restrictFields: (restrictRoles, throwError = false) => context => {
    const { data } = context;
    const fields = restrictRoles[context.params.allowedRole];
    if (fields) {
      fields.forEach(name => {
        const errorMessage = `You do not have permissions to update the field  "${name}"`;
        const error = `Patch blocked: ${context.path}.${name} by ${context.params.user.member_id}`;
        if (existsByDot(data, name)) {
          console.error(error);
          if (throwError) throw new errors.BadRequest(errorMessage);
          deleteByDot(data, name);
        }
        if (data[name]) {
          console.error(error);
          if (throwError) throw new errors.BadRequest(errorMessage);
          delete data[name];
        }
      });
    }
    return context;
  },

  removeRelated: (service, field) => async context => {
    const related = await context.app.service(service)
      .find({ query: { [field]: context.id, $select: '_id' } });
    await Promise.all(
      related.map(
        ({ _id }) => context.app.service(service).remove(_id)
      )
    );
  }

}
