class Options {
  constructor() {
    this.urlParams = undefined
    if (window.URLSearchParams) {
      this.urlParams = new URLSearchParams(window.location.search)
    }
  }
  get unsplashDaily() {
    return this.urlParams.has('d') ? this.urlParams.get('d') === 'true' : false
  }
  get clockSpeed() {
    return this.urlParams.has('s') ? +this.urlParams.get('s') : undefined
  }
  get backgroundUrl() {
    return this.urlParams.has('u') ? this.urlParams.get('u') : undefined
  }
  get startDate() {
    const date = new Date()
    if (this.urlParams.has('t')) {
      time = this.urlParams.get('t').split(':')
      return date.setHours(+time[0], time[1])
    }
    return date
  }
}

class Unsplash {
  constructor(container, daily, url) {
    this.container = container
    this.daily = daily
    this.url = url
  }
  render() {
    const background = document.createElement('div');
    let bgUrl = this.url || `https://source.unsplash.com/featured/${window.innerWidth}x${window.innerHeight}`;
    var bgImage = new Image();

    if (this.daily && !this.url) bgUrl += '/daily';
    background.className = 'background';

    bgImage.onload = function() {
      background.style.backgroundImage = `url(${bgUrl})`;
      this.container.appendChild(background);
    };

    bgImage.src = bgUrl;
  }
}

class Clock {
  constructor(size, sizeUnits) {
    this.container = document.createElement('div');
    this.size = size
    this.sizeUnits = sizeUnits
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
  }
  render() {
    var minutesContainer = document.createElement('div');
    var minutes = document.createElement('div');
    var minuteHandContainer = document.createElement('div');
    var minuteHand = document.createElement('div');
    var hoursContainer = document.createElement('div');
    var hours = document.createElement('div');
    var dial = document.createElement('div');
    var face = document.createElement('div');
    var degrees = this.getDegrees(this.startDate || new Date());

    this.container.className = `${ this.options.className } speed-${ this.options.speed }`;
    this.container.style.width = this.container.style.height = this.options.size + this.options.sizeUnits;
    minutes.className = 'minutes';
    minuteHand.className = 'minute-hand';
    hours.className = 'hours';
    minutesContainer.className = 'minutes-container';
    hoursContainer.className = 'hours-container';
    minuteHandContainer.className = 'minute-hand-container';
    dial.className = 'dial';
    face.className = 'face';

    minutesContainer.style.transform = minuteHandContainer.style.transform = `rotate(${ degrees.minute - 180 }deg)`;
    hoursContainer.style.transform = `rotate(${ degrees.hour - 180 }deg)`;

    minutes.style.backgroundColor = minuteHand.style.backgroundColor = this.options.colors.minute;
    hours.style.backgroundColor = this.options.colors.hour;

    face.appendChild(this.createMarkers());

    minutesContainer.appendChild(minutes);
    minuteHandContainer.appendChild(minuteHand);
    hoursContainer.appendChild(hours);

    this.container.appendChild(face);
    this.container.appendChild(dial);
    this.container.appendChild(hoursContainer);
    this.container.appendChild(minutesContainer);
    this.container.appendChild(minuteHandContainer);

    this.options.appendTo.appendChild(this.container);

    const step = () => {
      minutesContainer.style.transform = minuteHandContainer.style.transform = `rotate(${ degrees.minute }deg)`;
      hoursContainer.style.transform = `rotate(${ degrees.hour }deg)`;
      window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step);
  }
}

class Time {
  constructor(startDate) {
    const container = document.getElementById('digital')
    this.monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
    this.dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

    this.start = startDate;
    this.els = {
      container: container,
      time: container.querySelector('.time'),
      date: container.querySelector('.date')
    }
  }
  init() {
    const step = (time) => {
      const d = new Date(Date.parse(this.start) + time);
      this.render(d);
      window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  render(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (this.minutesLast === minutes) return;

    const displayDate = `${ this.dayNames[date.getDay()] }, ${ this.monthNames[date.getMonth()] } ${ date.getDate() }`
    const displayHours = (hours % 12 === 0 ? 12 : hours % 12).toString()
    const displayMinutes = minutes >= 10 ? minutes.toString() : `0 ${ minutes }`
    const ampm = hours > 11 ? 'PM' : 'AM';

    this.els.date.textContent = displayDate;
    this.els.time.textContent = `${ displayHours }:${ displayMinutes } ${ ampm }`
    this.minutesLast = minutes;
  }
}
