/*
 * Inspiration from:
 * SVG Clock: http://codepen.io/mohebifar/pen/KwdeMz
 * SVG Conical Gradients: https://codepen.io/zapplebee/pen/ByvPMN/
**/

// first things first
window.stop();

(function(window, document) {
  "use strict";

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  var Spring = window.Spring = {};

  Spring.Unsplash = (function() {
    var now = new Date();

    function complete() {
      document.body.classList.add('loaded');
    }

    return function() {
      var bgImg = document.getElementById('fs-bg');
      var bgUrl = `https://source.unsplash.com/featured/${window.innerWidth + 'x' + window.innerHeight}/${Spring.debug ? '' : 'daily'}`;

      bgImg.setAttribute('src', bgUrl);

      bgImg.addEventListener('load', function() {
        var elapsed = new Date() - now;
          complete();
      });
    }
  })();

  Spring.Watch = (function() {
    
    var watchSize = 250;
    var rad = watchSize/2;
    var customDate = getParameterByName('d') ? getParameterByName('d').split(':') : false; 
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

    function radClip(val) {
      return [val, rad, rad].join(' ');
    }

    function makeRGBA(degree) {
      ratio = 1 - Math.abs((degree / 360));
      colorVal = Math.floor(255 * ratio);
      colorArray = [colorVal, colorVal, colorVal];
      return `rgba(${colorArray.join(',')},1)`;
    }

    function renderConical(container) {
      var maskA = container.querySelector('.mask-a');
      var maskB = container.querySelector('.mask-b');
      var rect;

      for(i = 1; i < 360; i += 5) {
        rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.style.fill = makeRGBA(i);
        rect.style.transform = `rotate(${i}deg)`;

        if (i > 180) {
          maskB.appendChild(rect);
        } else {
          maskA.appendChild(rect);
        }
      }
    }

    function getAngles() {
      date = customDate && Spring.debug
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), customDate[0], customDate[1])
        : new Date();

      minutes = 90 + (date.getSeconds() / 60 + date.getMinutes()) / 60;
      hours = 90 + (date.getHours() + date.getMinutes()/60) / 12;

      return {
        minute: (minutes * 360) % 360,
        hour: (hours * 360) % 360
      }
    }

    function renderTime() {
      angles = getAngles();
      minuteRotate = `rotate(${angles.minute}deg)`;

      els.minute.style.transform = els.minuteHand.style = minuteRotate;
      els.hour.style.transform = `rotate(${angles.hour}deg)`;

      requestAnimationFrame(renderTime);
    }

    function renderMarkers() {
      els.markers.style.opacity = 1;
      for(i = 1; i <= 12; i++) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.style.transform = `rotate(${i * 360 / 12}deg)`;
        markers.appendChild(el);
      }
    }

    function animate() {
      var angles = getAngles();

      var center = anime({
        targets: els.center,
        duration: 1000,
        elasticity: 600,
        scale: [0, 1],
        complete: renderTime
      });

      var rotateDefs = function(angle) {
        return {
          easing: 'easeOutCubic',
          value: [0, angle],
          duration: 800
        }
      };

      var scaleDefs = {
        value: [0, 1],
        duration: 500,
        easing: 'easeOutCirc'
      };

      var hour = anime({
        targets: els.hour,
        delay: 50,
        rotate: rotateDefs(angles.hour),
        scale: scaleDefs
      });

      var minute = anime({
        targets: els.minute,
        delay: 50,
        rotate: rotateDefs(angles.minute),
        scale: scaleDefs
      });

      var minuteHand = anime({
        targets: els.minuteHand,
        delay: 50,
        rotate: rotateDefs(angles.minute),
        opacity: {
          value: [0, 1],
          easing: 'linear',
          duration: 50,
          delay: 500
        }
      });

      var markers = anime({
        targets: document.getElementById('markers'),
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
    }
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

      displayDate = `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
          
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

})(window, document);