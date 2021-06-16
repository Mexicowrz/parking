const sorter = (key: string) => {
  return (a: { [key: string]: any }, b: {[key: string]: any}): number => {
    return a[key] - b[key];
  };
};

/**
 * Описание колонок для вывода списка пользователей
 */
export const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    sorter: sorter('id'),
  },
  {
    title: 'Логин',
    dataIndex: 'username',
    key: 'username',
    sorter: sorter('username'),
  },
  {
    title: 'Фамилия',
    dataIndex: 'lastname',
    key: 'lastname',
    sorter: sorter('lastname'),
  },
  {
    title: 'Имя',
    dataIndex: 'firstname',
    key: 'firstname',
    sorter: sorter('firstname'),
  },
  {
    title: 'Отчество',
    dataIndex: 'middlename',
    key: 'middlename',
    sorter: sorter('middlename'),
  },
  {
    title: 'Роль',
    dataIndex: 'role',
    key: 'role',
    render: (role: number) => {
      switch (role) {
        case 0:
          return 'Администратор';
        case 1:
          return 'Владелец места';
        default:
          return 'Гость';
      }
    },
    sorter: sorter('role'),
  },
  {
    title: '№ квартиры',
    dataIndex: 'flat',
    key: 'flat',
    sorter: sorter('flat'),
  },
  {
    title: 'Заблокирован',
    dataIndex: 'is_blocking',
    key: 'is_blocking',
    render: (val: boolean) => (val && 'Да') || '',
    sorter: sorter('is_blocking'),
  },
];
