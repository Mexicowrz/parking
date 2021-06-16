import React, { useCallback, useEffect } from 'react';
import moment from 'moment';
import { Modal, Form, DatePicker, Button, Alert } from 'antd';
import { TakePlaceModalProps } from './TakePlaceModal.types';
import { useRequest } from 'hooks/useRequest';
import { REQ_TAKE_FREE_PLACE_PARAMS, TakeFree, IdResult } from 'models/Place';
import { translateError } from 'utils/translate';
import { Preloader } from 'components/Preloader';

/**
 * Компонент модального окна для захвата свободого места
 */
export const TakePlaceModal: React.FC<TakePlaceModalProps> = (
  props: TakePlaceModalProps,
) => {
  const [form] = Form.useForm();
  // организация запросов на сервер
  const [{ data, isLoading, error }, takeFree, reset] = useRequest<
    TakeFree,
    IdResult
  >(...REQ_TAKE_FREE_PLACE_PARAMS);

  useEffect(() => {
    if (!error) {
      form.resetFields();
      props.onClose();
    } else {
      props.setIsLoading && props.setIsLoading(false);
    }
  }, [data, error, form, props]);

  const place = props.place;

  // настройка колбэков
  const onSave = useCallback(
    (values: TakeFree) => {
      props.setIsLoading && props.setIsLoading(true);
      takeFree({
        date_to: values.date_to,
        id: place.place_id,
      });
    },
    [props, takeFree, place.place_id],
  );

  const onCancel = useCallback(() => {
    props.onClose();
    form.resetFields();
    reset();
  }, [props, form, reset]);

  return (
    <Modal
      title={`Занять место №${place.number}`}
      visible={props.visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        layout='horizontal'
        labelCol={{ span: 4 }}
        form={form}
        initialValues={{
          date_to: place.date_to
            ? moment(place.date_to).add(moment().utcOffset(), 'minutes')
            : moment().add(1, 'day'),
        }}
        onFinish={onSave}
      >
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
