export default class Time {
  constructor(startDate) {
    this.els = {
      container: document.createElement('div'),
      time: document.createElement('span'),
      date: document.createElement('span')
    }

    this.els.container.className = 'digital'
    this.els.time.className = 'time'
    this.els.date.className = 'date'

    this.monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]

    this.dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]

    this.start = startDate

    this.els.container.appendChild(this.els.time)
    this.els.container.appendChild(this.els.date)
  }

  renderTime(date) {
    const hours = date.getHours()
    const minutes = date.getMinutes()

    if (this.minutesLast === minutes) {
      return false
    }

    const day = this.dayNames[date.getDay()]
    const month = this.monthNames[date.getMonth()]

    const displayDate = `${day}, ${month} ${date.getDate()}`

    const displayHours = (hours % 12 === 0 ? 12 : hours % 12).toString()
    const displayMinutes = minutes >= 10 ? minutes.toString() : `0${minutes}`
    const ampm = hours > 11 ? 'PM' : 'AM'

    this.els.date.textContent = displayDate
    this.els.time.textContent = `${displayHours}:${displayMinutes} ${ampm}`
    this.minutesLast = minutes
  }

  render() {
    const step = time => {
      const d = new Date(Date.parse(this.start) + time)
      this.renderTime(d)
      window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step)
    return this.els.container
  }
}
