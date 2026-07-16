import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function ChatFloatingButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/chat') return null;

  return (
    <TouchableOpacity
      onPress={() => router.push('/chat')}
      style={styles.button}
    >
      <Ionicons name="chatbubble-ellipses" size={24} color="#000" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});