
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Moment = require('moment');


var Item = require('../itemIcon/itemIcon.jsx');

const Store = require('lpdoc/store.js');

const TOP_OFFSET = 300;

var Timeline = React.createClass({
	mixins : [Store.mixin()],

/*
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

*/
	getInitialState: function() {
		return this.getState();
	},
	onStoreChange : function(){
		this.setState(this.getState())
	},

	getState : function(){
		return {
			upcomingEvents : Store.getUpcomingEvents()
		}
	},

	renderMarkers : function(){


		return _.times(Store.getTotalDays(), (dayIndex) => {
			return <div
					className='marker'
					key={dayIndex}
					style={{top: Store.getState().pixelRatio * dayIndex + TOP_OFFSET}}>

				{Moment(Store.getState().start).add(dayIndex, 'days').format('MMM Do')}
			</div>
		});
	},

	renderItems : function(){
		return _.map(this.state.upcomingEvents, (event) => {
			var days = event.date.diff(Store.getState().start, 'days');
			return <Item item={event} key={event.date.format()} style={{top: Store.getState().pixelRatio * days + TOP_OFFSET}}>
				<i className={'fa ' + event.icon} />
			</Item>
		});
	},

	render : function(){

		/*
		var self = this;
		var config = this.props.config;





		//console.log((Moment().unix() -start.unix())/ (end.unix() - start.unix()));


		var numDays = Moment().diff(config.start, 'days') + 1;


		var markers = _.times(Moment().diff(config.start, 'days') + 1, function(day){

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
		*/

		var backgroundStyle = {};

			backgroundStyle={
				"background-position-y" : -this.backgroundPosition
			}



		return(
			<div className='timeline' style={{height : Store.getTotalDays() * Store.getState().pixelRatio}}>

				{this.renderMarkers()}
				{this.renderItems()}
				<div className='background' style={backgroundStyle}></div>
				<div className='topGradient'></div>
				<div className='bottomGradient'></div>


			</div>
		);
	}
});

module.exports = Timeline;