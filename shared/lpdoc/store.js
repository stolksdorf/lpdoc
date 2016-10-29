const flux = require('pico-flux');
const Moment = require('moment');

const State = {
	start : null,
	end : null,
	pixelRatio : 300,


	events : [],

	scroll : 0
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
		State.events = events;
	},
	SCROLL : function(val){
		console.log(val);
	},
},{

	getScroll : function(){
		return State.scroll
	},

	getPercentComplete : function(){
		return Moment().diff(State.start, 'days') / State.end.diff(State.start, 'days')
	},

	getCurrentPercentage : function(){
		return (State.scroll / State.pixelRatio) / ( State.end.diff(State.start, 'days'))
	}
})