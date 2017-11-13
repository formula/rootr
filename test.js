// mock browser globals

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

function parsePath(path) {
  var tmp = path.split('?')
  let pathname = tmp[0];
  let search = tmp[1] || '';
  let hash = '';
  if (search && search.indexOf('#') > -1){
    [search, hash] = search.split('#')
  }

  search = `?${search}`
  hash = `#${hash}`

  return {
    pathname, search, hash
  }

}

global.history = {
  pushState: (state, title, path) => {
    window.location = parsePath(path)
    historyQueue[historyQueue.length-1] =  { state, title, path: window.location.pathname, search: window.location.search, hash: window.location.search  }
  },
  replaceState: (state, title, path) => {
    window.location = parsePath(path)
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

//subscribe((state, action) => console.log('action', action))
var router= require('./src/index')
var { location, replaceRoutes, loadContent, loadRoutes, promiseContent } = require('./src/index')


loadRoutes([{
  path: '/',
  load: Promise.resolve(testComponent)
}, {
  path: '/admin',
  load: () => Promise.resolve(testComponent)
}, {
  path: '/admin2',
  component: testComponent2
}, {
  path: '/admin3',
  component: testComponent3
}, {
  path: '/admin4',
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
  t.equal(6, router.getState().routes.length)
})

test( 'location.open(path) works correctly', function* (t) {
  t.plan(12)


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


});
