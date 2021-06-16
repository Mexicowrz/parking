import { State, ActionTypes } from './types';

import { actionTypes } from './actions';

const initialState: State = {
  initializationInProgress: false,
  loggedIn: false,
  user: undefined,
};
/**
 * Редьюсер приложения
 *
 * @param  {State=initialState} state
 * @param  {ActionTypes} action
 * @returns State
 */
export const reducer = (
  state: State = initialState,
  action: ActionTypes,
): State => {
  switch (action.type) {
    case actionTypes.INIT_APP:
      return {
        ...state,
        initializationInProgress: true,
      };
    case actionTypes.INIT_APP_SUCCESS:
      const user = action.payload;
      return {
        ...state,
        loggedIn: true,
        initializationInProgress: false,
        user,
      };
    case actionTypes.INIT_APP_FAILURE:
      return {
        ...state,
        loggedIn: false,
        initializationInProgress: false,
        user: undefined,
      };
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        loggedIn: true,
      };
    case actionTypes.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: undefined,
        loggedIn: false,
      };
    default:
      return state;
  }
};
