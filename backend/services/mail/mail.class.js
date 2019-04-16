/* eslint-disable no-unused-vars */
const Email = require('email-templates')

class Mail {
  constructor(options) {
    this.options = options || {};
    this.email = new Email(options);
  }

  async create(params) {
    return this.email.send(params)
      .catch(err => console.error('Email Error', err));
  }
}

module.exports = function(options) {
  return new Mail(options);
};

module.exports.Service = Mail;
