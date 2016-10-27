require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemBar\\itemBar.jsx":[function(require,module,exports){
'use strict';

var React = require('react');
var _ = require('lodash');
//var $ = require('jquery');
var cx = require('classnames');

var ItemBar = React.createClass({
	displayName: 'ItemBar',

	getInitialState: function getInitialState() {
		return {
			selectedItem: null,
			items: []
		};
	},

	//This makes picking up items "sticky".
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (nextProps.items.length > this.state.items.length) {
			this.setState({
				items: nextProps.items
			});
		}
	},
	getDefaultProps: function getDefaultProps() {
		return {
			items: []
		};
	},
	clickItem: function clickItem(item) {
		var time = Math.abs(dateToPixel(item.date, this.props.config) - this.props.scroll) * 0.5;
		if (time > 5000) time = 5000;

		alert('clicked item!');

		/*
  $("html, body").animate({
  	scrollTop: dateToPixel(item.date, this.props.config)
  }, time);
  	*/
	},
	selectItem: function selectItem(item) {
		this.setState({
			selectedItem: item
		});
	},
	deselectItem: function deselectItem() {
		this.setState({
			selectedItem: null
		});
	},
	render: function render() {
		var self = this;

		if (this.state.items.length === 0) return React.createElement('noscript', null);

		var items = _.map(this.state.items, function (item, index) {
			return React.createElement(
				'div',
				{ className: 'item', key: index,
					onClick: self.clickItem.bind(self, item),
					onMouseEnter: self.selectItem.bind(self, item),
					onMouseLeave: self.deselectItem.bind(self, item) },
				React.createElement('i', { className: 'fa fa-fw ' + item.icon })
			);
		});

		var zoomClass = 'standard';
		if (items.length > 12) zoomClass = 'mini';
		if (items.length > 32) zoomClass = 'super_mini';

		var descriptionBox;
		if (this.state.selectedItem) {
			descriptionBox = React.createElement(
				'div',
				{ className: 'descriptionBox' },
				React.createElement(
					'div',
					{ className: 'itemName' },
					this.state.selectedItem.name
				),
				React.createElement(
					'div',
					{ className: 'itemDate' },
					this.state.selectedItem.date.format("MMM Do, YYYY")
				),
				React.createElement(
					'div',
					{ className: 'itemDescription' },
					this.state.selectedItem.desc
				)
			);
		}

		return React.createElement(
			'div',
			{ className: 'itemArea' },
			descriptionBox,
			React.createElement(
				'div',
				{ className: 'itemBar ' + zoomClass },
				React.createElement(
					'div',
					{ className: 'itemTitle' },
					'Items collected'
				),
				items
			)
		);
	}
});

module.exports = ItemBar;

