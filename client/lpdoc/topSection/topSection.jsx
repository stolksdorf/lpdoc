
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');


var Moment = require('moment');

const Store = require('lpdoc/store.js');

var getTimeOfDay = function(){
	var hour = (new Date).getHours();
	if(8  <= hour && hour < 18){ return 'day'; }
	else if(18 <= hour && hour < 20){ return 'dusk'; }
	else if(6 <= hour && hour < 8){ return 'dawn'; }
	else{ return 'night'; }
}

var TopSection = React.createClass({
	getDefaultProps: function() {
		return {
			//scroll : 0,
			//isDayTime : (8 <=(new Date).getHours()) && ((new Date).getHours() <= 20)
		};
	},

	/*
	getInitialState: function() {
		return {
			backgroundPosition : 0
		};
	},

	componentDidMount: function() {
	},
	*/
	render : function(){
		//var config = this.props.config;
		//var percentage = (Moment().diff(config.start, 'days')) / ( config.end.diff(config.start, 'days'));

		/*

		console.log(config.start, config.end);

		console.log(config.start.diff(config.end));

		console.log( config.end.diff(config.start, 'day'));

		console.log(Moment().diff(config.start, 'days'));
		console.log(Moment().diff(Moment("11-10-2013 09:03 AM", "DD-MM-YYYY hh:mm A"), "minute"));
	*/
		return(
			<div className={'topSection ' + getTimeOfDay() }>
				<div className='startMessage'>
					<div>Scroll to start her adventure</div>
					<img className='downArrow' src='/assets/lpdoc/topSection/down_arrow.png' />
				</div>
				<div className='title'>
					How Much is LP a Doctor?
				</div>
				<div className='subtitle'>
					An Interactive adventure!
				</div>
				<div className='topPercentage'>
					<div>{_.round(Store.getPercentComplete(), 2)}%</div>
					<img src='/assets/lpdoc/sparkle.gif' />
				</div>
				<div className='bottomGradient'></div>
			</div>
		);
	}
});

module.exports = TopSection;