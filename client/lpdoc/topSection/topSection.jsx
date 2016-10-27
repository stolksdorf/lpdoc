
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Moment = require('moment');

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
			scroll : 0,
			isDayTime : (8 <=(new Date).getHours()) && ((new Date).getHours() <= 20)
		};
	},

	getInitialState: function() {
		return {
			backgroundPosition : 0
		};
	},

	componentDidMount: function() {
		var self = this;
		setInterval(function(){
			self.setState({
				backgroundPosition : self.state.backgroundPosition + 1
			})
		}, 100);
	},

	render : function(){
		var self = this;
		var config = this.props.config;
		var percentage = (Moment().diff(config.start, 'days')) / ( config.end.diff(config.start, 'days'));

		return(
			<div className={'topSection ' + getTimeOfDay() }
				 style={{'background-position-x' : this.state.backgroundPosition}}>
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
					<div>{Math.round(percentage * 10000) / 100}%</div>
					<img src='/assets/lpdoc/sparkle.gif' />
				</div>
				<div className='bottomGradient'></div>
			</div>
		);
	}
});

module.exports = TopSection;