var dateToPixel = function dateToPixel(date, config) {
	return date.diff(config.start, 'days') * config.dayPixelRatio;
};

},{"classnames":"classnames","lodash":"lodash","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemIcon\\itemIcon.jsx":[function(require,module,exports){
'use strict';

var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var ItemIcon = React.createClass({
	displayName: 'ItemIcon',

	render: function render() {
		var self = this;
		var item = this.props.item;
		return React.createElement(
			'div',
			{ className: 'itemIcon', style: this.props.style },
			React.createElement('i', { className: "fa fa-fw " + item.icon })
		);
	}
});

module.exports = ItemIcon;

},{"classnames":"classnames","lodash":"lodash","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\lpdoc.jsx":[function(require,module,exports){
'use strict';

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
	base: 'assets/lpdoc/player/sprite/base.png',
	white_coat: 'assets/lpdoc/player/sprite/white_coat.png',
	white_coat_scope: 'assets/lpdoc/player/sprite/white_coat_scope.png',
	short_hair: 'assets/lpdoc/player/sprite/short_hair.png',
	shave_hair: 'assets/lpdoc/player/sprite/shave_hair.png'
};

var lpdoc = React.createClass({
	displayName: 'lpdoc',

	getDefaultProps: function getDefaultProps() {
		return {
			url: '',
			config: {},
			events: []
		};
	},

	getInitialState: function getInitialState() {
		return this.getUpdatedState(0, this.processConfig(this.props.config));
	},

	//Converts dates within the config to moment data structures
	processConfig: function processConfig(config) {

		config.start = Moment(config.start, "MMM Do, YYYY");
		config.end = Moment(config.end, "MMM Do, YYYY");

		console.log('CORE', config.end.diff(config.start, 'days'));

		config.lastSprite = sprites.base;
		config.events = _.map(config.events, function (event) {
			event.date = Moment(event.date, "MMM Do, YYYY");
			if (event.lp_sprite) {
				config.lastSprite = sprites[event.lp_sprite];
				//console.log('sprite', config.lastSprite);
			}
			return event;
		});
		return config;
	},

	getUpdatedState: function getUpdatedState(scroll, config) {
		var config = config || this.state.config;

		//update scroll, number of days passed, items collected, current item
		var scrollDay = Moment(config.start).add(Math.floor(scroll / config.dayPixelRatio), 'days');
		var currentItem,
		    currentSprite = sprites.base;
		var itemsCollected = _.reduce(config.events, function (r, event) {
			if (event.date.unix() <= scrollDay.unix()) {
				r.push(event);
				if (event.lp_sprite) currentSprite = sprites[event.lp_sprite];
			}
			if (event.date.diff(scrollDay, 'days') === 0) currentItem = event;
			return r;
		}, []);

		return {
			config: config,
			scroll: scroll,
			scrollDay: scrollDay,
			itemsCollected: itemsCollected,
			currentItem: currentItem,
			currentSprite: currentSprite,
			percentage: scroll / config.dayPixelRatio / config.end.diff(config.start, 'days')
		};
	},

	componentDidMount: function componentDidMount() {
		console.log('mounting');
	},

	handleScroll: function handleScroll(e) {
		this.setState(this.getUpdatedState(window.pageYOffset));
	},

	render: function render() {
		var self = this;

		//Don't load anything if we don't have the config
		//if(!this.state.config) return <noscript />

		var percentage;
		if (this.state.scroll !== 0) {
			percentage = React.createElement(
				'div',
				{ className: 'percentage' },
				Math.round(this.state.percentage * 10000) / 100,
				'%'
			);
		}

		return React.createElement(
			'div',
			{ className: 'lpdoc', onScroll: this.handleScroll },
			React.createElement(TopSection, {
				config: this.state.config,
				scroll: this.state.scroll,
				percentage: this.state.percentage }),
			React.createElement(Player, {
				currentSprite: this.state.currentSprite,
				currentItem: this.state.currentItem,
				config: this.state.config,
				scroll: this.state.scroll }),
			React.createElement(Timeline, {
				itemsCollected: this.state.itemsCollected,
				currentItem: this.state.currentItem,
				scrollDay: this.state.scrollDay,
				config: this.state.config,
				scroll: this.state.scroll }),
			React.createElement(ItemBar, { items: this.state.itemsCollected,
				config: this.state.config,
				scroll: this.state.scroll }),
			React.createElement(PointsBar, { items: this.state.itemsCollected }),
			percentage
		);
	}
});

module.exports = lpdoc;

},{"./itemBar/itemBar.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemBar\\itemBar.jsx","./player/player.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\player.jsx","./pointsBar/pointsBar.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\pointsBar\\pointsBar.jsx","./timeline/timeline.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\timeline\\timeline.jsx","./topSection/topSection.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\topSection\\topSection.jsx","classnames":"classnames","lodash":"lodash","moment":"moment","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\player.jsx":[function(require,module,exports){
'use strict';

var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
//var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Sprite = require('./sprite/sprite.jsx');
var ItemIcon = require('../itemIcon/itemIcon.jsx');

var Player = React.createClass({
	displayName: 'Player',

	getDefaultProps: function getDefaultProps() {
		return {
			scroll: 0,
			currentItem: null,
			percentage: 0
		};
	},

	render: function render() {
		var self = this;

		var frame = Math.floor(this.props.scroll / 150) % 8;

		var itemBanner = [],
		    hoverItem;
		if (this.props.currentItem) {
			frame = 8;
			itemBanner = React.createElement(
				'div',
				{ className: 'itemBanner', key: this.props.currentItem.date },
				React.createElement(
					'div',
					{ className: 'name' },
					this.props.currentItem.name
				),
				React.createElement(
					'div',
					{ className: 'desc' },
					this.props.currentItem.desc
				)
			);
			hoverItem = React.createElement(
				'div',
				{ className: 'hoverItem' },
				React.createElement(ItemIcon, { item: this.props.currentItem }),
				React.createElement('img', { src: '/assets/lpdoc/sparkle.gif' })
			);
		}
		if (this.props.scroll === 0) {
			frame = 8;
			//fix
			//this.props.currentSprite = this.props.config.lastSprite;
		}

		return React.createElement(
			'div',
			{ className: 'player' },
			React.createElement(
				'div',
				{ className: 'container' },
				itemBanner,
				hoverItem,
				React.createElement(Sprite, { frame: frame, imageSrc: this.props.currentSprite })
			)
		);
	}
});

module.exports = Player;
/*<ReactCSSTransitionGroup transitionName="fade">*/ /*</ReactCSSTransitionGroup>*/

},{"../itemIcon/itemIcon.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemIcon\\itemIcon.jsx","./sprite/sprite.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\sprite\\sprite.jsx","classnames":"classnames","lodash":"lodash","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\sprite\\sprite.jsx":[function(require,module,exports){
'use strict';

var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Sprite = React.createClass({
	displayName: 'Sprite',

	img: null,

	getDefaultProps: function getDefaultProps() {
		return {
			frame: 0,
			frameOffset: 84,
			imageSrc: ''
		};
	},

	componentDidMount: function componentDidMount() {
		var self = this;
		this.img = new Image();
		this.img.src = this.props.imageSrc;
		this.img.onload = function () {
			self.draw();
		};
	},

	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		var self = this;
		if (nextProps.imageSrc !== this.props.imageSrc) {
			this.img = new Image();
			this.img.src = nextProps.imageSrc;
			this.img.onload = function () {
				self.draw();
			};
		} else {
			this.draw(nextProps);
		}
	},

	draw: function draw(props) {
		props = props || this.props;
		var canvas = this.refs.canvas.getDOMNode();
		var ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(this.img, props.frame * -1 * props.frameOffset, 0, this.img.width * 4, this.img.height * 4);
	},

	render: function render() {
		var self = this;
		return React.createElement(
			'div',
			{ className: 'sprite' },
			React.createElement('canvas', { ref: 'canvas' })
		);
	}
});

module.exports = Sprite;

},{"classnames":"classnames","lodash":"lodash","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\pointsBar\\pointsBar.jsx":[function(require,module,exports){
'use strict';

var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var PointsBar = React.createClass({
	displayName: 'PointsBar',

	getDefaultProps: function getDefaultProps() {
		return {
			items: []
		};
	},

	renderPoints: function renderPoints() {
		var pointsRegex = new RegExp(/[0-9]+ \w+ points/);
		var points = {};
		var temp = _.each(this.props.items, function (item) {
			var desc = item.desc.toLowerCase();
			if (pointsRegex.test(desc)) {
				pointDesc = pointsRegex.exec(desc)[0].split(' ');
				points[pointDesc[1]] = points[pointDesc[1]] || 0;
				points[pointDesc[1]] += pointDesc[0] * 1;
			}
		});
		return _.map(points, function (val, pointName) {
			return React.createElement(
				'div',
				{ className: 'pointRow', key: pointName },
				React.createElement(
					'label',
					null,
					pointName
				),
				' ',
				val
			);
		});
	},

	render: function render() {
		var self = this;
		var points = this.renderPoints();
		if (!points.length) return React.createElement('noscript', null);
		return React.createElement(
			'div',
			{ className: 'pointsBar' },
			React.createElement(
				'div',
				{ className: 'title' },
				'points!'
			),
			points
		);
	}
});

module.exports = PointsBar;

},{"classnames":"classnames","lodash":"lodash","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\timeline\\timeline.jsx":[function(require,module,exports){
'use strict';

var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Moment = require('moment');

var Item = require('../itemIcon/itemIcon.jsx');

var Timeline = React.createClass({
	displayName: 'Timeline',

	backgroundPosition: 0,

	getDefaultProps: function getDefaultProps() {
		return {
			scroll: 0
		};
	},

	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {

		if (!this.props.currentItem) {
			this.backgroundPosition += nextProps.scroll - this.props.scroll;
		}
	},

	render: function render() {
		var self = this;
		var config = this.props.config;

		var TOP_OFFSET = 300;

		//console.log((Moment().unix() -start.unix())/ (end.unix() - start.unix()));

		var numDays = Moment().diff(config.start, 'days') + 1;

		var markers = _.times(Moment().diff(config.start, 'days') + 1, function (day) {
			return React.createElement(
				'div',
				{ className: 'marker', key: day, style: { top: config.dayPixelRatio * day + TOP_OFFSET } },
				Moment(config.start).add(day, 'days').format('MMM Do')
			);
		});

		var items = _.reduce(config.events, function (r, event) {

			var date = Moment(event.date, "MMM Do, YYYY");

			if (date.unix() > self.props.scrollDay.unix()) {

				var days = date.diff(config.start, 'days');

				r.push(React.createElement(
					Item,
					{ item: event, key: event.date.format(), style: { top: config.dayPixelRatio * days + TOP_OFFSET } },
					React.createElement('i', { className: 'fa ' + event.icon })
				));
			}

			return r;
		}, []);

		var backgroundStyle = {};

		backgroundStyle = {
			"background-position-y": -this.backgroundPosition
		};

		return React.createElement(
			'div',
			{ className: 'timeline', style: { height: numDays * config.dayPixelRatio } },
			markers,
			items,
			React.createElement('div', { className: 'background', style: backgroundStyle }),
			React.createElement('div', { className: 'topGradient' }),
			React.createElement('div', { className: 'bottomGradient' })
		);
	}
});

module.exports = Timeline;

},{"../itemIcon/itemIcon.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemIcon\\itemIcon.jsx","classnames":"classnames","lodash":"lodash","moment":"moment","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\topSection\\topSection.jsx":[function(require,module,exports){
'use strict';

var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Moment = require('moment');

var getTimeOfDay = function getTimeOfDay() {
	var hour = new Date().getHours();
	if (8 <= hour && hour < 18) {
		return 'day';
	} else if (18 <= hour && hour < 20) {
		return 'dusk';
	} else if (6 <= hour && hour < 8) {
		return 'dawn';
	} else {
		return 'night';
	}
};

var TopSection = React.createClass({
	displayName: 'TopSection',

	getDefaultProps: function getDefaultProps() {
		return {
			scroll: 0,
			isDayTime: 8 <= new Date().getHours() && new Date().getHours() <= 20
		};
	},

	getInitialState: function getInitialState() {
		return {
			backgroundPosition: 0
		};
	},

	componentDidMount: function componentDidMount() {},

	render: function render() {
		var config = this.props.config;
		var percentage = Moment().diff(config.start, 'days') / config.end.diff(config.start, 'days');

		console.log(config.start, config.end);

		console.log(config.start.diff(config.end));

		console.log(config.end.diff(config.start, 'day'));

		console.log(Moment().diff(config.start, 'days'));
		console.log(Moment().diff(Moment("11-10-2013 09:03 AM", "DD-MM-YYYY hh:mm A"), "minute"));

		return React.createElement(
			'div',
			{ className: 'topSection ' + getTimeOfDay() },
			React.createElement(
				'div',
				{ className: 'startMessage' },
				React.createElement(
					'div',
					null,
					'Scroll to start her adventure'
				),
				React.createElement('img', { className: 'downArrow', src: '/assets/lpdoc/topSection/down_arrow.png' })
			),
			React.createElement(
				'div',
				{ className: 'title' },
				'How Much is LP a Doctor?'
			),
			React.createElement(
				'div',
				{ className: 'subtitle' },
				'An Interactive adventure!'
			),
			React.createElement(
				'div',
				{ className: 'topPercentage' },
				React.createElement(
					'div',
					null,
					Math.round(percentage * 10000) / 100,
					'%'
				),
				React.createElement('img', { src: '/assets/lpdoc/sparkle.gif' })
			),
			React.createElement('div', { className: 'bottomGradient' })
		);
	}
});

module.exports = TopSection;

},{"classnames":"classnames","lodash":"lodash","moment":"moment","react":"react"}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvaXRlbUJhci9pdGVtQmFyLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy9pdGVtSWNvbi9pdGVtSWNvbi5qc3giLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvbHBkb2MuanN4IiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2MvY2xpZW50L2xwZG9jL3BsYXllci9wbGF5ZXIuanN4IiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2MvY2xpZW50L2xwZG9jL3BsYXllci9zcHJpdGUvc3ByaXRlLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy9wb2ludHNCYXIvcG9pbnRzQmFyLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy90aW1lbGluZS90aW1lbGluZS5qc3giLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvdG9wU2VjdGlvbi90b3BTZWN0aW9uLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFMUIsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUvQixJQUFJLE9BQU8sR0FB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bGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuLy92YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgSXRlbUJhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogbnVsbCxcblx0XHRcdGl0ZW1zIDogW11cblx0XHR9O1xuXHR9LFxuXG5cdC8vVGhpcyBtYWtlcyBwaWNraW5nIHVwIGl0ZW1zIFwic3RpY2t5XCIuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuXHRcdGlmKG5leHRQcm9wcy5pdGVtcy5sZW5ndGggPiB0aGlzLnN0YXRlLml0ZW1zLmxlbmd0aCl7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXRlbXMgOiBuZXh0UHJvcHMuaXRlbXNcblx0XHRcdH0pXG5cdFx0fVxuXHR9LFxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpdGVtcyA6IFtdXG5cdFx0fTtcblx0fSxcblx0Y2xpY2tJdGVtIDogZnVuY3Rpb24oaXRlbSl7XG5cdFx0dmFyIHRpbWUgPSBNYXRoLmFicyhkYXRlVG9QaXhlbChpdGVtLmRhdGUsIHRoaXMucHJvcHMuY29uZmlnKSAtIHRoaXMucHJvcHMuc2Nyb2xsKSAqIDAuNTtcblx0XHRpZih0aW1lID4gNTAwMCkgdGltZSA9IDUwMDA7XG5cblx0XHRhbGVydCgnY2xpY2tlZCBpdGVtIScpO1xuXG5cdFx0Lypcblx0XHQkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHtcblx0XHRcdHNjcm9sbFRvcDogZGF0ZVRvUGl4ZWwoaXRlbS5kYXRlLCB0aGlzLnByb3BzLmNvbmZpZylcblx0XHR9LCB0aW1lKTtcblxuXHRcdCovXG5cdH0sXG5cdHNlbGVjdEl0ZW0gOiBmdW5jdGlvbihpdGVtKXtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHNlbGVjdGVkSXRlbSA6IGl0ZW1cblx0XHR9KTtcblx0fSxcblx0ZGVzZWxlY3RJdGVtIDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHNlbGVjdGVkSXRlbSA6IG51bGxcblx0XHR9KTtcblx0fSxcblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblxuXHRcdGlmKHRoaXMuc3RhdGUuaXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm4gPG5vc2NyaXB0IC8+O1xuXG5cdFx0dmFyIGl0ZW1zID0gXy5tYXAodGhpcy5zdGF0ZS5pdGVtcywgZnVuY3Rpb24oaXRlbSwgaW5kZXgpe1xuXHRcdFx0cmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdpdGVtJyBrZXk9e2luZGV4fVxuXHRcdFx0XHRcdFx0b25DbGljaz17c2VsZi5jbGlja0l0ZW0uYmluZChzZWxmLCBpdGVtKX1cblx0XHRcdFx0XHRcdG9uTW91c2VFbnRlcj17c2VsZi5zZWxlY3RJdGVtLmJpbmQoc2VsZiwgaXRlbSl9XG5cdFx0XHRcdFx0XHRvbk1vdXNlTGVhdmU9e3NlbGYuZGVzZWxlY3RJdGVtLmJpbmQoc2VsZiwgaXRlbSl9PlxuXHRcdFx0XHQ8aSBjbGFzc05hbWU9eydmYSBmYS1mdyAnICsgaXRlbS5pY29ufSAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0fSk7XG5cblxuXHRcdHZhciB6b29tQ2xhc3MgPSAnc3RhbmRhcmQnXG5cdFx0aWYoaXRlbXMubGVuZ3RoID4gMTIpIHpvb21DbGFzcyA9ICdtaW5pJztcblx0XHRpZihpdGVtcy5sZW5ndGggPiAzMikgem9vbUNsYXNzID0gJ3N1cGVyX21pbmknO1xuXG5cblx0XHR2YXIgZGVzY3JpcHRpb25Cb3g7XG5cdFx0aWYodGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW0pe1xuXHRcdFx0ZGVzY3JpcHRpb25Cb3ggPSA8ZGl2IGNsYXNzTmFtZT0nZGVzY3JpcHRpb25Cb3gnPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbU5hbWUnPnt0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbS5uYW1lfTwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbURhdGUnPnt0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbS5kYXRlLmZvcm1hdChcIk1NTSBEbywgWVlZWVwiKX08L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1EZXNjcmlwdGlvbic+e3RoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLmRlc2N9PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHR9XG5cblxuXHRcdHJldHVybihcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtQXJlYSc+XG5cdFx0XHRcdHtkZXNjcmlwdGlvbkJveH1cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9eydpdGVtQmFyICcgKyB6b29tQ2xhc3N9PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtVGl0bGUnPkl0ZW1zIGNvbGxlY3RlZDwvZGl2PlxuXHRcdFx0XHRcdHtpdGVtc31cblxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1CYXI7XG5cblxudmFyIGRhdGVUb1BpeGVsID0gZnVuY3Rpb24oZGF0ZSwgY29uZmlnKXtcblx0cmV0dXJuIGRhdGUuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKiBjb25maWcuZGF5UGl4ZWxSYXRpbztcbn0iLCJcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgSXRlbUljb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGl0ZW0gPSB0aGlzLnByb3BzLml0ZW07XG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1JY29uJyBzdHlsZT17dGhpcy5wcm9wcy5zdHlsZX0+XG5cdFx0XHRcdDxpIGNsYXNzTmFtZT17XCJmYSBmYS1mdyBcIiArIGl0ZW0uaWNvbn0+PC9pPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbUljb247IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIE1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXIvcGxheWVyLmpzeCcpO1xudmFyIEl0ZW1CYXIgPSByZXF1aXJlKCcuL2l0ZW1CYXIvaXRlbUJhci5qc3gnKTtcbnZhciBUaW1lbGluZSA9IHJlcXVpcmUoJy4vdGltZWxpbmUvdGltZWxpbmUuanN4Jyk7XG52YXIgVG9wU2VjdGlvbiA9IHJlcXVpcmUoJy4vdG9wU2VjdGlvbi90b3BTZWN0aW9uLmpzeCcpO1xudmFyIFBvaW50c0JhciA9IHJlcXVpcmUoJy4vcG9pbnRzQmFyL3BvaW50c0Jhci5qc3gnKTtcblxuXG5cbnZhciBzcHJpdGVzID0ge1xuXHRiYXNlICAgICAgICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL2Jhc2UucG5nJyxcblx0d2hpdGVfY29hdCAgICAgICA6ICdhc3NldHMvbHBkb2MvcGxheWVyL3Nwcml0ZS93aGl0ZV9jb2F0LnBuZycsXG5cdHdoaXRlX2NvYXRfc2NvcGUgOiAnYXNzZXRzL2xwZG9jL3BsYXllci9zcHJpdGUvd2hpdGVfY29hdF9zY29wZS5wbmcnLFxuXHRzaG9ydF9oYWlyICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL3Nob3J0X2hhaXIucG5nJyxcblx0c2hhdmVfaGFpciAgICAgICA6ICdhc3NldHMvbHBkb2MvcGxheWVyL3Nwcml0ZS9zaGF2ZV9oYWlyLnBuZydcbn07XG5cblxuXG5cbnZhciBscGRvYyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dXJsIDogJycsXG5cdFx0XHRjb25maWcgOiB7fSxcblx0XHRcdGV2ZW50cyA6IFtdXG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFVwZGF0ZWRTdGF0ZSgwLFxuXHRcdFx0dGhpcy5wcm9jZXNzQ29uZmlnKHRoaXMucHJvcHMuY29uZmlnKSk7XG5cdH0sXG5cblx0Ly9Db252ZXJ0cyBkYXRlcyB3aXRoaW4gdGhlIGNvbmZpZyB0byBtb21lbnQgZGF0YSBzdHJ1Y3R1cmVzXG5cdHByb2Nlc3NDb25maWcgOiBmdW5jdGlvbihjb25maWcpe1xuXG5cdFx0Y29uZmlnLnN0YXJ0ID0gTW9tZW50KGNvbmZpZy5zdGFydCwgXCJNTU0gRG8sIFlZWVlcIik7XG5cdFx0Y29uZmlnLmVuZCA9IE1vbWVudChjb25maWcuZW5kLCBcIk1NTSBEbywgWVlZWVwiKTtcblxuXHRcdGNvbnNvbGUubG9nKCdDT1JFJywgY29uZmlnLmVuZC5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSk7XG5cblxuXHRcdGNvbmZpZy5sYXN0U3ByaXRlID0gc3ByaXRlcy5iYXNlO1xuXHRcdGNvbmZpZy5ldmVudHMgPSBfLm1hcChjb25maWcuZXZlbnRzLCBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRldmVudC5kYXRlID0gTW9tZW50KGV2ZW50LmRhdGUsIFwiTU1NIERvLCBZWVlZXCIpO1xuXHRcdFx0aWYoZXZlbnQubHBfc3ByaXRlKXtcblx0XHRcdFx0Y29uZmlnLmxhc3RTcHJpdGUgPSBzcHJpdGVzW2V2ZW50LmxwX3Nwcml0ZV07XG5cdFx0XHRcdC8vY29uc29sZS5sb2coJ3Nwcml0ZScsIGNvbmZpZy5sYXN0U3ByaXRlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBldmVudDtcblx0XHR9KTtcblx0XHRyZXR1cm4gY29uZmlnO1xuXHR9LFxuXG5cdGdldFVwZGF0ZWRTdGF0ZSA6IGZ1bmN0aW9uKHNjcm9sbCwgY29uZmlnKXtcblx0XHR2YXIgY29uZmlnID0gY29uZmlnIHx8IHRoaXMuc3RhdGUuY29uZmlnO1xuXG5cdFx0Ly91cGRhdGUgc2Nyb2xsLCBudW1iZXIgb2YgZGF5cyBwYXNzZWQsIGl0ZW1zIGNvbGxlY3RlZCwgY3VycmVudCBpdGVtXG5cdFx0dmFyIHNjcm9sbERheSA9IE1vbWVudChjb25maWcuc3RhcnQpLmFkZChNYXRoLmZsb29yKHNjcm9sbCAvIGNvbmZpZy5kYXlQaXhlbFJhdGlvKSwgJ2RheXMnKTtcblx0XHR2YXIgY3VycmVudEl0ZW0sIGN1cnJlbnRTcHJpdGUgPSBzcHJpdGVzLmJhc2U7XG5cdFx0dmFyIGl0ZW1zQ29sbGVjdGVkID0gXy5yZWR1Y2UoY29uZmlnLmV2ZW50cywgZnVuY3Rpb24ociwgZXZlbnQpe1xuXHRcdFx0aWYoZXZlbnQuZGF0ZS51bml4KCkgPD0gc2Nyb2xsRGF5LnVuaXgoKSl7XG5cdFx0XHRcdHIucHVzaChldmVudCk7XG5cdFx0XHRcdGlmKGV2ZW50LmxwX3Nwcml0ZSkgY3VycmVudFNwcml0ZSA9IHNwcml0ZXNbZXZlbnQubHBfc3ByaXRlXTtcblx0XHRcdH1cblx0XHRcdGlmKGV2ZW50LmRhdGUuZGlmZihzY3JvbGxEYXksICdkYXlzJykgPT09IDApIGN1cnJlbnRJdGVtID0gZXZlbnQ7XG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9LFtdKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRjb25maWcgOiBjb25maWcsXG5cdFx0XHRzY3JvbGwgOiBzY3JvbGwsXG5cdFx0XHRzY3JvbGxEYXkgOiBzY3JvbGxEYXksXG5cdFx0XHRpdGVtc0NvbGxlY3RlZCA6IGl0ZW1zQ29sbGVjdGVkLFxuXHRcdFx0Y3VycmVudEl0ZW0gOiBjdXJyZW50SXRlbSxcblx0XHRcdGN1cnJlbnRTcHJpdGUgOiBjdXJyZW50U3ByaXRlLFxuXHRcdFx0cGVyY2VudGFnZSA6IChzY3JvbGwgLyBjb25maWcuZGF5UGl4ZWxSYXRpbykgLyAoIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykpXG5cdFx0fTtcblx0fSxcblxuXG5cblxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ21vdW50aW5nJyk7XG5cdH0sXG5cblx0aGFuZGxlU2Nyb2xsIDogZnVuY3Rpb24oZSl7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFVwZGF0ZWRTdGF0ZSh3aW5kb3cucGFnZVlPZmZzZXQpKVxuXHR9LFxuXG5cblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHQvL0Rvbid0IGxvYWQgYW55dGhpbmcgaWYgd2UgZG9uJ3QgaGF2ZSB0aGUgY29uZmlnXG5cdFx0Ly9pZighdGhpcy5zdGF0ZS5jb25maWcpIHJldHVybiA8bm9zY3JpcHQgLz5cblxuXHRcdHZhciBwZXJjZW50YWdlO1xuXHRcdGlmKHRoaXMuc3RhdGUuc2Nyb2xsICE9PSAwKXtcblx0XHRcdHBlcmNlbnRhZ2UgPSAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdwZXJjZW50YWdlJz5cblx0XHRcdFx0XHR7TWF0aC5yb3VuZCh0aGlzLnN0YXRlLnBlcmNlbnRhZ2UgKiAxMDAwMCkgLyAxMDB9JVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2xwZG9jJyBvblNjcm9sbD17dGhpcy5oYW5kbGVTY3JvbGx9PlxuXHRcdFx0XHQ8VG9wU2VjdGlvblxuXHRcdFx0XHRcdGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdFx0c2Nyb2xsPXt0aGlzLnN0YXRlLnNjcm9sbH1cblx0XHRcdFx0XHRwZXJjZW50YWdlPXt0aGlzLnN0YXRlLnBlcmNlbnRhZ2V9IC8+XG5cblx0XHRcdFx0PFBsYXllclxuXHRcdFx0XHRcdGN1cnJlbnRTcHJpdGU9e3RoaXMuc3RhdGUuY3VycmVudFNwcml0ZX1cblx0XHRcdFx0XHRjdXJyZW50SXRlbT17dGhpcy5zdGF0ZS5jdXJyZW50SXRlbX1cblx0XHRcdFx0XHRjb25maWc9e3RoaXMuc3RhdGUuY29uZmlnfVxuXHRcdFx0XHRcdHNjcm9sbD17dGhpcy5zdGF0ZS5zY3JvbGx9Lz5cblxuXG5cblxuXHRcdFx0XHQ8VGltZWxpbmVcblx0XHRcdFx0XHRpdGVtc0NvbGxlY3RlZD17dGhpcy5zdGF0ZS5pdGVtc0NvbGxlY3RlZH1cblx0XHRcdFx0XHRjdXJyZW50SXRlbT17dGhpcy5zdGF0ZS5jdXJyZW50SXRlbX1cblx0XHRcdFx0XHRzY3JvbGxEYXk9e3RoaXMuc3RhdGUuc2Nyb2xsRGF5fVxuXHRcdFx0XHRcdGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdFx0c2Nyb2xsPXt0aGlzLnN0YXRlLnNjcm9sbH0gLz5cblxuXG5cdFx0XHRcdDxJdGVtQmFyIGl0ZW1zPXt0aGlzLnN0YXRlLml0ZW1zQ29sbGVjdGVkfVxuXHRcdFx0XHRcdFx0IGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdFx0XHQgc2Nyb2xsPXt0aGlzLnN0YXRlLnNjcm9sbH0vPlxuXG5cdFx0XHRcdDxQb2ludHNCYXIgaXRlbXM9e3RoaXMuc3RhdGUuaXRlbXNDb2xsZWN0ZWR9IC8+XG5cblx0XHRcdFx0e3BlcmNlbnRhZ2V9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBscGRvYztcbiIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL3ZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG5cbnZhciBTcHJpdGUgPSByZXF1aXJlKCcuL3Nwcml0ZS9zcHJpdGUuanN4Jyk7XG52YXIgSXRlbUljb24gPSByZXF1aXJlKCcuLi9pdGVtSWNvbi9pdGVtSWNvbi5qc3gnKTtcblxuXG52YXIgUGxheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDAsXG5cdFx0XHRjdXJyZW50SXRlbSA6IG51bGwsXG5cdFx0XHRwZXJjZW50YWdlIDogMFxuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR2YXIgZnJhbWUgPSBNYXRoLmZsb29yKHRoaXMucHJvcHMuc2Nyb2xsIC8gMTUwKSAlIDg7XG5cblx0XHR2YXIgaXRlbUJhbm5lciA9IFtdLCBob3Zlckl0ZW07XG5cdFx0aWYodGhpcy5wcm9wcy5jdXJyZW50SXRlbSl7XG5cdFx0XHRmcmFtZSA9IDg7XG5cdFx0XHRpdGVtQmFubmVyID0gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbUJhbm5lcicga2V5PXt0aGlzLnByb3BzLmN1cnJlbnRJdGVtLmRhdGV9PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSduYW1lJz57dGhpcy5wcm9wcy5jdXJyZW50SXRlbS5uYW1lfTwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdkZXNjJz57dGhpcy5wcm9wcy5jdXJyZW50SXRlbS5kZXNjfTwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0XHRob3Zlckl0ZW0gPSAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdob3Zlckl0ZW0nPlxuXHRcdFx0XHRcdDxJdGVtSWNvbiBpdGVtPXt0aGlzLnByb3BzLmN1cnJlbnRJdGVtfSAvPlxuXHRcdFx0XHRcdDxpbWcgc3JjPScvYXNzZXRzL2xwZG9jL3NwYXJrbGUuZ2lmJyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmKHRoaXMucHJvcHMuc2Nyb2xsID09PSAwKXtcblx0XHRcdGZyYW1lID0gODtcblx0XHRcdC8vZml4XG5cdFx0XHQvL3RoaXMucHJvcHMuY3VycmVudFNwcml0ZSA9IHRoaXMucHJvcHMuY29uZmlnLmxhc3RTcHJpdGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J3BsYXllcic+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdjb250YWluZXInPlxuXHRcdFx0XHRcdHsvKjxSZWFjdENTU1RyYW5zaXRpb25Hcm91cCB0cmFuc2l0aW9uTmFtZT1cImZhZGVcIj4qL31cblx0XHRcdFx0XHRcdHtpdGVtQmFubmVyfVxuXHRcdFx0XHRcdHsvKjwvUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXA+Ki99XG5cdFx0XHRcdFx0e2hvdmVySXRlbX1cblx0XHRcdFx0XHQ8U3ByaXRlIGZyYW1lPXtmcmFtZX0gaW1hZ2VTcmM9e3RoaXMucHJvcHMuY3VycmVudFNwcml0ZX0gLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIFNwcml0ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0aW1nIDogbnVsbCxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRmcmFtZSA6IDAsXG5cdFx0XHRmcmFtZU9mZnNldCA6IDg0LFxuXHRcdFx0aW1hZ2VTcmMgOiAnJ1xuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IHRoaXMucHJvcHMuaW1hZ2VTcmM7XG5cdFx0dGhpcy5pbWcub25sb2FkID0gZnVuY3Rpb24oKXtcblx0XHRcdHNlbGYuZHJhdygpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgOiBmdW5jdGlvbihuZXh0UHJvcHMpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRpZihuZXh0UHJvcHMuaW1hZ2VTcmMgIT09IHRoaXMucHJvcHMuaW1hZ2VTcmMpe1xuXHRcdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHRcdHRoaXMuaW1nLnNyYyA9IG5leHRQcm9wcy5pbWFnZVNyYztcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHNlbGYuZHJhdygpO1xuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5kcmF3KG5leHRQcm9wcyk7XG5cdFx0fVxuXHR9LFxuXG5cdGRyYXcgOiBmdW5jdGlvbihwcm9wcyl7XG5cdFx0cHJvcHMgPSBwcm9wcyB8fCB0aGlzLnByb3BzO1xuXHRcdHZhciBjYW52YXMgPSB0aGlzLnJlZnMuY2FudmFzLmdldERPTU5vZGUoKTtcblx0XHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0XHRjdHguY2xlYXJSZWN0ICggMCAsIDAgLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQgKTtcblx0XHRjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZyxcblx0XHRcdHByb3BzLmZyYW1lICogLTEgKiBwcm9wcy5mcmFtZU9mZnNldCxcblx0XHRcdDAsXG5cdFx0XHR0aGlzLmltZy53aWR0aCAqIDQsXG5cdFx0XHR0aGlzLmltZy5oZWlnaHQgKiA0XG5cdFx0KTtcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nc3ByaXRlJz5cblx0XHRcdFx0PGNhbnZhcyByZWY9J2NhbnZhcyc+PC9jYW52YXM+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGU7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIFBvaW50c0JhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpdGVtcyA6IFtdXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXJQb2ludHMgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBwb2ludHNSZWdleCA9IG5ldyBSZWdFeHAoL1swLTldKyBcXHcrIHBvaW50cy8pO1xuXHRcdHZhciBwb2ludHMgPSB7fTtcblx0XHR2YXIgdGVtcCA9IF8uZWFjaCh0aGlzLnByb3BzLml0ZW1zLCBmdW5jdGlvbihpdGVtKXtcblx0XHRcdHZhciBkZXNjID0gaXRlbS5kZXNjLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRpZihwb2ludHNSZWdleC50ZXN0KGRlc2MpKXtcblx0XHRcdFx0cG9pbnREZXNjID0gcG9pbnRzUmVnZXguZXhlYyhkZXNjKVswXS5zcGxpdCgnICcpO1xuXHRcdFx0XHRwb2ludHNbcG9pbnREZXNjWzFdXSA9IHBvaW50c1twb2ludERlc2NbMV1dIHx8IDA7XG5cdFx0XHRcdHBvaW50c1twb2ludERlc2NbMV1dICs9IHBvaW50RGVzY1swXSoxO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBfLm1hcChwb2ludHMsIGZ1bmN0aW9uKHZhbCwgcG9pbnROYW1lKXtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdwb2ludFJvdycga2V5PXtwb2ludE5hbWV9PlxuXHRcdFx0XHRcdDxsYWJlbD57cG9pbnROYW1lfTwvbGFiZWw+IHt2YWx9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9KVxuXHR9LFxuXG5cdHJlbmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciBwb2ludHMgPSB0aGlzLnJlbmRlclBvaW50cygpO1xuXHRcdGlmKCFwb2ludHMubGVuZ3RoKSByZXR1cm4gPG5vc2NyaXB0IC8+O1xuXHRcdHJldHVybihcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdwb2ludHNCYXInPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ndGl0bGUnPnBvaW50cyE8L2Rpdj5cblx0XHRcdFx0e3BvaW50c31cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50c0JhcjtcblxuIiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIE1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuXG5cbnZhciBJdGVtID0gcmVxdWlyZSgnLi4vaXRlbUljb24vaXRlbUljb24uanN4Jyk7XG5cbnZhciBUaW1lbGluZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRiYWNrZ3JvdW5kUG9zaXRpb24gOiAwLFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDBcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuXG5cdFx0aWYoIXRoaXMucHJvcHMuY3VycmVudEl0ZW0pe1xuXHRcdFx0dGhpcy5iYWNrZ3JvdW5kUG9zaXRpb24gKz0gbmV4dFByb3BzLnNjcm9sbCAtIHRoaXMucHJvcHMuc2Nyb2xsO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cblx0XHR2YXIgVE9QX09GRlNFVCA9IDMwMDtcblxuXG5cblx0XHQvL2NvbnNvbGUubG9nKChNb21lbnQoKS51bml4KCkgLXN0YXJ0LnVuaXgoKSkvIChlbmQudW5peCgpIC0gc3RhcnQudW5peCgpKSk7XG5cblxuXHRcdHZhciBudW1EYXlzID0gTW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxO1xuXG5cblx0XHR2YXIgbWFya2VycyA9IF8udGltZXMoTW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxLCBmdW5jdGlvbihkYXkpe1xuXHRcdFx0cmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdtYXJrZXInIGtleT17ZGF5fSBzdHlsZT17e3RvcDogY29uZmlnLmRheVBpeGVsUmF0aW8gKiBkYXkgKyBUT1BfT0ZGU0VUfX0+XG5cdFx0XHRcdHtNb21lbnQoY29uZmlnLnN0YXJ0KS5hZGQoZGF5LCAnZGF5cycpLmZvcm1hdCgnTU1NIERvJyl9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdH0pO1xuXG5cblx0XHR2YXIgaXRlbXMgPSBfLnJlZHVjZShjb25maWcuZXZlbnRzLCBmdW5jdGlvbihyLCBldmVudCl7XG5cblx0XHRcdHZhciBkYXRlID0gTW9tZW50KGV2ZW50LmRhdGUsIFwiTU1NIERvLCBZWVlZXCIpO1xuXG5cblx0XHRcdGlmKGRhdGUudW5peCgpID4gc2VsZi5wcm9wcy5zY3JvbGxEYXkudW5peCgpKXtcblxuXHRcdFx0XHR2YXIgZGF5cyA9IGRhdGUuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJyk7XG5cblx0XHRcdFx0ci5wdXNoKDxJdGVtIGl0ZW09e2V2ZW50fSBrZXk9e2V2ZW50LmRhdGUuZm9ybWF0KCl9IHN0eWxlPXt7dG9wOiBjb25maWcuZGF5UGl4ZWxSYXRpbyAqIGRheXMgKyBUT1BfT0ZGU0VUfX0+XG5cdFx0XHRcdFx0PGkgY2xhc3NOYW1lPXsnZmEgJyArIGV2ZW50Lmljb259IC8+XG5cdFx0XHRcdDwvSXRlbT4pXG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fSxbXSk7XG5cblxuXHRcdHZhciBiYWNrZ3JvdW5kU3R5bGUgPSB7fTtcblxuXHRcdFx0YmFja2dyb3VuZFN0eWxlPXtcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXlcIiA6IC10aGlzLmJhY2tncm91bmRQb3NpdGlvblxuXHRcdFx0fVxuXG5cblxuXHRcdHJldHVybihcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aW1lbGluZScgc3R5bGU9e3toZWlnaHQgOiBudW1EYXlzICogY29uZmlnLmRheVBpeGVsUmF0aW99fT5cblxuXHRcdFx0XHR7bWFya2Vyc31cblx0XHRcdFx0e2l0ZW1zfVxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYmFja2dyb3VuZCcgc3R5bGU9e2JhY2tncm91bmRTdHlsZX0+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0b3BHcmFkaWVudCc+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib3R0b21HcmFkaWVudCc+PC9kaXY+XG5cblxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBNb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxudmFyIGdldFRpbWVPZkRheSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBob3VyID0gKG5ldyBEYXRlKS5nZXRIb3VycygpO1xuXHRpZig4ICA8PSBob3VyICYmIGhvdXIgPCAxOCl7IHJldHVybiAnZGF5JzsgfVxuXHRlbHNlIGlmKDE4IDw9IGhvdXIgJiYgaG91ciA8IDIwKXsgcmV0dXJuICdkdXNrJzsgfVxuXHRlbHNlIGlmKDYgPD0gaG91ciAmJiBob3VyIDwgOCl7IHJldHVybiAnZGF3bic7IH1cblx0ZWxzZXsgcmV0dXJuICduaWdodCc7IH1cbn1cblxudmFyIFRvcFNlY3Rpb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDAsXG5cdFx0XHRpc0RheVRpbWUgOiAoOCA8PShuZXcgRGF0ZSkuZ2V0SG91cnMoKSkgJiYgKChuZXcgRGF0ZSkuZ2V0SG91cnMoKSA8PSAyMClcblx0XHR9O1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGJhY2tncm91bmRQb3NpdGlvbiA6IDBcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblx0XHR2YXIgcGVyY2VudGFnZSA9IChNb21lbnQoKS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSkgLyAoIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykpO1xuXG5cblx0XHRjb25zb2xlLmxvZyhjb25maWcuc3RhcnQsIGNvbmZpZy5lbmQpO1xuXG5cdFx0Y29uc29sZS5sb2coY29uZmlnLnN0YXJ0LmRpZmYoY29uZmlnLmVuZCkpO1xuXG5cdFx0Y29uc29sZS5sb2coIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXknKSk7XG5cblx0XHRjb25zb2xlLmxvZyhNb21lbnQoKS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSk7XG5cdFx0Y29uc29sZS5sb2coTW9tZW50KCkuZGlmZihNb21lbnQoXCIxMS0xMC0yMDEzIDA5OjAzIEFNXCIsIFwiREQtTU0tWVlZWSBoaDptbSBBXCIpLCBcIm1pbnV0ZVwiKSk7XG5cblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17J3RvcFNlY3Rpb24gJyArIGdldFRpbWVPZkRheSgpIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdzdGFydE1lc3NhZ2UnPlxuXHRcdFx0XHRcdDxkaXY+U2Nyb2xsIHRvIHN0YXJ0IGhlciBhZHZlbnR1cmU8L2Rpdj5cblx0XHRcdFx0XHQ8aW1nIGNsYXNzTmFtZT0nZG93bkFycm93JyBzcmM9Jy9hc3NldHMvbHBkb2MvdG9wU2VjdGlvbi9kb3duX2Fycm93LnBuZycgLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0SG93IE11Y2ggaXMgTFAgYSBEb2N0b3I/XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nc3VidGl0bGUnPlxuXHRcdFx0XHRcdEFuIEludGVyYWN0aXZlIGFkdmVudHVyZSFcblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0b3BQZXJjZW50YWdlJz5cblx0XHRcdFx0XHQ8ZGl2PntNYXRoLnJvdW5kKHBlcmNlbnRhZ2UgKiAxMDAwMCkgLyAxMDB9JTwvZGl2PlxuXHRcdFx0XHRcdDxpbWcgc3JjPScvYXNzZXRzL2xwZG9jL3NwYXJrbGUuZ2lmJyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvdHRvbUdyYWRpZW50Jz48L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvcFNlY3Rpb247Il19
