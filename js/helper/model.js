/*
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
