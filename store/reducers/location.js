import * as actionTypes from '../actionTypes';

const initialState = {
  current: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.LOCATION_UPDATE: {
      return { ...state, current: payload.coords };
    }
    default:
      return state;
  }
  
}
