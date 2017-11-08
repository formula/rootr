# pure-flux-router

[![CircleCI](https://circleci.com/gh/PureFlux/pure-flux-router.svg?style=svg)](https://circleci.com/gh/WebsiteHQ/pure-flux-router)

## Overview

A router for single page applications:

1. Wraps DOM APIs for window and history.
2. Routes defined with a paths, similar to express.
3. Content loaded async. Works with webpack.

## Usage

### Router Setup

```js
var {promiseAction} = require('pure-flux')
var {loadContent, loadRoutes} = require('pure-flux-router')

let routes = [{
    path: '/',
    load: loadContent( System.import('./pages/home') )
  }, {
    path: '/buckets',
    load: loadContent( System.import('./pages/buckets') )
  }, {
    path: '/bucket/:bucket_id',
    load: loadContent( System.import('./pages/buckets') )
  } {
    path: '*',
    load: loadContent( System.import('./pages/404') )
  }]

loadRoutes( routes )
```

### Open path programmically

```js
import {location} from 'pure-flux-router'
location.open('/buckets/1')
```
Use `redirect` to change the URL without adding an entry to the history state.
```js
location.redirect('/buckets')
```

### Replace routes

Change the routes.

```js
loadRoutes([{
  path: '/',
  load: loadContent( System.import('./pages/home') )
}])
```

## Final thoughts

Experimental. Untested in wide variety of browsers.
