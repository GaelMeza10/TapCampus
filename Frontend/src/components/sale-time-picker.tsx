import { DateTimePicker, type DateTimePickerProps } from '@expo/ui/community/datetime-picker';
import { COLORS } from '@/theme';

export type SaleTimePickerProps = Pick<DateTimePickerProps, 'value' | 'mode' | 'onValueChange' | 'onDismiss'>;

export default function SaleTimePicker(props: SaleTimePickerProps) {
  return <DateTimePicker {...props} display="default" locale="es_MX" accentColor={COLORS.primary} />;
}
