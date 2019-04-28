// GigAvailability-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const { Schema } = require('mongoose');
const ObjectId = Schema.Types.ObjectId;

module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const gigAvailability = new Schema({
    user: { type: ObjectId, required: true, ref: 'users' },
    gig: { type: ObjectId, required: true, ref: 'gigs' },
    status: { type: String, required: true },
    comments: { type: String },
    project: { type: String, required: true, ref: 'projects' }
  }, {
      timestamps: true
    });

  gigAvailability.index({ user: 1, gig: 1 }, { unique: true });

  return mongooseClient.model('gigAvailability', gigAvailability);
};
