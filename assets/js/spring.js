/**
 * Inspiration from:
 * SVG Clock: http://codepen.io/mohebifar/pen/KwdeMz
 * SVG Conical Gradients: https://codepen.io/zapplebee/pen/ByvPMN/
 */

var utils = window.utils = {
  debug: (function() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true' ? true : false;
  })(),
  throttleDelay: 1000,
  throttle: function(callback) {
    var timeLast, timeElapsed;
    var step = function(time) {
      if (!timeLast) timeLast = time;
      timeElapsed = time - timeLast;
      if (timeElapsed > utils.throttleDelay) {
        timeLast = time;
        callback();
      }
      window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
};

var Spring = window.Spring = function(debug) {
  var my = this;
  this.watch = new Spring.Watch();
  this.time = new Spring.Time(document.getElementById('digital'));
  this.unsplash = new Spring.Unsplash(document.getElementById('fs-bg'), function() {
    my.time.els.container.classList.add('loaded');
  });
};

Spring.Unsplash = function(container, loadCallback) {
  this.container = container;
  this.loadWait = 1000;
  this.loadCallback = loadCallback;
  this.init();
};

Spring.Unsplash.prototype.init = function() {
  var my = this;
  var timeStart = Date.now();
  var bgUrl = 'https://source.unsplash.com/featured/' + window.innerWidth + 'x' + window.innerHeight;

  if (!utils.debug) bgUrl += '/daily';

  fastdom.mutate(function() {
    my.container.setAttribute('src', bgUrl);
    my.container.addEventListener('load', function() {
      var timeLoaded = Date.now();
      var duration = timeLoaded - timeStart;
      var wait = duration < my.loadWait ? duration : 0;
      window.setTimeout(function() {
        my.container.classList.add('loaded');
        if (my.loadCallback && typeof(my.loadCallback) === 'function') my.loadCallback();
      }, wait);
    });
  });
};

Spring.Watch = function() {
  var my = this;
  fastdom.measure(function() {
    my.els = {
      hour: document.getElementById('hour'),
      minute: document.querySelector('.minute-group'),
      hourMask: document.getElementById('hour-mask'),
      minuteMask: document.getElementById('minute-mask'),
      center: document.querySelector('.center'),
      markers: document.getElementById('markers'),
      shadow: document.getElementById('watch-shadow')
    };
    my.init();
  });
};

Spring.Watch.prototype.makeRGBA = function(degree) {
  var ratio = 1 - Math.abs((degree / 360));
  var colorVal = Math.floor(255 * ratio);
  return 'rgba(' + colorVal + ',' + colorVal + ',' + colorVal + ',1)';
};

Spring.Watch.prototype.renderConical = function(container) {
  var maskAFragment = document.createDocumentFragment();
  var maskBFragment = document.createDocumentFragment();
  var rect, i = 1;

  for(; i < 360; i += 5) {
    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.style.fill = this.makeRGBA(i);
    rect.style.transform = 'rotate(' + i + 'deg)';

    if (i > 180) {
      maskBFragment.appendChild(rect);
    } else {
      maskAFragment.appendChild(rect);
    }
  }

  fastdom.mutate(function() {
    container.querySelector('.mask-a').appendChild(maskAFragment);
    container.querySelector('.mask-b').appendChild(maskBFragment);
  });
};

Spring.Watch.prototype.getAngles = function() {
  var d = new Date();
  var minutes = (d.getSeconds() / 60 + d.getMinutes()) / 60;
  var hours = (d.getHours() + d.getMinutes()/60) / 12;

  return {
    minute: 90 + (minutes * 360) % 360,
    hour: 90 + (hours * 360) % 360
  };
};

Spring.Watch.prototype.render = function() {
  var my = this, angles;
  utils.throttle(function() {
    angles = my.getAngles();
    fastdom.mutate(function() {
      my.els.minute.style.transform = 'rotate(' + angles.minute + 'deg)';
      my.els.hour.style.transform = 'rotate(' + angles.hour + 'deg)';
    });
  });
  
  fastdom.mutate(function() {
    my.els.minute.classList.add('off');
    my.els.hour.classList.add('off');
  });
};

Spring.Watch.prototype.renderMarkers = function() {
  var my = this, i = 1, markersFragment = document.createDocumentFragment();
  for(; i <= 12; i++) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    el.style.transform = 'rotate(' + i * 360 / 12 + 'deg)';
    markersFragment.appendChild(el);
  }
  fastdom.mutate(function() {
    my.els.markers.appendChild(markersFragment);
  });
};

Spring.Watch.prototype.animate = function() {
  var my = this;
  var angles = my.getAngles();

  fastdom.mutate(function() {
    my.els.center.classList.add('in');
    my.els.markers.classList.add('in');
    my.els.shadow.classList.add('in');

    my.els.hour.style.transform = 'scale(0) rotate(' + (angles.hour - 180) +  'deg)';
    my.els.minute.style.transform = 'scale(0) rotate(' + (angles.minute - 180) + 'deg)';
    my.els.hour.style.transform = 'scale(1) rotate(' + angles.hour +  'deg)';
    my.els.minute.style.transform = 'scale(1) rotate(' + angles.minute + 'deg)';

    my.els.hour.classList.add('in');
    my.els.minute.classList.add('in');

    my.els.center.addEventListener('transitionend', function() {
      my.render();
    });
  });
};

Spring.Watch.prototype.init = function() {
  this.renderConical(this.els.hourMask);
  this.renderConical(this.els.minuteMask);
  this.renderMarkers();
  this.animate();
};

Spring.Time = function(container) {
  this.els = {
    container: container,
    hours: container.querySelector('.hours'),
    minutes: container.querySelector('.minutes'),
    amPm: container.querySelector('.am-pm'),
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

  fastdom.mutate(function() {
    my.els.date.textContent = displayDate;
    my.emptyNode(my.els.hours).appendChild(my.renderText(displayHours));
    my.emptyNode(my.els.minutes).appendChild(my.renderText(displayMinutes));
    my.els.amPm.textContent = hours > 11 ? 'PM' : 'AM';
    my.minutesLast = minutes;
  });
};

Spring.Time.prototype.init = function() {
  var my = this;
  utils.throttle(function() {
    my.render(new Date());
  });
};

var spring = window.spring = new Spring(utils.debug);