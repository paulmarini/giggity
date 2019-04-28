const decode = require('jwt-decode');

module.exports = function(app) {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', connection => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (authResult, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // Obtain the logged in user from the connection
      const user = connection.user;
      const claims = decode(authResult.accessToken);
      user.projects = claims.projects;
      user.memberId = claims.memberId
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);
      app.channel(`/projects/${user.project}`).join(connection);
      app.channel(`/users/${user._id}`).join(connection);
      app.channel(`/members/${user.memberId}`).join(connection);
      // Channels can be named anything and joined on any condition

      // E.g. to send real-time events only to admins use
      // if(user.isAdmin) { app.channel('admins').join(connection); }

      // If the user has joined e.g. chat rooms
      // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(channel));

      // Easily organize users by email and userid for things like messaging
      // app.channel(`emails/${user.email}`).join(channel);
      // app.channel(`userIds/$(user.id}`).join(channel);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.publish((data, hook) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`
    // console.log('Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.'); // eslint-disable-line

    // e.g. to publish all service events to all authenticated users use
    // return app.channel('anonymous');
    console.log(hook.path, hook.method);
    if (hook.params.user) {
      return [
        app.channel(`/projects/${hook.params.user.project}`),
      ]
    }
    if (data.project && hook.path !== 'api/users') {
      return app.channel(`/projects/${data.project}`);
    }

    // if (hook.params.user) {
    //   return app.channel(`/projects/${hook.params.user.project}`);
    // }
  });

  // app.service('api/gigs').publish('created', 'patched', 'updated', data => app.channel(`gigs/${data._id}`));
  //
  // app.service('api/gig-availability').publish('created', 'patched', 'updated', data => app.channel(`gigs/${data.gig}`));


  // Here you can also add service specific event publishers
  // e.g. the publish the `users` service `created` event to the `admins` channel
  // app.service('api/users').publish('created', () => app.channel('admins'));

  // With the userid and email organization from above you can easily select involved users
  // app.service('api/messages').publish(() => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ];
  // });
};
