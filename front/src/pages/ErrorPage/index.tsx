import React from 'react';
import { ErrorPage } from './ErrorPage';

/**
 * готовые страницы для основных ошибок
 */
export const Error404: React.FC = () => <ErrorPage code={404} />;
export const Error403: React.FC = () => <ErrorPage code={403} />;
export const Error500: React.FC = () => <ErrorPage code={500} />;
