/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;

var PointsBar = React.createClass({

	getDefaultProps: function() {
		return {
			items : []
		};
	},

	renderPoints : function(){
		var pointsRegex = new RegExp(/[0-9]+ \w+ Points/);
		var points = {};
		var temp = _.each(this.props.items, function(item){
			if(pointsRegex.test(item.desc)){
				pointDesc = pointsRegex.exec(item.desc)[0].split(' ');
				points[pointDesc[1]] = points[pointDesc[1]] || 0;
				points[pointDesc[1]] += pointDesc[0]*1;
			}
		});
		return _.map(points, function(val, pointName){
			return (
				<div className='pointRow'>
					<label>{pointName}</label> {val}
				</div>
			);
		})
	},

	render : function(){
		var self = this;
		var points = this.renderPoints();
		if(!points.length) return <noscript />;
		return(
			<div className='pointsBar'>
				<div className='title'>points</div>
				{points}
			</div>
		);
	}
});

module.exports = PointsBar;

