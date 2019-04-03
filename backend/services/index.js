const users = require('./users/users.service.js');
const gigs = require('./gigs/gigs.service.js');
const gigAvailability = require('./gig-availability/gig-availability.service.js');
const projects = require('./projects/projects.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(gigs);
  app.configure(gigAvailability);
  app.configure(projects);
};
