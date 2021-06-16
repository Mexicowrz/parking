import React from 'react';
import { Layout as AntLayout } from 'antd';
import { MessageBar } from 'components/MessageBar';
import { Header } from './Header';

/**
 * Компонент для отрисовки основных элементов экрана
 * @returns
 */
export const Layout: React.FC = ({ children }) => {
  return (
    <AntLayout>
      <Header />
      <AntLayout.Content
        className='site-layout'
        style={{
          padding: '0 50px',
          marginTop: 64,
          minHeight: 'calc(100vh-64px)',
        }}
      >
        <MessageBar />
        {children}
      </AntLayout.Content>
    </AntLayout>
  );
};
