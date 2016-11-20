(function(window, document) {
  "use strict";

  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
  }

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  var Spring = window.Spring = Spring || {};

  Spring.Unsplash = (function() {
    var url = 'https://source.unsplash.com/featured/{0}/{1}';

    return function() {
      var bgImg = document.getElementById('fs-bg');
      var bgUrl = url.format(window.innerWidth + 'x' + window.innerHeight, getParameterByName('debug') ? '' : 'daily');

      bgImg.setAttribute('src', bgUrl);

      bgImg.addEventListener('load', function() {
        bgImg.style.opacity = '1';
      });
    }
  })();

  Spring.Watch = (function() {
    
    var rad = 150;
    var els = {
      hour: document.getElementById('hour'),
      minute: document.getElementById('minute'),
      minuteHand: document.getElementById('minute-hand'),
      hourMask: document.getElementById('hour-mask'),
      minuteMask: document.getElementById('minute-mask')
    };

    els.minuteHand.setAttribute('x2', rad);
    els.minuteHand.setAttribute('y1', rad);
    els.minuteHand.setAttribute('y2', rad);

    function radClip(val) {
      return [val, rad, rad].join(' ');
    }

    function makeRGBA(degree) {
      var ratio = 1 - Math.abs((degree / 360));
      var colorVal = Math.floor(255 * ratio);
      var colorArray = [colorVal, colorVal, colorVal];
      return 'rgba({0},1)'.format(colorArray.join(','));
    }

    function drawConical(container) {
      var maskA = container.querySelector('.mask-a');
      var maskB = container.querySelector('.mask-b');
      var i = 1;

      for(i; i < 360; i += 5) {
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', rad);
        rect.setAttribute('height', rad);
        rect.setAttribute('fill', makeRGBA(i));
        rect.setAttribute('transform', 'rotate({0})'.format(radClip(i)));
        if (i > 180) {
          maskB.appendChild(rect);
        } else {
          maskA.appendChild(rect);
        }
      }
    }

    function drawClock() {
      var date = new Date();
      var minuteAngle = 90 + (date.getSeconds() / 60 + date.getMinutes()) / 60 * 360;
      var hoursAngle = 90 + (date.getHours() + date.getMinutes()/60) / 12 * 360;

      els.hour.style.transform = 'rotate({0}deg)'.format(hoursAngle);
      els.minute.style.transform = els.minuteHand.style.transform = 'rotate({0}deg)'.format(minuteAngle);

      requestAnimationFrame(drawClock);
    }

    function drawMarkers() {
      var i = 1;
      for(i; i <= 12; i++) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.setAttribute('cx', '260');
        el.setAttribute('cy', rad);
        el.setAttribute('r', '2.2');
        el.setAttribute('transform', 'rotate({0})'.format(radClip(i * 360 / 12)));
        document.getElementById('markers').appendChild(el);
      }
    }

    return function() {
      drawConical(els.hourMask);
      drawConical(els.minuteMask);
      drawClock();
      drawMarkers();
    }
  })();

  /*Spring.Watch = (function() {

    var currentMinutes;
    
    var secondsInHour = 60 * 60,
        secondsInDay = secondsInHour * 12,
        timeClasses = ['zero','one','two','three','four','five','six','seven','eight','nine'];

    var watch = document.getElementById('watch'),
        digital = document.getElementById('digital');

    var els = {
      minute: watch.querySelector('.minutes'),
      minuteHand: watch.querySelector('.minute-hand'),
      hour: watch.querySelector('.hour'),
      digitalHours: digital.querySelector('.hour'),
      digitalMinutes: digital.querySelector('.minutes'),
      digitalAmPm: digital.querySelector('.am-pm'),
      digitalDate: digital.querySelector('.date')
    };

    window.onload = function() {
      digital.style.opacity = 1;
    };

    function setRotation(el, deg) {
      el.style.transform = 'rotate({0}deg)'.format(deg);
    }

    function drawText(word) {
      var fragment = document.createDocumentFragment();

      for(var i=0; i<word.length; i++) {
        var span = document.createElement('span');
        span.textContent = word[i];
        span.className = timeClasses[~~word[i]];
        fragment.appendChild(span);
      }
      return fragment;
    }

    function emptyNode(node) {
      while(node.lastChild) {
        node.removeChild(node.lastChild);
      }
      return node;
    }

    function drawTime(hours, minutes, seconds) {
      var minutesInSeconds = (minutes + (seconds/60)) * 60,
          hoursInSeconds = (hours + (minutes/60)) * secondsInHour,
          amPm = hours > 11 ? 'PM' : 'AM',
          displayHours = (hours % 12 == 0 ? 12 : hours % 12).toString(),
          displayMinutes = minutes >= 10 ? minutes.toString() : '0' + minutes;

      var minuteDegrees = ((minutesInSeconds / secondsInHour) * 360) % 360;
      var hourDegress = ((hoursInSeconds / secondsInDay) * 360) % 360;

      checkElementInit(els.minute, function() {
        setRotation(this, minuteDegrees);
      });
      
      checkElementInit(els.minuteHand, function() {
        setRotation(this, minuteDegrees);
      });

      checkElementInit(els.hour, function() {
        setRotation(this, hourDegress);
      });

      if(minutes != currentMinutes) {
        emptyNode(els.digitalHours).appendChild(drawText(displayHours));
        emptyNode(els.digitalMinutes).appendChild(drawText(displayMinutes));

        els.digitalAmPm.textContent = amPm;

        currentMinutes = minutes;
      }
    }

    function drawDate(day, date, month) {
      var months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
          days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
          displayDate = '{0}, {1} {2}'.format(days[day], months[month], date);
          
      els.digitalDate.textContent = displayDate;
    }

    function checkElementInit(el, callback) {
      var callCallback = function() {
        if(callback && typeof(callback) == 'function') callback.call(el);
      }
      callCallback();
      if(!el.hasAttribute('data-init')) {
        el.setAttribute('data-init', false);
        callCallback();
        setTimeout(function() {
          el.setAttribute('data-init', true);
        }, 1000);
      } else {
        callCallback();
      }
    }

    function init() {
      var now = new Date(),
          seconds = now.getSeconds(),
          minutes = now.getMinutes(),
          hours = now.getHours(),
          day = now.getDay(),
          date = now.getDate(),
          month = now.getMonth();

      drawTime(hours, minutes, seconds);
      drawDate(day, date, month);

      requestAnimationFrame(init);
    }

    function initGradients() {
      var minuteGradient = new ConicGradient({
        stops: 'rgba(0,215,255,1), rgba(0,215,255,.1)',
        size: 210
      });

      var hourGradient = new ConicGradient({
        stops: 'rgba(255,215,0,1), rgba(255,215,0,.1)',
        size: 210
      });

      els.minute.style.backgroundImage = 'url({0})'.format(minuteGradient.png);
      els.hour.style.backgroundImage = 'url({0})'.format(hourGradient.png);
    }

    return {
      init: init,
      initGradients: initGradients,
      drawCustomTime: function(hours, minutes) {
        drawTime(hours, minutes, 0);

        var d = new Date();
        drawDate(d.getDay(), d.getDate(), d.getMonth());
      }
    }
  })();*/

  var param = getParameterByName('t');

  Spring.Unsplash();
  Spring.Watch();
  //this.Watch.initGradients();

  if(param) {
    var time = param.split(':');
    //this.Watch.drawCustomTime(~~time[0], ~~time[1]);
  } else {
    //this.Watch.init();
  }

})(window, document);