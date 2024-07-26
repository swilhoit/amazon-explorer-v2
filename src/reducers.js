// reducers/index.js

import { combineReducers } from 'redux';

// Import the action types
const FETCH_AD_DATA_REQUEST = 'FETCH_AD_DATA_REQUEST';
const FETCH_AD_DATA_SUCCESS = 'FETCH_AD_DATA_SUCCESS';
const FETCH_AD_DATA_FAILURE = 'FETCH_AD_DATA_FAILURE';

// Ad data reducer
const adDataInitialState = {
  adData: null,
  loading: false,
  error: null,
};

function adDataReducer(state = adDataInitialState, action) {
  switch (action.type) {
    case FETCH_AD_DATA_REQUEST:
      return { ...state, loading: true };
    case FETCH_AD_DATA_SUCCESS:
      return { ...state, loading: false, adData: action.payload, error: null };
    case FETCH_AD_DATA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// Your existing initial state
const initialState = {
  // Your other initial state properties here
};

// Your existing root reducer
function mainReducer(state = initialState, action) {
  switch (action.type) {
    // Add your other reducer cases here
    default:
      return state;
  }
}

// Combine the reducers
const rootReducer = combineReducers({
  main: mainReducer,
  adData: adDataReducer,
});

export default rootReducer;