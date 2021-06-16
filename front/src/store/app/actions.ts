import { createAction } from 'typesafe-actions';
import { TokenMessage, UserData } from 'models/Auth';

// import { LoginResponse } from '../../types/serverRequests';
// import { User } from '../models/User';

/**
 * Список доступных эшкенов
 */
export const actionTypes = {
  /** инитиализация приложения */
  INIT_APP: 'INIT_APP',
  INIT_APP_SUCCESS: 'INIT_APP_SUCCESS',
  INIT_APP_FAILURE: 'INIT_APP_FAILURE',

  /** авторизация пользователя */
  LOGIN: 'LOGIN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',

  /** выход пользователя */
  LOGOUT: 'LOGOUT',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  LOGOUT_FAILURE: 'LOGOUT_FAILURE',
} as const;

export const actions = {
  initApp: createAction(actionTypes.INIT_APP)(),
  initAppSuccess: createAction(actionTypes.INIT_APP_SUCCESS)<UserData>(),
  initAppFailure: createAction(actionTypes.INIT_APP_FAILURE)(),

  login: createAction(actionTypes.LOGIN)<TokenMessage>(),
  loginSuccess: createAction(actionTypes.LOGIN_SUCCESS)<UserData>(),
  logout: createAction(actionTypes.LOGOUT)(),
};
