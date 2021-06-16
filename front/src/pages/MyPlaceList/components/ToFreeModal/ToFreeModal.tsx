import React, { useCallback, useEffect } from 'react';
import moment from 'moment';
import { Modal, Form, DatePicker, Button, Alert } from 'antd';
import type { ToFreeModalProps } from './ToFreeModal.types';
import { useRequest } from 'hooks/useRequest';
import { REQ_TO_FREE_PLACE_PARAMS, ToFreePlace, IdResult } from 'models/Place';
import { translateError } from 'utils/translate';
import { Preloader } from 'components/Preloader';

/**
 * Компонент для отображения модального окна освобождения места
 */
export const ToFreeModal: React.FC<ToFreeModalProps> = (
  props: ToFreeModalProps,
) => {
  const [form] = Form.useForm();
  // организация запросов на сервер
  const [{ data, isLoading, error }, toFreeReq, reset] = useRequest<
    ToFreePlace,
    IdResult
  >(...REQ_TO_FREE_PLACE_PARAMS);

  useEffect(() => {
    if (!error) {
      props.onClose();
    } else {
      props.setIsLoading && props.setIsLoading(false);
    }
  }, [data, error, props]);

  const place = props.place;

  const onSave = useCallback(
    (values: ToFreePlace) => {
      props.setIsLoading && props.setIsLoading(true);
      toFreeReq({
        date_from: values.date_from,
        date_to: values.date_to,
        id: place.id,
      });
    },
    [place, props, toFreeReq],
  );

  const onCancel = useCallback(() => {
    props.onClose();
    form.resetFields();
    reset();
  }, [form, props, reset]);

  return (
    <Modal
      title={`Передать место №${place.number}`}
      visible={props.visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        layout='horizontal'
        labelCol={{ span: 4 }}
        form={form}
        initialValues={{
          date_from:
            place.free && place.free.date_from
              ? moment(place.free.date_from).add(
                  moment().utcOffset(),
                  'minutes',
                )
              : moment(),
          date_to:
            place.free && place.free.date_to
              ? moment(place.free.date_to).add(moment().utcOffset(), 'minutes')
              : moment().add(1, 'day'),
        }}
        onFinish={onSave}
      >
        <Form.Item label='с' name='date_from' required>
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format='DD.MM.YYYY HH:mm'
          />
        </Form.Item>
        <Form.Item label='до' name='date_to' required>
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format='DD.MM.YYYY HH:mm'
          />
        </Form.Item>
        {error && (
          <Form.Item>
            <Alert type='error' message={translateError(error)} />
          </Form.Item>
        )}
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Подтвердить
          </Button>
        </Form.Item>
      </Form>
      {isLoading && <Preloader />}
    </Modal>
  );
};
