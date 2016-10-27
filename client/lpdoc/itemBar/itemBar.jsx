
var React = require('react');
var _ = require('lodash');
var $ = require('jquery');
var cx = require('classnames');

var ItemBar = React.createClass({
	getInitialState: function() {
		return {
			selectedItem : null,
			items : []
		};
	},

	//This makes picking up items "sticky".
	componentWillReceiveProps: function(nextProps) {
		if(nextProps.items.length > this.state.items.length){
			this.setState({
				items : nextProps.items
			})
		}
	},
	getDefaultProps: function() {
		return {
			items : []
		};
	},
	clickItem : function(item){
		var time = Math.abs(dateToPixel(item.date, this.props.config) - this.props.scroll) * 0.5;
		if(time > 5000) time = 5000;
		$("html, body").animate({
			scrollTop: dateToPixel(item.date, this.props.config)
		}, time);
	},
	selectItem : function(item){
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


		if(this.state.items.length === 0) return <noscript />;

		var items = _.map(this.state.items, function(item, index){
			return <div className='item' key={index}
						onClick={self.clickItem.bind(self, item)}
						onMouseEnter={self.selectItem.bind(self, item)}
						onMouseLeave={self.deselectItem.bind(self, item)}>
				<i className={'fa fa-fw ' + item.icon} />
			</div>
		});


		var zoomClass = 'standard'
		if(items.length > 12) zoomClass = 'mini';
		if(items.length > 32) zoomClass = 'super_mini';


		var descriptionBox;
		if(this.state.selectedItem){
			descriptionBox = <div className='descriptionBox'>
				<div className='itemName'>{this.state.selectedItem.name}</div>
				<div className='itemDate'>{this.state.selectedItem.date.format("MMM Do, YYYY")}</div>
				<div className='itemDescription'>{this.state.selectedItem.desc}</div>
			</div>
		}


		return(
			<div className='itemArea'>
				{descriptionBox}
				<div className={'itemBar ' + zoomClass}>
					<div className='itemTitle'>Items collected</div>
					{items}

				</div>
			</div>
		);
	}
});

module.exports = ItemBar;


var dateToPixel = function(date, config){
	return date.diff(config.start, 'days') * config.dayPixelRatio;
}