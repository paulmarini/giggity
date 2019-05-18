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

export const handleExpiredAuth = async (method, service, args) => {
  console.error('AUTH EXPIRED');
  localStorage.setItem('authExpiredPath', window.location.href)
  if (['create', 'patch', 'remove'].includes(method)) {
    localStorage.setItem('authExpiredMethod', JSON.stringify([method, service, args]))
  }
  localStorage.removeItem('feathers-jwt');
  // store.dispatch(actions.setAuth(false));

  // await client.logout();
  // window.location.href = '/login'
  window.location.href = '/auth/auth0'
}

export const emit = (method, service, ...args) => {
  return new Promise((resolve, reject) => {
    if (!['create', 'find', 'get', 'patch', 'update', 'remove', 'authenticate'].includes(method)) {
      return reject(`Invalid service method ${method}`);
    }
    socket.emit(method, `api/${service}`, ...args, (error, message) => {
      if (error) {
        if (error.message === 'No auth token') {
          return handleExpiredAuth(method, service, args);
        }
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
  const { projects, project, memberId } = await client.passport.verifyJWT(accessToken)
  const { user, preferences } = await emit('get', 'members', memberId);
  updateCurrentUser({ _id: memberId, user, preferences, projects })
  await Promise.all([
    loadUsers(),
    loadProjects(projects),
    loadProject(project),
    loadNextGigId(),
  ])
  store.dispatch(actions.setAuth(true));
}

// client.on('authenticated', handleAuth)

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

const updateCurrentUser = ({ _id, user, preferences, projects }) => {
  let { currentUser } = store.getState();
  if (!currentUser.memberId) {
    currentUser = {
      userId: user._id,
      projects,
      memberId: _id,
    }
  }
  if (currentUser.memberId === _id) {
    const { email, name, photo, project } = user;
    const userData = { ...currentUser, name, email, photo, preferences, project }
    store.dispatch(actions.setUser(userData));
  }
}

const loadProjects = async projects => {
  const projectData = (await emit('find', 'projects', { _id: { $in: Object.keys(projects) }, $select: ['name'] }))
    .map(project => ({ ...project, role: projects[project._id] }));
  return store.dispatch(actions.loadProjects(projectData));
};

const loadUsers = (user) => {
  if (user) {
    updateCurrentUser(user);
  }
  return emit('find', 'members', { '$populate': 'user' })
    .then(users => store.dispatch(actions.loadUsers(users)));
};

const gigUpdated = gig => {
  store.dispatch(actions.gigUpdated(gig))
}

const availabilityUpdated = availability => {
  store.dispatch(actions.availabilityUpdated(availability))
}

const loadNextGigId = async () => {
  const nextGig = (await emit('find', 'gigs', {
    start: { $gt: new Date().getTime() },
    $limit: 1,
    $select: ['_id'],
    $sort: { start: 1 }
  })).data[0];
  if (nextGig) {
    store.dispatch(actions.loadNextGigId(nextGig._id));
  }
}

projectService.on('patched', loadProject);

userService.on('created', loadUsers);
userService.on('patched', loadUsers);
userService.on('removed', loadUsers);

gigService.on('created', gigUpdated);
gigService.on('patched', gigUpdated);
gigService.on('removed', gigUpdated);

availabilityService.on('created', availabilityUpdated);
availabilityService.on('patched', availabilityUpdated);
