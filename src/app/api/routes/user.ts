import axios from "../axios";

export const getUsers = async () => {
  const res = await axios.get('/user/users');
  return res.data;
};

export const createUser = async (data: { password: string; email: string; permission: number }) => {
  const res = await axios.post('/user/signup', data);

  if (!res) {
    throw new Error('Failed to create user');
  }

  return res.data;
};

export const updateUser = async (data: { id: string; name: string; permission: number }) => {
  const res = await axios.post('/user/update-info', data);

  if (!res) {
    throw new Error('Failed to create user');
  }

  return res.data;
};

export const signIn = async (data: { password: string; email: string }) => {
  const res = await axios.post('/user/signin', data);

  if (!res) {
    throw new Error('Failed to create user');
  }

  return res.data;
};