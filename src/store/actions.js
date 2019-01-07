const actions = {
  loadGigs: payload => ({
    type: 'LOAD_GIGS',
    payload
  }),
  loadGig: payload => ({
    type: 'LOAD_GIG',
    payload
  }),
  setUser: payload => ({
    type: 'SET_USER',
    payload
  }),
  loadUserAvailability: payload => ({
    type: 'LOAD_USER_AVAILABILITY',
    payload
  })
}

export default actions;
