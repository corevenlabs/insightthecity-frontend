import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// Email links never mutate billing state. Authentication is required to view it.
export default function EmailEntry() {
  const { target } = useLocalSearchParams<{ target?: string }>();
  const { loading, isAuthenticated } = useAuth();
  if (loading) return null;
  const destination = target === 'membership' ? 'membership' : 'benefits';
  if (!isAuthenticated) return <Redirect href={{ pathname: '/login', params: { returnTo: destination } }} />;
  return <Redirect href={destination === 'membership' ? '/profile?membership=1' : '/club'} />;
}
