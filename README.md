# rootr

[![CircleCI](https://circleci.com/gh/formula/rootr.svg?style=svg)](https://circleci.com/gh/formula/rootr)

## Overview

A router for single page apps:

1. Wraps DOM APIs for window and history.
2. Routes defined with paths, similar to express.
3. Content loaded async. Works with code splitting.

## Usage

### Setup

```js
var {loadContent, loadRoutes} = require('rootr')

let routes = [{
    path: '/',
    load: () => System.import('./pages/home')
  } {
    path: '*',
    load: () => System.import('./pages/error_not_found')
  }]

loadRoutes( routes )
```

### Open path programmically

```js
import {location} from 'rootr'
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
