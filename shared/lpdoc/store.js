const _ = require('lodash');
const flux = require('pico-flux');
const Moment = require('moment');

const State = {
	start : null,
	end : null,
	pixelRatio : 300,

	events : [],

	scroll : 0,

	currentDay : null,
	lastEventIndex : 0,

	lastEvent : {}, //rename to last event

	currentSprite : 'base.png',

	totalDays : 0,

};

const parseDate = (date) => {
	return Moment(date, "MMM D, YYYY")
}

const getCurrentDayNum = () => {
	return Math.floor(State.scroll / State.pixelRatio);
}



module.exports = flux.createStore({
	SET_CONFIG : function(config){
		State.start = parseDate(config.start);
		State.end = parseDate(config.end);
		State.pixelRatio = config.dayPixelRatio;

		State.totalDays = State.end.diff(State.start, 'days');
	},

	SET_EVENTS : function(events){
		State.events = _.map(events, (event) => {
			if(event.sprite) State.lastSprite = event.sprite;
			const date = parseDate(event.date)
			return {...event,
				dayNum : date.diff(State.start, 'days'),
				date : date
			}
		});
	},
	SCROLL : function(scroll){
		State.scroll = scroll;
		const currentUnix = Moment(State.start).add(getCurrentDayNum(), 'days').unix();


		const testEvent = (event, idx) => {
			if(event && event.date.unix() <= currentUnix){
				if(event.sprite) State.currentSprite = event.sprite;
				State.lastEvent = event;
				State.lastEventIndex = idx;
				return testEvent(State.events[idx + 1], idx + 1);
			}
		};

		testEvent(State.events[0], 0);
	},
},{
	getState : function(){
		return State;
	},
	getScroll : function(){
		return State.scroll
	},

	getCurrentDay : function(){
		return Moment(State.start).add(getCurrentDayNum(), 'days');
	},
	getPercentComplete : function(){
		return Moment().diff(State.start, 'days') / State.totalDays
	},
	getCurrentPercentage : function(){
		return getCurrentDayNum() / State.totalDays
	},


	getCompletedEvents : function(){
		return _.slice(State.events, 0, State.lastEventIndex);
	},
	getUpcomingEvents : function(){
		return _.slice(State.events, State.lastEventIndex + 1);
	},


	getLastEvent : function(){
		return State.lastEvent;
	},
	getCurrentEvent : function(){
		if(State.lastEvent.dayNum == getCurrentDayNum()) return State.lastEvent;
	},


	getCurrentSprite : function(){
		return State.currentSprite;
	},

	getTotalDays : function(){
		return Moment().diff(State.start, 'days') + 1;
	}
})