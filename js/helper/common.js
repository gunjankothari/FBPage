(function(App){
	
	App.isFunction = function(object) {
	 return typeof object === "function";
	}

	App.extendClass = function(child, parent){
		child.prototype = Object.create(parent.prototype);
		child.prototype.constructor = child;
		//_.extend(child.prototype, child.prototype.__proto__);
	}
	App.isEmptyObject = function(obj) {
	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop))
	            return false;
	    }

	    return JSON.stringify(obj) === JSON.stringify({});
	}
	App.addEvent = function( view, event, selector, callback ){
		//addEvent( parent, event, selector, callback)
		var matches;

		var parent = view.$el;

		(function(doc) {
		   matches = 
		      doc.matchesSelector ||
		      doc.webkitMatchesSelector ||
		      doc.mozMatchesSelector ||
		      doc.oMatchesSelector ||
		      doc.msMatchesSelector;
		})(document.documentElement);

		if(!view.events){
			view.events = {};
		}
		if(!view.events[selector]){
			view.events[selector] = {};
		}
		view.events[selector][event] = function(e) {
			element = App.isChild(document.querySelectorAll(selector), e.target);
		   	if ( matches.call( e.target, selector) || element) {
		      if(App.isFunction(callback)){
		      	callback(e, element);
		      }
		   } 
		} 

		parent.addEventListener(event, view.events[selector][event], false);
		
	}
	
	App.removeEvent = function(view, event, selector){
		parent = view.$el;
		parent.removeEventListener(event, view.events[selector][event]);
	}
	App.isChild = function(parent, child){
		var isChild = false;
		parent.forEach(function(el){ 
	      if(el.contains(child)){ 
	          isChild =  el; 
	          return;
	      };
		});
		return isChild;
	}
	App.toogleClass = function(ele, class1){
		var classes = ele.className;
		var regex = new RegExp('\\b' + class1 + '\\b');
		var hasOne = classes.match(regex);
		class1 = class1.replace(/\s+/g, '');
		if (hasOne)
		ele.className = classes.replace(regex, '');
		else
		ele.className = classes + class1;
	}

}(app));