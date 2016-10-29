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
	return Moment(date, "MMM Do, YYYY")
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
	//And your State getters as the second parameter
	getInc : function(){
		return State.inc;
	},

	getPercentage : function(){
		return (State.scroll / State.dayPixelRatio) / ( State.end.diff(State.start, 'days'))
	}
})