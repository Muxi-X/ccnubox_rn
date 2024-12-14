import { getItem } from 'expo-secure-store';
const preUrl = 'http://121.43.151.190:8080';
export async function get<T>(url: string, isToken: boolean): Promise<T> {
  const headers = new Headers();
  if (isToken) {
    const token = getItem('shortToken');
    console.log(token);
    if (token) headers.append('Authorization', token);
  }
  const response = await fetch(`${preUrl}${url}`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401');
    } else if (response.status === 400) {
      const errorData = (await response.json()) as {
        code: number;
        msg: string;
      };
      throw new Error(`${errorData.code}`);
    }
  }
  return response.json();
}
