/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Sprite = require('./sprite/sprite.jsx');


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

		var showItem = [];
		if(this.props.currentItem){
			frame = 8;
			showItem = (
				<div className='showItem' key={this.props.currentItem.date}>
					<div>{this.props.currentItem.name}</div>
					<i className={'fa ' + this.props.currentItem.icon} />
				</div>
			);
		}

		return(
			<div className='player'>
				<div className='container'>

					<div className='percentage'>
						{Math.round(this.props.percentage * 10000) / 100} %
					</div>
					{this.props.scrollDay.format()}

					<ReactCSSTransitionGroup transitionName="fade">
						{showItem}
					</ReactCSSTransitionGroup>

					<Sprite frame={frame} imageSrc='assets/lpdoc/player/sprite/white_coat.png' />
				</div>
			</div>
		);
	}
});

module.exports = Player;