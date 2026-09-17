import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function IndexScreen() {
  const { loading, token } = useAuth();
  if (loading) return null;
  return <Redirect href={token ? '/home' : '/welcome'} />;
}
