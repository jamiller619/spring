
class Options {
  constructor() {
    this.urlParams = {}
    if (window.URLSearchParams) {
      this.urlParams = new URLSearchParams(window.location.search)
    }
  }
  async getColorScheme() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('colorScheme', response => {
        let colors = {
          minute: '#de54a5',
          hour: '#bb54de'
        }
        switch(response.colorScheme) {
          case 'classic':
            colors = {
              minute: 'hsla(210,67%,60%,1)',
              hour: 'hsla(0,67%,60%,1)'
            }
            break;
          case 'aqua':
            colors = {
              minute: 'hsla(140,67%,60%,1)',
              hour: 'hsla(200,67%,60%,1)'
            }
            break;
          case 'rose-gold':
            colors = {
              minute: 'hsla(0,67%,70%,1)',
              hour: 'hsla(30,67%,60%,1)'
            }
            break;
        }
        resolve(colors)
      })
    })
  }
  async isBookmarksBarEnabled() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('bookmarksBarEnabled', response => {
        resolve(response.bookmarksBarEnabled)
      })
    })
  }
  async isBookmarkSearchEnabled() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('searchEnabled', response => {
        resolve(response.searchEnabled)
      })
    })
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
    this.minutesContainer = document.createElement('div')
    this.minutes = document.createElement('div')
    this.minuteHandContainer = document.createElement('div')
    this.minuteHand = document.createElement('div')
    this.hoursContainer = document.createElement('div')
    this.hours = document.createElement('div')
    const dial = document.createElement('div')
    const face = document.createElement('div')

    this.container.className = 'analog'
    this.container.style.width = this.container.style.height = this.size + this.sizeUnits
    
    this.minutes.className = 'minutes'
    this.minuteHand.className = 'minute-hand'
    this.hours.className = 'hours'
    this.minutesContainer.className = 'minutes-container'
    this.hoursContainer.className = 'hours-container'
    this.minuteHandContainer.className = 'minute-hand-container'
    dial.className = 'dial'
    face.className = 'face'

    this.setColors(this.colors)

    face.appendChild(this.createMarkers())

    this.minutesContainer.appendChild(this.minutes)
    this.minuteHandContainer.appendChild(this.minuteHand)
    this.hoursContainer.appendChild(this.hours)

    this.container.appendChild(face)
    this.container.appendChild(dial)
    this.container.appendChild(this.hoursContainer)
    this.container.appendChild(this.minutesContainer)
    this.container.appendChild(this.minuteHandContainer)

    const step = () => {
      this.renderTime(new Date())
      window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step)

    return this.container
  }
  setColors(colors) {
    this.minutes.style.backgroundColor = this.minuteHand.style.backgroundColor = colors.minute
    this.hours.style.backgroundColor = colors.hour
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
    return new Promise((resolve, reject) => {
      this.container = document.createElement('ul')
      this.getBookmarkEntries().then((entries) => {
        const bookmarks = this.renderEntries(entries)
        
        this.container.className = 'bookmarks'
        this.container.appendChild(bookmarks)

        resolve(this.container)
      })
    })
  }
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
  async getBookmarkEntries() {
    this.entries = []
    let bookmarks = []
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree(root => {
        if (root.length && root[0] && root[0].children) {
          root[0].children.forEach(bookmarkNode => {
            if (bookmarkNode.children && bookmarkNode.children.length > 0) {
              bookmarkNode.children.forEach(childNode => {
                if (childNode.children && childNode.children.length > 0) {
                  childNode.children.forEach(more => {
                    this.entries.push({ title: more.title, url: more.url })
                  })
                } else {
                  this.entries.push({ title: childNode.title, url: childNode.url })
                }
              })
            } else {
              this.entries.push({ title: bookmarkNode.title, url: bookmarkNode.url })
            }
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
    title.setAttribute('tabindex', '-1')
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
    link.setAttribute('tabindex', '-1')

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

class Search {
  constructor(entries) {
    this.entries = entries
  }
  render() {
    this.input = document.createElement('input')
    this.results = document.createElement('ul')
    this.container = document.createElement('div')
    const resultsContainer = document.createDocumentFragment()

    this.container.className = 'search'
    this.results.className = 'results'
    this.input.setAttribute('type', 'text')
    this.input.setAttribute('placeholder', 'Bookmark Search')

    this.input.addEventListener('input', () => {
      let searchResults = this.search(this.input.value)
      searchResults.forEach(result => {
        resultsContainer.appendChild(this.renderResult(result))
      })
      this.results.innerHTML = ''
      this.results.appendChild(resultsContainer)
      this.initResultKeypressHandlers()
    })

    this.input.addEventListener('focus', () => {
      this.input.value = this.input.value
      this.input.classList.add('focused')
    })

    this.input.addEventListener('blur', (event) => {
      if (!event.path.includes(this.container)) {
        this.clearFocus()
      }
    })

    document.body.addEventListener('click', (event) => {
      if (!event.path.includes(this.container)) {
        this.clearFocus()
      }
    })

    this.container.appendChild(this.input)
    this.container.appendChild(this.results)

    this.initKeypressHandlers()

    return this.container
  }
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
  renderResult(item) {
    const container = document.createElement('li')
    const link = document.createElement('a')

    link.setAttribute('href', item.url)
    link.textContent = item.title

    container.appendChild(link)
    return container
  }
  search(text) {
    text = text.toLowerCase()
    return this.entries.filter(item => {
      return item.title.toLowerCase().indexOf(text) !== -1 || item.url.indexOf(text) !== -1 && item.title !== ''
    }).slice(0, 19)
  }
  initKeypressHandlers() {
    this.input.addEventListener('keydown', event => {
      switch(event.key) {
        case 'Escape':
          this.clearFocus()
          break;
        case 'ArrowDown':
          let firstResult = this.results.querySelector('li a')
          if (firstResult) firstResult.focus()
          break;
        case 'ArrowUp':
          let lastResult = this.results.querySelector('li:last-child a')
          if (lastResult) lastResult.focus()
          break;
      }
    })
  }
  initResultKeypressHandlers() {
    this.results.querySelectorAll('a').forEach(resultLink => {
      resultLink.addEventListener('keydown', event => {
        switch (event.key) {
          case 'Enter':
          case 'Tab':
            return true
          case 'Escape':
            this.clearFocus()
            break;
          case 'ArrowDown':
            let nextElement = resultLink.parentNode.nextElementSibling
            if (nextElement) {
              nextElement.querySelector('a').focus()
            } else {
              this.input.focus()
            }
            break;
          case 'ArrowUp':
            let prevElement = resultLink.parentNode.previousElementSibling
            if (prevElement) {
              prevElement.querySelector('a').focus()
            } else {
              this.input.focus()
            }
            break;
          default:
            this.input.focus()
        }
      })
    })
  }
  clearFocus() {
    this.input.blur()
    this.input.value = ''
    this.results.innerHTML = ''
    this.input.classList.remove('focused')
  }
}

const body = document.body
const container = document.createDocumentFragment()
const opts = new Options()
const backgroundImage = new BackgroundImage(opts.backgroundImageUpdateFrequency, opts.backgroundImageCustomURL)
const time = new Time(opts.startDateTime)
let clock = undefined

container.appendChild(backgroundImage.render())
container.appendChild(time.render())

body.appendChild(container)

opts.getColorScheme().then(colors => {
  clock = new Clock({
    startDate: opts.startDateTime,
    size: 31,
    sizeUnits: 'vmin',
    minuteColor: colors.minute,
    hourColor: colors.hour
  })
  document.body.appendChild(clock.render())
})

const bookmarksBar = new Bookmarks()

bookmarksBar.render().then(bookmarks => {
  const bookmarksSearch = new Search(bookmarksBar.entries)
  const toggleBookmarksBar = (show) => {
    if (show) {
      body.appendChild(bookmarks)
    } else {
      bookmarksBar.destroy()
    }
  }

  const toggleBookmarksSearch = (show) => {
    if (show) {
      body.appendChild(bookmarksSearch.render())
    } else {
      bookmarksSearch.destroy()
    }
  }

  opts.isBookmarkSearchEnabled().then(response => {
    toggleBookmarksSearch(response)
  })

  opts.isBookmarksBarEnabled().then(response => {
    toggleBookmarksBar(response)
  })

  chrome.storage.onChanged.addListener(changes => {
    for (key in changes) {
      switch (key) {
        case 'bookmarksBarEnabled':
          toggleBookmarksBar(changes[key].newValue)
          break;
        case 'searchEnabled':
          toggleBookmarksSearch(changes[key].newValue)
          break;
        case 'colorScheme':
          opts.getColorScheme().then(colors => {
            clock.setColors(colors)
          })
          break;
      }
    }
  })
})
