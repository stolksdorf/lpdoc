require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./client/lpdoc/lpdoc.jsx":[function(require,module,exports){
/** @jsx React.DOM */
var React = window.React;
var _ = window._;
var cx = React.addons.classSet;
var $ = window.jQuery;

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




var lpdoc = React.createClass({displayName: 'lpdoc',

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
		if(!this.state.config) return React.DOM.noscript(null)

		console.log('TEST',this.state.config);

		var percentage;
		if(this.state.scroll !== 0){
			percentage = (
				React.DOM.div({className: "percentage"}, 
					Math.round(this.state.percentage * 10000) / 100, "%"
				)
			);
		}

		return(
			React.DOM.div({className: "lpdoc"}, 
				TopSection({
					config: this.state.config, 
					scroll: this.state.scroll, 
					percentage: this.state.percentage}), 

				Player({
					currentSprite: this.state.currentSprite, 
					currentItem: this.state.currentItem, 
					config: this.state.config, 
					scroll: this.state.scroll}), 




				Timeline({
					itemsCollected: this.state.itemsCollected, 
					currentItem: this.state.currentItem, 
					scrollDay: this.state.scrollDay, 
					config: this.state.config, 
					scroll: this.state.scroll}), 


				ItemBar({items: this.state.itemsCollected, 
						 config: this.state.config, 
						 scroll: this.state.scroll}), 

				percentage
			)
		);
	}
});

module.exports = lpdoc;

},{"./itemBar/itemBar.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemBar\\itemBar.jsx","./player/player.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\player.jsx","./timeline/timeline.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\timeline\\timeline.jsx","./topSection/topSection.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\topSection\\topSection.jsx"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemBar\\itemBar.jsx":[function(require,module,exports){
/** @jsx React.DOM */
var React = window.React;
var _ = window._;
var $ = window.jQuery;
var cx = React.addons.classSet;

var ItemBar = React.createClass({displayName: 'ItemBar',
	getInitialState: function() {
		return {
			selectedItem : null,
			items : []
		};
	},

	//This makes picking up items "sticky".
	componentWillReceiveProps: function(nextProps) {
		if(nextProps.items.length > this.state.items.length){
			this.setState({
				items : nextProps.items
			})
		}
	},
	getDefaultProps: function() {
		return {
			items : []
		};
	},
	clickItem : function(item){
		var time = Math.abs(dateToPixel(item.date, this.props.config) - this.props.scroll) * 0.5;
		if(time > 5000) time = 5000;
		$("html, body").animate({
			scrollTop: dateToPixel(item.date, this.props.config)
		}, time);
	},
	selectItem : function(item){
		this.setState({
			selectedItem : item
		});
	},
	deselectItem : function(){
		this.setState({
			selectedItem : null
		});
	},
	render : function(){
		var self = this;


		if(this.state.items.length === 0) return React.DOM.noscript(null);

		var items = _.map(this.state.items, function(item, index){
			return React.DOM.div({className: "item", key: index, 
						onClick: self.clickItem.bind(self, item), 
						onMouseEnter: self.selectItem.bind(self, item), 
						onMouseLeave: self.deselectItem.bind(self, item)}, 
				React.DOM.i({className: 'fa fa-fw ' + item.icon})
			)
		});


		var zoomClass = 'standard'
		if(items.length > 12) zoomClass = 'mini';
		if(items.length > 32) zoomClass = 'super_mini';


		var descriptionBox;
		if(this.state.selectedItem){
			descriptionBox = React.DOM.div({className: "descriptionBox"}, 
				React.DOM.div({className: "itemName"}, this.state.selectedItem.name), 
				React.DOM.div({className: "itemDate"}, this.state.selectedItem.date.format("MMM Do, YYYY")), 
				React.DOM.div({className: "itemDescription"}, this.state.selectedItem.desc)
			)
		}


		return(
			React.DOM.div({className: "itemArea"}, 
				descriptionBox, 
				React.DOM.div({className: 'itemBar ' + zoomClass}, 
					React.DOM.div({className: "itemTitle"}, "Items collected"), 
					items

				)
			)
		);
	}
});

module.exports = ItemBar;


var dateToPixel = function(date, config){
	return date.diff(config.start, 'days') * config.dayPixelRatio;
}
},{}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemIcon\\itemIcon.jsx":[function(require,module,exports){
/** @jsx React.DOM */
var React = window.React;
var _ = window._;
var cx = React.addons.classSet;

var ItemIcon = React.createClass({displayName: 'ItemIcon',

	render : function(){
		var self = this;
		var item = this.props.item;
		return(
			React.DOM.div({className: "itemIcon", style: this.props.style}, 
				React.DOM.i({className: "fa fa-fw " + item.icon})
			)
		);
	}
});

module.exports = ItemIcon;
},{}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\player.jsx":[function(require,module,exports){
/** @jsx React.DOM */
var React = window.React;
var _ = window._;
var cx = React.addons.classSet;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Sprite = require('./sprite/sprite.jsx');
var ItemIcon = require('../itemIcon/itemIcon.jsx');


