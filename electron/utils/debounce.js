module.exports = function debounce(func, wait, immediate) {
    var timeout;
    return function executedFunction(...args) {
      var context = this;
  	    
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
  
      var callNow = immediate && !timeout;
  	
      clearTimeout(timeout);
  
      timeout = setTimeout(later, wait);
  	
      if (callNow) func.apply(context, args);
    };
  };