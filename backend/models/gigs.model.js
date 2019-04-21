// Gigs-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const gigs = new Schema({
    name: { type: String, required: true },
    project: { type: String, required: true, ref: 'projects' },
    description: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date },
    time_tbd: { type: Boolean, default: true },
    calendar: {
      id: { type: String },
      public_id: { type: String }
    }
  }, {
      timestamps: true
    });

  return mongooseClient.model('gigs', gigs);
};
