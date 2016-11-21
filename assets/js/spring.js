/*
 * Inspiration from:
 * SVG Clock: http://codepen.io/mohebifar/pen/KwdeMz
 * SVG Conical Gradients: https://codepen.io/zapplebee/pen/ByvPMN/
**/

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
    var now = new Date();
    var url = 'https://source.unsplash.com/featured/{0}/{1}';

    function complete() {
      document.body.classList.add('loaded');
    }

    return function() {
      var bgImg = document.getElementById('fs-bg');
      var bgUrl = url.format(window.innerWidth + 'x' + window.innerHeight, getParameterByName('debug') ? '' : 'daily');

      bgImg.setAttribute('src', bgUrl);

      bgImg.addEventListener('load', function() {
        var elapsed = new Date() - now;
        if(elapsed < 1000) {
          setTimeout(complete, 500);
        } else {
          complete();
        }
      });
    }
  })();

  Spring.Watch = (function() {
    
    var watchSize = 250;
    var rad = watchSize/2;

    var els = {
      hour: document.getElementById('hour'),
      minute: document.getElementById('minute'),
      minuteHand: document.getElementById('minute-hand'),
      hourMask: document.getElementById('hour-mask'),
      minuteMask: document.getElementById('minute-mask'),
      centers: document.querySelectorAll('.center'),
      markers: document.getElementById('markers')
    };

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
        rect.setAttribute('fill', makeRGBA(i));
        rect.setAttribute('transform', 'rotate({0})'.format(radClip(i)));
        if (i > 180) {
          maskB.appendChild(rect);
        } else {
          maskA.appendChild(rect);
        }
      }
    }

    function getAngles() {
      var date = new Date();
      return {
        minute: 90 + (date.getSeconds() / 60 + date.getMinutes()) / 60 * 360,
        hour: 90 + (date.getHours() + date.getMinutes()/60) / 12 * 360
      }
    }

    function drawTime() {
      var angles = getAngles();
      els.hour.style.transform = 'rotate({0}deg)'.format(angles.hour);
      els.minute.style.transform = els.minuteHand.style.transform = 'rotate({0}deg)'.format(angles.minute);

      requestAnimationFrame(drawTime);
    }

    function drawMarkers() {
      els.markers.style.opacity = 1;
      var i = 1;
      for(i; i <= 12; i++) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.setAttribute('transform', 'rotate({0})'.format(radClip(i * 360 / 12)));
        markers.appendChild(el);
      }
    }

    function animate() {
      var angles = getAngles();

      var center = anime({
        targets: els.centers,
        duration: 1800,
        elasticity: 600,
        r: [0, rad/2]
      });

      var rotateDefs = function(angle) {
        return {
          easing: 'easeOutCubic',
          value: [0, angle],
          duration: 1200
        }
      };

      var radiusDefs = {
        value: [0, rad],
        duration: 900,
        easing: 'easeOutCirc'
      };

      var hour = anime({
        targets: els.hour,
        delay: 50,
        rotate: rotateDefs(angles.hour),
        r: radiusDefs
      });

      var minute = anime({
        targets: els.minute,
        delay: 50,
        rotate: rotateDefs(angles.minute),
        r: radiusDefs
      });

      var minuteHand = anime({
        targets: els.minuteHand,
        delay: 50,
        rotate: rotateDefs(angles.minute),
        opacity: {
          value: [0, 1],
          easing: 'linear',
          duration: 100,
          delay: 700
        },
        complete: drawTime
      });

      var markers = anime({
        targets: document.getElementById('markers'),
        delay: 900,
        opacity: [0, 1],
        easing: 'linear',
        duration: 200
      });
    }

    return function() {
      drawConical(els.hourMask);
      drawConical(els.minuteMask);
      drawMarkers();
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

    function emptyNode(node) {
      while(node.lastChild) {
        node.removeChild(node.lastChild);
      }
      return node;
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
    
    function draw(date) {
      var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      var displayDate = '{0}, {1} {2}'.format(days[date.getDay()], months[date.getMonth()], date.getDate());
          
      els.date.textContent = displayDate;

      var hours = date.getHours();
      var minutes = date.getMinutes();
      var displayHours = (hours % 12 == 0 ? 12 : hours % 12).toString();
      var displayMinutes = minutes >= 10 ? minutes.toString() : '0' + minutes;

      emptyNode(els.hours).appendChild(drawText(displayHours));
      emptyNode(els.minutes).appendChild(drawText(displayMinutes));

      els.amPm.textContent = hours > 11 ? 'PM' : 'AM';
    }

    function init() {
      var date = new Date();
      draw(date);

      requestAnimationFrame(init);
    }

    return init;

  })();

  Spring.Unsplash();
  Spring.Watch();
  Spring.Digital();

})(window, document);