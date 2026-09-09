import { getItem } from 'expo-secure-store';

export const getFeedbackUser = () => getItem('user');
