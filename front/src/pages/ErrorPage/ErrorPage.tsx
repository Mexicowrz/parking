import React from 'react';
import { Result, Button } from 'antd';
import { ErrorPageProps, ERRORS } from './ErrorPage.types';

/**
 * Компонент для отображение ошибки на странице
 */
export const ErrorPage: React.FC<ErrorPageProps> = (props: ErrorPageProps) => {
  return (
    <Result
      {...ERRORS[props.code]}
      extra={
        <a type='primary' href='/'>
          На главную
        </a>
      }
    />
  );
};
