var Spring = window.Spring = function() {
  var my = this, body = document.body;
  my.unsplash = new Spring.Unsplash({
    container: body,
    daily: my.options.unsplashDaily
  });
  my.time = new Spring.Time(my.options.startDate);
  my.clock = new Spring.Clock({
    className: 'analog',
    size: 33,
    sizeUnits: 'vh',
    appendTo: body,
    startDate: my.options.startDate,
    colors: {
      minuteFace: '#f12177',
      hourFace: '#ad00e9',
      minuteHand: '#9bbfff'
    }
  });
};

Spring.prototype.options = (function() {
  var startDate = new Date(), unsplashDaily = true, time, urlParams;
  if (window.URLSearchParams) {
    urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('t')) {
      time = urlParams.get('t').split(':');
      startDate.setHours(+time[0], +time[1]);
    }
    if (urlParams.get('daily') === 'false') daily = false;
  }
  return {
    startDate: startDate,
    unsplashDaily: unsplashDaily
  };
})();

Spring.Unsplash = function(options) {
  var background = document.createElement('div');
  var bgUrl = 'https://source.unsplash.com/featured/' + window.innerWidth + 'x' + window.innerHeight;
  var bgImage = new Image();

  if (options.daily) bgUrl += '/daily';
  background.className = 'background';

  bgImage.onload = function() {
    background.style.backgroundImage = 'url(' + bgUrl + ')';
    options.container.appendChild(background);
  };

  bgImage.src = bgUrl;
};

Spring.Clock = function(options) {
  this.options = options;
  this.render();
};

Spring.Clock.prototype.render = function() {
  
  var my = this;
  my.container = document.createElement('div');
  var minutes = document.createElement('div');
  var minuteHand = document.createElement('div');
  var minutesGroup = document.createElement('div');
  var hours = document.createElement('div');
  var dial = document.createElement('div');
  var face = document.createElement('div');
  var degrees = my.getDegrees(my.options.startDate || new Date());

  my.container.className = my.options.className;
  my.container.style.width = my.container.style.height = my.options.size + my.options.sizeUnits;
  minutes.className = 'minutes';
  minuteHand.className = 'minute-hand';
  minutesGroup.className = 'minutes-group';
  hours.className = 'hours';
  dial.className = 'dial';
  face.className = 'face';

  minutes.style.transform = 'rotate(' + (degrees.minute - 180) + 'deg)';
  hours.style.transform = 'rotate(' + (degrees.hour - 180) + 'deg)';

  minutes.style.color = my.options.colors.minuteFace;
  minuteHand.style.color = my.options.colors.minuteHand;

  hours.style.color = my.options.colors.hourFace;

  minutesGroup.appendChild(minuteHand);
  minutes.appendChild(minutesGroup);
  face.appendChild(my.createMarkers());

  my.container.appendChild(face);
  my.container.appendChild(dial);
  my.container.appendChild(hours);
  my.container.appendChild(minutes);

  my.options.appendTo.appendChild(my.container);

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
  var my = this, container = document.getElementById('digital');
  my.els = {
    container: container,
    time: container.querySelector('.time'),
    date: container.querySelector('.date')
  };
  my.start = startDate;
  my.init();
};

Spring.Time.prototype.init = function() {
  var my = this, d;
  var step = function(time) {
    d = new Date(Date.parse(my.start) + time);
    my.render(d);
    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
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

var spring = window.spring = new Spring();