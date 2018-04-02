# Nanux

## Installation

```
yarn add nanux
npm install nanux
```

## Fast guide

### Create a store

```
import { Store } from 'nanux'

const store = new Store({
  state: 1,
  actions: {
    plus: (state, value) => state + value
  }
})
```

### Dispatch actions

```
store.dispatch('plus', 5) // => 6
```

### Subscribe to changes

```
store.subscribe((newState, oldState) => {
  console.log('Old state', oldState)
  console.log('New state', newState)
}
```

### Using middlewares

```
const store = new Store({
  state: 1,
  actions: {
    plus: (state, value) => state + value,
    minus: (state, value) => state - value
  },
  middlewares: [
    ({ action, payload }) => ({
      action: 'minus',
      payload
    })
  ]
})

store.dispatch('plus', 5) // => -4
```

### Asynchronous actions/middlewares

```
const store = new Store({
  state: 1,
  actions: {
    plus: (state, val) =>
      new Promise(res => setTimeout(res, 1000, val + 1))
  },
  middlewares: [
    ({ action, payload }) => new Promise(res => setTimeout(res, 1000, { action, payload }))
  ]
})
```

### Dispatch another actions inside action

```
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
        dispatch('isFetching', false)
        return { ...state, items: res.body }
      })
    }
  }
})
```

## License

MIT
