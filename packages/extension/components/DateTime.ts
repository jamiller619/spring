class DateTime extends HTMLElement {
  get datetime() {
    return this.hasAttribute('datetime')
      ? new Date(this.getAttribute('datetime')!)
      : new Date()
  }

  get options() {
    const fmt = {} as Record<string, string>

    if (this.hasAttributes()) {
      for (const attr of this.attributes) {
        fmt[attr.name] = attr.value
      }
    }

    return fmt
  }

  async connectedCallback() {
    this.loop()
  }

  loop() {
    window.requestAnimationFrame(this.render.bind(this))
  }

  render() {
    const dt = new Intl.DateTimeFormat(undefined, this.options).format(
      this.datetime,
    )

    if (this.textContent !== dt) {
      this.textContent = dt
    }

    this.loop()
  }
}

customElements.define('date-time', DateTime)
