import NanoEvents from "nanoevents"
import generate from "nanoid/generate"
import { normalizeStore } from "./normalize"

const generateId = () => generate("1234567890abcdefghijklmnopqrstuvwxyz", 10)

export const Store = function(store) {
  const m = normalizeStore(store)
  let isolatedState = m.state
  const bus = new NanoEvents()

  this.actions = m.actions
  this.middlewares = m.middlewares
  this.subscriptions = []

  const triggerUpdate = ({ action, payload, oldState, newState }) => {
    isolatedState = newState
    bus.emit("state:update", {
      action,
      payload,
      oldState,
      newState: this.getState()
    })
    this.subscriptions.forEach(sub => {
      sub.cb(this.getState(), oldState)
    })
    return newState
  }

  this.use = plugin => {
    plugin(this)
    return this
  }

  this.on = (evt, cb) => bus.on(evt, cb)

  this.subscribe = (cb, opts = {}) => {
    if (process.env.NODE_ENV !== "production") {
      if (typeof cb !== "function") {
        throw new TypeError(
          `[X] Expected subscribe callback to be a function but ${typeof cb} given`
        )
      }
    }
    this.subscriptions.push({ cb, opts })
    return () => this.unsubscribe(cb)
  }

  this.unsubscribe = cb => {
    const idx = this.subscriptions.findIndex(i => i.cb === cb)
    if (idx !== -1) {
      this.subscriptions.splice(idx, 1)
    }
  }

  this.getState = () => {
    return typeof isolatedState === "object"
      ? Object.assign({}, isolatedState)
      : isolatedState
  }

  this.dispatch = (action, payload, meta = {}) => {
    const id = generateId()

    let data = { action, payload }

    bus.emit("action:start", id, { action, payload, meta })

    const applyMiddleware = (middleware, idx) => res => {
      if (process.env.NODE_ENV !== "production") {
        if (!(res instanceof Promise) && !res.action) {
          console.warn(
            `[X] Middleware should return action as a String but [${idx}] returns ${
              res.action
            }`,
            this
          )
        }
      }
      if (!res) {
        bus.emit("action:middleware/skip", id, idx, {
          action,
          payload,
          meta
        })
        return { action: null, payload, meta }
      }
      bus.emit("action:middleware/apply", id, idx, {
        action,
        payload,
        meta
      })
      return this.middlewares[idx](res)
    }

    for (const i in this.middlewares) {
      if (data instanceof Promise) {
        data.then(applyMiddleware(this.middlewares[i], i))
      } else {
        data = applyMiddleware(this.middlewares[i], i)(data)
      }
    }

    const dispatchAction = ctx => {
      if (ctx.action === null) return isolatedState
      if (process.env.NODE_ENV !== "production") {
        if (!this.actions[ctx.action]) {
          throw new ReferenceError(`[X] Unknown action ${ctx.action}`, this)
        }
      }
      bus.emit("action:apply", id, {
        action: ctx.action,
        payload: ctx.payload
      })
      const res = this.actions[ctx.action](isolatedState, ctx.payload, {
        dispatch: this.dispatch
      })
      const update = newState =>
        triggerUpdate(
          Object.assign({}, ctx, { oldState: isolatedState, newState })
        )

      return res instanceof Promise ? res.then(update) : update(res)
    }

    return data instanceof Promise
      ? data.then(dispatchAction)
      : dispatchAction(data)
  }
}
