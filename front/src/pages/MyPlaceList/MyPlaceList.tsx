import React, { useState, useCallback } from 'react';
import { MyPlaceElement } from './components/MyPlaceElement';
import { MyPlace, SSE_MYPLACES_URL } from 'models/Place';
import * as Styled from './MyPlaceList.styled';
import { Preloader } from 'components/Preloader';
import { useEventSource } from 'hooks/useEventSource';

/**
 * Компонент для работы со списком мест пользователя
 */
export const MyPlaceList: React.FC = () => {
  // набор состояний компонента
  const [myplaces, setMyPlaces] = useState<MyPlace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // организация работы с SSE
  const onData = useCallback((data: MyPlace[]) => {
    setMyPlaces(data);
    setIsLoading(false);
  }, []);
  useEventSource(SSE_MYPLACES_URL, onData);
  return (
    <Styled.MyPlaceList>
      {myplaces.map((pl: MyPlace) => (
        <MyPlaceElement key={pl.id} place={pl} />
      ))}
      {isLoading && <Preloader />}
    </Styled.MyPlaceList>
  );
};
