/*
* @Author: gunjankothari
* @Date:   2017-04-13 05:29:32
* @Last Modified by:   Gunjan
* @Last Modified time: 2017-04-18 00:24:44
*/

'use strict';
(function(App){

	//View Class 
	var View = function(options){
		
		if(options){
			App.listenerEvents.call(this);
			this.template = options.template || "";
			this.compiledTemplate = _.template(document.querySelector(this.template).innerHTML);
			this.region = options.region || "body";
			this.model = options.model || new App.Model();
			this.afterRender = options.afterRender;
			this.templateContext = options.templateContext;
			this.beforeRerender = options.beforeRerender;
			this.renderCount = 0;

			this.$el = document.createElement('div');
			document.querySelector(this.region).appendChild(this.$el);

			if(App.isFunction(options.init)){
				options.init.call(this);
			}
		}			
	}

	View.prototype = Object.create(App.listenerEvents.prototype);
	View.prototype.constructor = View;

	App.extendClass(View, App.listenerEvents);
	//_.extend(View.prototype, View.prototype.__proto__);
	

	//Render Method of View class.
	View.prototype.render = function(method){

			this.renderCount++;
			
			if(App.isFunction(this.beforeRerender) && this.renderCount>1){
				this.beforeRerender();
			}
		
			var content = document.createElement('div')
			content.innerHTML = this.compiledTemplate(App.extend(true, this.model.getData(), this.templateContext));
			
			if(this.beforeRender){
				this.afterRender.call(this);
			}		

			switch(method){
				case 'append':
					this.$el.appendChild(content);
					break;

				case 'prepend':
					this.$el.prependChild(content);
					break;

				case 'replace':
				default:
					while (this.$el.firstChild) {
					    this.$el.removeChild(this.$el.firstChild);
					}
					this.$el.appendChild(content) ;
					break;
			}
			

			//this.$el = $(this.region);
			
			if(this.afterRender){
				this.afterRender.call(this);
			}		
	}

	//View is binded with App NAMESPACE here.
	App.View = View;

}(app));