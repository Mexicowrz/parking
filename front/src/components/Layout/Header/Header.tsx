import React, { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Layout as AntLayout, Menu } from 'antd';
import { PoweroffOutlined, UserOutlined } from '@ant-design/icons';
import { RootState } from 'store/configureStore';
import { useSelector } from 'hooks/useSelector';
import { appEffects } from 'store/app';
import { Role } from 'models/Auth';

/**
 * Компонент для формирования шапки приложения
 * @returns
 */
export const Header: React.FC = () => {
  const history = useHistory();
  const loc = useLocation();
  const user = useSelector<RootState['app']['user']>((state) => state.app.user);
  const dispatch = useDispatch();

  const onMenuClick = useCallback(
    (props) => {
      if (props.key === 'logout') {
        dispatch(appEffects.logout());
      } else history.push(props.key as string);
    },
    [dispatch, history],
  );

  return (
    <AntLayout.Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <Menu
        theme='dark'
        mode='horizontal'
        onClick={onMenuClick}
        defaultSelectedKeys={[loc.pathname]}
      >
        {/* убирать пункты меню в зависимости от роли */}
        {user!.role === Role.ADMIN && (
          <Menu.SubMenu key='admin' title='Администрирование'>
            <Menu.Item key='/admin/users'>Пользователи</Menu.Item>
            <Menu.Item key='/admin/messages'>Сообщения</Menu.Item>
          </Menu.SubMenu>
        )}
        {user!.role <= Role.PLACE_OWNER && (
          <Menu.Item key='/place/mylist'>Места</Menu.Item>
        )}

        <Menu.Item key='/place/free'>Свободные места</Menu.Item>
        <Menu.Item key='/user/lk' title='Личный кабинет'>
          <UserOutlined />
        </Menu.Item>
        <Menu.Item key='logout' title='Выход'>
          <PoweroffOutlined />
        </Menu.Item>
      </Menu>
    </AntLayout.Header>
  );
};
