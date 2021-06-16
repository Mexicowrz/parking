import { ActionType } from 'typesafe-actions';
import { actions } from './actions';
import { UserData } from 'models/Auth';

/**
 * Тип глобального состояния
 */
export type State = {
  user?: UserData;
  loggedIn: boolean;
  initializationInProgress: boolean;
};

export type ActionTypes = ActionType<typeof actions>;
