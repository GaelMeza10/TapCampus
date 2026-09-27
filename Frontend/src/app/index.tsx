 import { ActivityIndicator, View, StyleSheet } from 'react-native';
    
    // Pantalla de carga inicial.
    // Aparece un instante mientras el AuthContext revisa si hay
    // un token guardado y el _layout.tsx redirige al destino correcto.
    export default function Index() {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#4CAF6F" />
        </View>
      );
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EDEAE3',
      },
    });