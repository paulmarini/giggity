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
  const user = await client.passport.verifyJWT(accessToken)
  const userData = await emit('get', 'users', user.userId);
  store.dispatch(actions.setAuth(true));
  store.dispatch(actions.setUser({ ...user, ...userData }));
  console.log('authed', { ...user, ...userData })
  localStorage.setItem('email', user.email);
  loadUsers();
  await loadProject(userData.project);
}

client.on('authenticated', handleAuth)

client.on('logout', () => {
  store.dispatch(actions.resetApp());
})

export const userService = client.service('api/user-access');
export const gigService = client.service('api/gigs');
export const availabilityService = client.service('api/gig-availability');
export const projectService = client.service('api/projects');
export const registrationService = client.service('api/registration');

export const loadProject = project => {
  return emit('get', 'projects', project)
    .then(project => store.dispatch(actions.setProject(project)))
};

const loadProjects = () => {
  return emit('find', 'projects')
    .then(projects => store.dispatch(actions.loadProjects(projects.data)));
};

const loadUsers = () => {
  return emit('find', 'user-access', { '$populate': 'user' })
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
