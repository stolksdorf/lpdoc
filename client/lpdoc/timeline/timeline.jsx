
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Moment = require('moment');


var Item = require('../itemIcon/itemIcon.jsx');

const Store = require('lpdoc/store.js');

const TOP_OFFSET = 300;

var Timeline = React.createClass({
	mixins : [Store.mixin()],

	getInitialState: function() {
		return this.getState();
	},
	onStoreChange : function(){
		this.setState(this.getState())
	},

	getState : function(){
		return {
			upcomingEvents : Store.getUpcomingEvents(),
			currentEvent : Store.getCurrentEvent(),
			scroll : Store.getScroll()
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
		//console.log(this.state.upcomingEvents[0].name);
		return _.map(this.state.upcomingEvents, (event) => {
			var days = event.date.diff(Store.getState().start, 'days');
			return <Item item={event} key={event.date.format()} style={{top: Store.getState().pixelRatio * days + TOP_OFFSET}}>
				<i className={'fa ' + event.icon} />
			</Item>
		});
	},

	renderPercentage : function(){
		if(this.state.scroll == 0) return;
		return <div className='percentage'>
			{Store.getCurrentPercentage()}%
		</div>
	},

	getBackgroundStyle : function(){
		return {
			backgroundPositionY : -this.state.scroll
		}
	},

	render : function(){
		return <div className='timeline' style={{height : Store.getTotalDays() * Store.getState().pixelRatio}}>
			{this.renderPercentage()}
			{this.renderMarkers()}
			{this.renderItems()}
			<div className='background' style={this.getBackgroundStyle()}></div>
			<div className='topGradient'></div>
			<div className='bottomGradient'></div>
		</div>
	}
});

module.exports = Timeline;