
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Moment = require('moment');


var Item = require('../itemIcon/itemIcon.jsx');

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



		//console.log((Moment().unix() -start.unix())/ (end.unix() - start.unix()));


		var numDays = Moment().diff(config.start, 'days') + 1;


		var markers = _.times(Moment().diff(config.start, 'days') + 1, function(day){
			return <div className='marker' key={day} style={{top: config.dayPixelRatio * day + TOP_OFFSET}}>
				{Moment(config.start).add(day, 'days').format('MMM Do')}
				</div>
		});


		var items = _.reduce(config.events, function(r, event){

			var date = Moment(event.date, "MMM Do, YYYY");


			if(date.unix() > self.props.scrollDay.unix()){

				var days = date.diff(config.start, 'days');

				r.push(<Item item={event} key={event.date.format()} style={{top: config.dayPixelRatio * days + TOP_OFFSET}}>
					<i className={'fa ' + event.icon} />
				</Item>)

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