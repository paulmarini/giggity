// members-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const { Schema } = require('mongoose');
const ObjectId = Schema.Types.ObjectId;

module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const members = new Schema({
    user: { type: ObjectId, required: true, ref: 'users', autopopulate: true },
    project: { type: String, required: true, ref: 'projects' },
    role: { type: String, required: true, default: 'Member', enum: ['Root', 'Admin', 'Manager', 'Member', 'Read-Only'] },
    calendar_acls: {
      gig_calendar_acl_id: { type: String },
      rehearsal_calendar_acl_id: { type: String }
    },
    pending: { type: Boolean, default: true },
    preferences: {
      hide_rehearsals: { type: Boolean, default: false },
      email: {
        gig_added: { type: Boolean, default: false },
        gig_updated: { type: Boolean, default: false },
        gig_availability_updated: { type: Boolean, default: false }
      }
    }
  }, {
      timestamps: true
    });
  members.index({ user: 1, project: 1 }, { unique: true });
  members.plugin(require('mongoose-autopopulate'));

  return mongooseClient.model('members', members);
};
