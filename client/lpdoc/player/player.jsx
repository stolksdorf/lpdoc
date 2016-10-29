
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Sprite = require('./sprite/sprite.jsx');
var ItemIcon = require('../itemIcon/itemIcon.jsx');

const Store = require('lpdoc/store.js');

var Player = React.createClass({
	mixins : [Store.mixin()],

	getInitialState: function() {
		return this.getState()
	},
	onStoreChange: function(){
		this.setState(this.getState());
	},

	getState : function(){
		const scroll = Store.getScroll();
		const currentEvent = Store.getCurrentEvent();

		let frame = Math.floor(scroll / 150) % 8;
		if(currentEvent || scroll ==0) frame = 8;

		return {
			frame : frame,
			currentEvent : currentEvent,
			currentSprite : Store.getCurrentSprite()
		};
	},

	renderHover : function(){
		if(!this.state.currentEvent) return;
		return [
			<div className='itemBanner' key={this.state.currentEvent.date}>
				<div className='name'>{this.state.currentEvent.name}</div>
				<div className='desc'>{this.state.currentEvent.desc}</div>
			</div>,
			<div className='hoverItem' key='2'>
				<ItemIcon item={this.state.currentEvent} />
				<img src='/assets/lpdoc/sparkle.gif' />
			</div>
		]
	},

	render : function(){
		return <div className='player'>
			<div className='container'>
				{this.renderHover()}
				<Sprite frame={this.state.frame} imageSrc={this.state.currentSprite} />
			</div>
		</div>
	}
});

module.exports = Player;