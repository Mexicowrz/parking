import React, { useEffect } from 'react';
import { Alert } from 'antd';
import { useRequest } from 'hooks/useRequest';
import * as Styled from './MessageBar.styled';
import {
  Message,
  messageTypeToString,
  REQ_VISIBLE_MESSAGES_PARAMS,
} from 'models/Message';

/**
 * Компонент отображения сообщений для пользователей
 * @returns
 */
export const MessageBar: React.FC = () => {
  // организация загрузки списка сообщений
  const [{ data }, request] = useRequest<undefined, Message[]>(
    ...REQ_VISIBLE_MESSAGES_PARAMS,
  );
  useEffect(() => {
    request();
  }, [request]);
  return (
    <>
      {data && data.length ? (
        <Styled.Container>
          {data.map((el: { id: number; message: string; type: number }) => (
            <Alert
              data-testid="messagebar-alert"
              message={el.message}
              type={messageTypeToString(el.type)}
              closable
              key={el.id}
            />
          ))}
        </Styled.Container>
      ) : (
        <></>
      )}
    </>
  );
};
