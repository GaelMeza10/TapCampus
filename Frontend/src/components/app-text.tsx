import { Text, type TextProps } from 'react-native';
import { TYPE } from '@/theme';

export default function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: keyof typeof TYPE }) {
  return <Text {...props} style={[TYPE[variant], style]} />;
}
