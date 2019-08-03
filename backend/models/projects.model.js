// projects-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const fields = new Schema({
    label: { type: String },
    type: { type: String, enum: ['Text', 'Paragraph', 'Link', 'Member', 'Select', 'Checkbox', 'Radio', 'Date', 'Time', 'Multiple choice', 'Dropdown'] },
    options: { type: [String] },
    default: { type: String },
    public: { type: Boolean, default: false },
    helperText: { type: String }
  })
  const projects = new Schema({
    _id: { type: String },
    name: { type: String, required: true, unique: true },
    default_role: { type: String, default: 'Member' },
    custom_fields: { type: [fields] },
    custom_rehearsal_fields: { type: [fields] },
    communication: {
      email_list: { type: String },
      enable_gig_calendar: { type: Boolean, default: true },
      enable_rehearsal_calendar: { type: Boolean, default: true },
      enable_public_calendar: { type: Boolean, default: true },
    },
    rehearsal_schedule: { type: String },
    rehearsal_defaults: {
      name: { type: String, default: 'Rehearsal' },
      start: { type: Date },
      end: { type: Date },
      location: { type: String }
    },
    calendar: {
      gig_calendar_id: { type: String },
      rehearsal_calendar_id: { type: String },
      public_calendar_id: { type: String },
    }
  }, {
      timestamps: true
    });

  return mongooseClient.model('projects', projects);
};
