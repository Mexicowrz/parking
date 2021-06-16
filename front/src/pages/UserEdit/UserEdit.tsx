import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import {
  Form,
  Input,
  InputNumber,
  Radio,
  Switch,
  Row,
  Col,
  Checkbox,
  Button,
  Alert,
  Breadcrumb,
} from 'antd';
import * as Styled from './UserEdit.styled';
import { useRequest } from 'hooks/useRequest';
import { Preloader } from 'components/Preloader';
import { Params } from './UserEdit.types';
import { Place, REQ_ALL_PLACES_PARAMS } from 'models/Place';
import {
  User,
  makeGetUserParams,
  IdResult,
  REQ_ADD_USER_PARAMS,
  makeUpdateUserParams,
} from 'models/User';
import { translateError } from 'utils/translate';
import { Role } from 'models/Auth';

/**
 * Компонент добавления/редактирования пользователя
 * @returns
 */
export const UserEdit: React.FC = () => {
  const params = useParams<Params>();
  const history = useHistory();
  const [form] = Form.useForm();

  // набор состояний компонента
  const [places, setPlaces] = useState<{ label: number; value: string }[]>([]);

  // организация запросов на сервер
  const [placesData, getPlaces] = useRequest<undefined, Place[]>(
    ...REQ_ALL_PLACES_PARAMS,
  );
  const [userData, getUser] = useRequest<undefined, User>(
    ...makeGetUserParams(+(params?.id || 0)),
  );
  const [addUserData, addUser] = useRequest<User, IdResult>(
    ...REQ_ADD_USER_PARAMS,
  );
  const [updateUserData, updateUser] = useRequest<User, IdResult>(
    ...makeUpdateUserParams(+(params?.id || 0)),
  );

  // формирование загруженных данных
  useEffect(() => {
    if (params.id !== 'new') {
      getUser();
    }
  }, [params.id, getUser]);

  useEffect(() => {
    getPlaces();
  }, [getPlaces]);

  useEffect(() => {
    if (placesData.data) {
      setPlaces(
        placesData.data.map((el: Place) => ({
          label: el.id,
          value: (el.number || '').toString(),
        })),
      );
    }
  }, [placesData.data]);

  useEffect(() => {
    form.setFieldsValue(userData.data);
  }, [userData.data, form]);

  useEffect(() => {
    if (addUserData.data?.id) {
      history.push(`/admin/user/${addUserData.data.id}`);
    }
  }, [addUserData.data?.id, history]);

  const onFormSubmit = useCallback(
    (values: User) => {
      if (params.id === 'new') {
        addUser(values);
      } else {
        updateUser(values);
      }
    },
    [params, addUser, updateUser],
  );

  const error = userData.error || addUserData.error || updateUserData.error;

  return (
    <Styled.UserEditContainer>
      <Breadcrumb style={{ textAlign: 'left', paddingBottom: '20px' }}>
        <Breadcrumb.Item>Администрирование</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to='/admin/users'>Пользователи</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {params.id === 'new'
            ? 'Добавить пользователя'
            : 'Редактировать пользователя'}
        </Breadcrumb.Item>
      </Breadcrumb>
      <Form
        layout='horizontal'
        labelCol={{ span: 6 }}
        onFinish={onFormSubmit}
        form={form}
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label='Логин'
              name='username'
              rules={[{ required: true }]}
            >
              <Input autoComplete='off' disabled={params.id !== 'new'} />
            </Form.Item>
            <Form.Item
              label='Пароль'
              name='password'
              tooltip={
                params.id === 'new'
                  ? undefined
                  : 'Если не нужно менять пароль, оставьте поле пустым'
              }
              rules={[{ required: params.id === 'new' }]}
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
            <Form.Item
              label='№ квартиры'
              name='flat'
              rules={[{ required: true }]}
            >
              <InputNumber max={400} min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label='Телефон'
              name='phone'
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label='№ автомобиля' name='car_number'>
              <Input />
            </Form.Item>
            <Form.Item label='Роль' name='role' rules={[{ required: true }]}>
              <Radio.Group>
                <Radio.Button value={Role.ADMIN}>Администратор</Radio.Button>
                <Radio.Button value={Role.PLACE_OWNER}>
                  Владелец места
                </Radio.Button>
                <Radio.Button value={Role.CUSTOMER}>Гость</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label='Заблокировать'
              name='is_blocking'
              valuePropName='checked'
            >
              <Switch />
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
          <Col span={12}>
            <Form.Item label='Места' name='places'>
              <Checkbox.Group options={places} />
            </Form.Item>
            <Form.Item label='Описание' name='description'>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {(userData.isLoading ||
        placesData.isLoading ||
        addUserData.isLoading ||
        updateUserData.isLoading) && <Preloader />}
    </Styled.UserEditContainer>
  );
};
