
class Component {
  /** The name of the component */
  name = this.constructor.name

  parent


  started = false

  listeners = []

  addListener(listener) {
    this.listeners.push(listener);
  }
  updateListeners(eventName) {
    for (let listener of this.listeners) {
      if (listener.handleUpdate) {
        listener.handleUpdate(this, eventName)
      }
    }
  }
  get transform() {
    return this.parent.components[0]
  }
}

window.Component = Component;
