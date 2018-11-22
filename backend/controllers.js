const model = require('./model');
let sockets = null;

const controllers = {
  initController: (newSocket) => {
    sockets = newSocket;
  },
  getSocket: () => sockets,
  addGig: gig => {
    console.log('add', gig);
    return model.nextId()
      .then(id => {
        gig.id = id;
        return model.updateGig(gig)
      })
  },
  updateGig: gig => {
    console.error('update', gig);

    const method = gig.id == null ? controllers.addGig: model.updateGig;
    return method(gig)
      .then(gig => sockets.gigUpdated(gig))
      .then(() => controllers.fetchGigs())
      .then(gigs => sockets.gigsUpdated(gigs))
      .then(() => gig)
  },
  deleteGig: id => {
    return model.deleteGig(id)
      .then(() => controllers.fetchGigs())
      .then(gigs => sockets.gigsUpdated(gigs))
      .then(() => id)
  },
  fetchGig: id => {
    return model.fetchGig(id)
  },
  fetchGigs: () => {
    return model.fetchGigs()
      .then(res => {
        const gigs = Object.values(res);
        return gigs;
      });
  }
};

module.exports = controllers;
