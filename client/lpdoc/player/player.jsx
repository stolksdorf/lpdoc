/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;

var Sprite = require('./sprite/sprite.jsx');

var Player = React.createClass({

	getDefaultProps: function() {
		return {
			scroll : 0
		};
	},

	render : function(){
		var self = this;

		var config = this.props.config;

		var dayRatio = 150;


		var start = moment(config.start, "MMM Do, YYYY");
		var end = moment(config.end, "MMM Do, YYYY");
		var scrollDay = moment(start).add(Math.floor(this.props.scroll / dayRatio), 'days');


		var frame = Math.floor(this.props.scroll /200) % 8;

		var percentage = (scrollDay.unix() - start.unix()) / ( end.unix() - start.unix());

		return(
			<div className='player'>

				<div className='percentage'>
					{Math.round(percentage * 10000) / 100} %
				</div>



				<Sprite frame={frame} />
			</div>
		);
	}
});

module.exports = Player;