var Player = React.createClass({displayName: 'Player',

	getDefaultProps: function() {
		return {
			scroll : 0,
			currentItem : null,
			percentage : 0
		};
	},

	render : function(){
		var self = this;

		var frame = Math.floor(this.props.scroll / 150) % 8;

		var itemBanner = [], hoverItem;
		if(this.props.currentItem){
			frame = 8;
			itemBanner = (
				React.DOM.div({className: "itemBanner", key: this.props.currentItem.date}, 
					React.DOM.div({className: "name"}, this.props.currentItem.name), 
					React.DOM.div({className: "desc"}, this.props.currentItem.desc)
				)
			);
			hoverItem = (
				React.DOM.div({className: "hoverItem"}, 
					ItemIcon({item: this.props.currentItem}), 
					React.DOM.img({src: "/assets/lpdoc/sparkle.gif"})
				)
			);
		}
		if(this.props.scroll === 0){
			frame = 8;
			//fix
			this.props.currentSprite = this.props.config.lastSprite;
		}

		return(
			React.DOM.div({className: "player"}, 
				React.DOM.div({className: "container"}, 
					ReactCSSTransitionGroup({transitionName: "fade"}, 
						itemBanner
					), 
					hoverItem, 
					Sprite({frame: frame, imageSrc: this.props.currentSprite})
				)
			)
		);
	}
});

module.exports = Player;
},{"../itemIcon/itemIcon.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemIcon\\itemIcon.jsx","./sprite/sprite.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\sprite\\sprite.jsx"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\sprite\\sprite.jsx":[function(require,module,exports){
/** @jsx React.DOM */
var React = window.React;
var _ = window._;
var cx = React.addons.classSet;

var Sprite = React.createClass({displayName: 'Sprite',
	img : null,

	getDefaultProps: function() {
		return {
			frame : 0,
			frameOffset : 84,
			imageSrc : ''
		};
	},

	componentDidMount: function() {
		var self = this;
		this.img = new Image();
		this.img.src = this.props.imageSrc;
		this.img.onload = function(){
			self.draw();
		}

	},

	componentWillReceiveProps : function(nextProps){
		var self = this;
		if(nextProps.imageSrc !== this.props.imageSrc){
			this.img = new Image();
			this.img.src = nextProps.imageSrc;
			this.img.onload = function(){
				self.draw();
			}
		}else{
			this.draw(nextProps);
		}
	},

	draw : function(props){
		props = props || this.props;
		var canvas = this.refs.canvas.getDOMNode();
		var ctx = canvas.getContext('2d');

		ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(this.img,
			props.frame * -1 * props.frameOffset,
			0,
			this.img.width * 4,
			this.img.height * 4
		);
	},

	render : function(){
		var self = this;
		return(
			React.DOM.div({className: "sprite"}, 
				React.DOM.canvas({ref: "canvas"})
			)
		);
	}
});

module.exports = Sprite;
},{}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\timeline\\timeline.jsx":[function(require,module,exports){
/** @jsx React.DOM */
var React = window.React;
var _ = window._;
var cx = React.addons.classSet;


var Item = require('../itemIcon/itemIcon.jsx');

var Timeline = React.createClass({displayName: 'Timeline',

	backgroundPosition : 0,

	getDefaultProps: function() {
		return {
			scroll : 0
		};
	},

	componentWillReceiveProps: function(nextProps) {

		if(!this.props.currentItem){
			this.backgroundPosition += nextProps.scroll - this.props.scroll;
		}
	},

	render : function(){
		var self = this;
		var config = this.props.config;

		var TOP_OFFSET = 300;



		//console.log((moment().unix() -start.unix())/ (end.unix() - start.unix()));


		var numDays = moment().diff(config.start, 'days') + 1;


		var markers = _.times(moment().diff(config.start, 'days') + 1, function(day){
			return React.DOM.div({className: "marker", key: day, style: {top: config.dayPixelRatio * day + TOP_OFFSET}}, 
				moment(config.start).add(day, 'days').format('MMM Do')
				)
		});


		var items = _.reduce(config.events, function(r, event){

			var date = moment(event.date, "MMM Do, YYYY");


			if(date.unix() > self.props.scrollDay.unix()){

				var days = date.diff(config.start, 'days');

				r.push(Item({item: event, key: event.date.format(), style: {top: config.dayPixelRatio * days + TOP_OFFSET}}, 
					React.DOM.i({className: 'fa ' + event.icon})
				))

			}

			return r;
		},[]);


		var backgroundStyle = {};

			backgroundStyle={
				"background-position-y" : -this.backgroundPosition
			}



		return(
			React.DOM.div({className: "timeline", style: {height : numDays * config.dayPixelRatio}}, 

				markers, 
				items, 
				React.DOM.div({className: "background", style: backgroundStyle}), 
				React.DOM.div({className: "topGradient"}), 
				React.DOM.div({className: "bottomGradient"})


			)
		);
	}
});

