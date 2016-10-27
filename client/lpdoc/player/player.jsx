
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Sprite = require('./sprite/sprite.jsx');
var ItemIcon = require('../itemIcon/itemIcon.jsx');


var Player = React.createClass({

	getDefaultProps: function() {
		return {
			scroll : 0,
			currentItem : null,
			percentage : 0
		};
	},

	render : function(){
		var self = this;

		var frame = Math.floor(this.props.scroll / 150) % 8;

		var itemBanner = [], hoverItem;
		if(this.props.currentItem){
			frame = 8;
			itemBanner = (
				<div className='itemBanner' key={this.props.currentItem.date}>
					<div className='name'>{this.props.currentItem.name}</div>
					<div className='desc'>{this.props.currentItem.desc}</div>
				</div>
			);
			hoverItem = (
				<div className='hoverItem'>
					<ItemIcon item={this.props.currentItem} />
					<img src='/assets/lpdoc/sparkle.gif' />
				</div>
			);
		}
		if(this.props.scroll === 0){
			frame = 8;
			//fix
			this.props.currentSprite = this.props.config.lastSprite;
		}

		return(
			<div className='player'>
				<div className='container'>
					<ReactCSSTransitionGroup transitionName="fade">
						{itemBanner}
					</ReactCSSTransitionGroup>
					{hoverItem}
					<Sprite frame={frame} imageSrc={this.props.currentSprite} />
				</div>
			</div>
		);
	}
});

module.exports = Player;