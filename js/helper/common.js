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

}(app));