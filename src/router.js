var createStore = require('pure-flux').createStore;
var dispatch = require('pure-flux').dispatch;
var pathToRegexp = require('./pathToRegexp');
let pathRegexps = {};
let locationToken = require('./location').dispatchToken;
let locationStore = require('./location');
let isfunction = require('formula/fn/isfunction')

// Return the first matching route.
function match(routes=[], path) {
  for (var i = 0; i < routes.length; i++) {
    var re = pathRegexps[routes[i].path] || pathToRegexp(routes[i].path);
    pathRegexps[routes[i].path] = re;

    if (re && re.test(path)) {
      return { re, route: routes[i] };
    }
  }

  return false;
}


// Create a store with options:
//
// - routes - [{ path: "/buckets/:id", action: Promise }]
//   A list of routes that specify a URL path and an action that must return a promise to the page content.
module.exports = createStore( 'router', (state={ routes: [] }, action, waitFor) => {

  // routes depends on location store being updated first!
  waitFor([locationToken]);

  var {routes, content} = state;

  if (action.type === 'loadRoutes'){
    routes = action.data;
  }

  var ls = locationStore.getState();
  var pathname = ls.pathname;

  // console.log('current path', pathname)

  // Match routes
  var found = match( routes, pathname );

  if (!found) {
    // console.warn("not found", pathname, routes);
    return state;
  }

  var {re, route} = found;

  if (state.route && state.route === route) {
    // console.log('same route')
    return state;
  }

  if (!route) {
    // console.warn('no route!');
    return state;
  }
  // extract parameters
  var paramNames = re.exec(route.path).slice(1);
  var args = re.exec(pathname).slice(1);

  // zip into object { key: value }
  var params = paramNames.length === args.length ?
      paramNames.reduce( (acc, key, i) => { acc[key.substring(1)] = args[i]; return acc; }, {}) :
      {};


  // console.log('CHECK', route, typeof route.load)
  if (found && route.component) {
    // console.log('COMPONENT', route.component)
    content = route.component;
  } else if (found && route && route.load) {
    // console.log('ASYNC', route)
    // run the action method defined by the router
    if (route.load.then) {
      // console.log("THEN", route)
      route.load.then( (content) => dispatch( {
        type: 'loadContent',
        content,
        params,
        args,
        route
      } ) );
    } else if (isfunction(route.load)) {
      // console.log("THUNK", route, typeof route.load)
      content = route.load(params);
    }
  }

  // console.log('EXIT', pathname, route.path, content)

  return { routes, route, params, args, content };

});
