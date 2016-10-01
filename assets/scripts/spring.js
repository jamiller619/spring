(function(window, document) {
  "use strict";

  var Spring = Spring || {};

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

  Spring.Unsplash = {
    init: function() {
      var unsplashUrl = "https://source.unsplash.com/{0}/daily",
          bgUrl = unsplashUrl.format(window.innerWidth + 'x' + window.innerHeight);

      document.body.style.backgroundImage = 'url({0})'.format(bgUrl);
    }
  };

  Spring.TimePiece = (function() {

    var secondsInHour = 60 * 60,
        secondsInDay = secondsInHour * 12;

    var els = {
      minute: document.getElementById('minute'),
      hour: document.getElementById('hour'),
      timePiece: document.getElementById('timepiece')
    };

    function setRotation(el, deg) {
      el.style.transform = 'rotate({0}deg)'.format(deg);
    }

    function drawClock() {
      var now = new Date(),
          _hours = now.getHours(),
          seconds = now.getSeconds(),
          minutes = now.getMinutes(),
          hours = _hours > 12 ? _hours - 12 : _hours,
          secondsInHour = 60 * 60,
          secondsInDay = secondsInHour * 12,
          minutesInSeconds = (minutes + (seconds/60)) * 60,
          hoursInSeconds = (hours + (minutes/60)) * secondsInHour,
          amPm = _hours > 11 ? 'PM' : 'AM',
          displayMinutes = minutes.length == 1 ? '0' + minutes : minutes;

      setRotation(els.minute, (minutesInSeconds / secondsInHour) * 360);
      setRotation(els.hour, (hoursInSeconds / secondsInDay) * 360);

      els.timePiece.setAttribute('title', '{0}:{1} {2}'.format(hours, displayMinutes, amPm));

      requestAnimationFrame(drawClock);
    }

    function init() {
      requestAnimationFrame(drawClock);
    }

    return {
      init: init
    }
  })();

  Spring.init = function() {
    this.Unsplash.init();
    this.TimePiece.init();
  };

  Spring.init();

  window.Spring = Spring;

})(window, document);