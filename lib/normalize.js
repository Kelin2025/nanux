export const normalizeStore = store => {
  if (process.env.NODE_ENV !== "production") {
    if (store.getters && typeof store.getters !== "object") {
      throw new TypeError(
        `[X] Expected getters to be an object, ${typeof store.getters} given`
      )
    }
    if (store.actions && typeof store.actions !== "object") {
      throw new TypeError(
        `[X] Expected actions to be an object, ${typeof store.actions} given`
      )
    }
    if (store.middlewares && !Array.isArray(store.middlewares)) {
      throw new TypeError(
        `[X] Expected middlewares to be an array, ${typeof store.middlewares} given`
      )
    }
    Object.entries(store.actions).forEach(([name, cb]) => {
      if (typeof cb !== "function") {
        throw new TypeError(
          `[X] Action "${name}" should be a function but ${typeof cb} given`
        )
      }
    })
    ;(store.middlewares || []).forEach((cb, idx) => {
      if (typeof cb !== "function") {
        throw new TypeError(
          `[X] Middleware [${idx}] should be a function but ${typeof cb} given`
        )
      }
    })
  }
  return {
    name: store.name || "unknown",
    state: store.state,
    getters: store.getters || {},
    actions: store.actions || {},
    middlewares: store.middlewares || []
  }
}
