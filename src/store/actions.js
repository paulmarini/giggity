const actions = {
  loadGigs: payload => ({
    type: 'LOAD_GIGS',
    payload: payload.map(gig => ({ ...gig }))
  }),
  gigUpdated: payload => ({
    type: 'GIG_UPDATED',
    payload
  }),
  loadGig: payload => ({
    type: 'LOAD_GIG',
    payload: { ...payload }
  }),
  loadNextGigId: payload => ({
    type: 'LOAD_NEXT_GIG_ID',
    payload: payload
  }),
  loadUsers: payload => ({
    type: 'LOAD_USERS',
    payload: payload.map(user => {
      if (user.user && user.user.name) {
        delete user.user._id;
        Object.assign(user, user.user);
        delete user.user;
      }
      return user;
    })
  }),
  loadProjects: payload => ({
    type: 'LOAD_PROJECTS',
    payload
  }),
  setUser: payload => ({
    type: 'SET_USER',
    payload
  }),
  setProject: payload => ({
    type: 'SET_PROJECT',
    payload
  }),
  loadGigAvailability: payload => ({
    type: 'LOAD_GIG_AVAILABILITY',
    payload
  }),
  availabilityUpdated: payload => ({
    type: 'UPDATE_AVAILABILITY',
    payload
  }),
  loadUserAvailability: payload => ({
    type: 'LOAD_USER_AVAILABILITY',
    payload
  }),
  addError: payload => ({
    type: 'ADD_ERROR',
    payload
  }),
  removeError: payload => ({
    type: 'REMOVE_ERROR',
    payload
  }),
  updateDrawer: payload => ({
    type: 'UPDATE_DRAWER',
    payload
  }),
  setAuth: payload => ({
    type: 'SET_AUTH',
    payload
  }),
  resetApp: () => ({ type: 'RESET_APP' })
}

export default actions;
