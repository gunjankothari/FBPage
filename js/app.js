/*
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