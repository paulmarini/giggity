const { google } = require('googleapis');
const moment = require('moment');

/* eslint-disable no-unused-vars */
class Service {
  constructor(options) {
    this.options = options || {};
    if (!this.options.calendar.enabled) {
      return;
    }
    // configure a JWT auth client
    this.jwtClient = new google.auth.JWT(
      options.google.client_email,
      null,
      options.google.private_key,
      ['https://www.googleapis.com/auth/calendar']
    );
    this.jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.error(err);
        return;
      }
    });
    google.options({
      auth: this.jwtClient
    })
    this.calendars = google.calendar('v3');
  }

  async removeACLs({ gig_calendar_id, rehearsal_calendar_id }, { email, calendar_acls = {} }) {
    const promises = [gig_calendar_id, rehearsal_calendar_id]
      .map(async (calendarId, index) => {
        const ruleId = index === 0 ? calendar_acls.gig_calendar_acl_id : calendar_acls.rehearsal_calendar_id_calendar_acl_id
        if (calendarId && ruleId) {
          const result = await this.calendars.acl.delete({
            calendarId,
            ruleId,
          });
          return result.data.id
        }
      });
    await Promise.all(promises);
  }

  async updateACLs({ gig_calendar_id, rehearsal_calendar_id }, { email, calendar_acls = {} }) {
    const promises = [gig_calendar_id, rehearsal_calendar_id]
      .map(async (calendarId, index) => {
        const ruleId = index === 0 ? calendar_acls.gig_calendar_acl_id : calendar_acls.rehearsal_calendar_id_calendar_acl_id
        const method = ruleId ? 'patch' : 'insert';
        const result = await this.calendars.acl[method]({
          calendarId,
          ruleId,
          sendNotifications: false,
          requestBody: {
            role: "reader",
            scope: { type: "user", value: email }
          }
        });
        return result.data.id
      });
    const [gig_calendar_acl_id, rehearsal_calendar_acl_id] = await Promise.all(promises);
    return {
      gig_calendar_acl_id,
      rehearsal_calendar_acl_id
    };
  }

  async create({ project }) {
    const promises = ['Gigs', 'Rehearsals', 'Public Gigs']
      .map(async type => {
        const { data: { id } } = await this.calendars.calendars.insert({
          requestBody: { summary: `${project} ${type}` }
        })
        await this.calendars.acl.insert({
          calendarId: id,
          requestBody: {
            role: "owner",
            scope: { type: "user", value: "giggity.giggity.info@gmail.com" }
          }
        })
        if (type === 'Public Gigs') {
          await this.calendars.acl.insert({
            calendarId: id,
            requestBody: {
              role: "reader",
              scope: { type: "default" }
            }
          })
        }
        return id;
      });

    const [gig_calendar_id, rehearsal_calendar_id, public_calendar_id] = await Promise.all(promises);
    return {
      gig_calendar_id,
      rehearsal_calendar_id,
      public_calendar_id
    }
  }

  async updateEvent({ gig_calendar_id, rehearsal_calendar_id, public_calendar_id }, gig, gigData, remove) {
    const requestBody = {
      summary: gig.name,
      description:
        ['bandDetails', 'publicDetails']
          .map(type => Object.keys(gigData[type])
            .map(key => `<b>${key}:</b> ${gigData[type][key]}`)
            .join('\n\n')
          )
          .join('\n\n<hr/><b>PUBLIC DETAILS</b>\n\n'),
      start: {
        'date': null
      },
      end: {
        'date': null
      }
    }
    if (gig.start && gig.end) {
      requestBody.start.dateTime = gig.start;
      requestBody.end.dateTime = gig.end;
    } else {
      const date = moment(gig.start).format('YYYY-MM-DD');
      requestBody.start.date = date;
      requestBody.end.date = date;
    }
    const calendarIds = gig.type === 'rehearsal' ? [rehearsal_calendar_id] : [gig_calendar_id, public_calendar_id];
    const eventIDs = gig.calendar || {};
    const promises = calendarIds
      .map(async (calendarId, i) => {
        const eventId = i === 0 ? eventIDs.id : eventIDs.public_id;
        const method = remove ? 'delete' : (eventId ? 'patch' : 'insert');
        if (remove && !eventId) {
          return;
        }
        try {
          const response = await this.calendars.events[method]({
            eventId,
            sendUpdates: 'none',
            calendarId,
            requestBody
          });
          return response.data.id
        } catch (err) {
          if (err.response.status === 404 && method === 'patch') {
            const response = await this.calendars.events.insert({
              sendUpdates: 'none',
              calendarId,
              requestBody
            });
            return response.data.id;
          }
          console.error(`Error ${method}ing calendar event ${eventId} on calendar ${calendarId}`, err.message, requestBody)
          return Promise.reject(err);
        }
      });
    const [id, public_id] = await Promise.all(promises);
    return {
      id,
      public_id
    }
  }

}

module.exports = function(options) {
  return new Service(options);
};

module.exports.Service = Service;
