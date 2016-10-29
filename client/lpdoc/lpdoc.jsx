
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Moment = require('moment');

var Player = require('./player/player.jsx');
var ItemBar = require('./itemBar/itemBar.jsx');
var Timeline = require('./timeline/timeline.jsx');
var TopSection = require('./topSection/topSection.jsx');
var PointsBar = require('./pointsBar/pointsBar.jsx');



var sprites = {
	base             : 'assets/lpdoc/player/sprite/base.png',
	white_coat       : 'assets/lpdoc/player/sprite/white_coat.png',
	white_coat_scope : 'assets/lpdoc/player/sprite/white_coat_scope.png',
	short_hair       : 'assets/lpdoc/player/sprite/short_hair.png',
	shave_hair       : 'assets/lpdoc/player/sprite/shave_hair.png'
};


const Actions = require('lpdoc/actions.js');
const Store = require('lpdoc/store.js');


var LPDoc = React.createClass({
	getDefaultProps: function() {
		return {
			url : '',
			config : {},
			events : []
		};
	},

	getInitialState: function() {

		return this.getUpdatedState(0,
			this.processConfig(this.props.old_config));

	},

	//Converts dates within the config to moment data structures
	processConfig : function(config){

		config.start = Moment(config.start, "MMM Do, YYYY");
		config.end = Moment(config.end, "MMM Do, YYYY");

		//console.log('CORE', config.end.diff(config.start, 'days'));


		config.lastSprite = sprites.base;
		config.events = _.map(config.events, function(event){
			event.date = Moment(event.date, "MMM Do, YYYY");
			if(event.lp_sprite){
				config.lastSprite = sprites[event.lp_sprite];
				//console.log('sprite', config.lastSprite);
			}
			return event;
		});
		return config;
	},

	getUpdatedState : function(scroll, config){
		var config = config || this.state.config;

		//update scroll, number of days passed, items collected, current item
		var scrollDay = Moment(config.start).add(Math.floor(scroll / config.dayPixelRatio), 'days');
		var currentItem, currentSprite = sprites.base;
		var itemsCollected = _.reduce(config.events, function(r, event){
			if(event.date.unix() <= scrollDay.unix()){
				r.push(event);
				if(event.lp_sprite) currentSprite = sprites[event.lp_sprite];
			}
			if(event.date.diff(scrollDay, 'days') === 0) currentItem = event;
			return r;
		},[]);

		return {
			config : config,
			scroll : scroll,
			scrollDay : scrollDay,
			itemsCollected : itemsCollected,
			currentItem : currentItem,
			currentSprite : currentSprite,
			percentage : (scroll / config.dayPixelRatio) / ( config.end.diff(config.start, 'days'))
		};
	},

	componentWillMount: function() {
		Actions.setConfig(this.props.config);
		Actions.setEvents(this.props.events);
	},

	componentDidMount: function() {
		window.addEventListener("scroll", this.handleScroll);
	},


	handleScroll : function(e){
		Actions.scroll(window.pageYOffset);
	},

	//Probably move to timeline
	renderPercentage : function(){
		if(Store.getScroll() == 0) return;
		return 	<div className='percentage'>
			{Math.round(Store.getPercentage() * 10000) / 100}%
		</div>
	},

	render : function(){
		return <div className='lpdoc' onScroll={this.handleScroll}>
			<TopSection />
			<Timeline />

			<Player
				currentSprite={this.state.currentSprite}
				currentItem={this.state.currentItem}
				config={this.state.config}
				scroll={this.state.scroll}/>

			{/*









			<ItemBar items={this.state.itemsCollected}
					 config={this.state.config}
					 scroll={this.state.scroll}/>

			<PointsBar items={this.state.itemsCollected} />
			*/}
			{this.renderPercentage()}
		</div>
	}
});

module.exports = LPDoc;
