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
    type: { type: String, required: true, default: 'Member', enum: ['Root', 'Admin', 'Manager', 'Member', 'Read-Only'] },
  }, {
      timestamps: true
    });
  users.index({ project: 1, email: 1 }, { unique: true });
  return mongooseClient.model('users', users);
};
