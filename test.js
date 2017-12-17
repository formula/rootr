// mock browser globals

var parseURL = require('url').parse;
var historyQueue = []

let windowCallbacks = {}
global.window = {
  location: {
    pathname: '/',
    search: '',
    hash: ''
  },
  addEventListener: (name, cb) => {
    windowCallbacks[name] = cb
  }
}

function* goBack() {

  //console.log(historyQueue.length)
  var current = historyQueue.pop()
  var previous = historyQueue.pop()
  window.location.pathname = previous.pathname
  window.location.search = previous.search
  window.location.hash = previous.hash
  windowCallbacks.popstate(previous)
}

global.document = {
  title: 'test'
}

global.history = {
  pushState: (state, title, url) => {
    window.location = parseURL(url)
    historyQueue.push(window.location);
  },
  replaceState: (state, title, url) => {
    window.location = parseURL(url)
  },
}

// run tests
var test = require('tape-async');
var React = require('react')
var ReactDom = require('react-dom/server')

var testComponent = (props) => <div>path: {props.location.pathname}. params: {JSON.stringify(props.router.params)}. search: {props.location.search}</div>
var testComponent2 = (props) => <div>2</div>
var testComponent3 = (props) => <div>3</div>
var testComponent4 = (props) => <div>4</div>
var pageNotFound = (props) => <div>not found</div>

var { createStore, dispatch, promiseAction, subscribe } = require('fluxury')

// subscribe((state, action) => console.log('action', action))
var router= require('./src/index')
var { location, replaceRoutes, loadContent, loadRoutes, promiseContent } = require('./src/index')


loadRoutes([{
  path: '/',
  load: Promise.resolve(testComponent)
}, {
  path: '/admin',
  load: () => Promise.resolve(testComponent) // Promise resolves to component
}, {
  path: '/admin2',
  load: () => Promise.resolve({ default: testComponent2 }) // Promise resolves to ES6 default.
}, {
  path: '/admin3',
  component: testComponent3
}, {
  path: '/admin4',
  component: testComponent4
}, {
    path: '/page/:num',
    component: testComponent4
}, {
  path: '*',
  component: testComponent
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
  t.plan(3)
  t.equal(typeof loadContent, 'function')
  t.equal(typeof router.loadContent, 'function')
  t.equal(7, router.getState().routes.length)
})

test( 'location.open(path) works correctly', function* (t) {
  t.plan(16)


  var result = yield location.open('/admin')

  t.equal( window.location.pathname, '/admin')

  var result = yield location.open('/admin?foo=1#456')

  t.equal( window.location.pathname, '/admin')
  t.equal( window.location.search, '?foo=1')
  t.equal( window.location.hash, '#456')

  var result = yield location.open('/')

  var rs = router.getState;
  var result = yield location.open('/admin')
  t.equal( rs().route.path, '/admin' );
  t.equal( rs().content, testComponent );

  var result = yield location.open('/admin2?foo=bar')
  t.equal( rs().route.path, '/admin2' );
  t.equal( rs().content, testComponent2 );

  var result = yield location.open('/admin3')
  t.equal( rs().route.path, '/admin3' );
  t.equal( rs().content, testComponent3 );

  var result = yield location.open('/admin4')
  t.equal( rs().route.path, '/admin4' );
  t.equal( rs().content, testComponent4 );

  var result = yield location.open('/page/1')
  t.equal( rs().route.path, '/page/:num' );
  t.deepEqual( rs().params, { num: '1' })

  var result = yield location.open('/page/2')
  t.equal( rs().route.path, '/page/:num' );
  t.deepEqual( rs().params, { num: '2' })

});

test( 'goBack works correctly', function*(t) {
  t.plan(3)
  var result = yield location.open('/admin?foo=1#bar')

  yield location.open('/admin2')

  yield goBack();

  var state = location.getState();

  t.equal( state.pathname, '/admin')
  t.equal( state.search, '?foo=1')
  t.equal( state.hash, '#bar')

});
