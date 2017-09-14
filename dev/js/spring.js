

class Options {
  
  constructor() {
    this.urlParams = {}
    if (window.URLSearchParams) {
      this.urlParams = new URLSearchParams(window.location.search)
    }
  }
  get backgroundImageUpdateFrequency() {
    let frequency = 'daily'
    if (this.urlParams.has('bu')) {
      frequency = this.urlParams.get('bu') === 'every'
        ? ''
        : 'weekly'
    }
    return frequency
  }
  get backgroundImageCustomURL() {
    return this.urlParams.has('bc') ? this.urlParams.get('bc') : undefined
  }
  get startDateTime() {
    const date = new Date()
    if (this.urlParams.has('t')) {
      time = this.urlParams.get('t').split(':')
      return date.setHours(+time[0], time[1])
    }
    return date
  }
}

class BackgroundImage {
  constructor(updateFrequency, customUrl) {
    this.updateFrequency = updateFrequency
    this.url = customUrl || `https://source.unsplash.com/featured/${ window.innerWidth }x${ window.innerHeight }/${ this.updateFrequency }`
  }
  render() {
    const container = document.createElement('div')
    let image = new Image()

    container.className = 'background'

    image.onload = () => {
      container.style.backgroundImage = `url(${ this.url })`
    }

    image.src = this.url

    return container
  }
}

class Clock {
  constructor({ startDate, size, sizeUnits, minuteColor, hourColor }) {
    this.container = document.createElement('div');
    this.size = size
    this.sizeUnits = sizeUnits
    this.startDate = startDate
    this.colors = {
      minute: minuteColor,
      hour: hourColor
    }
  }
  getDegrees(date) {
    var d = date || new Date();
    var minutes = (d.getSeconds() / 60 + d.getMinutes()) / 60;
    var hours = (d.getHours() + d.getMinutes() / 60) / 12;
    return {
      minute: (minutes * 360) % 360,
      hour: (hours * 360) % 360
    };
  }
  createMarkers() {
    const markers = document.createDocumentFragment()
    const els = [...Array(12)].map((_, i) => {
      let el = document.createElement('div');
      el.className = 'marker';
      el.style.transform = `rotate(${i * 360 / 12}deg) translate(${(this.size / 2 * .75) + this.sizeUnits})`;
      markers.appendChild(el);
    })
    return markers
  }
  renderTime(time) {
    const degrees = this.getDegrees(time)
    this.minutesContainer.style.transform = this.minuteHandContainer.style.transform = `rotate(${ degrees.minute }deg)`
    this.hoursContainer.style.transform = `rotate(${ degrees.hour }deg)`
  }
  render() {
    const minutesContainer = document.createElement('div')
    const minutes = document.createElement('div')
    const minuteHandContainer = document.createElement('div')
    const minuteHand = document.createElement('div')
    const hoursContainer = document.createElement('div')
    const hours = document.createElement('div')
    const dial = document.createElement('div')
    const face = document.createElement('div')

    this.container.className = 'analog'
    this.container.style.width = this.container.style.height = this.size + this.sizeUnits
    minutes.className = 'minutes'
    minuteHand.className = 'minute-hand'
    hours.className = 'hours'
    minutesContainer.className = 'minutes-container'
    hoursContainer.className = 'hours-container'
    minuteHandContainer.className = 'minute-hand-container'
    dial.className = 'dial'
    face.className = 'face'

    minutes.style.backgroundColor = minuteHand.style.backgroundColor = this.colors.minute
    hours.style.backgroundColor = this.colors.hour

    face.appendChild(this.createMarkers())

    minutesContainer.appendChild(minutes)
    minuteHandContainer.appendChild(minuteHand)
    hoursContainer.appendChild(hours)

    this.container.appendChild(face)
    this.container.appendChild(dial)
    this.container.appendChild(hoursContainer)
    this.container.appendChild(minutesContainer)
    this.container.appendChild(minuteHandContainer)

    this.minutesContainer = minutesContainer
    this.minuteHandContainer = minuteHandContainer
    this.hoursContainer = hoursContainer

    const step = () => {
      this.renderTime(new Date())
      window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step)

    return this.container
  }
}

class Time {
  constructor(startDate) {
    this.els = {
      container: document.createElement('div'),
      time: document.createElement('span'),
      date: document.createElement('span')
    }

    this.els.container.className = 'digital'
    this.els.time.className = 'time'
    this.els.date.className = 'date'

    this.monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
    this.dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

    this.start = startDate

    this.els.container.appendChild(this.els.time)
    this.els.container.appendChild(this.els.date)
  }
  renderTime(date) {
    const hours = date.getHours()
    const minutes = date.getMinutes()

    if (this.minutesLast === minutes) return

    const displayDate = `${ this.dayNames[date.getDay()] }, ${ this.monthNames[date.getMonth()] } ${ date.getDate() }`
    const displayHours = (hours % 12 === 0 ? 12 : hours % 12).toString()
    const displayMinutes = minutes >= 10 ? minutes.toString() : `0${ minutes }`
    const ampm = hours > 11 ? 'PM' : 'AM'

    this.els.date.textContent = displayDate
    this.els.time.textContent = `${ displayHours }:${ displayMinutes } ${ ampm }`
    this.minutesLast = minutes
  }
  render() {
    const step = (time) => {
      const d = new Date(Date.parse(this.start) + time)
      this.renderTime(d)
      window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)

    return this.els.container
  }
}

const body = document.body
const container = document.createDocumentFragment()
const opts = new Options()
const backgroundImage = new BackgroundImage(opts.backgroundImageUpdateFrequency, opts.backgroundImageURL)
const time = new Time(opts.startDateTime)
const clock = new Clock({
  startDate: opts.startDateTime,
  size: 33,
  sizeUnits: 'vmin',
  minuteColor: '#de54a5',
  hourColor: '#bb54de'
})

container.appendChild(backgroundImage.render())
container.appendChild(time.render())
container.appendChild(clock.render())

body.appendChild(container)
