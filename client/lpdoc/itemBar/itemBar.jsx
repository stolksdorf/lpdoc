/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var $ = require('jquery');
var cx = React.addons.classSet;

var ItemBar = React.createClass({
	getInitialState: function() {
		return {
			selectedItem : null
		};
	},
	getDefaultProps: function() {
		return {
			items : []
		};
	},
	clickItem : function(item){
		$("html, body").animate({
			scrollTop: dateToPixel(item.date, this.props.config)
		}, 1000);
	},
	selectItem : function(item){
		console.log('selecting', item);
		this.setState({
			selectedItem : item
		});
	},
	deselectItem : function(){
		this.setState({
			selectedItem : null
		});
	},
	render : function(){
		var self = this;

		var items = _.map(this.props.items, function(item, index){
			return <div className='item' key={index}
						onClick={self.clickItem.bind(self, item)}
						onMouseEnter={self.selectItem.bind(self, item)}
						onMouseLeave={self.deselectItem.bind(self, item)}>
				<i className={'fa ' + item.icon} />
			</div>
		});


		var zoomClass = 'standard'
		if(items.length > 16) zoomClass = 'mini';
		if(items.length > 32) zoomClass = 'super_mini';


		var descriptionBox;
		if(this.state.selectedItem){
			descriptionBox = <div className='descriptionBox'>
				<div className='itemName'>{this.state.selectedItem.name}</div>
				<div className='itemDescription'>{this.state.selectedItem.description}</div>
			</div>
		}


		return(
			<div className='itemArea'>
				{descriptionBox}
				<div className={'itemBar ' + zoomClass}>
					<div className='itemTitle'>Items</div>
					{items}

				</div>
			</div>
		);
	}
});

module.exports = ItemBar;


var dateToPixel = function(date, config){
	console.log(date.format(), config.start.format());
	console.log(date.diff(config.start, 'days'), config.dayPixelRatio);
	return date.diff(config.start, 'days') * config.dayPixelRatio;
}