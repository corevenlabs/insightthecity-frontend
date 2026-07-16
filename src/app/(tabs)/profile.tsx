import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://i.pravatar.cc/300',
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>Juan Pérez</Text>
        <Text style={styles.role}>Administrador</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información</Text>

        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>juan.perez@empresa.com</Text>

        <Text style={styles.label}>Teléfono</Text>
        <Text style={styles.value}>+56 9 1234 5678</Text>

        <Text style={styles.label}>Departamento</Text>
        <Text style={styles.value}>Operaciones</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Actividad</Text>

        <Text style={styles.value}>Proyectos asignados: 12</Text>
        <Text style={styles.value}>Tareas completadas: 48</Text>
        <Text style={styles.value}>Último acceso: Hoy</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  role: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    color: '#888',
    marginTop: 10,
  },
  value: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 4,
  },
});