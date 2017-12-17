var createStore = require('fluxury').createStore;
var dispatch = require('fluxury').dispatch;
var pathToRegexp = require('./pathToRegexp');
let pathRegexps = {};
let locationToken = require('./location').dispatchToken;
let locationStore = require('./location');
let isobject = require('formula/fn/isobject');
let isfunction = require('formula/fn/isfunction');

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

  if (action.type === 'loadContent') {
    // console.log('loadContent in router', state, action)
    return Object.assign({}, state, { content: isobject(action.data) && action.data.default ? action.data.default : action.data });
  }

  if (action.type === 'loadRoutes'){
    routes = action.data;
  }

  var ls = locationStore.getState();
  var pathname = ls.pathname;

  console.log('current path', pathname)

  // Match routes
  var found = match( routes, pathname );

  if (!found) {
     console.warn("not found", pathname, routes);
    return state;
  }

  var {re, route} = found;


  if (!route) {
    console.warn('no route!');
    return state;
  }
  // extract parameters
  var paramNames = re.exec(route.path).slice(1);
  var args = re.exec(pathname).slice(1);

  // zip into object { key: value }
  var params = paramNames.length === args.length ?
      paramNames.reduce( (acc, key, i) => { acc[key.substring(1)] = args[i]; return acc; }, {}) :
      {};


  if (state.route && state.route === route && state.params === params) {
    console.log('same route and params')
    return state;
  }

  // console.log('CHECK', route, typeof route.load)
  if (found && route.component) {
    // console.log('COMPONENT', route.component)
    content = route.component;
  } else if (found && route && route.load) {
    // console.log('ASYNC', route, content)
    // run the action method defined by the router
    let loader = route.load;

    if (isfunction(loader)) {
      // console.log("THUNK", route, typeof route.load)
      loader = route.load(params);
    }

    if (isfunction(loader)) {
      content = loader;
    } else if (isobject(loader) && loader.then) {
      // console.log("THEN", route)
      loader.then( (cmp) => dispatch('loadContent', cmp) );
    }
  }

  // console.log('EXIT', pathname, route.path, content)

  return { routes, route, params, args, content };

});
