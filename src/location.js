// Knows all about which page is loaded and responds to action to load new page.
var {createStore, dispatch} = require('fluxury');
var parsequery = require('formula/fn/parsequery');

function readLocation(state) {
  var pathname = window.location.pathname,
      search = window.location.search;

  return {
    title: document.title,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    query: search && search.length > 0 ? parsequery(window.location.search) : {}
  };
}

var store = createStore( 'location', ( state=false, action ) => {

  if (!state) return readLocation();

  switch (action.type) {
  case 'openPath':
  case 'redirectPath':
  case 'windowPopState':
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
  dispatch('windowPopState')
});

module.exports = store;
