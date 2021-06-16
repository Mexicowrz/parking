import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { columns } from './UserList.types';
import { Table } from 'antd';
import * as Styled from './UserList.styled';
import { useRequest } from 'hooks/useRequest';
import { useHistory } from 'react-router-dom';
import { Preloader } from 'components/Preloader';
import { HeaderList } from 'components/HeaderList';
import {
  UserForList,
  REQ_ALL_USERS_PARAMS,
  makeDeletUserParams,
  IdResult,
} from 'models/User';

/**
 * Функция возврщает кэлбэк фунцкию для фильтрации пользователей по значению
 *
 * @param searchValue
 * @returns
 */
const searchUserCompare = (searchValue: string) => {
  return (usr: UserForList) =>
    `${usr.username} ${usr.firstname} ${usr.lastname} ${usr.middlename}`.includes(
      searchValue,
    ) || searchValue === `${usr.flat}`;
};

/**
 * Компонент для работы со списком пользователей
 */
export const UserList: React.FC = () => {
  const history = useHistory();

  // набор состояний компонента
  const [selectedRow, setSelectedRow] =
    useState<UserForList | undefined>(undefined);
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

  // организация запросов на сервер
  const [userListData, getUserList] = useRequest<undefined, UserForList[]>(
    ...REQ_ALL_USERS_PARAMS,
  );
  const [deleteUserData, deleteUser] = useRequest<undefined, IdResult>(
    ...makeDeletUserParams(selectedRow?.id || 0),
  );

  // перегружать список при удалении сообщения
  useEffect(() => {
    getUserList();
    setSearchValue(undefined);
  }, [deleteUserData.data, getUserList]);

  // колбэки операций над списком
  const onAdd = useCallback(() => {
    history.push('/admin/user/new');
  }, [history]);

  const onEdit = useCallback(() => {
    history.push(`/admin/user/${selectedRow?.id}`);
  }, [selectedRow, history]);

  const onDelete = useCallback(() => {
    deleteUser();
  }, [deleteUser]);

  const onSearch = useCallback((value?: string) => {
    setSearchValue(value || undefined);
  }, []);

  const onChange = useCallback(
    (_selectedRowKeys: React.Key[], selectedRows: UserForList[]) => {
      setSelectedRow(
        (selectedRows && selectedRows.length > 0 && selectedRows[0]) ||
          undefined,
      );
    },
    [],
  );

  // сохранять фильтрацию списка
  const users = useMemo(() => {
    return searchValue
      ? (userListData.data || []).filter(searchUserCompare(searchValue))
      : userListData.data;
  }, [userListData.data, searchValue]);

  return (
    <Styled.UserList>
      {!userListData.isLoading && (
        <>
          <HeaderList
            isDisabled={selectedRow === undefined}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onSearch={onSearch}
          />
          <Table
            dataSource={users}
            columns={columns}
            pagination={false}
            rowSelection={{
              type: 'radio',
              onChange,
            }}
            rowKey={'id'}
          />
        </>
      )}
      {(userListData.isLoading || deleteUserData.isLoading) && <Preloader />}
    </Styled.UserList>
  );
};
