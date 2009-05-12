/*
render relative timestamps on the clientside instead of relying on serverside logic.
this allows the clientside to keep the timestamp "fresh" without requireing a hard refresh.
it also allows for the serverside to generate cachable markup (with absolute timestamps) 
and rely on the client side to render the relevant relative timestamp.

inspired by: http://www.37signals.com/svn/posts/1557-javascript-makes-relative-times-compatible-with-caching

NOTE: since it is dependent on client side clock, it may not be 100% accurate.

Usage:
  $('.my_timestamp').relativeTimestamp(myDate);

  //re-render the relative timestamp periodically
  setInterval(function() {
    $('.my_timestamp').updateRelativeTimestamp();
  }, 60000);
*/
(function($) {
  $.fn.relativeTimestamp = function(timestamp) {
  	return this.each(function() {
  		new $.RelativeTimestamp(this, timestamp);
  	});
  };

  /*
  re-render the relative timestamp for this element. 
  */
  $.fn.updateRelativeTimestamp = function() {
  	return this.each(function() {
  	  $(this).trigger('updateRelativeTimestamp');
  	});
  };

  $.RelativeTimestamp = function(e, t) {
    var DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var MONTHS_OF_YEAR = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var ABBREV_MONTHS_OF_YEAR = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    var THREE_HOURS = 3 * 60 * 60 * 1000;

    var text = $(e);
    var timestamp = t;
    text.bind('updateRelativeTimestamp', updateRelativeTimestamp);
    
    function updateRelativeTimestamp() {
      text.html(relativeTimestamp(timestamp));
    };

    /* Builds a textual timestamp sutiable for substitution into relative timestamps */
    function relativeTimestamp(then) {
      var now = new Date();
      if ((now.getTime() - then.getTime()) < THREE_HOURS) {
        return distance_of_time_in_words(now, then);
      } else {
        return dayOf(then) + " at " + twelveHourTime(then);
      }
    };

    // Returns 12 hour time
    function twelveHourTime(then) {
      var timeString = "";

      if (then.getHours() == 0) {
        timeString += "12";
      } else if (then.getHours() > 12) {
        timeString += then.getHours() - 12;
      } else {
        timeString += then.getHours();
      }

      timeString += ":" + (then.getMinutes() < 10 ? "0" + then.getMinutes() : then.getMinutes());
      timeString += " " + (then.getHours() > 12 ? 'pm' : 'am');

      return timeString;
    };

    // inspired by ApplicationHelper#day_of
    function dayOf(then) {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      var differenceInDays = (today - then) / ( 24 * 60 * 60 * 1000);

      if (differenceInDays <= 0) {
        return "Today";
      } else if (differenceInDays > 0 && differenceInDays <= 1) {
        return "Yesterday";
      } else if (differenceInDays >=1 && differenceInDays <= 5) {
        return DAYS_OF_WEEK[then.getDay()];
      } else {

        if (now.getFullYear() == then.getFullYear()) {
          return MONTHS_OF_YEAR[then.getMonth()] + " " + then.getDate();
        } else {
          return ABBREV_MONTHS_OF_YEAR[then.getMonth()] + " " + then.getDate() + ", " + then.getFullYear();
        }
      }
    };

    // see http://gist.github.com/58761
    function distance_of_time_in_words(to, from) {
      var distance_in_seconds = ((to - from) / 1000);
      var distance_in_minutes = Math.floor(distance_in_seconds / 60);

      if (distance_in_minutes == 0) { return 'less than a minute ago'; }
      if (distance_in_minutes == 1) { return '1 minute ago'; }
      if (distance_in_minutes < 45) { return distance_in_minutes + ' minutes ago'; }
      if (distance_in_minutes < 90) { return 'about 1 hour ago'; }
      if (distance_in_minutes < 1440) { return 'about ' + Math.round(distance_in_minutes / 60) + ' hours ago'; }
      if (distance_in_minutes < 2880) { return '1 day ago'; }
      if (distance_in_minutes < 43200) { return Math.round(distance_in_minutes / 1440) + ' days ago'; }
      if (distance_in_minutes < 86400) { return 'about 1 month ago'; }
      if (distance_in_minutes < 525960) { return Math.round(distance_in_minutes / 43200) + ' months ago'; }
      if (distance_in_minutes < 1051199) { return 'about 1 year ago'; }

      return 'over ' + Math.floor(distance_in_minutes / 525960) + ' years ago';
    };
    
    updateRelativeTimestamp();
  };
})(jQuery);
