import React, { useCallback, useState, useEffect } from 'react';
import { MyPlaceElementProps } from './MyPlaceElement.types';
import { REQ_RESPOND_PLACE_PARAMS, IdParams, IdResult } from 'models/Place';
import { Card, Button, Typography, Popconfirm } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useRequest } from 'hooks/useRequest';
import { ToFreeModal } from '../ToFreeModal';
import moment from 'moment';

/**
 * Компонент для отображения одного элемента места пользователя
 */
export const MyPlaceElement: React.FC<MyPlaceElementProps> = (
  props: MyPlaceElementProps,
) => {
  // набор состояний компонента
  const [freeModalShow, setFreeModalShow] = useState<boolean>(false);

  // организация запросов на сервер
  const [respondData, respond] = useRequest<IdParams, IdResult>(
    ...REQ_RESPOND_PLACE_PARAMS,
  );

  const place = props.place;

  const onRespond = useCallback(() => {
    props.setIsLoading && props.setIsLoading(true);
    respond({ id: place.id });
  }, [place, props, respond]);

  const onCloseModal = useCallback(() => setFreeModalShow(false), []);
  const onShowModal = useCallback(() => setFreeModalShow(true), []);

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
      {place.free ? (
        <>
          <p>
            Во временной до{' '}
            <Typography.Text type='danger'>
              {moment(place.free.date_to)
                .add(moment().utcOffset(), 'minutes')
                .format('DD.MM.YYYY HH:mm')}
            </Typography.Text>{' '}
            <a onClick={() => setFreeModalShow(true)}>
              <EditOutlined />
            </a>
          </p>
          {place.free.customer_user_id && (
            <p>
              Занято до{' '}
              <Typography.Text type='danger'>
                {moment(place.free.customer_date_to)
                  .add(moment().utcOffset(), 'minutes')
                  .format('DD.MM.YYYY HH:mm')}
              </Typography.Text>{' '}
              (
              {place.free.user &&
                `${place.free.user.lastname || ''} ${
                  place.free.user.firstname || ''
                } ${place.free.user.middlename || ''}`}
              ){' '}
            </p>
          )}
          <p>
            <Popconfirm
              title='Вы уверены, что хотите отозвать место?'
              onConfirm={onRespond}
              okText='Да'
              cancelText='Нет'
            >
              <Button type='primary' danger>
                Отозвать место
              </Button>
            </Popconfirm>
          </p>{' '}
        </>
      ) : (
        <p>
          <Button type='primary' onClick={onShowModal}>
            Поделиться местом
          </Button>
        </p>
      )}
      <ToFreeModal {...props} onClose={onCloseModal} visible={freeModalShow} />
    </Card>
  );
};
