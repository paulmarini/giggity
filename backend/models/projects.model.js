// projects-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const fields = new Schema({
    label: { type: String },
    type: { type: String, enum: ['Text', 'Paragraph', 'Link', 'Member', 'Dropdown', 'Checkboxes', 'Multiple choice', 'Date', 'Time'] },
    options: { type: [String] },
    default: { type: String },
    private: { type: Boolean, default: true }
  })
  const projects = new Schema({
    _id: { type: String },
    name: { type: String, required: true, unique: true },
    email_list: { type: String },
    default_role: { type: String, default: 'Member' },
    custom_fields: { type: [fields] },
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
