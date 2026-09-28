import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from './styles/theme';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import InputField from '@/components/InputField';

export default function RegisterScreen({ }) {
    const [form, setForm] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        password: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const updateField = (field: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

    async function handleRegister() {
        if (!accepted) return;
        setLoading(true);
        setError('');
        try {
            await register({
                nombre: form.nombre,
                correo: form.correo,
                telefono: form.telefono,
                contrasena: form.password,
            });
        } catch (err: any) {
            const data = err?.response?.data;
            if (Array.isArray(data?.message)) {
                setError(data.message[0]);
            } else {
                setError(data?.message || 'Ocurrió un error al registrarse.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="chevron-back" size={20} color={COLORS.textDark} />
                        <Text style={styles.backText}>Volver</Text>
                    </TouchableOpacity>

                  
                    <View style={styles.header}>
                        <Text style={styles.title}>Crea tu cuenta</Text>
                        <Text style={styles.subtitle}>
                            Solo para estudiantes con correo{' '}
                            <Text style={styles.subtitleHighlight}>institucional</Text>
                        </Text>
                    </View>

                    
                    <View style={styles.card}>
                       
                        <InputField
                            icon="person-outline"
                            placeholder="Nombre completo"
                            value={form.nombre}
                            onChangeText={(v) => updateField('nombre', v)}
                            autoCapitalize="words"
                        />

                      
                        <InputField
                            icon="mail-outline"
                            placeholder="Correo institucional"
                            value={form.correo}
                            onChangeText={(v) => updateField('correo', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        
                        <InputField
                            icon="call-outline"
                            placeholder="+52 664 123 4567"
                            value={form.telefono}
                            onChangeText={(v: string) => updateField('telefono', v)}
                            keyboardType="phone-pad"
                        />

                        
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color={COLORS.textLight}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={[styles.input, styles.inputPassword]}
                                placeholder="Crea una contraseña"
                                placeholderTextColor={COLORS.textLight}
                                value={form.password}
                                onChangeText={(v) => updateField('password', v)}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={18}
                                    color={COLORS.textLight}
                                />
                            </TouchableOpacity>
                        </View>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        
                        <View style={styles.divider} />

                        
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setAccepted(!accepted)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
                                {accepted && (
                                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                Acepto el{' '}
                                <Text style={styles.checkboxLink}>aviso de privacidad</Text> y los{' '}
                                <Text style={styles.checkboxLink}>
                                    términos de uso de TapCampus
                                </Text>
                                .
                            </Text>
                        </TouchableOpacity>

                        
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                !accepted && styles.primaryButtonDisabled,
                            ]}
                            onPress={handleRegister}
                            activeOpacity={0.85}
                            disabled={!accepted}
                        >
                            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                        </TouchableOpacity>
                    </View>

                    
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.footerLink}>Inicia sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Componente reutilizable para inputs simples

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },

    // Volver
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 16,
        marginBottom: 24,
        alignSelf: 'flex-start',
    },
    backText: {
        fontSize: 15,
        color: COLORS.textDark,
        fontWeight: '500',
    },

    // Encabezado
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.textDark,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMedium,
        lineHeight: 20,
    },
    subtitleHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Card
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: 24,
        ...SHADOW.card,
    },

    // Inputs
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
    inputPassword: {
        paddingRight: 8,
    },

    // Separador
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 16,
    },

    // Checkbox
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        flexShrink: 0,
    },
    checkboxActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textMedium,
        lineHeight: 19,
    },
    checkboxLink: {
        color: COLORS.primary,
        fontWeight: '500',
    },

    // Botón
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.full,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonDisabled: {
        backgroundColor: COLORS.border,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,
    },
    footerText: {
        fontSize: 14,
        color: COLORS.textMedium,
    },
    footerLink: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
    }, input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textDark,
        height: '100%',
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#FEF2F2',
      borderRadius: RADIUS.md,
      padding: 12,
      marginBottom: 12,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      color: COLORS.error,
      lineHeight: 18,
    },
});