const express = require('express');
const controllers = require('./controllers');
const auth = require('./auth');

const router = express.Router();
console.log('!!!', controllers);

router
  .post('/auth', (req, res, next) => {
    const {user, password, project} = req.body;
    return controllers.auth(user, password, project)
      .then(token => {
        res.send({token});
      }, next)
  })
  .use(auth.restVerify())
  .delete('/gigs/:id', (req, res, next) => {
    const {id} = req.params;
    return controllers.deleteGig(req.user.data.project, id)
      .then(result => {
        res.send(result);
      }, next)
  })
  .post('/gigs', (req, res, next) => {
    const {gig} = req.body;
    return controllers.updateGig(req.user.data.project, gig)
      .then(result => {
        res.send(result);
      }, next)
  })
  .put('/gigs/:id', (req, res, next) => {
    const {gig} = req.body;
    return controllers.updateGig(req.user.data.project, gig)
      .then(result => {
        res.send(result);
      }, next)
  })
  .delete('/users/:id', (req, res, next) => {
    const {id} = req.params;
    return controllers.deleteUser(req.user.data.project, id)
      .then(result => {
        res.send(result);
      }, next)
  })
  .post('/users', (req, res, next) => {
    const {user} = req.body;
    console.log('update', user, req.user.data.project)
    return controllers.updateUser(req.user.data.project, user)
      .then(result => {
        res.send(result);
      }, next)
  })
  .put('/users/:id', (req, res, next) => {
    const {user} = req.body;
    return controllers.updateUser(req.user.data.project, user)
      .then(result => {
        res.send(result);
      }, next)
  })
  .use((error, req, res, next) => {
    console.error('API ERROR', error, req.path);
    res.status(500).send({error});
  })

module.exports = router;
