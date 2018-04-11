export default class Options {
  constructor() {
    this.urlParams = new URLSearchParams(window.location.search) || {}
  }

  get colors() {
    return {
      minute: '#f12176',
      minuteHand: '#fff',
      marker: '#fff',
      hour: '#520ff9',
      dial: '#520ff9',
      dialBorder: '#fff'
    }
  }

  get bgUpdateFreq() {
    return this.urlParams.has('bgUpdateFreq') && this.urlParams.get('bgUpdateFreq') === 'every' ? '' : 'weekly' || 'daily'
  }
  
  get bgCustomURL() {
    return this.urlParams.has('bgCustomURL') ? this.urlParams.get('bgCustomURL') : undefined
  }
  
  get startTime() {
    const date = new Date()
    if (this.urlParams.has('t')) {
      time = this.urlParams.get('t').split(':')
      return date.setHours(+time[0], time[1])
    }
    return date
  }
}
