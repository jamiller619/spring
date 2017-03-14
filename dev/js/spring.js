var Spring = window.Spring = function() {
  
  var body = document.body;
  this.background = new Spring.Unsplash(body);
  this.clock = new Spring.Clock({
    className: 'analog',
    size: 33,
    sizeUnits: 'vh',
    appendTo: body,
    startDate: options.startDate,
    colors: {
      minuteFace: '#f12177',
      hourFace: '#ad00e9',
      minuteHand: '#9bbfff'
    }
  });
  this.time = new Spring.Time(options.startDate);
};

Spring.Unsplash = function(container) {
  var background = document.createElement('div');
  var bgUrl = 'https://source.unsplash.com/featured/' + window.innerWidth + 'x' + window.innerHeight;
  var bgImage = new Image();

  if (options.unsplash.daily) bgUrl += '/daily';
  background.className = 'background';

  bgImage.onload = function() {
    background.style.backgroundImage = 'url(' + bgUrl + ')';
    container.appendChild(background);
  };

  bgImage.src = bgUrl;
};

Spring.Clock = function(options) {
  this.options = options;
  this.render();
};

Spring.Clock.prototype.render = function() {
  
  this.container = document.createElement('div');
  var minutes = document.createElement('div');
  var minuteHand = document.createElement('div');
  var minutesGroup = document.createElement('div');
  var hours = document.createElement('div');
  var dial = document.createElement('div');
  var face = document.createElement('div');
  var degrees = this.getDegrees(this.options.startDate || new Date());

  this.container.className = this.options.className;
  this.container.style.width = this.container.style.height = this.options.size + this.options.sizeUnits;
  minutes.className = 'minutes';
  minuteHand.className = 'minute-hand';
  minutesGroup.className = 'minutes-group';
  hours.className = 'hours';
  dial.className = 'dial';
  face.className = 'face';

  minutes.style.transform = 'rotate(' + (degrees.minute - 180) + 'deg)';
  hours.style.transform = 'rotate(' + (degrees.hour - 180) + 'deg)';

  minutes.style.color = this.options.colors.minuteFace;
  minuteHand.style.color = this.options.colors.minuteHand;

  hours.style.color = this.options.colors.hourFace;

  minutesGroup.appendChild(minuteHand);
  minutes.appendChild(minutesGroup);
  face.appendChild(this.createMarkers());

  this.container.appendChild(face);
  this.container.appendChild(dial);
  this.container.appendChild(hours);
  this.container.appendChild(minutes);

  this.options.appendTo.appendChild(this.container);

  window.setTimeout(function() {
    minutes.style.transform = 'rotate(' + degrees.minute + 'deg)';
    hours.style.transform = 'rotate(' + degrees.hour + 'deg)';
  }, 10);
};

Spring.Clock.prototype.createMarkers = function() {
  var i = 0, l = 12, el, markers = document.createDocumentFragment();
  for(; i < l; i++) {
    el = document.createElement('div');
    el.className = 'marker';
    el.style.transform = 'rotate(' + (i * 360 / 12) + 'deg) translate(' + (this.options.size / 2 * .75) + this.options.sizeUnits + ')';
    markers.appendChild(el);
  }
  return markers;
};

Spring.Clock.prototype.getDegrees = function(date) {
  var d = date || new Date();
  var minutes = (d.getSeconds() / 60 + d.getMinutes()) / 60;
  var hours = (d.getHours() + d.getMinutes() / 60) / 12;
  return {
    minute: (minutes * 360) % 360,
    hour: (hours * 360) % 360
  };
};

Spring.Time = function(startDate) {
  var container = document.getElementById('digital');
  this.els = {
    container: container,
    time: container.querySelector('.time'),
    date: container.querySelector('.date')
  };
  this.init(startDate);
};

Spring.Time.prototype.options = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
};

Spring.Time.prototype.render = function(date) {
  var my = this;
  var hours = date.getHours();
  var minutes = date.getMinutes();

  if (my.minutesLast === minutes) return;

  var displayDate = my.options.dayNames[date.getDay()] + ', ' + my.options.monthNames[date.getMonth()] + ' ' + date.getDate();
  var displayHours = (hours % 12 == 0 ? 12 : hours % 12).toString();
  var displayMinutes = minutes >= 10 ? minutes.toString() : '0' + minutes;
  var ampm = hours > 11 ? 'PM' : 'AM';

  my.els.date.textContent = displayDate;
  my.els.time.textContent = displayHours + ':' + displayMinutes + ' ' + ampm;
  my.minutesLast = minutes;
};

Spring.Time.prototype.init = function(startDate) {
  var my = this;
  var step = function() {
    my.render(startDate || new Date());
    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
};

var options = window.options = (function() {
  var urlParams = new URLSearchParams(window.location.search);
  var time = urlParams.has('t') ? urlParams.get('t').split(':') : false;
  var date = new Date();
  return {
    startDate: time ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), time[0], time[1]) : date,
    unsplash: {
      daily: urlParams.get('daily') === 'false' ? false : true
    }
  };
})();

var spring = window.spring = new Spring();