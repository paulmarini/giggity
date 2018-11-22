import axios from 'axios';
import openSocket from 'socket.io-client';

let socket;

const requests = {
  init: () => {
    socket = openSocket('http://localhost:9000');
    return socket;
  },
  socket,
  register: (method, cb) => {
    if (socket) {
      socket.on(method, cb);
    }
  },
  unregister: (method) => {
    if (socket) {
      socket.off(method);
    }
  },
  send: (method, data) => {
    if (socket) {
      socket.emit(method, data);
    }
  },
  saveGig: gig => {
    return axios.post('/api/gigs', {gig})
      .then(res => res.data)
  },
  deleteGig: id => {
    return axios.delete(`/api/gigs/${id}`)
      .then(res => res.data)
  }
}

export default requests;