module.exports = Timeline;
},{"../itemIcon/itemIcon.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemIcon\\itemIcon.jsx"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\topSection\\topSection.jsx":[function(require,module,exports){
/** @jsx React.DOM */
var React = window.React;
var _ = window._;
var cx = React.addons.classSet;
var Moment = window.moment;

var getTimeOfDay = function(){
	var hour = (new Date).getHours();
	if(8  <= hour && hour < 18){ return 'day'; }
	else if(18 <= hour && hour < 20){ return 'dusk'; }
	else if(6 <= hour && hour < 8){ return 'dawn'; }
	else{ return 'night'; }
}

var TopSection = React.createClass({displayName: 'TopSection',
	getDefaultProps: function() {
		return {
			scroll : 0,
			isDayTime : (8 <=(new Date).getHours()) && ((new Date).getHours() <= 20)
		};
	},

	getInitialState: function() {
		return {
			backgroundPosition : 0
		};
	},

	componentDidMount: function() {
		var self = this;
		setInterval(function(){
			self.setState({
				backgroundPosition : self.state.backgroundPosition + 1
			})
		}, 100);
	},

	render : function(){
		var self = this;
		var config = this.props.config;
		var percentage = (Moment().diff(config.start, 'days')) / ( config.end.diff(config.start, 'days'));

		return(
			React.DOM.div({className: 'topSection ' + getTimeOfDay(), 
				 style: {'background-position-x' : this.state.backgroundPosition}}, 
				React.DOM.div({className: "startMessage"}, 
					React.DOM.div(null, "Scroll to start her adventure"), 
					React.DOM.img({className: "downArrow", src: "/assets/lpdoc/topSection/down_arrow.png"})
				), 
				React.DOM.div({className: "title"}, 
					"How Much is LP a Doctor?"
				), 
				React.DOM.div({className: "subtitle"}, 
					"An Interactive adventure!"
				), 
				React.DOM.div({className: "topPercentage"}, 
					React.DOM.div(null, Math.round(percentage * 10000) / 100, "%"), 
					React.DOM.img({src: "/assets/lpdoc/sparkle.gif"})
				), 
				React.DOM.div({className: "bottomGradient"})
			)
		);
	}
});

module.exports = TopSection;
},{}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xccmVjb2lsXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImNsaWVudFxcbHBkb2NcXGxwZG9jLmpzeCIsImNsaWVudFxcbHBkb2NcXGl0ZW1CYXJcXGl0ZW1CYXIuanN4IiwiY2xpZW50XFxscGRvY1xcaXRlbUljb25cXGl0ZW1JY29uLmpzeCIsImNsaWVudFxcbHBkb2NcXHBsYXllclxccGxheWVyLmpzeCIsImNsaWVudFxcbHBkb2NcXHBsYXllclxcc3ByaXRlXFxzcHJpdGUuanN4IiwiY2xpZW50XFxscGRvY1xcdGltZWxpbmVcXHRpbWVsaW5lLmpzeCIsImNsaWVudFxcbHBkb2NcXHRvcFNlY3Rpb25cXHRvcFNlY3Rpb24uanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gd2luZG93LlJlYWN0O1xudmFyIF8gPSB3aW5kb3cuXztcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbnZhciAkID0gd2luZG93LmpRdWVyeTtcblxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyL3BsYXllci5qc3gnKTtcbnZhciBJdGVtQmFyID0gcmVxdWlyZSgnLi9pdGVtQmFyL2l0ZW1CYXIuanN4Jyk7XG52YXIgVGltZWxpbmUgPSByZXF1aXJlKCcuL3RpbWVsaW5lL3RpbWVsaW5lLmpzeCcpO1xudmFyIFRvcFNlY3Rpb24gPSByZXF1aXJlKCcuL3RvcFNlY3Rpb24vdG9wU2VjdGlvbi5qc3gnKTtcblxuXG5cbnZhciBzcHJpdGVzID0ge1xuXHRiYXNlICAgICAgICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL2Jhc2UucG5nJyxcblx0d2hpdGVfY29hdCAgICAgICA6ICdhc3NldHMvbHBkb2MvcGxheWVyL3Nwcml0ZS93aGl0ZV9jb2F0LnBuZycsXG5cdHdoaXRlX2NvYXRfc2NvcGUgOiAnYXNzZXRzL2xwZG9jL3BsYXllci9zcHJpdGUvd2hpdGVfY29hdF9zY29wZS5wbmcnLFxuXHRzaG9ydF9oYWlyICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL3Nob3J0X2hhaXIucG5nJyxcblx0c2hhdmVfaGFpciAgICAgICA6ICdhc3NldHMvbHBkb2MvcGxheWVyL3Nwcml0ZS9zaGF2ZV9oYWlyLnBuZydcbn07XG5cblxuXG5cbnZhciBscGRvYyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2xwZG9jJyxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjb25maWcgOiBudWxsLFxuXHRcdFx0c2Nyb2xsOiAwLFxuXHRcdH07XG5cdH0sXG5cblx0Ly9Db252ZXJ0cyBkYXRlcyB3aXRoaW4gdGhlIGNvbmZpZyB0byBtb21lbnQgZGF0YSBzdHJ1Y3R1cmVzXG5cdHByb2Nlc3NDb25maWcgOiBmdW5jdGlvbihjb25maWcpe1xuXHRcdGNvbmZpZy5zdGFydCA9IG1vbWVudChjb25maWcuc3RhcnQsIFwiTU1NIERvLCBZWVlZXCIpO1xuXHRcdGNvbmZpZy5lbmQgPSBtb21lbnQoY29uZmlnLmVuZCwgXCJNTU0gRG8sIFlZWVlcIik7XG5cdFx0Y29uZmlnLmxhc3RTcHJpdGUgPSBzcHJpdGVzLmJhc2U7XG5cdFx0Y29uZmlnLmV2ZW50cyA9IF8ubWFwKGNvbmZpZy5ldmVudHMsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdGV2ZW50LmRhdGUgPSBtb21lbnQoZXZlbnQuZGF0ZSwgXCJNTU0gRG8sIFlZWVlcIik7XG5cdFx0XHRpZihldmVudC5scF9zcHJpdGUpe1xuXHRcdFx0XHRjb25maWcubGFzdFNwcml0ZSA9IHNwcml0ZXNbZXZlbnQubHBfc3ByaXRlXTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ3Nwcml0ZScsIGNvbmZpZy5sYXN0U3ByaXRlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBldmVudDtcblx0XHR9KTtcblx0XHRyZXR1cm4gY29uZmlnO1xuXHR9LFxuXG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKHNjcm9sbCwgY29uZmlnKXtcblx0XHR2YXIgY29uZmlnID0gY29uZmlnIHx8IHRoaXMuc3RhdGUuY29uZmlnO1xuXG5cdFx0Ly91cGRhdGUgc2Nyb2xsLCBudW1iZXIgb2YgZGF5cyBwYXNzZWQsIGl0ZW1zIGNvbGxlY3RlZCwgY3VycmVudCBpdGVtXG5cdFx0dmFyIHNjcm9sbERheSA9IG1vbWVudChjb25maWcuc3RhcnQpLmFkZChNYXRoLmZsb29yKHNjcm9sbCAvIGNvbmZpZy5kYXlQaXhlbFJhdGlvKSwgJ2RheXMnKTtcblx0XHR2YXIgY3VycmVudEl0ZW0sIGN1cnJlbnRTcHJpdGUgPSBzcHJpdGVzLmJhc2U7XG5cdFx0dmFyIGl0ZW1zQ29sbGVjdGVkID0gXy5yZWR1Y2UoY29uZmlnLmV2ZW50cywgZnVuY3Rpb24ociwgZXZlbnQpe1xuXHRcdFx0aWYoZXZlbnQuZGF0ZS51bml4KCkgPD0gc2Nyb2xsRGF5LnVuaXgoKSl7XG5cdFx0XHRcdHIucHVzaChldmVudCk7XG5cdFx0XHRcdGlmKGV2ZW50LmxwX3Nwcml0ZSkgY3VycmVudFNwcml0ZSA9IHNwcml0ZXNbZXZlbnQubHBfc3ByaXRlXTtcblx0XHRcdH1cblx0XHRcdGlmKGV2ZW50LmRhdGUuZGlmZihzY3JvbGxEYXksICdkYXlzJykgPT09IDApIGN1cnJlbnRJdGVtID0gZXZlbnQ7XG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9LFtdKTtcblxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Y29uZmlnIDogY29uZmlnLFxuXHRcdFx0c2Nyb2xsIDogc2Nyb2xsLFxuXHRcdFx0c2Nyb2xsRGF5IDogc2Nyb2xsRGF5LFxuXHRcdFx0aXRlbXNDb2xsZWN0ZWQgOiBpdGVtc0NvbGxlY3RlZCxcblx0XHRcdGN1cnJlbnRJdGVtIDogY3VycmVudEl0ZW0sXG5cdFx0XHRjdXJyZW50U3ByaXRlIDogY3VycmVudFNwcml0ZSxcblx0XHRcdHBlcmNlbnRhZ2UgOiAoc2Nyb2xsIC8gY29uZmlnLmRheVBpeGVsUmF0aW8pIC8gKCBjb25maWcuZW5kLmRpZmYoY29uZmlnLnN0YXJ0LCAnZGF5cycpKVxuXHRcdH0pO1xuXHR9LFxuXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0JC5nZXRKU09OKCdodHRwczovL3Jhd2dpdC5jb20vc3RvbGtzZG9yZi9scGRvYy9tYXN0ZXIvbHBkb2NfY29uZmlnLmpzb24nLCBmdW5jdGlvbihjb25maWcpe1xuXHRcdFx0c2VsZi51cGRhdGUoMCwgc2VsZi5wcm9jZXNzQ29uZmlnKGNvbmZpZykpXG5cdFx0fSlcblxuXHRcdCQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0c2VsZi51cGRhdGUod2luZG93LnBhZ2VZT2Zmc2V0KTtcblx0XHR9KTtcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdC8vRG9uJ3QgbG9hZCBhbnl0aGluZyBpZiB3ZSBkb24ndCBoYXZlIHRoZSBjb25maWdcblx0XHRpZighdGhpcy5zdGF0ZS5jb25maWcpIHJldHVybiBSZWFjdC5ET00ubm9zY3JpcHQobnVsbClcblxuXHRcdGNvbnNvbGUubG9nKCdURVNUJyx0aGlzLnN0YXRlLmNvbmZpZyk7XG5cblx0XHR2YXIgcGVyY2VudGFnZTtcblx0XHRpZih0aGlzLnN0YXRlLnNjcm9sbCAhPT0gMCl7XG5cdFx0XHRwZXJjZW50YWdlID0gKFxuXHRcdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGVyY2VudGFnZVwifSwgXG5cdFx0XHRcdFx0TWF0aC5yb3VuZCh0aGlzLnN0YXRlLnBlcmNlbnRhZ2UgKiAxMDAwMCkgLyAxMDAsIFwiJVwiXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0UmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxwZG9jXCJ9LCBcblx0XHRcdFx0VG9wU2VjdGlvbih7XG5cdFx0XHRcdFx0Y29uZmlnOiB0aGlzLnN0YXRlLmNvbmZpZywgXG5cdFx0XHRcdFx0c2Nyb2xsOiB0aGlzLnN0YXRlLnNjcm9sbCwgXG5cdFx0XHRcdFx0cGVyY2VudGFnZTogdGhpcy5zdGF0ZS5wZXJjZW50YWdlfSksIFxuXG5cdFx0XHRcdFBsYXllcih7XG5cdFx0XHRcdFx0Y3VycmVudFNwcml0ZTogdGhpcy5zdGF0ZS5jdXJyZW50U3ByaXRlLCBcblx0XHRcdFx0XHRjdXJyZW50SXRlbTogdGhpcy5zdGF0ZS5jdXJyZW50SXRlbSwgXG5cdFx0XHRcdFx0Y29uZmlnOiB0aGlzLnN0YXRlLmNvbmZpZywgXG5cdFx0XHRcdFx0c2Nyb2xsOiB0aGlzLnN0YXRlLnNjcm9sbH0pLCBcblxuXG5cblxuXHRcdFx0XHRUaW1lbGluZSh7XG5cdFx0XHRcdFx0aXRlbXNDb2xsZWN0ZWQ6IHRoaXMuc3RhdGUuaXRlbXNDb2xsZWN0ZWQsIFxuXHRcdFx0XHRcdGN1cnJlbnRJdGVtOiB0aGlzLnN0YXRlLmN1cnJlbnRJdGVtLCBcblx0XHRcdFx0XHRzY3JvbGxEYXk6IHRoaXMuc3RhdGUuc2Nyb2xsRGF5LCBcblx0XHRcdFx0XHRjb25maWc6IHRoaXMuc3RhdGUuY29uZmlnLCBcblx0XHRcdFx0XHRzY3JvbGw6IHRoaXMuc3RhdGUuc2Nyb2xsfSksIFxuXG5cblx0XHRcdFx0SXRlbUJhcih7aXRlbXM6IHRoaXMuc3RhdGUuaXRlbXNDb2xsZWN0ZWQsIFxuXHRcdFx0XHRcdFx0IGNvbmZpZzogdGhpcy5zdGF0ZS5jb25maWcsIFxuXHRcdFx0XHRcdFx0IHNjcm9sbDogdGhpcy5zdGF0ZS5zY3JvbGx9KSwgXG5cblx0XHRcdFx0cGVyY2VudGFnZVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxwZG9jO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSB3aW5kb3cuUmVhY3Q7XG52YXIgXyA9IHdpbmRvdy5fO1xudmFyICQgPSB3aW5kb3cualF1ZXJ5O1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG52YXIgSXRlbUJhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0l0ZW1CYXInLFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzZWxlY3RlZEl0ZW0gOiBudWxsLFxuXHRcdFx0aXRlbXMgOiBbXVxuXHRcdH07XG5cdH0sXG5cblx0Ly9UaGlzIG1ha2VzIHBpY2tpbmcgdXAgaXRlbXMgXCJzdGlja3lcIi5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG5cdFx0aWYobmV4dFByb3BzLml0ZW1zLmxlbmd0aCA+IHRoaXMuc3RhdGUuaXRlbXMubGVuZ3RoKXtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpdGVtcyA6IG5leHRQcm9wcy5pdGVtc1xuXHRcdFx0fSlcblx0XHR9XG5cdH0sXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGl0ZW1zIDogW11cblx0XHR9O1xuXHR9LFxuXHRjbGlja0l0ZW0gOiBmdW5jdGlvbihpdGVtKXtcblx0XHR2YXIgdGltZSA9IE1hdGguYWJzKGRhdGVUb1BpeGVsKGl0ZW0uZGF0ZSwgdGhpcy5wcm9wcy5jb25maWcpIC0gdGhpcy5wcm9wcy5zY3JvbGwpICogMC41O1xuXHRcdGlmKHRpbWUgPiA1MDAwKSB0aW1lID0gNTAwMDtcblx0XHQkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHtcblx0XHRcdHNjcm9sbFRvcDogZGF0ZVRvUGl4ZWwoaXRlbS5kYXRlLCB0aGlzLnByb3BzLmNvbmZpZylcblx0XHR9LCB0aW1lKTtcblx0fSxcblx0c2VsZWN0SXRlbSA6IGZ1bmN0aW9uKGl0ZW0pe1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogaXRlbVxuXHRcdH0pO1xuXHR9LFxuXHRkZXNlbGVjdEl0ZW0gOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogbnVsbFxuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXG5cdFx0aWYodGhpcy5zdGF0ZS5pdGVtcy5sZW5ndGggPT09IDApIHJldHVybiBSZWFjdC5ET00ubm9zY3JpcHQobnVsbCk7XG5cblx0XHR2YXIgaXRlbXMgPSBfLm1hcCh0aGlzLnN0YXRlLml0ZW1zLCBmdW5jdGlvbihpdGVtLCBpbmRleCl7XG5cdFx0XHRyZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIml0ZW1cIiwga2V5OiBpbmRleCwgXG5cdFx0XHRcdFx0XHRvbkNsaWNrOiBzZWxmLmNsaWNrSXRlbS5iaW5kKHNlbGYsIGl0ZW0pLCBcblx0XHRcdFx0XHRcdG9uTW91c2VFbnRlcjogc2VsZi5zZWxlY3RJdGVtLmJpbmQoc2VsZiwgaXRlbSksIFxuXHRcdFx0XHRcdFx0b25Nb3VzZUxlYXZlOiBzZWxmLmRlc2VsZWN0SXRlbS5iaW5kKHNlbGYsIGl0ZW0pfSwgXG5cdFx0XHRcdFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6ICdmYSBmYS1mdyAnICsgaXRlbS5pY29ufSlcblx0XHRcdClcblx0XHR9KTtcblxuXG5cdFx0dmFyIHpvb21DbGFzcyA9ICdzdGFuZGFyZCdcblx0XHRpZihpdGVtcy5sZW5ndGggPiAxMikgem9vbUNsYXNzID0gJ21pbmknO1xuXHRcdGlmKGl0ZW1zLmxlbmd0aCA+IDMyKSB6b29tQ2xhc3MgPSAnc3VwZXJfbWluaSc7XG5cblxuXHRcdHZhciBkZXNjcmlwdGlvbkJveDtcblx0XHRpZih0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbSl7XG5cdFx0XHRkZXNjcmlwdGlvbkJveCA9IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJkZXNjcmlwdGlvbkJveFwifSwgXG5cdFx0XHRcdFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpdGVtTmFtZVwifSwgdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW0ubmFtZSksIFxuXHRcdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaXRlbURhdGVcIn0sIHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLmRhdGUuZm9ybWF0KFwiTU1NIERvLCBZWVlZXCIpKSwgXG5cdFx0XHRcdFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpdGVtRGVzY3JpcHRpb25cIn0sIHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLmRlc2MpXG5cdFx0XHQpXG5cdFx0fVxuXG5cblx0XHRyZXR1cm4oXG5cdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaXRlbUFyZWFcIn0sIFxuXHRcdFx0XHRkZXNjcmlwdGlvbkJveCwgXG5cdFx0XHRcdFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogJ2l0ZW1CYXIgJyArIHpvb21DbGFzc30sIFxuXHRcdFx0XHRcdFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpdGVtVGl0bGVcIn0sIFwiSXRlbXMgY29sbGVjdGVkXCIpLCBcblx0XHRcdFx0XHRpdGVtc1xuXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtQmFyO1xuXG5cbnZhciBkYXRlVG9QaXhlbCA9IGZ1bmN0aW9uKGRhdGUsIGNvbmZpZyl7XG5cdHJldHVybiBkYXRlLmRpZmYoY29uZmlnLnN0YXJ0LCAnZGF5cycpICogY29uZmlnLmRheVBpeGVsUmF0aW87XG59IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSB3aW5kb3cuUmVhY3Q7XG52YXIgXyA9IHdpbmRvdy5fO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG52YXIgSXRlbUljb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJdGVtSWNvbicsXG5cblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGl0ZW0gPSB0aGlzLnByb3BzLml0ZW07XG5cdFx0cmV0dXJuKFxuXHRcdFx0UmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIml0ZW1JY29uXCIsIHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlfSwgXG5cdFx0XHRcdFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtZncgXCIgKyBpdGVtLmljb259KVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1JY29uOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gd2luZG93LlJlYWN0O1xudmFyIF8gPSB3aW5kb3cuXztcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbnZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG5cbnZhciBTcHJpdGUgPSByZXF1aXJlKCcuL3Nwcml0ZS9zcHJpdGUuanN4Jyk7XG52YXIgSXRlbUljb24gPSByZXF1aXJlKCcuLi9pdGVtSWNvbi9pdGVtSWNvbi5qc3gnKTtcblxuXG52YXIgUGxheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUGxheWVyJyxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzY3JvbGwgOiAwLFxuXHRcdFx0Y3VycmVudEl0ZW0gOiBudWxsLFxuXHRcdFx0cGVyY2VudGFnZSA6IDBcblx0XHR9O1xuXHR9LFxuXG5cdHJlbmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0dmFyIGZyYW1lID0gTWF0aC5mbG9vcih0aGlzLnByb3BzLnNjcm9sbCAvIDE1MCkgJSA4O1xuXG5cdFx0dmFyIGl0ZW1CYW5uZXIgPSBbXSwgaG92ZXJJdGVtO1xuXHRcdGlmKHRoaXMucHJvcHMuY3VycmVudEl0ZW0pe1xuXHRcdFx0ZnJhbWUgPSA4O1xuXHRcdFx0aXRlbUJhbm5lciA9IChcblx0XHRcdFx0UmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIml0ZW1CYW5uZXJcIiwga2V5OiB0aGlzLnByb3BzLmN1cnJlbnRJdGVtLmRhdGV9LCBcblx0XHRcdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibmFtZVwifSwgdGhpcy5wcm9wcy5jdXJyZW50SXRlbS5uYW1lKSwgXG5cdFx0XHRcdFx0UmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImRlc2NcIn0sIHRoaXMucHJvcHMuY3VycmVudEl0ZW0uZGVzYylcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHRcdGhvdmVySXRlbSA9IChcblx0XHRcdFx0UmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImhvdmVySXRlbVwifSwgXG5cdFx0XHRcdFx0SXRlbUljb24oe2l0ZW06IHRoaXMucHJvcHMuY3VycmVudEl0ZW19KSwgXG5cdFx0XHRcdFx0UmVhY3QuRE9NLmltZyh7c3JjOiBcIi9hc3NldHMvbHBkb2Mvc3BhcmtsZS5naWZcIn0pXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmKHRoaXMucHJvcHMuc2Nyb2xsID09PSAwKXtcblx0XHRcdGZyYW1lID0gODtcblx0XHRcdC8vZml4XG5cdFx0XHR0aGlzLnByb3BzLmN1cnJlbnRTcHJpdGUgPSB0aGlzLnByb3BzLmNvbmZpZy5sYXN0U3ByaXRlO1xuXHRcdH1cblxuXHRcdHJldHVybihcblx0XHRcdFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwbGF5ZXJcIn0sIFxuXHRcdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29udGFpbmVyXCJ9LCBcblx0XHRcdFx0XHRSZWFjdENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6IFwiZmFkZVwifSwgXG5cdFx0XHRcdFx0XHRpdGVtQmFubmVyXG5cdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0aG92ZXJJdGVtLCBcblx0XHRcdFx0XHRTcHJpdGUoe2ZyYW1lOiBmcmFtZSwgaW1hZ2VTcmM6IHRoaXMucHJvcHMuY3VycmVudFNwcml0ZX0pXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSB3aW5kb3cuUmVhY3Q7XG52YXIgXyA9IHdpbmRvdy5fO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG52YXIgU3ByaXRlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU3ByaXRlJyxcblx0aW1nIDogbnVsbCxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRmcmFtZSA6IDAsXG5cdFx0XHRmcmFtZU9mZnNldCA6IDg0LFxuXHRcdFx0aW1hZ2VTcmMgOiAnJ1xuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IHRoaXMucHJvcHMuaW1hZ2VTcmM7XG5cdFx0dGhpcy5pbWcub25sb2FkID0gZnVuY3Rpb24oKXtcblx0XHRcdHNlbGYuZHJhdygpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgOiBmdW5jdGlvbihuZXh0UHJvcHMpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRpZihuZXh0UHJvcHMuaW1hZ2VTcmMgIT09IHRoaXMucHJvcHMuaW1hZ2VTcmMpe1xuXHRcdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHRcdHRoaXMuaW1nLnNyYyA9IG5leHRQcm9wcy5pbWFnZVNyYztcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHNlbGYuZHJhdygpO1xuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5kcmF3KG5leHRQcm9wcyk7XG5cdFx0fVxuXHR9LFxuXG5cdGRyYXcgOiBmdW5jdGlvbihwcm9wcyl7XG5cdFx0cHJvcHMgPSBwcm9wcyB8fCB0aGlzLnByb3BzO1xuXHRcdHZhciBjYW52YXMgPSB0aGlzLnJlZnMuY2FudmFzLmdldERPTU5vZGUoKTtcblx0XHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0XHRjdHguY2xlYXJSZWN0ICggMCAsIDAgLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQgKTtcblx0XHRjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZyxcblx0XHRcdHByb3BzLmZyYW1lICogLTEgKiBwcm9wcy5mcmFtZU9mZnNldCxcblx0XHRcdDAsXG5cdFx0XHR0aGlzLmltZy53aWR0aCAqIDQsXG5cdFx0XHR0aGlzLmltZy5oZWlnaHQgKiA0XG5cdFx0KTtcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRyZXR1cm4oXG5cdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic3ByaXRlXCJ9LCBcblx0XHRcdFx0UmVhY3QuRE9NLmNhbnZhcyh7cmVmOiBcImNhbnZhc1wifSlcblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGU7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSB3aW5kb3cuUmVhY3Q7XG52YXIgXyA9IHdpbmRvdy5fO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5cbnZhciBJdGVtID0gcmVxdWlyZSgnLi4vaXRlbUljb24vaXRlbUljb24uanN4Jyk7XG5cbnZhciBUaW1lbGluZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1RpbWVsaW5lJyxcblxuXHRiYWNrZ3JvdW5kUG9zaXRpb24gOiAwLFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDBcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuXG5cdFx0aWYoIXRoaXMucHJvcHMuY3VycmVudEl0ZW0pe1xuXHRcdFx0dGhpcy5iYWNrZ3JvdW5kUG9zaXRpb24gKz0gbmV4dFByb3BzLnNjcm9sbCAtIHRoaXMucHJvcHMuc2Nyb2xsO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cblx0XHR2YXIgVE9QX09GRlNFVCA9IDMwMDtcblxuXG5cblx0XHQvL2NvbnNvbGUubG9nKChtb21lbnQoKS51bml4KCkgLXN0YXJ0LnVuaXgoKSkvIChlbmQudW5peCgpIC0gc3RhcnQudW5peCgpKSk7XG5cblxuXHRcdHZhciBudW1EYXlzID0gbW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxO1xuXG5cblx0XHR2YXIgbWFya2VycyA9IF8udGltZXMobW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxLCBmdW5jdGlvbihkYXkpe1xuXHRcdFx0cmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJtYXJrZXJcIiwga2V5OiBkYXksIHN0eWxlOiB7dG9wOiBjb25maWcuZGF5UGl4ZWxSYXRpbyAqIGRheSArIFRPUF9PRkZTRVR9fSwgXG5cdFx0XHRcdG1vbWVudChjb25maWcuc3RhcnQpLmFkZChkYXksICdkYXlzJykuZm9ybWF0KCdNTU0gRG8nKVxuXHRcdFx0XHQpXG5cdFx0fSk7XG5cblxuXHRcdHZhciBpdGVtcyA9IF8ucmVkdWNlKGNvbmZpZy5ldmVudHMsIGZ1bmN0aW9uKHIsIGV2ZW50KXtcblxuXHRcdFx0dmFyIGRhdGUgPSBtb21lbnQoZXZlbnQuZGF0ZSwgXCJNTU0gRG8sIFlZWVlcIik7XG5cblxuXHRcdFx0aWYoZGF0ZS51bml4KCkgPiBzZWxmLnByb3BzLnNjcm9sbERheS51bml4KCkpe1xuXG5cdFx0XHRcdHZhciBkYXlzID0gZGF0ZS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKTtcblxuXHRcdFx0XHRyLnB1c2goSXRlbSh7aXRlbTogZXZlbnQsIGtleTogZXZlbnQuZGF0ZS5mb3JtYXQoKSwgc3R5bGU6IHt0b3A6IGNvbmZpZy5kYXlQaXhlbFJhdGlvICogZGF5cyArIFRPUF9PRkZTRVR9fSwgXG5cdFx0XHRcdFx0UmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogJ2ZhICcgKyBldmVudC5pY29ufSlcblx0XHRcdFx0KSlcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9LFtdKTtcblxuXG5cdFx0dmFyIGJhY2tncm91bmRTdHlsZSA9IHt9O1xuXG5cdFx0XHRiYWNrZ3JvdW5kU3R5bGU9e1xuXHRcdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teVwiIDogLXRoaXMuYmFja2dyb3VuZFBvc2l0aW9uXG5cdFx0XHR9XG5cblxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0UmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRpbWVsaW5lXCIsIHN0eWxlOiB7aGVpZ2h0IDogbnVtRGF5cyAqIGNvbmZpZy5kYXlQaXhlbFJhdGlvfX0sIFxuXG5cdFx0XHRcdG1hcmtlcnMsIFxuXHRcdFx0XHRpdGVtcywgXG5cdFx0XHRcdFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJiYWNrZ3JvdW5kXCIsIHN0eWxlOiBiYWNrZ3JvdW5kU3R5bGV9KSwgXG5cdFx0XHRcdFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0b3BHcmFkaWVudFwifSksIFxuXHRcdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYm90dG9tR3JhZGllbnRcIn0pXG5cblxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVsaW5lOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gd2luZG93LlJlYWN0O1xudmFyIF8gPSB3aW5kb3cuXztcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbnZhciBNb21lbnQgPSB3aW5kb3cubW9tZW50O1xuXG52YXIgZ2V0VGltZU9mRGF5ID0gZnVuY3Rpb24oKXtcblx0dmFyIGhvdXIgPSAobmV3IERhdGUpLmdldEhvdXJzKCk7XG5cdGlmKDggIDw9IGhvdXIgJiYgaG91ciA8IDE4KXsgcmV0dXJuICdkYXknOyB9XG5cdGVsc2UgaWYoMTggPD0gaG91ciAmJiBob3VyIDwgMjApeyByZXR1cm4gJ2R1c2snOyB9XG5cdGVsc2UgaWYoNiA8PSBob3VyICYmIGhvdXIgPCA4KXsgcmV0dXJuICdkYXduJzsgfVxuXHRlbHNleyByZXR1cm4gJ25pZ2h0JzsgfVxufVxuXG52YXIgVG9wU2VjdGlvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1RvcFNlY3Rpb24nLFxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzY3JvbGwgOiAwLFxuXHRcdFx0aXNEYXlUaW1lIDogKDggPD0obmV3IERhdGUpLmdldEhvdXJzKCkpICYmICgobmV3IERhdGUpLmdldEhvdXJzKCkgPD0gMjApXG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRiYWNrZ3JvdW5kUG9zaXRpb24gOiAwXG5cdFx0fTtcblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG5cdFx0XHRzZWxmLnNldFN0YXRlKHtcblx0XHRcdFx0YmFja2dyb3VuZFBvc2l0aW9uIDogc2VsZi5zdGF0ZS5iYWNrZ3JvdW5kUG9zaXRpb24gKyAxXG5cdFx0XHR9KVxuXHRcdH0sIDEwMCk7XG5cdH0sXG5cblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXHRcdHZhciBwZXJjZW50YWdlID0gKE1vbWVudCgpLmRpZmYoY29uZmlnLnN0YXJ0LCAnZGF5cycpKSAvICggY29uZmlnLmVuZC5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSk7XG5cblx0XHRyZXR1cm4oXG5cdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6ICd0b3BTZWN0aW9uICcgKyBnZXRUaW1lT2ZEYXkoKSwgXG5cdFx0XHRcdCBzdHlsZTogeydiYWNrZ3JvdW5kLXBvc2l0aW9uLXgnIDogdGhpcy5zdGF0ZS5iYWNrZ3JvdW5kUG9zaXRpb259fSwgXG5cdFx0XHRcdFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzdGFydE1lc3NhZ2VcIn0sIFxuXHRcdFx0XHRcdFJlYWN0LkRPTS5kaXYobnVsbCwgXCJTY3JvbGwgdG8gc3RhcnQgaGVyIGFkdmVudHVyZVwiKSwgXG5cdFx0XHRcdFx0UmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImRvd25BcnJvd1wiLCBzcmM6IFwiL2Fzc2V0cy9scGRvYy90b3BTZWN0aW9uL2Rvd25fYXJyb3cucG5nXCJ9KVxuXHRcdFx0XHQpLCBcblx0XHRcdFx0UmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRpdGxlXCJ9LCBcblx0XHRcdFx0XHRcIkhvdyBNdWNoIGlzIExQIGEgRG9jdG9yP1wiXG5cdFx0XHRcdCksIFxuXHRcdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic3VidGl0bGVcIn0sIFxuXHRcdFx0XHRcdFwiQW4gSW50ZXJhY3RpdmUgYWR2ZW50dXJlIVwiXG5cdFx0XHRcdCksIFxuXHRcdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidG9wUGVyY2VudGFnZVwifSwgXG5cdFx0XHRcdFx0UmVhY3QuRE9NLmRpdihudWxsLCBNYXRoLnJvdW5kKHBlcmNlbnRhZ2UgKiAxMDAwMCkgLyAxMDAsIFwiJVwiKSwgXG5cdFx0XHRcdFx0UmVhY3QuRE9NLmltZyh7c3JjOiBcIi9hc3NldHMvbHBkb2Mvc3BhcmtsZS5naWZcIn0pXG5cdFx0XHRcdCksIFxuXHRcdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYm90dG9tR3JhZGllbnRcIn0pXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9wU2VjdGlvbjsiXX0=
