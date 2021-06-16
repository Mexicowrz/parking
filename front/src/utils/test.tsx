import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { actions } from 'store/app/actions';
import { Role, UserData } from 'models/Auth';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { rootReducer } from 'store/configureStore';

export const renderWithRedux = (
  component: React.ReactElement,
  user?: UserData,
  url?: string,
) => {
  const history = createMemoryHistory();
  if (url) {
    history.push(url);
  }
  const store = createStore(rootReducer(history));
  if (user) store.dispatch(actions.initAppSuccess(user));
  return {
    ...render(
      <Router history={history}>
        <Provider store={store}>{component}</Provider>
      </Router>,
    ),
    store,
  };
};

export const SampleUser = {
  admin: {
    id: 1,
    username: 'admin',
    firstname: 'admin',
    lastname: 'admin',
    role: Role.ADMIN,
  },
  owner: {
    id: 2,
    username: 'owner',
    firstname: 'owner',
    lastname: 'owner',
    role: Role.PLACE_OWNER,
  },
  customer: {
    id: 3,
    username: 'customer',
    firstname: 'customer',
    lastname: 'customer',
    role: Role.CUSTOMER,
  },
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
