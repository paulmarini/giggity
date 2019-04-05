// registration-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const registration = new Schema({
    project_id: { type: String, required: true, unique: true },
    project: { type: String, required: true },
    email: { type: String, required: true },
    verificationCode: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false }
  }, {
      timestamps: true
    });

  return mongooseClient.model('registration', registration);
};
