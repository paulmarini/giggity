// user_access-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const { Schema } = require('mongoose');
const ObjectId = Schema.Types.ObjectId;

module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const userAccess = new Schema({
    user: { type: ObjectId, required: true, ref: 'users' },
    project: { type: String, required: true, ref: 'projects' },
    role: { type: String, required: true, default: 'Member', enum: ['Root', 'Admin', 'Manager', 'Member', 'Read-Only'] },
    calendar_acls: {
      gig_calendar_acl_id: { type: String },
      rehearsal_calendar_acl_id: { type: String }
    }
  }, {
      timestamps: true
    });
  userAccess.index({ user: 1, project: 1 }, { unique: true });

  return mongooseClient.model('userAccess', userAccess);
};
