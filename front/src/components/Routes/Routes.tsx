import React, { lazy, useEffect } from 'react';
import { Switch, Route, useLocation, useHistory } from 'react-router-dom';
import { RootState } from 'store/configureStore';
import { useSelector } from 'hooks/useSelector';
import { Error404 } from 'pages/ErrorPage';

const myPlaces = lazy(() => import('pages/MyPlaceList'));
const freePlaces = lazy(() => import('pages/FreePlaceList'));
const userList = lazy(() => import('pages/UserList'));
const userEdit = lazy(() => import('pages/UserEdit'));
const messageList = lazy(() => import('pages/MessageList'));
const privateOffice = lazy(() => import('pages/PrivateOffice'));

/**
 * Компонент настройки роутинга в приложении
 * @returns
 */
export const Routes: React.FC = () => {
  const user = useSelector<RootState['app']['user']>((state) => state.app.user);
  const location = useLocation();
  const history = useHistory();
  useEffect(() => {
    if (location.pathname === '/') {
      history.push(
        user!.role === 0
          ? '/admin/users'
          : user!.role === 1
          ? '/place/mylist'
          : '/place/free',
      );
    }
  }, [history, location.pathname, user]);
  return (
    <>
      {user!.role === 0 && (
        <Switch key='admin-switch'>
          <Route
            key='admin_userlist'
            path={'/admin/users'}
            component={userList}
          />
          <Route
            key='admin_messagelist'
            path={'/admin/messages'}
            component={messageList}
          />
          <Route
            key='admin_useredit'
            path={'/admin/user/:id'}
            component={userEdit}
          />
        </Switch>
      )}
      <Switch key='user-switch'>
        {user!.role <= 1 && (
          <Route
            key='place_mylist'
            path={'/place/mylist'}
            component={myPlaces}
          />
        )}
        <Route
          key='place_freelist'
          path={'/place/free'}
          component={freePlaces}
        />
        <Route key='user_lk' path={'/user/lk'} component={privateOffice} />
        <Route key='404' component={Error404} />
      </Switch>
    </>
  );
};
