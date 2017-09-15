
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
    this.container = document.createElement('div')
    this.size = size
    this.sizeUnits = sizeUnits
    this.startDate = startDate
    this.colors = {
      minute: minuteColor,
      hour: hourColor
    }
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
      let el = document.createElement('div')
      el.className = 'marker'
      el.style.transform = `rotate(${i * 360 / 12}deg) translate(${(this.size / 2 * .75) + this.sizeUnits})`;
      markers.appendChild(el)
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

let isBookmarkFolderOpen = false

class Bookmarks {
  async render() {
    this.container = document.createElement('ul')
    const entries = await this.getBookmarkEntries()
    const bookmarks = this.renderEntries(entries)
    
    this.container.className = 'bookmarks'
    this.container.appendChild(bookmarks)

    return this.container
  }
  async getBookmarkEntries() {
    let bookmarks = []
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree(root => {
        if (root.length && root[0] && root[0].children) {
          root[0].children.forEach(bookmarkNode => {
            if (bookmarkNode.title === 'Bookmarks Bar') {
              bookmarks = bookmarkNode.children
            }
          })
        }
        resolve(bookmarks)
      })
    })
  }
  renderEntries(entries) {
    const container = document.createDocumentFragment()
    entries.forEach(entry => {
      if (entry.children && entry.children.length > 0) {
        container.appendChild(this.renderGroup(entry))
      } else {
        container.appendChild(this.renderItem(entry))
      }
    })
    return container
  }
  renderGroup(groupNode) {
    const container = document.createElement('li')
    const list = document.createElement('ul')
    const title = document.createElement('a')

    title.className = 'title'
    title.setAttribute('href', 'javascript:;')
    title.textContent = groupNode.title

    groupNode.children.forEach(item => {
      const bookmark = this.renderItem(item)
      list.appendChild(bookmark)
    })

    container.className = 'folder'
    container.appendChild(title)
    container.appendChild(list)

    this.addRippleHover(title)
    this.addEventListeners(container, list)

    return container
  }
  renderItem(itemNode) {
    const container = document.createElement('li')
    const link = document.createElement('a')
    const title = document.createTextNode(itemNode.title)
    const favicon = document.createElement('img')
    const url = new URL(itemNode.url)

    link.setAttribute('href', itemNode.url)
    link.setAttribute('title', itemNode.url)

    if (url && url.host) {
      const favicon = document.createElement('img')
      favicon.setAttribute('src', `https://www.google.com/s2/favicons?domain=${ url.host }`)
      link.appendChild(favicon)
    }

    link.appendChild(title)

    this.addRippleHover(link)

    container.appendChild(link)

    return container
  }
  addEventListeners(container, list) {
    container.addEventListener('click', () => {
      list.classList.toggle('show')
      isBookmarkFolderOpen = !isBookmarkFolderOpen
    })

    container.addEventListener('mouseover', () => {
      if (isBookmarkFolderOpen) {
        list.classList.add('show')
      }
    })

    container.addEventListener('mouseout', () => {
      if (isBookmarkFolderOpen) {
        list.classList.remove('show')
      }
    })
  }
  addRippleHover(button) {
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    button.appendChild(ripple)
    button.addEventListener('mousemove', (event) => {
      ripple.style.top = `${ event.offsetY }px`
      ripple.style.left = `${ event.offsetX }px`
    })
  }
}

const body = document.body
const container = document.createDocumentFragment()
const opts = new Options()
const backgroundImage = new BackgroundImage(opts.backgroundImageUpdateFrequency, opts.backgroundImageCustomURL)
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

const bookmarks = new Bookmarks()
;(async() => {
  const bookmarksRender = await bookmarks.render()
  body.appendChild(bookmarksRender)
})()
