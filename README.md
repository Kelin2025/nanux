# Nanux

State, actions and middlewares in just 1 KB

[**Installation**](#installation)  
[**Fast guide**](#fast-guide)  
[**Vue integration**](#vue-integration)
[**TODO**](#todo)

## Installation

```
yarn add nanux
npm install nanux
```

## Fast guide

### Create a store

```javascript
import { Store } from "nanux"

const store = new Store({
  state: 1,
  actions: {
    plus: (state, value) => state + value
  }
})
```

### Dispatch actions

```javascript
store.dispatch("plus", 5) // => 6
```

> **NOTE**: `dispatch` returns new state or Promise with new state

### Subscribe/unsubscribe to changes

```javascript
const cb = store.subscribe((newState, oldState) => {
  console.log('Old state', oldState)
  console.log('New state', newState)
}

store.unsubscribe(cb)
```

### Using middlewares

```javascript
const store = new Store({
  state: 1,
  actions: {
    plus: (state, value) => state + value,
    minus: (state, value) => state - value
  },
  middlewares: [
    ({ action, payload }) => ({
      action: "minus",
      payload
    })
  ]
})

store.dispatch("plus", 5) // => -4
```

> **NOTE**: if middleware returns `null`, action and all next middlewares will be aborted.

### Asynchronous actions/middlewares

```javascript
const store = new Store({
  state: 1,
  actions: {
    plus: (state, val) => new Promise(res => setTimeout(res, 1000, val + 1))
  },
  middlewares: [
    ({ action, payload }) =>
      new Promise(res => setTimeout(res, 1000, { action, payload }))
  ]
})
```

### Dispatch another actions inside action

```javascript
const store = new Store({
  state: {
    isFetching: false,
    items: []
  },
  actions: {
    setFetching: (state, isFetching) => ({ ...state, isFetching }),
    loadItems (state, _, { dispatch }) => {
      dispatch('setFetching', true)
      return fetch('/items').then(res => {
        dispatch('setFetching', false)
        return { ...state, items: res.body }
      })
    }
  }
})
```

## Vue integration

### Usage

##### Install mixin

```javascript
import Vue from "vue"
import VueNanux from "nanux/mixins/vue"

Vue.use(VueNanux)
```

##### Add store modules to your components

```javascript
import { moduleA, moduleB } from "./stores"

export default {
  stores: {
    moduleA,
    moduleB
  }
}
```

#### Use `$store`

```javascript
this.$store.moduleA.state
this.$store.moduleA.dispatch("foo", "bar")
```

> **NOTE**: `dispatch` triggers `$forceUpdate` to apply changes

## TODO

##### Global

* [ ] Add advanced events guide to README.md
* [ ] Getters
* [ ] Modules (?)
* [ ] Write tests/types

##### Vue

* [ ] Deep-pass of store modules (maybe `provide/inject`?)
* [ ] Add mapState/mapActions helpers

## License

MIT
