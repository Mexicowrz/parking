import React, { useEffect, useCallback } from 'react';
import { Form, Input, InputNumber, Row, Col, Button, Alert } from 'antd';
import * as Styled from './PrivateOffice.styled';
import { useRequest } from 'hooks/useRequest';
import { Preloader } from 'components/Preloader';
import { RootState } from 'store/configureStore';
import { useSelector } from 'hooks/useSelector';
import {
  User,
  makeGetUserParams,
  IdResult,
  makePrivateUpdateUserParams,
  PrivateUser,
} from 'models/User';
import { translateError } from 'utils/translate';

/**
 * Компонент редактирования личной информации пользователя
 * @returns
 */
export const PrivateOffice: React.FC = () => {
  const [form] = Form.useForm();
  const user = useSelector<RootState['app']['user']>((state) => state.app.user);

  // организация запросов на сервер
  const [userData, getUser] = useRequest<undefined, User>(
    ...makeGetUserParams(user!.id),
  );
  const [updateUserData, updateUser] = useRequest<PrivateUser, IdResult>(
    ...makePrivateUpdateUserParams(user!.id),
  );

  // загрузка и заполнение данных
  useEffect(() => {
    form.setFieldsValue(userData.data);
  }, [userData.data, form]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const onFormSubmit = useCallback(
    (values: PrivateUser) => {
      updateUser(values);
    },
    [updateUser],
  );

  const error = userData.error || updateUserData.error;

  return (
    <Styled.UserEditContainer>
      <Form
        layout='horizontal'
        labelCol={{ span: 6 }}
        onFinish={onFormSubmit}
        form={form}
      >
        <Row>
          <Col span={12}>
            <Form.Item label='Логин' name='username'>
              <Input autoComplete='off' disabled />
            </Form.Item>
            <Form.Item
              label='Пароль'
              name='password'
              tooltip={'Если не нужно менять пароль, оставьте поле пустым'}
            >
              <Input.Password autoComplete='new-password' />
            </Form.Item>
            <Form.Item
              label='Фамилия'
              name='lastname'
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='Имя'
              name='firstname'
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label='Отчество' name='middlename'>
              <Input />
            </Form.Item>
            <Form.Item label='№ квартиры' name='flat'>
              <InputNumber
                max={400}
                min={1}
                style={{ width: '100%' }}
                disabled
              />
            </Form.Item>
            <Form.Item
              label='Телефон'
              name='phone'
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label='№ автомобиля' name='car_number'>
              <Input disabled />
            </Form.Item>
            {error && (
              <Form.Item>
                <Alert type='error' message={translateError(error)} />
              </Form.Item>
            )}
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                Сохранить
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {(userData.isLoading || updateUserData.isLoading) && <Preloader />}
    </Styled.UserEditContainer>
  );
};
