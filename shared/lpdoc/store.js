const _ = require('lodash');
const flux = require('pico-flux');
const Moment = require('moment');

const State = {
	start : null,
	end : null,
	pixelRatio : 300,

	events : [],
	eventGroups : {
		past : [],
		current : [],
		future : []
	},


	scroll : 0,
	currentDay : null,

/*
	lastEventIndex : 0,

	lastEvent : {}, //rename to last event

	currentEvent : null,
*/
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
		//const currentUnix = Moment(State.start).add(getCurrentDayNum(), 'days').unix();

		const currentDayNum = getCurrentDayNum();

		State.currentEvent = null;
		State.currentEventIndex = -1;

		State.eventGroups = _.groupBy(State.events, (event) => {
			if(event.sprite) State.lastSprite = event.sprite;
			if(event.dayNum > currentDayNum) return 'future';

			if(event.sprite) State.currentSprite = event.sprite;

			if(event.dayNum == currentDayNum) return 'current';
			if(event.dayNum < currentDayNum) return 'past';
		});

		State.eventGroups.past = State.eventGroups.past || [];
		State.eventGroups.current = State.eventGroups.current || [];
		State.eventGroups.future = State.eventGroups.future || [];
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
		return _.round(Moment().diff(State.start, 'days') / State.totalDays * 100, 1);
	},
	getCurrentPercentage : function(){
		return _.round(getCurrentDayNum() / State.totalDays * 100, 1)
	},


	getCompletedEvents : function(){
		return State.eventGroups.past;
	},
	getUpcomingEvents : function(){
		return State.eventGroups.future;
	},


	getLastEvent : function(){
		return State.lastEvent;
	},
	getCurrentEvent : function(){
		if(State.eventGroups.current) return State.eventGroups.current[0]
	},

	getCurrentSprite : function(){
		if(State.scroll == 0) return State.lastSprite;
		return State.currentSprite;
	},

	getTotalDays : function(){
		return Moment().diff(State.start, 'days') + 1;
	}
})