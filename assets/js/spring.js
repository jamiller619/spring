/*
 * Inspiration from:
 * SVG Clock: http://codepen.io/mohebifar/pen/KwdeMz
 * SVG Conical Gradients: https://codepen.io/zapplebee/pen/ByvPMN/
**/

// first things first
window.stop();

(function(window, document, anime) {
  'use strict';

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  var Spring = window.Spring = {};

  Spring.Unsplash = (function() {
    function complete() {
      document.body.classList.add('loaded');
    }

    return function() {
      var bgImg = document.getElementById('fs-bg');
      var bgUrl = 'https://source.unsplash.com/featured/' + window.innerWidth + 'x' + window.innerHeight;

      if(!Spring.debug) {
        bgUrl += '/daily';
      }

      bgImg.setAttribute('src', bgUrl);

      bgImg.addEventListener('load', complete);
    };
  })();

  Spring.Watch = (function() {
    var customTime = getParameterByName('t') ? getParameterByName('t').split(':') : false;
    var date, angles, minuteRotate, minutes, hours, ratio, colorVal, colorArray, i;

    var els = {
      hour: document.getElementById('hour'),
      minute: document.getElementById('minute'),
      minuteHand: document.getElementById('minute-hand'), 
      hourMask: document.getElementById('hour-mask'),
      minuteMask: document.getElementById('minute-mask'),
      center: document.querySelector('.center'),
      markers: document.getElementById('markers')
    };

    function makeRGBA(degree) {
      ratio = 1 - Math.abs((degree / 360));
      colorVal = Math.floor(255 * ratio);
      colorArray = [colorVal, colorVal, colorVal];
      return 'rgba(' + colorArray.join(',') + ',1)';
    }

    function renderConical(container) {
      var maskA = container.querySelector('.mask-a');
      var maskB = container.querySelector('.mask-b');
      var rect;

      for(i = 1; i < 360; i += 5) {
        rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.style.fill = makeRGBA(i);
        rect.style.transform = 'rotate(' + i + 'deg)';

        if (i > 180) {
          maskB.appendChild(rect);
        } else {
          maskA.appendChild(rect);
        }
      }
    }

    function getAngles() {
      date = new Date();

      if(customTime && Spring.debug) {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), customTime[0], customTime[1]);
      }

      minutes = (date.getSeconds() / 60 + date.getMinutes()) / 60;
      hours = (date.getHours() + date.getMinutes()/60) / 12;

      return {
        minute: 90 + (minutes * 360) % 360,
        hour: 90 + (hours * 360) % 360
      };
    }

    function renderTime() {
      angles = getAngles();
      minuteRotate = 'rotate(' + angles.minute + 'deg)';

      els.minute.style.transform = els.minuteHand.style.transform = minuteRotate;
      els.hour.style.transform = 'rotate(' + angles.hour + 'deg)';

      requestAnimationFrame(renderTime);
    }

    function renderMarkers() {
      els.markers.style.opacity = 1;
      for(i = 1; i <= 12; i++) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.style.transform = 'rotate(' + i * 360 / 12 + 'deg)';
        els.markers.appendChild(el);
      }
    }

    function animate() {
      var angles = getAngles();

      anime({
        targets: els.center,
        duration: 1000,
        elasticity: 600,
        scale: [0, 1],
        complete: renderTime
      });

      anime({
        targets: document.querySelectorAll('.conical'),
        delay: 50,
        rotate: {
          easing: 'easeOutCubic',
          duration: 800,
          value: function(el) {
            var angle = el.id == 'hour' ? angles.hour : angles.minute;
            return [angle - 180 + 'deg', angle + 'deg'];
          }
        },
        scale: {
          value: [0, 1],
          duration: 500,
          easing: 'easeOutCirc'
        }
      });

      anime({
        targets: els.minuteHand,
        delay: 50,
        rotate: {
          easing: 'easeOutCubic',
          value: angles.minute + 'deg',
          duration: 800
        },
        opacity: {
          value: [0, 1],
          easing: 'linear',
          duration: 50,
          delay: 500
        }
      });

      anime({
        targets: els.markers,
        delay: 700,
        opacity: [0, 1],
        easing: 'linear',
        duration: 100
      });
    }

    return function() {
      renderConical(els.hourMask);
      renderConical(els.minuteMask);
      renderMarkers();
      animate();
    };
  })();

  Spring.Digital = (function() {

    var digital = document.getElementById('digital');
    var els = {
      hours: digital.querySelector('.hours'),
      minutes: digital.querySelector('.minutes'),
      amPm: digital.querySelector('.am-pm'),
      date: digital.querySelector('.date')
    };

    var timeClasses = ['zero','one','two','three','four','five','six','seven','eight','nine'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var hours, minutes, displayDate, displayHours, displayMinutes, minutesLast, fragment, span, i;

    function emptyNode(node) {
      while(node.lastChild) {
        node.removeChild(node.lastChild);
      }
      return node;
    }

    function renderText(word) {
      fragment = document.createDocumentFragment();

      for(i = 0; i < word.length; i++) {
        span = document.createElement('span');
        span.textContent = word[i];
        span.className = timeClasses[~~word[i]];
        fragment.appendChild(span);
      }
      return fragment;
    }
    
    function render(date) {
      hours = date.getHours();
      minutes = date.getMinutes();

      if(minutes == minutesLast) return;

      displayDate = days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate();
          
      els.date.textContent = displayDate;

      displayHours = (hours % 12 == 0 ? 12 : hours % 12).toString();
      displayMinutes = minutes >= 10 ? minutes.toString() : '0' + minutes;

      emptyNode(els.hours).appendChild(renderText(displayHours));
      emptyNode(els.minutes).appendChild(renderText(displayMinutes));

      els.amPm.textContent = hours > 11 ? 'PM' : 'AM';

      minutesLast = minutes;
    }

    function init() {
      render(new Date());
      requestAnimationFrame(init);
    }

    return init;

  })();

  Spring.debug = getParameterByName('debug');

  Spring.Unsplash();
  Spring.Watch();
  Spring.Digital();

})(window, document, window.anime);