import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Typography, Popconfirm } from 'antd';
import moment from 'moment';
import { useSelector } from 'hooks/useSelector';
import { RootState } from 'store/configureStore';
import { FreePlaceElementProps } from './FreePlaceElement.types';
import { useRequest } from 'hooks/useRequest';
import { TakePlaceModal } from '../TakePlaceModal';
import {
  IdResult,
  IdParams,
  REQ_RELEASE_FREE_PLACE_PARAMS,
} from 'models/Place';

/**
 * Компонент для работы со списком мест пользователя
 */
export const FreePlaceElement: React.FC<FreePlaceElementProps> = (
  props: FreePlaceElementProps,
) => {
  // получение из глобального стора
  const user = useSelector<RootState['app']['user']>((state) => state.app.user);

  // набор состояний компонента
  const [freeModalShow, setFreeModalShow] = useState<boolean>(false);
  const [respondData, release] = useRequest<IdParams, IdResult>(
    ...REQ_RELEASE_FREE_PLACE_PARAMS,
  );

  const place = props.place;

  // настройка колбэков
  const onRelease = useCallback(() => {
    props.setIsLoading && props.setIsLoading(true);
    release({ id: place.place_id });
  }, [place, props, release]);

  const onCloseModal = useCallback(() => setFreeModalShow(false), []);

  useEffect(() => {
    if (respondData.error) {
      props.setIsLoading && props.setIsLoading(true);
    }
  }, [respondData.data, respondData.error, props]);

  return (
    <Card
      title={
        <span>
          Место № <b>{place.number}</b>
        </span>
      }
    >
      <p>
        Свободно до{' '}
        <Typography.Text type='danger'>
          {moment(place.date_to)
            .add(moment().utcOffset(), 'minutes')
            .format('DD.MM.YYYY HH:mm')}
        </Typography.Text>{' '}
      </p>
      {place.status === 1 && place.username === user!.username ? (
        <>
          <p>
            Занято вами до{' '}
            <Typography.Text type='danger'>
              {moment(place.customer_date_to)
                .add(moment().utcOffset(), 'minutes')
                .format('DD.MM.YYYY HH:mm')}
            </Typography.Text>
          </p>
          <p>
            <Popconfirm
              title='Вы уверены, что хотите освободить место?'
              onConfirm={onRelease}
              okText='Да'
              cancelText='Нет'
            >
              <Button type='primary' danger>
                Освободить место
              </Button>
            </Popconfirm>
          </p>
        </>
      ) : (
        <p>
          <Button type='primary' onClick={() => setFreeModalShow(true)}>
            Занять место
          </Button>
        </p>
      )}
      <TakePlaceModal
        {...props}
        onClose={onCloseModal}
        visible={freeModalShow}
      />
    </Card>
  );
};
