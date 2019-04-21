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
    auth0Id: { type: String, sparse: true },
    project: { type: String, ref: 'projects' },
    photo: { type: String },
    accessCode: { type: String }
  }, {
      timestamps: true
    });

  users.index({ auth0Id: 1 }, { unique: true, partialFilterExpression: { auth0Id: { $type: "string" } } })

  return mongooseClient.model('users', users);
};
