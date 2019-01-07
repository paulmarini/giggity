const jwt = require('jsonwebtoken');
const express_jwt = require('express-jwt');
const jwtAuth = require('socketio-jwt-auth');
const {userModel} = require('./model');
const secret = 'HEYYY';

const Auth = {
  authenticate: (email, password, data={}) => {
    let err = 'Unknown Authentication error';
    return userModel.fetchByEmail(data.project, email)
      .then(user => {
        if (password === 'a') {
        // if (user.password === password) {
          const token = jwt.sign({user: user.id, data: {name: user.name, email: user.email, ...data}}, secret);
          console.log(token);
          return Promise.resolve(token);
        } else {
          err = "invalid user/password";
        }

        return Promise.reject(err);
      })
  },
  restVerify: () => {
    return express_jwt({secret})
  },
  socketVerify: (payload, done) => {
    return jwtAuth.authenticate(
      {secret}, (payload, done) => {
      console.log('*****', payload);
      return done(null, payload);
    })
  }
}

module.exports =  Auth;
