/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;

var TopSection = React.createClass({

	render : function(){
		var self = this;
		return(
			<div className='topSection'>
				Ready
			</div>
		);
	}
});

module.exports = TopSection;