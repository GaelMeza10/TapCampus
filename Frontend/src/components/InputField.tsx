import {
    View, 
    TextInput,
    StyleSheet,
    KeyboardTypeOptions,

} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../app/styles/theme';


interface InputFieldProps {
    icon: string;
    placeholder: string;
    value: string;
    onChangeText: (v: string) => void;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; 
}

    
export default function InputField({ icon, placeholder, value, onChangeText, keyboardType, autoCapitalize }:InputFieldProps) {
    return (
        <View style={styles.inputWrapper}>
            <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={COLORS.textLight}
                style={styles.inputIcon}
            />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize ?? 'none'}
                autoCorrect={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
      inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: RADIUS.md,
        marginBottom: 12,
        paddingHorizontal: 14,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
      input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textDark,
        height: '100%',
    },
});