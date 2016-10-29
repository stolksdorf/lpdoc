'use strict';

var React = require('react');
var _ = require('lodash');
//var $ = require('jquery');
var cx = require('classnames');

const Store = require('lpdoc/store.js');


var ItemBar = React.createClass({
	getInitialState: function() {
		return {
			selectedItem : null,
			items : []
		};
	},

	mixins : [Store.mixin()],
	getInitialState: function() {
		return this.getState()
	},
	onStoreChange: function(){
		this.setState(this.getState());
	},

	getState : function(){
		return {
			events : Store.getCompletedEvents()
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
		return;
		var time = Math.abs(dateToPixel(item.date, this.props.config) - this.props.scroll) * 0.5;
		if(time > 5000) time = 5000;

		alert('clicked item!');

		/*
		$("html, body").animate({
			scrollTop: dateToPixel(item.date, this.props.config)
		}, time);

		*/
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


	renderItems : function(){
		//console.log(this.state.events);


		return _.map(this.state.events, (event, index) => {
			return <div className='item' key={index}
						onClick={this.clickItem.bind(null, event)}
						onMouseEnter={this.selectItem.bind(null, event)}
						onMouseLeave={this.deselectItem.bind(null, event)}>
				<i className={'fa fa-fw ' + event.icon} />
			</div>
		});
	},

	renderSelectedItem : function(){
		if(!this.state.selectedItem) return;

		return <div className='descriptionBox'>
			<div className='itemName'>{this.state.selectedItem.name}</div>
			<div className='itemDate'>{this.state.selectedItem.date.format("MMM Do, YYYY")}</div>
			<div className='itemDescription'>{this.state.selectedItem.desc}</div>
		</div>;
	},


	render : function(){
		/*

		if(this.state.items.length === 0) return <noscript />;

		var items = _.map(this.state.items, function(item, index){
			return
		});

*/
		var zoomClass = 'standard'
		if(this.state.events.length > 12) zoomClass = 'mini';
		if(this.state.events.length > 32) zoomClass = 'super_mini';

/*
		var descriptionBox;
		if(this.state.selectedItem){
			descriptionBox =
		}
*/

		return <div className='itemArea'>
			{this.renderSelectedItem()}
			<div className={'itemBar ' + zoomClass}>
				<div className='itemTitle'>Items collected</div>
				{this.renderItems()}
			</div>
		</div>
	}
});

module.exports = ItemBar;


var dateToPixel = function(date, config){
	return date.diff(config.start, 'days') * config.dayPixelRatio;
}