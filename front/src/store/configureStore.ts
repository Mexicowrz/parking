import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import {
  connectRouter,
  routerMiddleware,
  RouterState,
} from 'connected-react-router';
import { History } from 'history';
import { browserHistory } from '../utils/history';
import { appReducer, AppState } from './app';

/**
 * Тип общего состояния стора
 */
export type RootState = {
  app: AppState;
  router: RouterState;
};

/**
 * Основной редюсер
 * @param {History} history
 * @returns {Reducer<CombinedState<RootState>>}
 */
export const rootReducer = (history: History) =>
  combineReducers<RootState>({
    app: appReducer,
    router: connectRouter(history),
  });


const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  rootReducer(browserHistory),
  composeEnhancers(applyMiddleware(routerMiddleware(browserHistory), thunk)),
);
