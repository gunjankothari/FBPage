/*
* @Author: gunjankothari
* @Date:   2017-04-13 05:57:33
* @Last Modified by:   Gunjan
* @Last Modified time: 2017-04-17 19:02:42
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
				fb_model.query(searchText, "page", "name, id, about, category, picture, fan_count, link, is_verified", 20, 5);
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
		dataArrayField	:'queryData',
		data: {
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
				//console.log("View Rendered.");
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