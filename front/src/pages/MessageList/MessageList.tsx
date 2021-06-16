import React, { useCallback, useEffect, useState, useMemo } from 'react';
import * as Styled from './MessageList.styled';
import { Preloader } from 'components/Preloader';
import { useRequest } from 'hooks/useRequest';
import { Table } from 'antd';
import { MessageEdit } from './components/MessageEdit';
import { columns } from './MessageList.types';
import { HeaderList } from 'components/HeaderList';
import {
  MessageElem,
  REQ_ALL_MESSAGES_PARAMS,
  makeDeleteMessageParams,
  IdResult,
} from 'models/Message';

/**
 * Компонент для работы со списком сообщений, выводимых пользователю
 */
export const MessageList: React.FC = () => {
  // набор состояний компонента
  const [selectedRow, setSelectedRow] =
    useState<MessageElem | undefined>(undefined);
  const [editedRow, setEditedRow] =
    useState<MessageElem | undefined>(undefined);
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
  const [editShow, setEditShow] = useState<boolean>(false);

  // организация запросов на сервер
  const [mgsList, getMessageList] = useRequest<undefined, MessageElem[]>(
    ...REQ_ALL_MESSAGES_PARAMS,
  );
  const [deleteData, deleteMessage] = useRequest<undefined, IdResult>(
    ...makeDeleteMessageParams(selectedRow?.id || 0),
  );

  // перегружать список при удалении сообщения
  useEffect(() => {
    getMessageList();
    setSelectedRow(undefined);
    setSearchValue(undefined);
  }, [deleteData.data, getMessageList]);

  // колбэки операций над списком
  const onDelete = useCallback(() => {
    deleteMessage();
  }, [deleteMessage]);

  const onAdd = useCallback(() => {
    setEditedRow(undefined);
    setEditShow(true);
  }, []);

  const onEdit = useCallback(() => {
    setEditedRow(selectedRow);
    setEditShow(true);
  }, [selectedRow]);

  const onSearch = useCallback((value?: string) => {
    setSearchValue(value || undefined);
  }, []);

  const onChange = useCallback(
    (_selectedRowKeys: React.Key[], selectedRows: MessageElem[]) => {
      setSelectedRow(
        (selectedRows && selectedRows.length > 0 && selectedRows[0]) ||
          undefined,
      );
    },
    [],
  );

  const onCloseModal = useCallback(
    (isRefresh: boolean) => {
      if (isRefresh) {
        getMessageList();
      }
      setEditShow(false);
    },
    [getMessageList],
  );

  // сохранять фильтрацию списка
  const messages = useMemo(() => {
    return searchValue
      ? (mgsList.data || []).filter((msg) => msg.message.includes(searchValue))
      : mgsList.data;
  }, [mgsList.data, searchValue]);

  return (
    <Styled.MessageListContainer>
      {!mgsList.isLoading && (
        <>
          <HeaderList
            onDelete={onDelete}
            isDisabled={selectedRow === null}
            onAdd={onAdd}
            onEdit={onEdit}
            onSearch={onSearch}
          />
          <Table
            dataSource={messages}
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
      {editShow && (
        <MessageEdit visible onClose={onCloseModal} data={editedRow} />
      )}
      {(mgsList.isLoading || deleteData.isLoading) && <Preloader />}
    </Styled.MessageListContainer>
  );
};
