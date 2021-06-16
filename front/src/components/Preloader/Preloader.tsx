import React from 'react';
import * as Styled from './Preloader.styled';
import { Spin } from 'antd';

/**
 * Компонент отображения загрузчика
 */
export const Preloader: React.FC = () => {
	return <Styled.PreloaderContainer>
		<Spin data-testid="preloader-spin" />
	</Styled.PreloaderContainer>;
}