import { request } from '@/request';

const deactivate = async (password: string) => {
  return await request.post(`/users/deactivate`, {
    password: password,
  });
};

const logout = async () => {
  return await request.get(`/users/logout`);
};

export { deactivate, logout };
