export default class Clock {
  constructor({startDate, size, sizeUnits, colors}) {
    this.container = this.createElement()
    this.size = size
    this.sizeUnits = sizeUnits
    this.startDate = startDate
    this.colors = colors
  }

  getDegrees(date) {
    var d = date || new Date()
    var minutes = (d.getSeconds() / 60 + d.getMinutes()) / 60
    var hours = (d.getHours() + d.getMinutes() / 60) / 12
    return {
      minute: (minutes * 360) % 360,
      hour: (hours * 360) % 360
    }
  }

  createMarkers() {
    const markers = document.createDocumentFragment()
    const els = [...Array(12)].map((_, i) => {
      let el = this.createElement()
      el.className = 'marker'
      el.style.transform = `rotate(${i * 360 / 12}deg) translate(${this.size /
        2 *
        0.75 +
        this.sizeUnits})`
      markers.appendChild(el)
    })
    return markers
  }

  renderTime(time) {
    const degrees = this.getDegrees(time)
    this.minutesContainer.style.transform = this.minuteHandContainer.style.transform = `rotate(${
      degrees.minute
    }deg)`
    this.hoursContainer.style.transform = `rotate(${degrees.hour}deg)`
  }

  createElement(name = 'div') {
    return document.createElement(name)
  }

  render() {
    this.minutesContainer = this.createElement()
    this.minutes = this.createElement()
    this.minuteHandContainer = this.createElement()
    this.minuteHand = this.createElement()
    this.hoursContainer = this.createElement()
    this.hours = this.createElement()
    this.dial = this.createElement()
    this.face = this.createElement()

    this.container.className = 'analog'
    this.container.style.width = this.container.style.height =
      this.size + this.sizeUnits

    this.minutes.className = 'minutes'
    this.minuteHand.className = 'minute-hand'
    this.hours.className = 'hours'
    this.minutesContainer.className = 'minutes-container'
    this.hoursContainer.className = 'hours-container'
    this.minuteHandContainer.className = 'minute-hand-container'
    this.dial.className = 'dial'
    this.face.className = 'face'

    this.setColors(this.colors)

    this.face.appendChild(this.createMarkers())

    this.minutesContainer.appendChild(this.minutes)
    this.minuteHandContainer.appendChild(this.minuteHand)
    this.hoursContainer.appendChild(this.hours)

    this.container.appendChild(this.face)
    this.container.appendChild(this.dial)
    this.container.appendChild(this.minutesContainer)
    this.container.appendChild(this.hoursContainer)
    this.container.appendChild(this.minuteHandContainer)

    const step = () => {
      this.renderTime(new Date())
      window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step)

    return this.container
  }

  setColors({minute, minuteHand, hour, dial, dialBorder, marker}) {
    this.minutes.style.backgroundColor = minute
    this.minuteHand.style.backgroundColor = minuteHand
    this.hours.style.backgroundColor = hour
    this.dial.style.backgroundColor = dial
    this.dial.style.borderColor = dialBorder
    this.face.style.color = marker
  }
}
