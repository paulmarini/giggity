const defaultState = {
  gigsList: [],
  currentGig: {
    _id: ''
  },
  currentUser: {},
  userAvailability: {},
  currentGigAvailability: {},
  users: [],
  errors: [],
  authenticated: false,
  drawerOpen: false,
  projects: [],
  currentProject: {},
  nextGigId: ''
}

const appReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'LOAD_USERS':
      return { ...state, users: action.payload };
    case 'LOAD_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'LOAD_GIGS':
      return { ...state, gigsList: action.payload };
    case 'LOAD_GIG':
      return { ...state, currentGig: action.payload };
    case 'LOAD_NEXT_GIG_ID':
      return { ...state, nextGigId: action.payload };
    case 'LOAD_USER_AVAILABILITY':
      return {
        ...state,
        userAvailability: action.payload
          .reduce((obj, payload) => {
            obj[payload.gig] = payload
            return obj;
          }, {})
      };
    case 'LOAD_GIG_AVAILABILITY':
      return {
        ...state,
        currentGigAvailability: action.payload
          .reduce((obj, payload) => {
            obj[payload.member] = payload
            return obj;
          }, {})
      };
    case 'SET_AUTH':
      return { ...state, authenticated: action.payload }
    case 'ADD_ERROR':
      return { ...state, errors: [action.payload, ...state.errors] }
    case 'REMOVE_ERROR':
      return { ...state, errors: [...state.errors.slice(1)] }
    case 'UPDATE_AVAILABILITY': {
      const availability = action.payload;
      const { currentGig, currentUser } = state;
      const newState = { ...state };
      if (availability.gig === currentGig._id) {
        newState.currentGigAvailability = {
          ...state.currentGigAvailability,
          [availability.member]: availability
        };
      }
      if (availability.member === currentUser.memberId) {
        newState.userAvailability = {
          ...state.userAvailability,
          [availability.gig]: availability
        };
      }
      return newState;
    }
    case 'GIG_UPDATED': {
      const gig = action.payload;
      gig.date = new Date(gig.date);
      const { currentGig, gigsList } = state;
      const newState = { ...state };
      if (gig._id === currentGig._id) {
        newState.currentGig = {
          ...currentGig,
          ...gig
        };
      }
      newState.gigsList = gigsList.map(g => {
        return g._id === gig._id ? { ...g, ...gig } : g
      })

      return newState;
    }
    case 'UPDATE_DRAWER': {
      return { ...state, drawerOpen: action.payload }
    }
    default:
      return state;
  }
}

export default (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }
  return appReducer(state, action)
}
