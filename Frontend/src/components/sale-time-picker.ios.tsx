import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle, environment, tint } from '@expo/ui/swift-ui/modifiers';
import { COLORS } from '@/theme';
import type { SaleTimePickerProps } from './sale-time-picker';

export default function SaleTimePicker({ value, onValueChange }: SaleTimePickerProps) {
  return (
    // A bounded Host avoids the wheel's automatic sizing inside the sheet's ScrollView.
    <Host style={{ height: 216, alignSelf: 'stretch' }} colorScheme="light" ignoreSafeArea="all">
      <DatePicker
        selection={value}
        displayedComponents={['date', 'hourAndMinute']}
        modifiers={[datePickerStyle('wheel'), environment('locale', 'es_MX'), tint(COLORS.primary)]}
        onDateChange={(date) => onValueChange?.({ nativeEvent: {
          timestamp: date.getTime(), utcOffset: -date.getTimezoneOffset(),
        } }, date)}
      />
    </Host>
  );
}
