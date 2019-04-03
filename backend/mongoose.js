const mongoose = require('mongoose');

module.exports = function(app) {
  mongoose.connect(
    app.get('mongodb'),
    // { useCreateIndex: true, useNewUrlParser: true },
    { useCreateIndex: true, useNewUrlParser: false },
    (error) => {
      if (error) {
        console.error('MONGO connection error');
        console.error(error);
      }
    }
  );
  mongoose.Promise = global.Promise;

  app.set('mongooseClient', mongoose);
};
