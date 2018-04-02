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
        update(store.state)
      })
    },
    beforeDestroy() {
      Object.values(this.$storeWatchers).forEach(unsub => unsub())
    }
  })
}
