// Knows all about which page is loaded and responds to action to load new page.
var {createStore, dispatch} = require('pure-flux');
var parsequery = require('formula/fn/parsequery');

function readLocation(state) {
  var path = window.location.pathname,
      search = window.location.search;

  return {
    title: document.title,
    path: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    query: search && search.length > 0 ? parsequery(window.location.search) : {}
  };
}

var store = createStore( 'location', ( state={ path: null }, action ) => {

  if (!state.path) return readLocation();

  switch (action.type) {
  case 'openPath':
  case 'redirectPath':
    return readLocation();
  }

  return state;

}, {
  open: (state, path) => {
    history.pushState({ path }, document.title, path);
    return dispatch('openPath', path);
  },
  redirect: (state, path) => {
    history.replaceState({ path }, document.title, path);
    return dispatch('redirectPath', path);
  }
});

window.addEventListener('popstate', function(event) {
  store.redirect( window.location.pathname );
});

module.exports = store;
