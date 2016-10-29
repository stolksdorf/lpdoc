
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

const Store = require('lpdoc/store.js');

var PointsBar = React.createClass({
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

	renderPoints : function(){
		var pointsRegex = new RegExp(/[0-9]+ \w+ points/);
		var points = {};
		var temp = _.each(this.state.events, (event) => {
			var desc = event.desc.toLowerCase();
			if(pointsRegex.test(desc)){
				const pointDesc = pointsRegex.exec(desc)[0].split(' ');
				points[pointDesc[1]] = points[pointDesc[1]] || 0;
				points[pointDesc[1]] += pointDesc[0]*1;
			}
		});
		return _.map(points, (val, pointName) => {
			return <div className='pointRow' key={pointName}>
				<label>{pointName}</label> {val}
			</div>
		})
	},

	render : function(){
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

