import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import { store, actions } from './store';

const client = feathers();

export const socket = io(null, {
  transports: ['websocket'],
  forceNew: true
});

client.configure(socketio(socket));
client.configure(auth({ storage: window.localStorage }));

export const emit = (method, service, ...args) => {

  return new Promise((resolve, reject) => {
    if (!['create', 'find', 'get', 'patch', 'update', 'remove', 'authenticate'].includes(method)) {
      return reject(`Invalid service method ${method}`);
    }
    socket.emit(method, `api/${service}`, ...args, (error, message) => {
      if (error) {
        console.error('EMIT ERROR', method, error);
        store.dispatch({ type: 'ADD_ERROR', payload: error });
        return reject(error);
      }
      resolve(message);
    });
  });
};

export const authenticate = () => {
  return client.authenticate()
    .then(handleAuth)
    .catch((err) => {
      client.logout();
      return Promise.reject(err)
    })
};

export const login = async ({ email, password, project }) => {
  const login = await client.authenticate({
    strategy: 'local',
    email,
    password,
    project
  });

  return login;
};

export const logout = () => {
  client.logout();
};

const handleAuth = async ({ accessToken }) => {
  const { userId, projects, project, memberId } = await client.passport.verifyJWT(accessToken)
  const { user } = (await emit('find', 'members', { user: userId, project }))[0];
  const { email, name, photo } = user;
  const userData = { userId, projects: Object.keys(projects), name, email, photo, memberId, project }

  await Promise.all([
    loadUsers(),
    loadProjects(projects),
    loadProject(project)
  ])
  store.dispatch(actions.setAuth(true));
  store.dispatch(actions.setUser(userData));
}

client.on('authenticated', handleAuth)

client.on('logout', () => {
  store.dispatch(actions.resetApp());
})

export const userService = client.service('api/members');
export const gigService = client.service('api/gigs');
export const availabilityService = client.service('api/gig-availability');
export const projectService = client.service('api/projects');
export const registrationService = client.service('api/registration');

export const loadProject = project => {
  return emit('get', 'projects', project)
    .then(project => store.dispatch(actions.setProject(project)))
};

const loadProjects = async projects => {
  const projectData = (await emit('find', 'projects', { _id: { $in: Object.keys(projects) }, $select: ['name'] }))
    .map(project => ({ ...project, role: projects[project._id] }));
  return store.dispatch(actions.loadProjects(projectData));
};

const loadUsers = () => {
  return emit('find', 'members', { '$populate': 'user' })
    .then(users => store.dispatch(actions.loadUsers(users)));
};

const gigUpdated = gig => {
  store.dispatch(actions.gigUpdated(gig))
}

projectService.on('patched', loadProject);

userService.on('created', loadUsers);
userService.on('patched', loadUsers);
userService.on('updated', loadUsers);
userService.on('removed', loadUsers);


gigService.on('created', gigUpdated);
gigService.on('patched', gigUpdated);
gigService.on('updated', gigUpdated);

const availabilityUpdated = availability => {
  store.dispatch(actions.availabilityUpdated(availability))
}

availabilityService.on('created', availabilityUpdated);
availabilityService.on('patched', availabilityUpdated);
availabilityService.on('updated', availabilityUpdated);
