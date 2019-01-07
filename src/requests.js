import axios from 'axios';
import openSocket from 'socket.io-client';
import jwtDecode from 'jwt-decode';
import store from  './store'

let socket;

const requests = {
  authToken: localStorage.getItem('token'),
  user: null,
  init: () => {
    const {protocol, hostname} = window.location;
    socket = openSocket(`${protocol}//${hostname}:9000`, {query: {auth_token: requests.authToken}});
    return socket;
  },
  socket,
  register: (method, cb) => {
    if (socket) {
      console.log('register', method);
      socket.on(`${method}`, res => console.log('$$$', method, res) || cb(res));
    } else {
      console.log('can\'t register', method);

    }
  },
  unregister: (method) => {
    if (socket) {
      socket.off(`${method}`);
    }
  },
  send: (method, data) => {
    if (socket) {
      socket.emit(method, data);
    }
  },
  save: (type, data) => {
    return axios.post(`/api/${type}s`, {[type]: data})
      .then(res => res.data)
  },
  delete: (type, id) => {
    return axios.delete(`/api/${type}s/${id}`)
      .then(res => res.data)
  },
  login: data => {
    requests.logout();
    return axios.post('/api/auth', data)
      .then(res => {
        return requests.initSession(res.data.token);
      })
  },
  initSession: token => {
    if (token) {
      requests.authToken = token;
      axios.defaults.headers.common.Authorization = `Bearer ${requests.authToken}`;
      requests.user = jwtDecode(requests.authToken);
      localStorage.setItem('token', requests.authToken);
      return token;
    }
  },
  logout: () => {
    delete axios.defaults.headers.common.Authorization;
    requests.authToken = '';
    localStorage.setItem('token', '');
    requests.socket && requests.socket.close();
    requests.socket = null;
  },
}

requests.initSession(requests.authToken);

export default requests;
