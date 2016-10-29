var dispatch = require('pico-flux').dispatch;

module.exports = {
	setConfig : function(config){
		dispatch('SET_CONFIG', config);
	},
	setEvents : function(events){
		dispatch('SET_EVENTS', events);
	},
	scroll : function(scrollVal){
		dispatch('SCROLL', scrollVal);
	},
}