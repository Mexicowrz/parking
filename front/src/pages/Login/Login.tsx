import React, { useCallback, useEffect } from 'react';
import { useRequest } from 'hooks/useRequest';
import { Form, Input, Button, Typography, notification, Alert } from 'antd';
import { UserOutlined, LockOutlined, CarOutlined } from '@ant-design/icons';
import * as Styled from './Login.styled';
import { useDispatch } from 'react-redux';
import { appEffects } from 'store/app';
import { Preloader } from 'components/Preloader';
import { LoginRequest, TokenMessage, REQ_LOGIN_PARAMS } from 'models/Auth';

/**
 * Компонент для отображения страницы авторизации
 *
 * @returns
 */
export const Login: React.FC = () => {
  const [{ data, isLoading, error }, login] = useRequest<
    LoginRequest,
    TokenMessage
  >(...REQ_LOGIN_PARAMS);
  const dispatch = useDispatch();

  const onFinish = useCallback(
    (values: LoginRequest) => {
      login(values);
    },
    [login],
  );

  useEffect(() => {
    if (data) {
      dispatch(appEffects.login(data));
    }
  }, [dispatch, data]);

  const onForgotPasswordClick = useCallback(() => {
    notification.open({
      message: 'Восстановление пароля',
      description: 'Для восстановления паролья обратитесь к администратору',
      key: 'forgot-password',
    });
  }, []);

  return (
    <Styled.Container>
      <Form
        name='normal_login'
        className='login-form'
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item>
          <Typography.Title>
            <CarOutlined /> Парковка
          </Typography.Title>
        </Form.Item>
        <Form.Item
          name='username'
          rules={[{ required: true, message: 'Укажите логин!' }]}
        >
          <Input
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder='Логин'
          />
        </Form.Item>
        <Form.Item
          name='password'
          rules={[{ required: true, message: 'Укажите пароль' }]}
        >
          <Input
            prefix={<LockOutlined className='site-form-item-icon' />}
            type='password'
            placeholder='Пароль'
          />
        </Form.Item>
        <Form.Item>
          <a className='login-form-forgot' onClick={onForgotPasswordClick}>
            Забыли пароль?
          </a>
        </Form.Item>

        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            className='login-form-button'
          >
            Войти
          </Button>
        </Form.Item>
        {error && <Alert message={error} type='error' showIcon />}
      </Form>
      {isLoading && <Preloader />}
    </Styled.Container>
  );
};
