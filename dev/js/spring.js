
var utils = window.utils = {
  debug: (function() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true' ? true : false;
  })()
};

var Spring = window.Spring = function(debug) {
  
  var body = document.body;
  var background = document.createElement('div');
  var bgUrl = 'https://source.unsplash.com/featured/' + window.innerWidth + 'x' + window.innerHeight;
  if (!debug) bgUrl += '/daily';
  background.style.backgroundImage = 'url(' + bgUrl + ')';
  background.id = 'background';
  body.appendChild(background);

  this.clock = new Spring.Clock({
    id: 'analog',
    size: '33vh',
    appendTo: body,
    colors: {
      minuteFace: '#f12177',
      hourFace: '#ad00e9',
      minuteHand: '#9bbfff'
    }
  });
  this.time = new Spring.Time();
};

Spring.Clock = function(options) {

  var container = document.createElement('div');
  var minutes = document.createElement('div');
  var minuteHand = document.createElement('div');
  var minutesGroup = document.createElement('div');
  var hours = document.createElement('div');
  var dial = document.createElement('div');
  var face = document.createElement('div');
  var degrees = this.getDegrees();

  container.id = options.id;
  container.style.width = container.style.height = options.size;
  minutes.setAttribute('class', 'minutes');
  minuteHand.setAttribute('class', 'minute-hand');
  minutesGroup.setAttribute('class', 'minutes-group');
  hours.setAttribute('class', 'hours');
  dial.setAttribute('class', 'dial');
  face.setAttribute('class', 'face');

  minutes.style.transform = 'rotate(' + degrees.minute + 'deg)';
  minutes.style.color = options.colors.minuteFace;
  minuteHand.style.color = options.colors.minuteHand;

  hours.style.transform = 'rotate(' + degrees.hour + 'deg)';
  hours.style.color = options.colors.hourFace;

  minutesGroup.appendChild(minuteHand);
  minutes.appendChild(minutesGroup);
  container.appendChild(face);
  container.appendChild(dial);
  container.appendChild(hours);
  container.appendChild(minutes);

  options.appendTo.appendChild(container);
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

Spring.Time = function() {
  var container = document.getElementById('digital');
  this.els = {
    container: container,
    /*hours: container.querySelector('.hours'),
    minutes: container.querySelector('.minutes'),
    amPm: container.querySelector('.ampm'),*/
    time: container.querySelector('.time'),
    date: container.querySelector('.date')
  };
  this.init();
};

Spring.Time.prototype.options = {
  timeClasses: ['zero','one','two','three','four','five','six','seven','eight','nine'],
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
};

Spring.Time.prototype.emptyNode = function(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  return node;
};

Spring.Time.prototype.renderText = function(word) {
  var i = 0, l = word.length, fragment = document.createDocumentFragment(), span;
  for(; i < l; i++) {
    span = document.createElement('span');
    span.textContent = word[i];
    span.className = this.options.timeClasses[~~word[i]];
    fragment.appendChild(span);
  }
  return fragment;
};

Spring.Time.prototype.render = function(date) {
  var my = this;
  var hours = date.getHours();
  var minutes = date.getMinutes();

  if (my.minutesLast === minutes) return;

  var displayDate = my.options.dayNames[date.getDay()] + ', ' + my.options.monthNames[date.getMonth()] + ' ' + date.getDate();
  var displayHours = (hours % 12 == 0 ? 12 : hours % 12).toString();
  var displayMinutes = minutes >= 10 ? minutes.toString() : '0' + minutes;

  my.els.date.textContent = displayDate;
  /*my.emptyNode(my.els.hours).appendChild(my.renderText(displayHours));
  my.emptyNode(my.els.minutes).appendChild(my.renderText(displayMinutes));
  my.els.amPm.textContent = hours > 11 ? 'PM' : 'AM';*/
  my.els.time.textContent = displayHours + ':' + displayMinutes + ' ' + (hours > 11 ? 'PM' : 'AM');
  my.minutesLast = minutes;
};

Spring.Time.prototype.init = function() {
  var my = this;
  var step = function() {
    my.render(new Date());
    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
};

var spring = window.spring = new Spring(utils.debug);