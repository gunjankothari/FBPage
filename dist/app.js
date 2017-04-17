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
}(app));;(function(App){
	
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

}(app));;/*
* @Author: gunjankothari
* @Date:   2017-04-13 05:28:34
* @Last Modified by:   gunjankothari
* @Last Modified time: 2017-04-15 21:45:27
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
		return $.extend(true,{},this.data);
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

			this.login( onLogin );
		}
		catch(e){
			console.log(e);
		}
	}

	FBModel.prototype.login = function( onLogin ){
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
	}

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
			  		"after": nextPage
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
	FBModel.prototype.plainQuery = function(){

	}
	FBModel.prototype.find = function(value){
		var obj = _.findWhere(this.data[ this.dataArrayField ], {
			id:value+""
		});
		return $.extend(true, {}, obj);
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
* @Last Modified by:   gunjankothari
* @Last Modified time: 2017-04-15 20:04:01
*/

'use strict';
(function(App){

	//View Class 
	var View = function(options){
		
		if(options){
			App.listenerEvents.call(this);
			this.template = options.template || "";
			this.compiledTemplate = _.template(this.template.html());
			this.region = options.region || "body";
			this.model = options.model || new App.Model();
			this.afterRender = options.afterRender;
			this.templateContext = options.templateContext;
			this.beforeRerender = options.beforeRerender;
			this.renderCount = 0;

			this.$el = $('<div></div>');
			$(this.region).append(this.$el);

			if(App.isFunction(options.init)){
				options.init.call(this);
			}
		}
		
			
	}

	View.prototype = Object.create(App.listenerEvents.prototype);
	View.prototype.constructor = View;
	_.extend(View.prototype, View.prototype.__proto__);
	

	//Render Method of View class.
	View.prototype.render = function(method){

			this.renderCount++;
			
			if(App.isFunction(this.beforeRerender) && this.renderCount>1){
				this.beforeRerender();
			}
		
			var content = this.compiledTemplate($.extend(true, {}, this.model.getData(), this.templateContext));
			
			if(this.beforeRender){
				this.afterRender.call(this);
			}		

			switch(method){
				case 'append':
					this.$el.append(content);
					break;

				case 'prepend':
					this.$el.prepend(content);
					break;

				case 'replace':
				default:
					this.$el.html(content);
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
* @Last Modified by:   gunjankothari
* @Last Modified time: 2017-04-15 22:18:03
*/

'use strict';
(function(App){

	var CollectionView = function(options){
		this.options = options;
		this.model = options.model || new App.Model();
		this.viewModelMapping = {};
		this.primaryField = options.primaryField || 'id';

		if(this.options.emptyTemplate)
			this.compiledEmptyView = _.template(this.options.emptyTemplate.html());

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
			
			var itemView = new App.View($.extend(true,{},that.options,options));
			
			that.viewModelMapping[ data[ that.primaryField ] ] = itemView
			
			itemView.render('append');
		});
	}

	CollectionView.prototype.renderNewOnly = function(){

		if(App.isEmptyObject(this.viewModelMapping)){
			//This will remove the empty view.
			this.empty();
		}

		var that = this;

		_.each(this.model.getData()[this.model.dataArrayField],function(data){

			if(typeof that.viewModelMapping[ data[ that.primaryField ] ] !== "object"){
				
				var options = {
					model: new App.Model({
						data: data
					})
				};
				
				var itemView = new App.View( $.extend( true, { }, that.options, options ) );

				that.viewModelMapping[ data[ that.primaryField ] ] = itemView
				
				itemView.render('append');
			}
		});
	}
	CollectionView.prototype.removeOld = function(id){

		var that = this;

		that.viewModelMapping[id].$el.remove();

		delete that.viewModelMapping[id];

		this.showEmptyView();
	}

	CollectionView.prototype.showEmptyView = function(){
		
		if(this.model.getData()[this.model.dataArrayField].length == 0 && this.compiledEmptyView){
			$(this.options.region).html(this.compiledEmptyView());
		}
	}

	CollectionView.prototype.empty = function(){
		$(this.options.region).empty();

		if(this.model.getData()[this.model.dataArrayField].length == 0){
			this.viewModelMapping = {};	
		}
		
	}

	App.CollectionView = CollectionView

}(app));;/*
* @Author: gunjankothari
* @Date:   2017-04-13 05:57:33
* @Last Modified by:   gunjankothari
* @Last Modified time: 2017-04-15 21:11:26
*/

'use strict';
(function(App, $){


//============================ Search View =========================================//

	var searchModel = new App.Model({
		localStorageKey : 'search_data',
	});

	var searchView = new App.View({
		template : $('#searchTemplate'),
		region: '#searchTemplateContainer',
		model: searchModel,
		afterRender:function(){
			var that = this;
			this.$el.on('change','input#search',function(e){
				var searchText = $(e.currentTarget).val();
				that.model.setData('search', searchText, true);
				fb_model.query(searchText, "page", "name, id, about, category, picture, fan_count, link", 20, 5);
			});
			
		},
		beforeRerender:function(){
			this.$el.off('change','input');
		}
	});

	searchView.render();


//============================== Header View ==========================================//

	var headerView = new App.View({
		template : $('#headerTemplate'),
		region: '#headerWrapper',
		afterRender:function(){
			var that = this;
			this.$el.on('click','ul li.tab',function(e){
				var tab = $(e.target).closest('li').attr('id');
				switch(tab){
					case 'searchTab': 
						resultView.render();
						break;

					case 'favTab':
						favResultView.render();
						break;
				}
			});
		}
	});

	headerView.render();


//============================== Header View ==========================================//

	var footerView = new App.View({
		template : $('#footerTemplate'),
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
			  appId      : '802617683083235',
			  xfbml      : true,
			  version    : 'v2.8'
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
		'dataArrayField':'queryData',
		init:function(){
			
		}
	});


//============================= Search Result View =============================================//
	
	var resultView = new App.CollectionView({
   		template : $('#cardTemplate'),
   		emptyTemplate: $('#noDataAvailable'),
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
			//console.log(this.$el);
			this.$el.on('click','.favBtn',function(e){
				var pageId = $(e.currentTarget).closest('.card').data('pageid');
				$(e.currentTarget).toggleClass('white');
				fav_model.toggleItem(that.model.getData(),true,true);
			});
		},
		beforeRerender:function(){
			this.$el.off('click','.favBtn');
		}
   });
   resultView.render();


//================================= Favorite View ====================================//


	//Creating View.
	var favResultView = new App.CollectionView({
		template : $('#cardTemplate'),
		emptyTemplate: $('#noDataAvailable'),
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
			this.$el.on('click','.cancelBtn',function(e){
				//var pageId = $(e.currentTarget).closest('.card').data('pageid');
				fav_model.removeItem(that.model.getData(),true);
			});
		},
		beforeRerender:function(){
			this.$el.off('click','.cancelBtn');
		}
		
	});

//========================================================================//

   
}(app, jQuery));