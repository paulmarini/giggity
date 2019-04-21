// projects-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const projects = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: true },
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
