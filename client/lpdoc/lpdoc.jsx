/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;
var $ = require('jquery');

var Player = require('./player/player.jsx');
var ItemBar = require('./itemBar/itemBar.jsx');
var Timeline = require('./timeline/timeline.jsx');
var TopSection = require('./topSection/topSection.jsx');

var lpdoc = React.createClass({

	getInitialState: function() {
		return {
			config : null,
			scroll: 0,
			PACHOW :{
				show : false,
				x : 0,
				y : 0
			}
		};
	},

	//Converts dates within the config to moment data structures
	processConfig : function(config){
		config.start = moment(config.start, "MMM Do, YYYY");
		config.end = moment(config.end, "MMM Do, YYYY");
		config.events = _.map(config.events, function(event){
			event.date = moment(event.date, "MMM Do, YYYY");
			return event;
		})
		return config;
	},

	update : function(scroll, config){
		var config = config || this.state.config;

		//update scroll, number of days passed, items collected, current item
		var scrollDay = moment(config.start).add(Math.floor(scroll / config.dayPixelRatio), 'days');
		var currentItem;
		var itemsCollected = _.reduce(config.events, function(r, event){
			if(event.date.unix() <= scrollDay.unix()) r.push(event);
			if(event.date.diff(scrollDay, 'days') === 0) currentItem = event;
			return r;
		},[]);

		this.setState({
			config : config,
			scroll : scroll,
			scrollDay : scrollDay,
			itemsCollected : itemsCollected,
			currentItem : currentItem,
			percentage : (scroll / config.dayPixelRatio) / ( config.end.diff(config.start, 'days'))
		});
	},

	componentDidMount: function() {
		var self = this;
		window.title = 'PACHOW!';

		$.getJSON('https://dl.dropboxusercontent.com/u/562800/lpdoc_config.json', function(config){
			console.log(config);
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

		return(
			<div className='lpdoc'>
				<TopSection scroll={this.state.scroll} />

				<Player
				scrollDay={this.state.scrollDay}
					percentage={this.state.percentage}
					currentItem={this.state.currentItem}
					config={this.state.config}
					scroll={this.state.scroll}/>




				<Timeline
					itemsCollected={this.state.itemsCollected}
					currentItem={this.state.currentItem}
					scrollDay={this.state.scrollDay}
					config={this.state.config}
					scroll={this.state.scroll} />


				<ItemBar items={this.state.itemsCollected} config={this.state.config} />
			</div>
		);
	}
});

module.exports = lpdoc;

//

/*
<img src="/assets/lpdoc/pachow.png" className={cx({
	PACHOW : true,
	show : this.state.PACHOW.show
})} style={{
	top : this.state.PACHOW.y,
	left : this.state.PACHOW.x,
}}></img>


 */