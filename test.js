// mock browser globals

var historyQueue = []

let windowCallbacks = {}
global.window = {
  location: {
    pathname: '/',
    search: ''
  },
  addEventListener: (name, cb) => {
    windowCallbacks[name] = cb
  }
}

function* goBack() {
  var item = historyQueue[historyQueue.length-2]
  window.location.pathname = item.path
  window.location.search = item.search
  windowCallbacks.popstate(item)
  historyQueue = historyQueue.slice(0, -1)

  // yield 3 times; once for each promise in redirectPath
  yield Promise.resolve()
  yield Promise.resolve()
  yield Promise.resolve()
}

global.document = {
  title: 'test'
}


global.history = {
  pushState: (state, title, path) => {
    var tmp = path.split('?')

    window.location.pathname = tmp[0]
    window.location.search = tmp[1] ? '?' + tmp[1] : ''
    historyQueue.push( { state, title, path: tmp[0], search: window.location.search } )
  },
  replaceState: (state, title, path) => {
    var tmp = path.split('?')

    window.location.pathname = tmp[0]
    window.location.search = tmp[1] ? '?' + tmp[1] : ''
    historyQueue[historyQueue.length-1] =  { state, title, path: tmp[0], search: window.location.search  }
  },
}

// run tests
var test = require('tape-async');
var React = require('react')
var ReactDom = require('react-dom/server')

var testComponent = React.createClass({
  render() {
    var loc = location.getState()
    return <div>path: {loc.path}. params: {JSON.stringify(this.props.router.params)}. search: {loc.search}</div>
  }
})

var pageNotFound = React.createClass({
  render() { return <div>not found</div> }
})

var {createStore, dispatch, promiseAction} = require('pure-flux')

let loadComponent = require('./src/index').loadContent;

var router= require('./src/index')
var { location, replaceRoutes, loadContent, loadRoutes } = require('./src/index')

loadRoutes([{
    path: '/',
    load: loadComponent(testComponent)
  }, {
    path: '/buckets',
    load: loadComponent(testComponent)
  }, {
    path: '/buckets/:account_id',
    load: loadComponent(testComponent)
  }, {
    path: '/buckets/:account_id/settings',
    load: loadComponent(testComponent)
  }, {
    path: '*',
    load: loadComponent(pageNotFound)
  }])

test( 'Exports are correct type', function(t) {
  t.plan(2)
  t.equal(typeof location, 'object')
  t.equal(typeof router, 'object')
})

test( 'Location includes valid exports', function(t) {
  t.plan(3)
  t.equal(location.name, 'location')
  t.equal(typeof location.open, 'function')
  t.equal(typeof location.redirect, 'function')
})

test( 'Router includes valid exports', function(t) {
  t.plan(2)
  t.equal(typeof loadContent, 'function')
  t.equal(typeof router.loadContent, 'function')
})

test( 'location.open(path) works correctly', function* (t) {
  t.plan(2)


  var result = yield location.open('/buckets/123')

  t.equal( window.location.pathname, '/buckets/123')

  var result = yield location.open('/buckets/123#456')

  t.equal( window.location.pathname, '/buckets/123#456')

});
