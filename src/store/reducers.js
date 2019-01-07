const defaultState = {
  gigsList: [],
  currentGig: {
    id: ''
  },
  currentUser: {},
  userAvailability: {}
}

export default (state = defaultState, action) => {
  switch(action.type) {
    case 'SET_USER':
      return {...state, currentUser: action.payload};
    case 'LOAD_GIGS':
      return {...state, gigsList: action.payload};
    case 'LOAD_GIG':
      return {...state, currentGig: action.payload};
    case 'LOAD_USER_AVAILABILITY':
      return {...state, userAvailability: action.payload};
    default:
      return state;
  }
}
