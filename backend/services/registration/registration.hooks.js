const randomNumber = require("random-number-csprng");
const { disallow, required } = require('feathers-hooks-common');

const { generateCode } = require('../../hooks/customHooks');

const initializeProject = async ({ app, result }) => {
  if (!result.length) {
    throw new Error('Unable to locate registration');
  }
  let user;
  const { project, project_id, email, verificationCode } = result[0];
  await app.service('api/projects').create({ name: project, _id: project_id });

  if (app.get('calendar').enabled) {
    const calendar = await app.service('api/calendar').create({ project });
    await app.service('api/projects')._patch(project_id, { calendar })
  }

  const users = await app.service('api/users').find({ query: { email } });
  if (users.data.length) {
    user = users.data[0];
    await app.service('api/users').patch(user._id, { project: project_id, password: verificationCode });
    await app.service('api/members').create({ project: project_id, user: user._id, role: 'Admin' });
  } else {
    user = await app.service('api/users').create({ project: project_id, email, name: email, password: verificationCode, role: 'Admin' });
  }
}

const getVerificationCode = async context => {
  const { data } = context;
  data.project_id = data.project
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  data.verified = false;
  data.verificationCode = await generateCode();
  return context;
}

const checkVerify = context => {
  const { params: { query } } = context;
  if (!query.email || !query.verificationCode || !query.project) {
    throw new Error('Invalid Request');
  }
  context.data.verified = false;
  return context;
}

module.exports = {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [getVerificationCode],
    update: [disallow()],
    patch: [checkVerify],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [initializeProject],
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
