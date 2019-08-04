const { authenticate } = require('@feathersjs/authentication').hooks;
const moment = require('moment');
const { removeRelated } = require('../../hooks/customHooks');
const { restrictToRole, restrictFields } = require('../../hooks/customHooks');
const { startCase } = require('lodash');

const renderDate = date => date ? moment(date).format('dddd, MMMM Do') : ''
const renderTime = time => time ? moment(time).format('h:mm A') : ''


const formatUpdates = async context => {
  const { app, method, result: gig } = context;

  if (gig.status === 'Draft') {
    return context;
  }

  const action = method === 'create' ? 'New' : 'Updated';

  context.project = await app.service('api/projects').get(gig.project);
  context.users = await app.service('api/members').find({
    query: {
      project: gig.project,
      $populate: 'user',
      $select: ['user.name', 'preferences']
    }
  });

  // console.log(context.users);

  const availability = await app.service('api/gig-availability').find({
    query: {
      gig: gig._id,
      $populate: 'member'
    }
  });

  const availabilityIndex = Object.values(availability)
    .reduce((index, availability) => {
      index[availability.status] = index[availability.status] || []
      index[availability.status].push({ user: context.users.find(user => user._id.toString() === availability.member._id.toString()), availability })
      return index;
    }, {})

  const date = renderDate(gig.start);
  const shortDate = moment(gig.start).format('M/D/YY');

  context.gigData = {
    action: method === 'create' ? 'New Gig' : 'Gig Update',
    project: context.project.name,
    date,
    shortDate,
    name: gig.name,
    title: `${action} ${context.project.name} ${gig.type}: ${moment(gig.start).format('M/D/YY')} - ${gig.name}`,
    shortTitle: `${shortDate} - ${gig.name}`,
    link: `https://giggity.info/gigs/${gig._id}`,
    bandDetails: {
      'Status': gig.status,
      'When': date +
        ((gig.start && gig.end) ? `<br/>${renderTime(gig.start)} - ${renderTime(gig.end)}` : '') +
        ((gig.load_in && gig.type === 'Gig') ? `<br/>Load-in at ${renderTime(gig.load_in)}` : ''),
      'Where': gig.location || 'TBD',
      'Description': gig.description.replace(/\n/g, '<br/>') || 'TBD',
      'Who\'s Coming': ['Available', 'Maybe', 'Unavailable']
        .filter(key => availabilityIndex[key] && availabilityIndex[key].length)
        .map(key =>
          `<b>${key}</b>: ${availabilityIndex[key].map(({ user }) => user.user.name).join(', ')}`
        ).join('<br/>'),
      'Member Comments': Object.values(availabilityIndex)
        .reduce((arr, val) => [...arr, ...val], [])
        .filter(({ availability }) => availability.comments)
        .sort((a, b) => a.user.user.name.localeCompare(b.user.user.name))
        .map(({ user, availability }) =>
          `<b>${user.user.name}</b>: ${availability.comments}`
        ).join('<br/>'),
      ...(
        context.project.custom_fields
          .filter(field => !field.public)
          .reduce((obj, field) => {
            obj[field.label] = gig.custom_fields[field.label].replace(/\n/g, '<br/>');
            return obj;
          }, {})
      )
    },
    publicDetails: {
      'Event Time': (gig.event_start && gig.event_end) ? `${renderTime(gig.event_start)} - ${renderTime(gig.event_end)}` : '',
      'Public Title': gig.public_title,
      'Public Description': gig.public_description.replace(/\n/g, '<br/>'),
      'Public Link': gig.link,
      ...(
        context.project.custom_fields
          .filter(field => field.public)
          .reduce((obj, field) => {
            obj[field.label] = gig.custom_fields[field.label].replace(/\n/g, '<br/>');
            return obj;
          }, {})
      )
    }
  };

  ['bandDetails', 'publicDetails']
    .forEach(type => {
      Object.keys(context.gigData[type]).forEach(key => {
        if (!context.gigData[type][key]) {
          delete context.gigData[type][key]
        }
      })
    })

  return context;
}

const mailGigUpdate = async context => {
  const { app, method, gigData, result: gig, users } = context;

  if (!app.get('mail').enabled) {
    return context;
  }

  if (gig.status === 'Draft') {
    return context;
  }

  const filter = method === 'create' ? 'added' : 'updated';

  await Promise.all(
    users
      .filter(user => user.preferences.email[`gig_${filter}`])
      .map(({ user }) => {
        return app.service('api/mail').create({
          template: 'gigUpdate',
          message: {
            to: user.email // FIXME user.email
          },
          locals: {
            user,
            gigData,
          }
        });
      })
  )
}

const updateCalendar = async context => {
  const { app, method, gigData, project, result: gig } = context;
  if (!context.app.get('calendar').enabled) {
    return context;
  }
  gig.calendar = gig.calendar || {};
  const remove = method === 'remove' || gig.status === 'Draft';
  const calendar = await app.service('api/calendar').updateEvent(project.calendar, gig, gigData, remove);
  if (calendar.id !== gig.calendar.id || calendar.public_id !== gig.calendar.public_id) {
    gig.calendar = calendar;
    await app.service('api/gigs')._patch(gig._id, { calendar });
  }
  return context;
}

const hideDraftsFromNonManagers = context => {
  const roles = context.app.get('roles')
  const userRole = context.params.user.projects[context.params.user.project];
  const role_index = roles.indexOf('Manager');
  const userIndex = roles.indexOf(userRole);
  if (userIndex && userIndex > role_index) {
    context.params.query.status = { '$ne': 'Draft' };
  }
  return context;
}

module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      // preUpdate
    ],
    find: [hideDraftsFromNonManagers],
    get: [
      ({ app, params: { connection }, id }) => {
        app.channels.forEach(channel => {
          if (channel.match('/gigs/')) {
            app.channel(channel).leave(connection);
          }
        });
        app.channel(`/gigs/${id}`).join(connection);
      }
    ],
    create: [restrictToRole('Manager')],
    update: [],
    patch: [restrictToRole('Manager'), restrictFields({ Manager: ['project'] })],
    remove: [restrictToRole('Manager'), removeRelated('api/gig-availability', 'gig')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [formatUpdates, mailGigUpdate, updateCalendar],
    update: [],
    patch: [formatUpdates, mailGigUpdate, updateCalendar],
    remove: [updateCalendar]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
