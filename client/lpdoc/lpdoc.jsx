/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;
var $ = require('jquery');

var Player = require('./player/player.jsx');
var ItemBar = require('./itemBar/itemBar.jsx');
var Timeline = require('./timeline/timeline.jsx');
var TopSection = require('./topSection/topSection.jsx');



var sprites = {
	base             : 'assets/lpdoc/player/sprite/base.png',
	white_coat       : 'assets/lpdoc/player/sprite/white_coat.png',
	white_coat_scope : 'assets/lpdoc/player/sprite/white_coat_scope.png',
	short_hair       : 'assets/lpdoc/player/sprite/short_hair.png',
	shave_hair       : 'assets/lpdoc/player/sprite/shave_hair.png'
};




var lpdoc = React.createClass({

	getInitialState: function() {
		return {
			config : null,
			scroll: 0,
		};
	},

	//Converts dates within the config to moment data structures
	processConfig : function(config){
		config.start = moment(config.start, "MMM Do, YYYY");
		config.end = moment(config.end, "MMM Do, YYYY");
		config.lastSprite = sprites.base;
		config.events = _.map(config.events, function(event){
			event.date = moment(event.date, "MMM Do, YYYY");
			if(event.lp_sprite){
				config.lastSprite = sprites[event.lp_sprite];
				console.log('sprite', config.lastSprite);
			}
			return event;
		});
		return config;
	},

	update : function(scroll, config){
		var config = config || this.state.config;

		//update scroll, number of days passed, items collected, current item
		var scrollDay = moment(config.start).add(Math.floor(scroll / config.dayPixelRatio), 'days');
		var currentItem, currentSprite = sprites.base;
		var itemsCollected = _.reduce(config.events, function(r, event){
			if(event.date.unix() <= scrollDay.unix()){
				r.push(event);
				if(event.lp_sprite) currentSprite = sprites[event.lp_sprite];
			}
			if(event.date.diff(scrollDay, 'days') === 0) currentItem = event;
			return r;
		},[]);

		this.setState({
			config : config,
			scroll : scroll,
			scrollDay : scrollDay,
			itemsCollected : itemsCollected,
			currentItem : currentItem,
			currentSprite : currentSprite,
			percentage : (scroll / config.dayPixelRatio) / ( config.end.diff(config.start, 'days'))
		});
	},

	componentDidMount: function() {
		var self = this;
		$.getJSON('https://rawgit.com/stolksdorf/lpdoc/master/lpdoc_config.json', function(config){
			self.update(0, self.processConfig(config))
		})

		$(window).on('scroll', function(e) {
			self.update(window.pageYOffset);
		});
	},

	render : function(){
		var self = this;

		//Don't load anything if we don't have the config
		if(!this.state.config) return <noscript />

		console.log('TEST',this.state.config);

		var percentage;
		if(this.state.scroll !== 0){
			percentage = (
				<div className='percentage'>
					{Math.round(this.state.percentage * 10000) / 100}%
				</div>
			);
		}

		return(
			<div className='lpdoc'>
				<TopSection
					config={this.state.config}
					scroll={this.state.scroll}
					percentage={this.state.percentage} />

				<Player
					currentSprite={this.state.currentSprite}
					currentItem={this.state.currentItem}
					config={this.state.config}
					scroll={this.state.scroll}/>




				<Timeline
					itemsCollected={this.state.itemsCollected}
					currentItem={this.state.currentItem}
					scrollDay={this.state.scrollDay}
					config={this.state.config}
					scroll={this.state.scroll} />


				<ItemBar items={this.state.itemsCollected}
						 config={this.state.config}
						 scroll={this.state.scroll}/>

				{percentage}
			</div>
		);
	}
});

module.exports = lpdoc;
