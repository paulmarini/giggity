// Gigs-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const gigs = new Schema({
    name: { type: String, required: true },
    project: { type: String, required: true, ref: 'projects', index: true },
    type: { type: String, enum: ['Rehearsal', 'Gig'], default: 'Rehearsal', index: true },
    description: { type: String },
    start: { type: Date, required: true, index: true },
    end: { type: Date },
    load_in: { type: Date },
    event_start: { type: Date },
    event_end: { type: Date },
    time_tbd: { type: Boolean, default: true },
    location: { type: String },
    public_title: { type: String },
    public_description: { type: String },
    status: { type: String, enum: ['Draft', 'Proposed', 'Confirmed', 'Cancelled'] },
    private: { type: Boolean },
    link: { type: String },
    custom_fields: { type: Map, of: String },
    calendar: {
      id: { type: String },
      public_id: { type: String }
    },
  }, {
      timestamps: true
    });

  return mongooseClient.model('gigs', gigs);
};
