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
	lastCompletedEventIndex : 0,
	currentEvent : {},
	currentSprite : 'base.png',

	lastSprite : 'base.png'
};

const parseDate = (date) => {
	return Moment(date, "MMM D, YYYY")
}

module.exports = flux.createStore({
	SET_CONFIG : function(config){
		State.start = parseDate(config.start);
		State.end = parseDate(config.end);
		State.pixelRatio = config.dayPixelRatio;
	},

	SET_EVENTS : function(events){
		State.events = _.map(events, (event) => {
			if(event.sprite) State.lastSprite = event.sprite
			return {...event,
				date : parseDate(event.date)
			}
		});
	},
	SCROLL : function(scroll){
		console.log(val);

		State.scroll = scroll;
		State.currentDay = Moment(State.start).add(Math.floor(State.scroll / State.pixelRatio), 'days');

		const testEvent = (event, idx) => {
			if(event.date.unix() <= State.currentDay.unix()){
				if(event.sprite) State.current = event.sprite;
				State.currentEvent = event;
				State.lastCompletedEventIndex = idx;
				return testEvent(State.events[idx + 1], idx + 1);
			}
		};

	},
},{

	getScroll : function(){
		return State.scroll
	},

	getCurrentDay : function(){
		return Moment(State.start).add(Math.floor(State.scroll / State.pixelRatio), 'days');
	},

	getPercentComplete : function(){
		return Moment().diff(State.start, 'days') / State.end.diff(State.start, 'days')
	},

	getCurrentPercentage : function(){
		return (State.scroll / State.pixelRatio) / ( State.end.diff(State.start, 'days'))
	},


	getCompletedEvents : function(){

	},
	getCurrentEvent : function(){
		return State.currentEvent;
	},
	getCurrentSprite : function(){
		return State.currentSprite;
	}
})