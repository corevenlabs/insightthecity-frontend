import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { API_URL } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ✅ FIX 1: StyleSheet FUERA del componente
// Adentro se recreaba en cada keystroke → crash con apellido
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    content: {
        padding: 20,
        paddingTop: 40,
        paddingBottom: 150,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#AAA',
        textAlign: 'center',
        marginBottom: 30,
    },
    card: {
        backgroundColor: '#111111',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#222',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        color: '#FFF',
        marginBottom: 12,
    },
    paymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
    },
    paymentText: {
        color: '#FFF',
        marginLeft: 10,
        fontWeight: '600',
    },
    paymentInfo: {
        marginTop: 12,
        padding: 14,
        backgroundColor: '#0F0F0F',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    infoText: {
        color: '#999',
        fontSize: 12,
        lineHeight: 18,
    },
    planName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    planPrice: {
        color: '#D4AF37',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    planDescription: {
        color: '#999',
        marginTop: 10,
        lineHeight: 20,
    },
    joinButton: {
        backgroundColor: '#D4AF37',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    joinButtonDisabled: {
        backgroundColor: '#8a7020',
    },
    joinButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    note: {
        color: '#666',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default function ClubFormScreen() {
    const { user, token } = useAuth();
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ FIX 2: Estado para los inputs del formulario
    const [formData, setFormData] = useState({
        nombre: user?.name ?? '',
        email: user?.email ?? '',
        telefono: '',
        ciudad: '',
    });

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ✅ FIX 3: Validación antes de ir a Stripe, email real del input
    const handlePayment = async () => {
        const { nombre, email, telefono, ciudad } = formData;

        if (!token || !user) {
            Alert.alert('Inicia sesión', 'Necesitas una cuenta para activar tu membresía.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Iniciar sesión', onPress: () => router.push('/login') },
            ]);
            return;
        }

        if (!nombre.trim() || !email.trim() || !telefono.trim() || !ciudad.trim()) {
            Alert.alert('Campos incompletos', 'Por favor completa todos los campos antes de continuar.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Email inválido', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`${API_URL}/api/payment/create-subscription`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });

            const data = await res.json();

            if (data.checkout_url) {
                router.push({
                    pathname: "/checkout",
                    params: { url: data.checkout_url },
                });
            } else {
                Alert.alert('Error', 'No se pudo generar el link de pago. Intenta de nuevo.');
            }

        } catch (error) {
            console.log(error);
            Alert.alert('Error de conexión', 'Verifica tu conexión a internet e intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ITC CLUB</Text>
                <View style={{ width: 24 }} />
            </View>

            <Text style={styles.subtitle}>
                Completa tus datos para unirte al club.
            </Text>

            {/* INFORMACIÓN PERSONAL */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>

                {/* ✅ Inputs controlados con su estado */}
                <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    placeholderTextColor="#666"
                    value={formData.nombre}
                    onChangeText={(val) => handleChange('nombre', val)}
                    autoCorrect={false}       // ✅ evita correcciones inesperadas
                    autoCapitalize="words"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(val) => handleChange('email', val)}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Teléfono"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                    value={formData.telefono}
                    onChangeText={(val) => handleChange('telefono', val)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Ciudad"
                    placeholderTextColor="#666"
                    value={formData.ciudad}
                    onChangeText={(val) => handleChange('ciudad', val)}
                    autoCorrect={false}
                />
            </View>

            {/* MÉTODO DE PAGO */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>MÉTODO DE PAGO</Text>

                <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={() => setShowPayment(!showPayment)}
                >
                    <Ionicons
                        name={showPayment ? 'checkmark-circle' : 'shield-checkmark-outline'}
                        size={22}
                        color="#D4AF37"
                    />
                    <Text style={styles.paymentText}>
                        {showPayment ? 'Pago seguro activado' : 'Pago seguro con Stripe'}
                    </Text>
                </TouchableOpacity>

                {showPayment && (
                    <View style={styles.paymentInfo}>
                        <Text style={styles.infoText}>
                            Serás redirigido a una página segura donde podrás pagar con tarjeta,
                            Apple Pay o Google Pay. No almacenamos información de pago en la app.
                        </Text>
                    </View>
                )}
            </View>

            {/* PLAN */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>PLAN</Text>
                <Text style={styles.planName}>ITC Club</Text>
                <Text style={styles.planPrice}>$4.99 / mes</Text>
                <Text style={styles.planDescription}>
                    Acceso a beneficios exclusivos, descuentos y experiencias especiales.
                </Text>
            </View>

            {/* BOTÓN FINAL */}
            <TouchableOpacity
                style={[styles.joinButton, loading && styles.joinButtonDisabled]}
                onPress={handlePayment}
                disabled={loading}
            >
                <Text style={styles.joinButtonText}>
                    {loading ? "PROCESANDO..." : "CONTINUAR AL PAGO"}
                </Text>
            </TouchableOpacity>

            <Text style={styles.note}>
                Pago seguro procesado por Stripe. Puedes cancelar en cualquier momento.
            </Text>
        </ScrollView>
    );
}
