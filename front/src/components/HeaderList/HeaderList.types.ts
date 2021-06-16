/**
 * Тип данных, принимаемых компонентом заголовка списков
 */
export type HeaderListProps = {
  onSearch?: (query: string) => void;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDisabled?: boolean;
}