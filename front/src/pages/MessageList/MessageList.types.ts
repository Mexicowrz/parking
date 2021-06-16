const sorter = (key: string) => {
  return (a: { [key: string]: any }, b: { [key: string]: any }): number => {
    return a[key] - b[key];
  };
};

/**
 * Описание колонок для вывода списка сообщений
 */
export const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    sorter: sorter('id'),
  },
  {
    title: 'Сообщение',
    dataIndex: 'message',
    key: 'message',
    sorter: sorter('message'),
  },
  {
    title: 'Тип',
    dataIndex: 'type',
    key: 'type',
    sorter: sorter('type'),
    render: (type: number) => {
      switch (type) {
        case 1:
          return 'внимание';
        case 2:
          return 'опасность';
        default:
          return 'информация';
      }
    },
  },
  {
    title: 'Видимость',
    dataIndex: 'is_visible',
    key: 'is_visible',
    sorter: sorter('is_visible'),
    render: (isVisible: boolean) => {
      return isVisible ? 'Да' : 'Нет';
    },
  },
];
