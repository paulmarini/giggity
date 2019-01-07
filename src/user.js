import { decode } from 'jsonwebtoken';

const updateUser = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const user = decode(token);
    console.log('USER', user);
    return user;
    // actions.setUser(user);
  }
}

export default updateUser;
