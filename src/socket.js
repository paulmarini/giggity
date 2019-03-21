import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import { store, actions } from './store';

const { protocol, hostname } = window.location;
const client = feathers();

export const socket = io(`${protocol}//${hostname}:3030`, {
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
    .catch((err) => {
      console.log('EEORE', err)
      client.logout();
      return Promise.reject(err)
    })
};

export const login = ({ email, password }) => {
  return client.authenticate({
    strategy: 'local',
    email,
    password,
  });
};

export const logout = () => {
  client.logout();
};

client.on('authenticated', ({ accessToken }) => {
  client.passport.verifyJWT(accessToken)
    .then(user => {
      store.dispatch(actions.setUser(user));
      store.dispatch(actions.setAuth(true));
      loadUsers();
    })
})

client.on('logout', () => {
  store.dispatch(actions.resetApp());
})

export const userService = client.service('users');
export const gigService = client.service('gigs');
export const availabilityService = client.service('gig-availability');

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
