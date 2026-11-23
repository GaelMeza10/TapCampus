import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Host, Picker, Stepper, Text } from '@expo/ui/swift-ui';
import { disabled as nativeDisabled, frame, pickerStyle, tag, tint } from '@expo/ui/swift-ui/modifiers';
import { COLORS, SPACE } from '@/theme';
import AppText from './app-text';
import { durationParts, type OfferDurationProps } from './offer-duration.types';

export default function OfferDuration({ value, onChange, disabled, error, maxMinutes }: OfferDurationProps) {
  const parts = durationParts(value);
  const [width, setWidth] = useState(0);
  return <View style={styles.group} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <AppText variant="label">Anticipación antes del fin</AppText>
    {width > 0 ? <>
      <Host style={{ width, height: 52 }} colorScheme="light">
        <Stepper label={`Horas: ${parts.hours}`} value={parts.hours} min={0} max={Math.max(parts.hours, Math.floor((maxMinutes - parts.minutes) / 60))} onValueChange={hours => onChange(hours * 60 + parts.minutes)} modifiers={[frame({ width, height: 52 }), tint(COLORS.primary), nativeDisabled(!!disabled)]} />
      </Host>
      <Host style={{ width, height: 176 }} colorScheme="light">
        <Picker label="Minutos" selection={parts.minutes} onSelectionChange={(minutes: number) => onChange(parts.hours * 60 + minutes)} modifiers={[pickerStyle('wheel'), frame({ width, height: 176 }), nativeDisabled(!!disabled)]}>
          {Array.from({ length: 60 }, (_, minute) => <Text key={minute} modifiers={[tag(minute)]}>{minute} min</Text>)}
        </Picker>
      </Host>
    </> : null}
    <AppText variant="caption">{parts.hours} h {parts.minutes} min antes de terminar. La activación debe quedar en el futuro y dentro del horario.</AppText>
    {error ? <AppText accessibilityRole="alert" style={styles.error}>{error}</AppText> : null}
  </View>;
}
const styles = StyleSheet.create({ group: { gap: SPACE.sm }, error: { color: COLORS.error } });
