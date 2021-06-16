import React, { useState, useCallback } from 'react';
import { FreePlaceElement } from './components/FreePlaceElement';
import { Empty } from 'antd';
import * as Styled from './FreePlaceList.styled';
import { Preloader } from 'components/Preloader';
import { SSE_FREEPLACE_URL, FreePlace } from 'models/Place';
import { useEventSource } from 'hooks/useEventSource';

/**
 * Компонент для работы со списком свободных мест
 */
export const FreePlaceList: React.FC = () => {
  // набор состояний компонента
  const [freeplaces, setFreePlaces] = useState<FreePlace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // организация работы с SSE
  const onData = useCallback((data: FreePlace[]) => {
    setFreePlaces(data);
    setIsLoading(false);
  }, []);
  useEventSource(SSE_FREEPLACE_URL, onData);

  return (
    <Styled.FreePlaceList>
      {!isLoading && (!freeplaces || freeplaces.length === 0) && (
        <Empty description='К сожалению в настоящий момент нет свободных мест' />
      )}
      {freeplaces.map((pl: FreePlace) => (
        <FreePlaceElement
          key={pl.place_id}
          place={pl}
          setIsLoading={setIsLoading}
        />
      ))}
      {isLoading && <Preloader />}
    </Styled.FreePlaceList>
  );
};
