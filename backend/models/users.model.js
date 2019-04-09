// Users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const users = new Schema({
    name: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    auth0Id: { type: String, unique: true },
    project: { type: String, ref: 'projects' },
    photo: { type: String },
    accessCode: { type: String }
  }, {
      timestamps: true
    });
  return mongooseClient.model('users', users);
};
