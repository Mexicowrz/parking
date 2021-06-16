import React from 'react';
import { Input, Button, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import * as Styled from './HeaderList.styled';
import { HeaderListProps } from './HeaderList.types';

/**
 * Компонент отображения заголовка списков
 * @param {HeaderListProps} props
 * @returns
 */
export const HeaderList: React.FC<HeaderListProps> = (
  props: HeaderListProps,
) => {
  return (
    <Styled.Header>
      <Input.Search
        data-testid='search-input'
        style={{ width: 200, marginRight: 10 }}
        onSearch={props.onSearch}
      />
      <Button
        data-testid='add-button'
        type='primary'
        shape='circle'
        icon={<PlusOutlined />}
        onClick={props.onAdd}
        style={{ marginRight: 10 }}
      />
      <Button
        data-testid='edit-button'
        type='primary'
        disabled={props.isDisabled}
        onClick={props.onEdit}
        shape='circle'
        icon={<EditOutlined />}
        style={{ marginRight: 10 }}
      />
      <Popconfirm
        title='Вы уверены, что хотите удалить пользователя?'
        onConfirm={props.onDelete}
        okText='Да'
        cancelText='Нет'
        disabled={props.isDisabled}
      >
        <Button
          data-testid='delete-button'
          type='primary'
          disabled={props.isDisabled}
          shape='circle'
          icon={<DeleteOutlined />}
        />
      </Popconfirm>
    </Styled.Header>
  );
};
