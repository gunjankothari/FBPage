/*
Github Reference :
https://gist.github.com/fatihacet/1290216
*/

'use strict';
(function(App) {
    
    var events = function(){
        this.topics = {}, 
        this.subUid = -1;
    }
    events.prototype.listenTo = function(topic, func) {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        var token = (++this.subUid).toString();
        this.topics[topic].push({
            token: token,
            func: func
        });
        return token;
    };

    events.prototype.on = function( topic, context, args) {
        if (!context.topics || !context.topics[topic]) {
            return false;
        }
        //setTimeout(function() {
            var subscribers = context.topics[topic],
                len = subscribers ? subscribers.length : 0;

            while (len--) {
                subscribers[len].func(context, args);
            }
       // }, 0);
        return true;

    };

    events.prototype.dontListen = function(token) {
        for (var m in this.topics) {
            if (this.topics[m]) {
                for (var i = 0, j = this.topics[m].length; i < j; i++) {
                    if (this.topics[m][i].token === token) {
                        this.topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    };

    App.listenerEvents = events;
}(app));;//Ref- https://gist.github.com/p0rsche/2763377

(function(App){
  "use strict";

  var _class2type = {};

  var _type = function( obj ) {
    return obj == null ?
      String( obj ) :
      _class2type[ toString.call(obj) ] || "object";
  };

  var _isWindow = function( obj ) {
    return obj != null && obj == obj.window;
  };

  var _isFunction = function(target){
    return toString.call(target) === "[object Function]";
  };

  var _isArray =  Array.isArray || function( obj ) {
      return _type(obj) === "array";
  };

  var _isPlainObject = function( obj ) {
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || _type(obj) !== "object" || obj.nodeType || _isWindow( obj ) ) {
      return false;
    }

    try {
      // Not own constructor property must be Object
      if ( obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }
    } catch ( e ) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.

    var key;
    for ( key in obj ) {}

    return key === undefined || hasOwn.call( obj, key );
  };

  App.extend = function() {
    var options, name, src, copy, copyIsArray, clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
      deep = target;
      target = arguments[1] || {};
      // skip the boolean and the target
      i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !_isFunction(target) ) {
      target = {};
    }

    if ( length === i ) {
      target = this;
      --i;
    }

    for ( ; i < length; i++ ) {
      // Only deal with non-null/undefined values
      if ( (options = arguments[ i ]) != null ) {
        // Extend the base object
        for ( name in options ) {
          src = target[ name ];
          copy = options[ name ];

          // Prevent never-ending loop
          if ( target === copy ) {
            continue;
          }

          // Recurse if we're merging plain objects or arrays
          if ( deep && copy && ( _isPlainObject(copy) || (copyIsArray = _isArray(copy)) ) ) {
            if ( copyIsArray ) {
              copyIsArray = false;
              clone = src && _isArray(src) ? src : [];

            } else {
              clone = src && _isPlainObject(src) ? src : {};
            }

            // Never move original objects, clone them
            target[ name ] = App.extend( deep, clone, copy );

          // Don't bring in undefined values
          } else if ( copy !== undefined ) {
            target[ name ] = copy;
          }
        }
      }
    }
    // Return the modified object
    return target;
  };
}(app));(function(App){
	
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
	App.removeAllEvent = function(view){
			//Code here.
			debugger;
			

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

	//Ref - https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
	/*App.extend = function(){
	    // Variables
	    var extended = {};
	    var deep = false;
	    var i = 0;
	    var length = arguments.length;

	    // Check if a deep merge
	    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
	        deep = arguments[0];
	        i++;
	    }

	    // Merge the object into the extended object
	    var merge = function (obj) {
	        for ( var prop in obj ) {
	            if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
	                // If deep merge and property is an object, merge properties
	                if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
	                    extended[prop] = App.extend( true, extended[prop], obj[prop] );
	                } else {
	                    extended[prop] = obj[prop];
	                }
	            }
	        }
	    };

	    // Loop through each object and conduct a merge
	    for ( ; i < length; i++ ) {
	        var obj = arguments[i];
	        merge(obj);
	    }

	    return extended;
	}*/

}(app));;/*
* @Author: gunjankothari
* @Date:   2017-04-13 05:28:34
* @Last Modified by:   Gunjan
* @Last Modified time: 2017-04-18 00:58:36
*/

'use strict';
(function(App){

//=====Base Model to store and retrive data======================================================================================//

	var Model = function(options){
		
		options = options || {};
		this.data = options.data || {};
		this.localStorageKey = options.localStorageKey || undefined;
		this.dataArrayField = options.dataArrayField;
		App.listenerEvents.call(this);
		
		if(App.isFunction(options.init)){
			options.init.call(this,options);	
		}

		if(this.localStorageKey){
			this.restoreData();
		}

	}

	//extending Model.
	App.extendClass(Model, App.listenerEvents);
	

	Model.prototype.getData = function(){

		return App.extend( true, {}, this.data);
	}

	Model.prototype.setData = function(param, data, updateLocalStorage, silent){
		
		this.data[param] = data;

		if(updateLocalStorage){
			this.storeData();
		}
		
		if(!silent){
			//Publishing the model update method.
			this.on('model:set', this);
		}
	}

	Model.prototype.resetData = function(data, silent){
		
		this.data = data;
		
		if(!silent){
			//Publishing the model update method.	
			this.on('model:reset', this);
		}	
	}

	Model.prototype.addItem = function(param, data, updateLocalStorage, silent){

		if(typeof this.data[param] == undefined){
			this.data[param] = [];
		}
		this.data[param].push(data);

		//Save to LocalStorage.
		if(updateLocalStorage){
			this.storeData();
		}	

		if(!silent){
			this.on('model:update', this);
		}
		//Publishing the model update method.
		//App.on('model:update', this.data[param]);		
	}

	Model.prototype.append = function(param, data, updateLocalStorage, silent){

		if(typeof this.data[param] == undefined){
			this.data[param] = [];
		}
		this.data[param] = this.data[param].concat(data);
		//console.log(this.data[param]);

		//Save to LocalStorage.
		if(updateLocalStorage){
			this.storeData();
		}	

		if(!silent){
			this.on('model:update', this);
		}
		//Publishing the model update method.
		//App.on('model:update', this.data[param]);	
	}


//================= Localstorage Management =================================================================

	Model.prototype.storeData = function(){
		if(this.getData() && this.localStorageKey){
			localStorage.setItem(this.localStorageKey, JSON.stringify(this.getData()) );	
		}
	}
	Model.prototype.restoreData = function(){
		var data;
		if(this.localStorageKey){
			data = localStorage.getItem(this.localStorageKey);
		}
		if(data){
			this.resetData(JSON.parse(data));	
		}
		else{
			this.clearStorage();
		}
	}
	Model.prototype.clearStorage = function(){
		
		return localStorage.removeItem(this.localStorageKey);
	}




//======= FB Model extended from base model (talks with Graph API)===========================================

	var FBModel = function(options){
		Model.call(this,options);
		this.FBCredentials = options.data.FBCredentials;
	}
	
	App.extendClass(FBModel, Model);

	
	FBModel.prototype.connect = function( onLogin ){
		try{
			FB.init(this.FBCredentials);

			//this.login( onLogin );
		}
		catch(e){
			console.log(e);
		}
	}

	/*FBModel.prototype.login = function( onLogin ){
		if(App.isFunction( onLogin )){
			FB.getLoginStatus( function(response){
				if (response.status == 'connected') {
					onLogin.call(this,response);
				}
				else{
					FB.login(function(response) {
						if (response.status == 'connected') {
						      onLogin.call(this,response);
						  }
				    }, {scope: 'user_friends, email'});
				}
			});
		}	
	}*/

	FBModel.prototype.query = function( query, type, fields, limit, maxPageLimit, callback ){
		this.setData(this.dataArrayField,[],true);
		this.queryCall( query, type, fields, limit, maxPageLimit, true, callback );
	}

	FBModel.prototype.queryCall = function( query, type, fields, limit, maxPageLimit, nextPage, callback ){
		var that = this;
		if(!limit) 
			limit=10;

		FB.api('/search','GET',{
			  		"q"		: query,
			  		"type"	: type,
			  		"fields": fields,
			  		"limit": limit,
			  		"after": nextPage,
			  		"access_token": this.FBCredentials.at
			 	},function(response) {
			 		if(response.error){
			 			
			 			console.log(response.error);
			 		
			 		} else {
			 			
			 			that.append(that.dataArrayField,response.data, true);
			 		
			 			if(App.isFunction(callback)){
				      		callback.call(this,response);
		    			}

		    			if(maxPageLimit){
			    			
			    			maxPageLimit -= 1;

			    			if(nextPage && maxPageLimit > 0 && response && response.paging && response.paging.cursors){
			    				that.queryCall(query, type, fields, limit, maxPageLimit, response.paging.cursors.after)
			    			}
		    			
		    			}
		    		
			 		}
			      		
				});
	}

	FBModel.prototype.find = function(value){
		var obj = _.findWhere(this.data[ this.dataArrayField ], {
			id:value+""
		});
		return App.extend(true, {}, obj);
	}

//======== Faviourite Model ============================================

	var Favourite = function(options){

		Model.call(this,options);
	}
	
	App.extendClass(Favourite, Model);
	

	//Favourite.prototype.getData = undefined;
	Favourite.prototype.setData = undefined;

	//Find in data.favtData
	Favourite.prototype.find = function(value){
		
		if(typeof this.data[ this.dataArrayField ] !== undefined){
			var obj = _.findWhere(this.data[ this.dataArrayField ], {
				id: value+""
			});
		}
		return obj;
	}

	//Indexof in data.favtData
	Favourite.prototype.indexOf = function(value){
		
		if(typeof this.data[ this.dataArrayField ] !== undefined){
			var index = _.findIndex(this.data[ this.dataArrayField ], {
				id:value
			})
		}
		return index;
	}

	//Indexof in data.favtData
	Favourite.prototype.isFav = function(value){
		
		if(this.indexOf(value) >= 0 )
			return true; 
		else
			return false;
	}

	Favourite.prototype.toggleItem = function(data, updateLocalStorage, silent){
		if(this.indexOf(data.id) >= 0){
			this.removeItem(data);
		}
		else{
			this.addItem(data, updateLocalStorage, silent);
		}
	}

	//Adding Item to Favourite List.
	Favourite.prototype.addItem = function(data, updateLocalStorage, silent){

		var param = this.dataArrayField;
		if(typeof this.data[param] === "undefined"){
			this.data[param] = [];
		}
		this.data[param].push(data);

		//Save to LocalStorage.
		if(updateLocalStorage){
			this.storeData();
		}

		if(!silent){
			//Publishing model:update Event.
			this.on('model:update', this);
		}
	}

	//Removing Item from Favourite List.
	Favourite.prototype.removeItem = function(data, updateLocalStorage, silent){

		var param = this.dataArrayField;
		
		// if(typeof this.data[param] === "undefined"){
		// 	this.data[param] = [];
		// 	return;
		// }
		
		var index = this.indexOf(data.id);
		this.data[param].splice(index,1);

		//Save to LocalStorage.
		if(updateLocalStorage){
			this.storeData();
		}

		if(!silent){
			this.on('model:remove', this, data);
		}
		
	}


	//Assigning Models to App Object.
	App.Model = Model;
	App.FBModel = FBModel;
	App.FavouriteModel = Favourite;

}(app));
;/*
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

}(app));;/*
* @Author: gunjankothari
* @Date:   2017-04-14 16:58:17
* @Last Modified by:   Gunjan
* @Last Modified time: 2017-04-18 01:36:26
*/

'use strict';
(function(App){

/**
 *
 * This view can be used to render collection of views.
 *
 */

	var CollectionView = function(options){

		//Configuration Parameters. 
		this.options = options;
		this.model = options.model || new App.Model();

		//primaryField is the unique key name used inside individual objects of the collection.
		this.primaryField = options.primaryField || 'id';

		this.views = {};

		if(this.options.emptyTemplate)
			this.compiledEmptyView = _.template(document.querySelector(this.options.emptyTemplate).innerHTML);

		this.$region = document.querySelector(this.options.region);

		var that = this;
		this.model.listenTo('model:update',function(model, newData){
			that.renderNewOnly();
		});
		this.model.listenTo("model:reset",function(){
			that.render();
		});
		this.model.listenTo("model:set",function(){
			that.render();
		});
		this.model.listenTo("model:remove",function(model, data){
			that.removeOld(data.id);
		});
	}
	
	CollectionView.prototype.render = function(){

		var that = this;

		this.empty();

		this.showEmptyView();

		_.each(this.model.getData()[this.model.dataArrayField],function(data){
			
			var options = {
				model: new App.Model({
					data: data
				})
			};
			
			var itemView = new App.View( App.extend(true,that.options,options));
			
			that.views[ data[ that.primaryField ] ] = itemView
			
			itemView.render('append');
		});
	}

	CollectionView.prototype.renderNewOnly = function(){

		if(App.isEmptyObject(this.views)){

			//This will remove the empty view.
			this.empty();
		}

		var that = this;

		_.each(this.model.getData()[this.model.dataArrayField],function(data){

			if(typeof that.views[ data[ that.primaryField ] ] !== "object"){
				
				var options = {
					model: new App.Model({
						data: data
					})
				};
				
				var itemView = new App.View( App.extend( true, that.options, options ) );
				debugger;

				that.views[ data[ that.primaryField ] ] = itemView
				
				itemView.render('append');
			}
		});
	}

	CollectionView.prototype.removeOld = function(id){

		var that = this;

		document.querySelector(this.options.region).removeChild(that.views[id].$el);

		delete that.views[id];

		this.showEmptyView();
	}

	CollectionView.prototype.showEmptyView = function(){
		
		if(this.model.getData()[this.model.dataArrayField].length == 0 && this.compiledEmptyView){

			document.querySelector(this.options.region).innerHTML = this.compiledEmptyView();
		}
	}

	CollectionView.prototype.empty = function(){

		var $el = document.querySelectorAll(this.options.region)[0];
		
		while ($el.firstChild) {
			$el.removeChild($el.firstChild);
		}

		if(this.model.getData()[this.model.dataArrayField].length == 0){
			this.views = {};	
		}		
	}

	App.CollectionView = CollectionView

}(app));;/*
* @Author: gunjankothari
* @Date:   2017-04-13 05:57:33
* @Last Modified by:   Gunjan
* @Last Modified time: 2017-04-18 02:44:56
*/

'use strict';
(function(App){


//================ Managing Route =====================

(function(route){

	window.addEventListener("hashchange", routeChange, false);

	function routeChange(){
		route = window.location.hash;
		switch(route){
			case '#searchArea':
				resultView.render();
				document.querySelector('#favAreaWrapper').style.display = 'none';
				document.querySelector('#searchAreaWrapper').style.display = 'block';
				setTab('searchTab');
				setIndicator();
				break;

			case '#favArea':
				favResultView.render();
				document.querySelector('#searchAreaWrapper').style.display = 'none';
				document.querySelector('#favAreaWrapper').style.display = 'block';
				setTab('favTab');
				setIndicator();
				break;
		}	
	}

	function setTab(tab){
		var element = document.querySelector('.nav-wrapper ul li a.active');
		element.className = element.className.replace(new RegExp('active', 'g'), '');

		var element = document.querySelector('.nav-wrapper ul li#'+ tab + ' a');
		element.className = element.className = element.className + ' active';
	}

	function setIndicator(){
		var indicator = document.querySelector('.indicator');

		var element = document.querySelector('.nav-wrapper ul li a.active').parentElement;
		var left = element.offsetLeft+'px';
		var width = element.offsetWidth+'px';
				
		indicator.style.left = left;
		indicator.style.width = width;
	}

	

}());

//============================ Search View =========================================//

	var searchModel = new App.Model({
		localStorageKey : 'search_data',
	});

	var searchView = new App.View({
		template : '#searchTemplate',
		region: '#searchTemplateContainer',
		model: searchModel,
		afterRender:function(){
			var that = this;
			
			//Parameters - addEvent( parent, event, selector, callback)
			App.addEvent(this, 'change', 'input#search', function(e){
				var searchText = e.target.value;
				that.model.setData('search', searchText, true);
				fb_model.query(searchText, "page", "name, id, about, category, picture, fan_count, link, is_verified", 20, 5);
			});
			
		},
		beforeRerender:function(){
			//App.removeEvent(parent, event, eventName)
			App.removeEvent(this, 'change', 'input#search');
			//this.$el.off('change','input');
		}
	});
	
	searchView.render();


//============================== Header View ==========================================//

	var headerView = new App.View({
		template : '#headerTemplate',
		region: '#headerWrapper',
		afterRender:function(){
			var that = this;

			
			
			//App.addEvent(this.$el, 'change', 'input#search', 'input:search', function(e){
			App.addEvent(this, 'click', 'ul li.tab', function(e, element){

			});
		},
		beforeRerender:function(){
			//App.removeEvent(parent, event, eventName)
			App.removeEvent(this, 'click', 'ul li.tab a');
			//this.$el.off('change','input');
		}
	});

	headerView.render();


//============================== Header View ==========================================//

	var footerView = new App.View({
		template : '#footerTemplate',
		region: '#footer-copyright',
	});

	footerView.render();

	
//============================ FB Model =========================================//

	//Creating Model.
	var fb_model = new App.FBModel({
		localStorageKey : 'fb_data',
		'dataArrayField':'queryData',
		data:{
			FBCredentials: {
			  appId      : '273738926370334',
			  xfbml      : true,
			  version    : 'v2.8',
			  appSecret  : 'b276b4a0cd1a560461c7e089effc0554',
			  at: "273738926370334|b276b4a0cd1a560461c7e089effc0554"
			},
		},
		init:function(options){}
	});

//=====================================================================//

	//Connecting FB
	window.fbAsyncInit = function(){
		fb_model.connect(function(){
			//fb_model.query("fun", "page", "name,id,about,category,picture");
		});	
	} 

//============================== Favorite Model =======================================//

	var fav_model = new App.FavouriteModel({
		localStorageKey : 'favt_data',
		dataArrayField:'queryData',
		init:function(){
			
		}
	});


//============================= Search Result View =============================================//
	
	var resultView = new App.CollectionView({
   		template : '#cardTemplate',
   		emptyTemplate: '#noDataAvailable',
		region: '#searchResult',
		model: fb_model,
		templateContext:{
			colClass:'l2 m3 s12',
			getImagePath:function(id){
				return "https://graph.facebook.com/" + id + "/picture?type=normal";
			},
			isFav:function(id){
				return fav_model.isFav(id);
			},
			showFav:function(){
				return true;
			},
		},
		afterRender:function(){
			var that = this;
			
			App.addEvent(this, 'click', '.favBtn', function(e, element){
				App.toogleClass(element, 'white');
				fav_model.toggleItem(that.model.getData(),true,true);
			});

		},
		beforeRerender:function(){
			
			App.removeEvent(this, 'click', '.favBtn');
		}
   });

   resultView.render();


//================================= Favorite View ====================================//


	//Creating View.
	var favResultView = new App.CollectionView({
		template : '#cardTemplate',
		emptyTemplate:'#noDataAvailable',
		region: '#favResult',
		model: fav_model,
		templateContext:{
			colClass:'l2 m3 s12',
			getImagePath:function(id){
				return "https://graph.facebook.com/" + id + "/picture?type=normal";
			},
			showFav:function(){
				return false;
			},
			isFav:function(id){
				return fav_model.isFav(id);
			},
		},
		init:function(){
			//Subscribing the view:render method.
			//Whenever view is updated this function will be executed.
			this.listenTo('view:render',function(view){
				console.log("View Rendered.");
			});
		},
		afterRender:function(){
			var that = this;
			App.addEvent(this, 'click', '.cancelBtn', function(e, element){
				fav_model.removeItem(that.model.getData(),true);
			});
		},
		beforeRerender:function(){
			App.removeEvent(this, 'click', '.cancelBtn');
		}
		
	});

//========================================================================//
var event = new Event('hashchange');
window.dispatchEvent(event);
   
}(app));