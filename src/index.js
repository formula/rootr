// Copyright JC Fisher @ 2017
let {promiseAction, dispatch} = require('pure-flux');

let router = require('./router');
router.location = require('./location');
router.loadRoutes = (routes) => dispatch('loadRoutes', routes);
router.loadContent = (cmp) => () => promiseAction('loadContent', cmp);

module.exports = router;
