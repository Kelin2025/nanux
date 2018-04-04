import { Store } from "../lib"

export const StoreProvider = {
  props: {
    name: { type: String, required: true }
    store: { type: Store, required: true }
  },
  provide() {
    return {
      [this.name]: this
    }
  },
  data() {
    return {
      state: this.store.getState()
    }
  },
  methods: {
    dispatch(...args) {
      return this.store.dispatch(...args)
    }
  },
  render(h) {
    return this.$slots.default[0]
  },
  created() {
    this.unsubscribe = this.store.subscribe(({ newState }) => {
      this.state = newState
    })
  },
  beforeDestroy() {
    this.unsubscribe()
  }
}

export default Vue => {
  Vue.mixin({
    beforeCreate() {
      if (!this.$options.stores) return
      this.$store = {}
      this.$storeWatchers = {}
      Object.entries(this.$options.stores).forEach(([name, store]) => {
        store = typeof store === "function" ? store() : store
        this.$store[name] = store
        const update = newState => {
          this.$store[name].state = newState
          this.$forceUpdate()
        }
        this.$storeWatchers[name] = store.subscribe(update)
        update(store.getState())
      })
    },
    beforeDestroy() {
      Object.values(this.$storeWatchers).forEach(unsub => unsub())
    }
  })
}
