/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;

var Sprite = React.createClass({

	getDefaultProps: function() {
		return {
			frame : 0
		};
	},
	render : function(){
		var self = this;
		return(
			<div className={'sprite frame' + this.props.frame} onClick={this.handle} key={this.props.frame}>
				{this.props.frame}
			</div>
		);
	}
});

module.exports = Sprite;