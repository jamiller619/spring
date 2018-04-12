/**
 * A locale aware clock that displays the local date and time
 */
const dateFormat = {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
}

const timeFormat = {
  hour: '2-digit',
  minute: '2-digit'
}

const style = document.createElement('style')
style.textContent = `
  .date,
  .time {
    display: block;
    line-height: 1;
  }

  .date {
    font-size: .3em;
    letter-spacing: .06em;
    text-align: right;
  }

  .time {
    font-size: 1em;
    text-align: right;
  }`

window.customElements.define(
  'date-time',
  class extends HTMLElement {
    constructor() {
      super().createShadow()
    }

    createShadow() {
      this.attachShadow({mode: 'open'})

      const wrapper = document.createDocumentFragment()
      this.time = document.createElement('span')
      this.date = document.createElement('span')

      this.time.className = 'time'
      this.date.className = 'date'

      wrapper.appendChild(this.time)
      wrapper.appendChild(this.date)

      this.shadowRoot.appendChild(style)
      this.shadowRoot.appendChild(wrapper)
    }

    connectedCallback() {
      window.requestAnimationFrame(this.render.bind(this))
    }

    render() {
      const date = new Date(Date.parse(this.start))
      const minutes = date.getMinutes()

      if (this.minutesLast !== minutes) {
        this.renderDateTime(date)
        this.minutesLast = minutes
      }

      window.requestAnimationFrame(this.render.bind(this))
    }

    renderDateTime(date) {
      this.date.textContent = date.toLocaleString(this.locale, dateFormat)
      this.time.textContent = date.toLocaleString(this.locale, timeFormat)
    }

    get locale() {
      if (this._locale) {
        return this._locale
      }

      this._locale = this.hasAttribute('locale')
        ? this.getAttribute('locale')
        : window.navigator.language || window.navigator.userLanguage || 'en-US'

      return this._locale
    }

    get start() {
      return this.hasAttribute('start')
        ? this.getAttribute('start')
        : new Date()
    }
  }
)
