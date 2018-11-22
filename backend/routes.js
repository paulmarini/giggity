const express = require('express');
const controllers = require('./controllers');

const router = express.Router();
console.log('!!!', controllers);

router
  .delete('/gigs/:id', (req, res, next) => {
    const {id} = req.params;
    return controllers.deleteGig(id)
      .then(result => {
        res.send(result);
      })
  })
  .post('/gigs', (req, res, next) => {
    const {gig} = req.body;
    return controllers.updateGig(gig)
      .then(result => {
        res.send(result);
      })
  })
  .put('/gigs/:id', (req, res, next) => {
    const {gig} = req.body;
    return controllers.updateGig(gig)
      .then(result => {
        res.send(result);
      })
  })

module.exports = router;
