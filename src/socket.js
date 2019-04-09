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

export const emit = (method, ...args) => {
  return new Promise((resolve, reject) => {
    if (!['create', 'find', 'get', 'patch', 'update', 'remove', 'authenticate'].includes(method)) {
      return reject(`Invalid service method ${method}`);
    }
    socket.emit(method, ...args, (error, message) => {
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
}

client.on('authenticated', handleAuth)

client.on('logout', () => {
  store.dispatch(actions.resetApp());
})

export const userService = client.service('users');
export const gigService = client.service('gigs');
export const availabilityService = client.service('gig-availability');
export const projectService = client.service('projects');
export const registrationService = client.service('registration');

const loadProjects = () => {
  return emit('find', 'projects')
    .then(projects => store.dispatch(actions.loadProjects(projects.data)));
};

const loadUsers = () => {
  return emit('find', 'users')
    .then(users => store.dispatch(actions.loadUsers(users.data)));
};

const gigUpdated = gig => {
  store.dispatch(actions.gigUpdated(gig))
}

gigService.on('created', gigUpdated);
gigService.on('patched', gigUpdated);
gigService.on('updated', gigUpdated);

const availabilityUpdated = availability => {
  store.dispatch(actions.availabilityUpdated(availability))
}

availabilityService.on('created', availabilityUpdated);
availabilityService.on('patched', availabilityUpdated);
availabilityService.on('updated', availabilityUpdated);
