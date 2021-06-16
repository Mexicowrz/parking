import React, { useEffect, useCallback } from 'react';
import { Form, Input, Modal, Button, Alert, Radio, Switch } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { Preloader } from 'components/Preloader';
import { MessageElem, makeSaveMessageParams, IdResult } from 'models/Message';
import { translateError } from 'utils/translate';
import { Types, EditMessageProps } from './MessageEdit.types';

/**
 * Компонент формы редактирования сообщения
 * @param {EditMessageProps} props
 */
export const MessageEdit: React.FC<EditMessageProps> = (
  props: EditMessageProps,
) => {
  const [form] = Form.useForm();
  // организация запросов на сохранение сообщения
  const [{ data, isLoading, error }, saveReq, reset] = useRequest<
    MessageElem,
    IdResult
  >(...makeSaveMessageParams((props.data && props.data.id) || 'add'));

  useEffect(() => {
    if (data && data.id) {
      form.resetFields();
      props.onClose(true);
    }
  }, [data, form, props]);

  useEffect(() => {
    form.setFieldsValue(props.data);
  }, [props.data, form]);

  const onSave = useCallback(
    (values?: MessageElem) => {
      saveReq(values);
    },
    [saveReq],
  );

  const onClose = useCallback(() => {
    props.onClose(false);
    form.resetFields();
    reset();
  }, [props, form, reset]);

  return (
    <Modal
      title={
        props.data === null ? 'Добавить сообщение' : 'Редактировать сообщение'
      }
      visible={props.visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        layout='horizontal'
        labelCol={{ span: 6 }}
        form={form}
        onFinish={onSave}
      >
        <Form.Item
          label='Сообщение'
          name='message'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label='Тип' name='type' rules={[{ required: true }]}>
          <Radio.Group optionType='button' options={Types}></Radio.Group>
        </Form.Item>
        <Form.Item
          label='Показывать?'
          name='is_visible'
          valuePropName={'checked'}
        >
          <Switch />
        </Form.Item>
        {error && (
          <Form.Item>
            <Alert type='error' message={translateError(error)} />
          </Form.Item>
        )}
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Сохранить
          </Button>
        </Form.Item>
      </Form>
      {isLoading && <Preloader />}
    </Modal>
  );
};
