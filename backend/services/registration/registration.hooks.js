const randomNumber = require("random-number-csprng");
const { disallow, required } = require('feathers-hooks-common');

const generateCode = async () => {
  const int = await randomNumber(1, 999999);
  return String(int)
    .padStart(6, 0)
    .slice(0, 6);
}

module.exports = {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [
      async (context) => {
        const { data } = context;
        data.project_id = data.project
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');
        data.verified = false;
        data.verificationCode = await generateCode();
        return context;
      }
    ],
    update: [disallow()],
    patch: [
      context => {
        const { params: { query } } = context;
        if (!query.email || !query.verificationCode || !query.project) {
          throw new Error('Invalid Request');
        }
        context.data.verified = false;
        return context;
      }
    ],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      async ({ app, result }) => {
        if (!result.length) {
          throw new Error('Unable to locate registration');
        }

        const { project, project_id, email, verificationCode } = result[0];
        await app.service('projects').create({ name: project, _id: project_id });
        await app.service('users').create({ project: project_id, email, name: email, type: 'Admin', password: verificationCode })
      }
    ],
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
