import { Dispatch } from 'redux';
import { UserData } from 'models/Auth';
import { request } from '../../utils/request';
import { actions } from './actions';
import { TokenMessage } from 'models/Auth';

/**
 * Инициализация прилжения
 * @param  {(Dispatch) => Promise<void>}
 */
const initApp = () => async (dispatch: Dispatch) => {
  try {
    dispatch(actions.initApp());
    const user: UserData = await request('/auth/current/', true);
    dispatch(actions.initAppSuccess(user));
  } catch (error) {
    dispatch(actions.initAppFailure());
  }
};

/**
 * Сохранение авторизационных данных пользователя
 * @param  {TokenMessage} user}
 */
const login =
  ({ token, user }: TokenMessage) =>
  (dispatch: Dispatch) => {
    localStorage.setItem('token', token);
    dispatch(actions.loginSuccess(user));
  };

/**
 * сброс авторизационных данных пользователя
 * @param  {TokenMessage} user}
 */
const logout = () => (dispatch: Dispatch) => {
  localStorage.removeItem('token');
  dispatch(actions.logout());
};

export const effects = {
  initApp,
  login,
  logout
};
