/*
* @Author: gunjankothari
* @Date:   2017-04-14 16:58:17
* @Last Modified by:   gunjankothari
* @Last Modified time: 2017-04-17 08:24:41
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
				
				var itemView = new App.View( $.extend( true, { }, that.options, options ) );

				that.views[ data[ that.primaryField ] ] = itemView
				
				itemView.render('append');
			}
		});
	}

	CollectionView.prototype.removeOld = function(id){

		var that = this;

		that.views[id].$el.remove();

		delete that.views[id];

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
			this.views = {};	
		}		
	}

	App.CollectionView = CollectionView

}(app));