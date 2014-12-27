/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;




var Timeline = React.createClass({

	backgroundPosition : 0,

	getDefaultProps: function() {
		return {
			scroll : 0
		};
	},

	componentWillReceiveProps: function(nextProps) {

		if(!this.props.currentItem){
			this.backgroundPosition += nextProps.scroll - this.props.scroll;
		}
	},

	render : function(){
		var self = this;
		var config = this.props.config;

		var TOP_OFFSET = 300;



		//console.log((moment().unix() -start.unix())/ (end.unix() - start.unix()));


		var numDays = moment().diff(config.start, 'days') + 1;


		var markers = _.times(moment().diff(config.start, 'days') + 1, function(day){
			return <div className='marker' key={day} style={{top: config.dayPixelRatio * day + TOP_OFFSET}}>
				{moment(config.start).add(day, 'days').format('MMM Do')}
				</div>
		});


		var items = _.reduce(config.events, function(r, event){

			var date = moment(event.date, "MMM Do, YYYY");


			if(date.unix() > self.props.scrollDay.unix()){

				var days = date.diff(config.start, 'days');

				r.push(<div className='item' key={event.date.format()} style={{top: config.dayPixelRatio * days + TOP_OFFSET}}>
					<i className={'fa ' + event.icon} />
				</div>)

			}

			return r;
		},[]);


		var backgroundStyle = {};

			backgroundStyle={
				"background-position-y" : -this.backgroundPosition
			}



		return(
			<div className='timeline' style={{height : numDays * config.dayPixelRatio}}>

				{markers}
				{items}
				<div className='background' style={backgroundStyle}></div>
				<div className='topGradient'></div>
				<div className='bottomGradient'></div>


			</div>
		);
	}
});

module.exports = Timeline;