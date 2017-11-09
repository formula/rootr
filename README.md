# pure-flux-router

[![CircleCI](https://circleci.com/gh/PureFlux/pure-flux-router.svg?style=svg)](https://circleci.com/gh/WebsiteHQ/pure-flux-router)

## Overview

A router for single page applications:

1. Wraps DOM APIs for window and history.
2. Routes defined with paths, similar to express.
3. Content loaded async. Works with code splitting.

## Usage

### Router Setup

```js
var {promiseAction} = require('pure-flux')
var {loadContent, loadRoutes} = require('pure-flux-router')

let routes = [{
    path: '/',
    load: () => System.import('./pages/home').then( cmp => loanContent(cmp) )
  } {
    path: '*',
    load: () => System.import('./pages/error_not_found').then( cmp => loanContent(cmp) )
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
