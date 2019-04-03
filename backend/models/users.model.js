// Users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const users = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    project: { type: String, required: true },
    is_admin: { type: Boolean, default: false }
  }, {
      timestamps: true
    });

  return mongooseClient.model('users', users);
};
