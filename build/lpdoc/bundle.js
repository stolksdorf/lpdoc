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

var Actions = require('lpdoc/actions.js');
var Store = require('lpdoc/store.js');

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

		//console.log('CORE', config.end.diff(config.start, 'days'));

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
		console.log('mounting', this.props);

		Actions.setConfig(this.props.config);
		Actions.setEvents(this.props.events);

		console.log(Store.getPercentage());
	},

	handleScroll: function handleScroll(e) {
		this.setState(this.getUpdatedState(window.pageYOffset));

		Actions.scroll(window.pageYOffset);

		console.log(Store.getPercentage());
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

		console.log(Store);

		return React.createElement(
			'div',
			{ className: 'lpdoc', onScroll: this.handleScroll },
			Store.getPercentage()
		);

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

},{"./itemBar/itemBar.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemBar\\itemBar.jsx","./player/player.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\player.jsx","./pointsBar/pointsBar.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\pointsBar\\pointsBar.jsx","./timeline/timeline.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\timeline\\timeline.jsx","./topSection/topSection.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\topSection\\topSection.jsx","classnames":"classnames","lodash":"lodash","lpdoc/actions.js":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\shared\\lpdoc\\actions.js","lpdoc/store.js":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\shared\\lpdoc\\store.js","moment":"moment","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\player.jsx":[function(require,module,exports){
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

		/*
  	console.log(config.start, config.end);
  	console.log(config.start.diff(config.end));
  	console.log( config.end.diff(config.start, 'day'));
  	console.log(Moment().diff(config.start, 'days'));
  console.log(Moment().diff(Moment("11-10-2013 09:03 AM", "DD-MM-YYYY hh:mm A"), "minute"));
  */
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

},{"classnames":"classnames","lodash":"lodash","moment":"moment","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\shared\\lpdoc\\actions.js":[function(require,module,exports){
'use strict';

var dispatch = require('pico-flux').dispatch;

module.exports = {
	setConfig: function setConfig(config) {
		dispatch('SET_CONFIG', config);
	},
	setEvents: function setEvents(events) {
		dispatch('SET_EVENTS', events);
	},
	scroll: function scroll(scrollVal) {
		dispatch('SCROLL', scrollVal);
	}
};

},{"pico-flux":"pico-flux"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\shared\\lpdoc\\store.js":[function(require,module,exports){
'use strict';

var flux = require('pico-flux');
var Moment = require('moment');

var State = {
	start: null,
	end: null,
	pixelRatio: 300,

	events: [],

	scroll: 0
};

var parseDate = function parseDate(date) {
	return Moment(date, "MMM Do, YYYY");
};

module.exports = flux.createStore({
	SET_CONFIG: function SET_CONFIG(config) {
		State.start = parseDate(config.start);
		State.end = parseDate(config.end);
		State.pixelRatio = config.dayPixelRatio;
	},

	SET_EVENTS: function SET_EVENTS(events) {
		State.events = events;
	},
	SCROLL: function SCROLL(val) {
		console.log(val);
	}
}, {
	//And your State getters as the second parameter
	getInc: function getInc() {
		return State.inc;
	},

	getPercentage: function getPercentage() {
		return State.scroll / State.dayPixelRatio / State.end.diff(State.start, 'days');
	}
});

},{"moment":"moment","pico-flux":"pico-flux"}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvaXRlbUJhci9pdGVtQmFyLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy9pdGVtSWNvbi9pdGVtSWNvbi5qc3giLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvbHBkb2MuanN4IiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2MvY2xpZW50L2xwZG9jL3BsYXllci9wbGF5ZXIuanN4IiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2MvY2xpZW50L2xwZG9jL3BsYXllci9zcHJpdGUvc3ByaXRlLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy9wb2ludHNCYXIvcG9pbnRzQmFyLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy90aW1lbGluZS90aW1lbGluZS5qc3giLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvdG9wU2VjdGlvbi90b3BTZWN0aW9uLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL3NoYXJlZC9scGRvYy9hY3Rpb25zLmpzIiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2Mvc2hhcmVkL2xwZG9jL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSxJQUFJLEtBQUssR0FB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QUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QyxPQUFLLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsT0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO0VBQ3hDOztBQUVELFdBQVUsRUFBRyxvQkFBUyxNQUFNLEVBQUM7QUFDNUIsT0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7RUFDdEI7QUFDRCxPQUFNLEVBQUcsZ0JBQVMsR0FBRyxFQUFDO0FBQ3JCLFNBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7RUFFakI7Q0FDRCxFQUFDOztBQUVELE9BQU0sRUFBRyxrQkFBVTtBQUNsQixTQUFPLEtBQUssQ0FBQyxHQUFHLENBQUM7RUFDakI7O0FBRUQsY0FBYSxFQUFHLHlCQUFVO0FBQ3pCLFNBQU8sQUFBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhLEdBQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQUFBQyxDQUFBO0VBQ3BGO0NBQ0QsQ0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG4vL3ZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBJdGVtQmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzZWxlY3RlZEl0ZW0gOiBudWxsLFxuXHRcdFx0aXRlbXMgOiBbXVxuXHRcdH07XG5cdH0sXG5cblx0Ly9UaGlzIG1ha2VzIHBpY2tpbmcgdXAgaXRlbXMgXCJzdGlja3lcIi5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG5cdFx0aWYobmV4dFByb3BzLml0ZW1zLmxlbmd0aCA+IHRoaXMuc3RhdGUuaXRlbXMubGVuZ3RoKXtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpdGVtcyA6IG5leHRQcm9wcy5pdGVtc1xuXHRcdFx0fSlcblx0XHR9XG5cdH0sXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGl0ZW1zIDogW11cblx0XHR9O1xuXHR9LFxuXHRjbGlja0l0ZW0gOiBmdW5jdGlvbihpdGVtKXtcblx0XHR2YXIgdGltZSA9IE1hdGguYWJzKGRhdGVUb1BpeGVsKGl0ZW0uZGF0ZSwgdGhpcy5wcm9wcy5jb25maWcpIC0gdGhpcy5wcm9wcy5zY3JvbGwpICogMC41O1xuXHRcdGlmKHRpbWUgPiA1MDAwKSB0aW1lID0gNTAwMDtcblxuXHRcdGFsZXJ0KCdjbGlja2VkIGl0ZW0hJyk7XG5cblx0XHQvKlxuXHRcdCQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe1xuXHRcdFx0c2Nyb2xsVG9wOiBkYXRlVG9QaXhlbChpdGVtLmRhdGUsIHRoaXMucHJvcHMuY29uZmlnKVxuXHRcdH0sIHRpbWUpO1xuXG5cdFx0Ki9cblx0fSxcblx0c2VsZWN0SXRlbSA6IGZ1bmN0aW9uKGl0ZW0pe1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogaXRlbVxuXHRcdH0pO1xuXHR9LFxuXHRkZXNlbGVjdEl0ZW0gOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogbnVsbFxuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXG5cdFx0aWYodGhpcy5zdGF0ZS5pdGVtcy5sZW5ndGggPT09IDApIHJldHVybiA8bm9zY3JpcHQgLz47XG5cblx0XHR2YXIgaXRlbXMgPSBfLm1hcCh0aGlzLnN0YXRlLml0ZW1zLCBmdW5jdGlvbihpdGVtLCBpbmRleCl7XG5cdFx0XHRyZXR1cm4gPGRpdiBjbGFzc05hbWU9J2l0ZW0nIGtleT17aW5kZXh9XG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtzZWxmLmNsaWNrSXRlbS5iaW5kKHNlbGYsIGl0ZW0pfVxuXHRcdFx0XHRcdFx0b25Nb3VzZUVudGVyPXtzZWxmLnNlbGVjdEl0ZW0uYmluZChzZWxmLCBpdGVtKX1cblx0XHRcdFx0XHRcdG9uTW91c2VMZWF2ZT17c2VsZi5kZXNlbGVjdEl0ZW0uYmluZChzZWxmLCBpdGVtKX0+XG5cdFx0XHRcdDxpIGNsYXNzTmFtZT17J2ZhIGZhLWZ3ICcgKyBpdGVtLmljb259IC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHR9KTtcblxuXG5cdFx0dmFyIHpvb21DbGFzcyA9ICdzdGFuZGFyZCdcblx0XHRpZihpdGVtcy5sZW5ndGggPiAxMikgem9vbUNsYXNzID0gJ21pbmknO1xuXHRcdGlmKGl0ZW1zLmxlbmd0aCA+IDMyKSB6b29tQ2xhc3MgPSAnc3VwZXJfbWluaSc7XG5cblxuXHRcdHZhciBkZXNjcmlwdGlvbkJveDtcblx0XHRpZih0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbSl7XG5cdFx0XHRkZXNjcmlwdGlvbkJveCA9IDxkaXYgY2xhc3NOYW1lPSdkZXNjcmlwdGlvbkJveCc+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtTmFtZSc+e3RoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLm5hbWV9PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtRGF0ZSc+e3RoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLmRhdGUuZm9ybWF0KFwiTU1NIERvLCBZWVlZXCIpfTwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbURlc2NyaXB0aW9uJz57dGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW0uZGVzY308L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdH1cblxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1BcmVhJz5cblx0XHRcdFx0e2Rlc2NyaXB0aW9uQm94fVxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT17J2l0ZW1CYXIgJyArIHpvb21DbGFzc30+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1UaXRsZSc+SXRlbXMgY29sbGVjdGVkPC9kaXY+XG5cdFx0XHRcdFx0e2l0ZW1zfVxuXG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbUJhcjtcblxuXG52YXIgZGF0ZVRvUGl4ZWwgPSBmdW5jdGlvbihkYXRlLCBjb25maWcpe1xuXHRyZXR1cm4gZGF0ZS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSAqIGNvbmZpZy5kYXlQaXhlbFJhdGlvO1xufSIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBJdGVtSWNvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbUljb24nIHN0eWxlPXt0aGlzLnByb3BzLnN0eWxlfT5cblx0XHRcdFx0PGkgY2xhc3NOYW1lPXtcImZhIGZhLWZ3IFwiICsgaXRlbS5pY29ufT48L2k+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtSWNvbjsiLCJcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgTW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci9wbGF5ZXIuanN4Jyk7XG52YXIgSXRlbUJhciA9IHJlcXVpcmUoJy4vaXRlbUJhci9pdGVtQmFyLmpzeCcpO1xudmFyIFRpbWVsaW5lID0gcmVxdWlyZSgnLi90aW1lbGluZS90aW1lbGluZS5qc3gnKTtcbnZhciBUb3BTZWN0aW9uID0gcmVxdWlyZSgnLi90b3BTZWN0aW9uL3RvcFNlY3Rpb24uanN4Jyk7XG52YXIgUG9pbnRzQmFyID0gcmVxdWlyZSgnLi9wb2ludHNCYXIvcG9pbnRzQmFyLmpzeCcpO1xuXG5cblxudmFyIHNwcml0ZXMgPSB7XG5cdGJhc2UgICAgICAgICAgICAgOiAnYXNzZXRzL2xwZG9jL3BsYXllci9zcHJpdGUvYmFzZS5wbmcnLFxuXHR3aGl0ZV9jb2F0ICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL3doaXRlX2NvYXQucG5nJyxcblx0d2hpdGVfY29hdF9zY29wZSA6ICdhc3NldHMvbHBkb2MvcGxheWVyL3Nwcml0ZS93aGl0ZV9jb2F0X3Njb3BlLnBuZycsXG5cdHNob3J0X2hhaXIgICAgICAgOiAnYXNzZXRzL2xwZG9jL3BsYXllci9zcHJpdGUvc2hvcnRfaGFpci5wbmcnLFxuXHRzaGF2ZV9oYWlyICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL3NoYXZlX2hhaXIucG5nJ1xufTtcblxuXG5jb25zdCBBY3Rpb25zID0gcmVxdWlyZSgnbHBkb2MvYWN0aW9ucy5qcycpO1xuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdscGRvYy9zdG9yZS5qcycpO1xuXG5cbnZhciBscGRvYyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dXJsIDogJycsXG5cdFx0XHRjb25maWcgOiB7fSxcblx0XHRcdGV2ZW50cyA6IFtdXG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VXBkYXRlZFN0YXRlKDAsXG5cdFx0XHR0aGlzLnByb2Nlc3NDb25maWcodGhpcy5wcm9wcy5jb25maWcpKTtcblxuXHR9LFxuXG5cdC8vQ29udmVydHMgZGF0ZXMgd2l0aGluIHRoZSBjb25maWcgdG8gbW9tZW50IGRhdGEgc3RydWN0dXJlc1xuXHRwcm9jZXNzQ29uZmlnIDogZnVuY3Rpb24oY29uZmlnKXtcblxuXHRcdGNvbmZpZy5zdGFydCA9IE1vbWVudChjb25maWcuc3RhcnQsIFwiTU1NIERvLCBZWVlZXCIpO1xuXHRcdGNvbmZpZy5lbmQgPSBNb21lbnQoY29uZmlnLmVuZCwgXCJNTU0gRG8sIFlZWVlcIik7XG5cblx0XHQvL2NvbnNvbGUubG9nKCdDT1JFJywgY29uZmlnLmVuZC5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSk7XG5cblxuXHRcdGNvbmZpZy5sYXN0U3ByaXRlID0gc3ByaXRlcy5iYXNlO1xuXHRcdGNvbmZpZy5ldmVudHMgPSBfLm1hcChjb25maWcuZXZlbnRzLCBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRldmVudC5kYXRlID0gTW9tZW50KGV2ZW50LmRhdGUsIFwiTU1NIERvLCBZWVlZXCIpO1xuXHRcdFx0aWYoZXZlbnQubHBfc3ByaXRlKXtcblx0XHRcdFx0Y29uZmlnLmxhc3RTcHJpdGUgPSBzcHJpdGVzW2V2ZW50LmxwX3Nwcml0ZV07XG5cdFx0XHRcdC8vY29uc29sZS5sb2coJ3Nwcml0ZScsIGNvbmZpZy5sYXN0U3ByaXRlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBldmVudDtcblx0XHR9KTtcblx0XHRyZXR1cm4gY29uZmlnO1xuXHR9LFxuXG5cdGdldFVwZGF0ZWRTdGF0ZSA6IGZ1bmN0aW9uKHNjcm9sbCwgY29uZmlnKXtcblx0XHR2YXIgY29uZmlnID0gY29uZmlnIHx8IHRoaXMuc3RhdGUuY29uZmlnO1xuXG5cdFx0Ly91cGRhdGUgc2Nyb2xsLCBudW1iZXIgb2YgZGF5cyBwYXNzZWQsIGl0ZW1zIGNvbGxlY3RlZCwgY3VycmVudCBpdGVtXG5cdFx0dmFyIHNjcm9sbERheSA9IE1vbWVudChjb25maWcuc3RhcnQpLmFkZChNYXRoLmZsb29yKHNjcm9sbCAvIGNvbmZpZy5kYXlQaXhlbFJhdGlvKSwgJ2RheXMnKTtcblx0XHR2YXIgY3VycmVudEl0ZW0sIGN1cnJlbnRTcHJpdGUgPSBzcHJpdGVzLmJhc2U7XG5cdFx0dmFyIGl0ZW1zQ29sbGVjdGVkID0gXy5yZWR1Y2UoY29uZmlnLmV2ZW50cywgZnVuY3Rpb24ociwgZXZlbnQpe1xuXHRcdFx0aWYoZXZlbnQuZGF0ZS51bml4KCkgPD0gc2Nyb2xsRGF5LnVuaXgoKSl7XG5cdFx0XHRcdHIucHVzaChldmVudCk7XG5cdFx0XHRcdGlmKGV2ZW50LmxwX3Nwcml0ZSkgY3VycmVudFNwcml0ZSA9IHNwcml0ZXNbZXZlbnQubHBfc3ByaXRlXTtcblx0XHRcdH1cblx0XHRcdGlmKGV2ZW50LmRhdGUuZGlmZihzY3JvbGxEYXksICdkYXlzJykgPT09IDApIGN1cnJlbnRJdGVtID0gZXZlbnQ7XG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9LFtdKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRjb25maWcgOiBjb25maWcsXG5cdFx0XHRzY3JvbGwgOiBzY3JvbGwsXG5cdFx0XHRzY3JvbGxEYXkgOiBzY3JvbGxEYXksXG5cdFx0XHRpdGVtc0NvbGxlY3RlZCA6IGl0ZW1zQ29sbGVjdGVkLFxuXHRcdFx0Y3VycmVudEl0ZW0gOiBjdXJyZW50SXRlbSxcblx0XHRcdGN1cnJlbnRTcHJpdGUgOiBjdXJyZW50U3ByaXRlLFxuXHRcdFx0cGVyY2VudGFnZSA6IChzY3JvbGwgLyBjb25maWcuZGF5UGl4ZWxSYXRpbykgLyAoIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykpXG5cdFx0fTtcblx0fSxcblxuXG5cblxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ21vdW50aW5nJywgdGhpcy5wcm9wcyk7XG5cblx0XHRBY3Rpb25zLnNldENvbmZpZyh0aGlzLnByb3BzLmNvbmZpZyk7XG5cdFx0QWN0aW9ucy5zZXRFdmVudHModGhpcy5wcm9wcy5ldmVudHMpO1xuXG5cdFx0Y29uc29sZS5sb2coU3RvcmUuZ2V0UGVyY2VudGFnZSgpKTtcblx0fSxcblxuXHRoYW5kbGVTY3JvbGwgOiBmdW5jdGlvbihlKXtcblx0XHR0aGlzLnNldFN0YXRlKHRoaXMuZ2V0VXBkYXRlZFN0YXRlKHdpbmRvdy5wYWdlWU9mZnNldCkpO1xuXG5cdFx0QWN0aW9ucy5zY3JvbGwod2luZG93LnBhZ2VZT2Zmc2V0KTtcblxuXHRcdGNvbnNvbGUubG9nKFN0b3JlLmdldFBlcmNlbnRhZ2UoKSk7XG5cblx0fSxcblxuXG5cdHJlbmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0Ly9Eb24ndCBsb2FkIGFueXRoaW5nIGlmIHdlIGRvbid0IGhhdmUgdGhlIGNvbmZpZ1xuXHRcdC8vaWYoIXRoaXMuc3RhdGUuY29uZmlnKSByZXR1cm4gPG5vc2NyaXB0IC8+XG5cblx0XHR2YXIgcGVyY2VudGFnZTtcblx0XHRpZih0aGlzLnN0YXRlLnNjcm9sbCAhPT0gMCl7XG5cdFx0XHRwZXJjZW50YWdlID0gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ncGVyY2VudGFnZSc+XG5cdFx0XHRcdFx0e01hdGgucm91bmQodGhpcy5zdGF0ZS5wZXJjZW50YWdlICogMTAwMDApIC8gMTAwfSVcblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKFN0b3JlKTtcblxuXHRcdHJldHVybiA8ZGl2IGNsYXNzTmFtZT0nbHBkb2MnIG9uU2Nyb2xsPXt0aGlzLmhhbmRsZVNjcm9sbH0+XG5cdFx0XHR7U3RvcmUuZ2V0UGVyY2VudGFnZSgpfVxuXHRcdDwvZGl2PlxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2xwZG9jJyBvblNjcm9sbD17dGhpcy5oYW5kbGVTY3JvbGx9PlxuXHRcdFx0XHQ8VG9wU2VjdGlvblxuXHRcdFx0XHRcdGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdFx0c2Nyb2xsPXt0aGlzLnN0YXRlLnNjcm9sbH1cblx0XHRcdFx0XHRwZXJjZW50YWdlPXt0aGlzLnN0YXRlLnBlcmNlbnRhZ2V9IC8+XG5cblx0XHRcdFx0PFBsYXllclxuXHRcdFx0XHRcdGN1cnJlbnRTcHJpdGU9e3RoaXMuc3RhdGUuY3VycmVudFNwcml0ZX1cblx0XHRcdFx0XHRjdXJyZW50SXRlbT17dGhpcy5zdGF0ZS5jdXJyZW50SXRlbX1cblx0XHRcdFx0XHRjb25maWc9e3RoaXMuc3RhdGUuY29uZmlnfVxuXHRcdFx0XHRcdHNjcm9sbD17dGhpcy5zdGF0ZS5zY3JvbGx9Lz5cblxuXG5cblxuXHRcdFx0XHQ8VGltZWxpbmVcblx0XHRcdFx0XHRpdGVtc0NvbGxlY3RlZD17dGhpcy5zdGF0ZS5pdGVtc0NvbGxlY3RlZH1cblx0XHRcdFx0XHRjdXJyZW50SXRlbT17dGhpcy5zdGF0ZS5jdXJyZW50SXRlbX1cblx0XHRcdFx0XHRzY3JvbGxEYXk9e3RoaXMuc3RhdGUuc2Nyb2xsRGF5fVxuXHRcdFx0XHRcdGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdFx0c2Nyb2xsPXt0aGlzLnN0YXRlLnNjcm9sbH0gLz5cblxuXG5cdFx0XHRcdDxJdGVtQmFyIGl0ZW1zPXt0aGlzLnN0YXRlLml0ZW1zQ29sbGVjdGVkfVxuXHRcdFx0XHRcdFx0IGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdFx0XHQgc2Nyb2xsPXt0aGlzLnN0YXRlLnNjcm9sbH0vPlxuXG5cdFx0XHRcdDxQb2ludHNCYXIgaXRlbXM9e3RoaXMuc3RhdGUuaXRlbXNDb2xsZWN0ZWR9IC8+XG5cblx0XHRcdFx0e3BlcmNlbnRhZ2V9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBscGRvYztcbiIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL3ZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG5cbnZhciBTcHJpdGUgPSByZXF1aXJlKCcuL3Nwcml0ZS9zcHJpdGUuanN4Jyk7XG52YXIgSXRlbUljb24gPSByZXF1aXJlKCcuLi9pdGVtSWNvbi9pdGVtSWNvbi5qc3gnKTtcblxuXG52YXIgUGxheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDAsXG5cdFx0XHRjdXJyZW50SXRlbSA6IG51bGwsXG5cdFx0XHRwZXJjZW50YWdlIDogMFxuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR2YXIgZnJhbWUgPSBNYXRoLmZsb29yKHRoaXMucHJvcHMuc2Nyb2xsIC8gMTUwKSAlIDg7XG5cblx0XHR2YXIgaXRlbUJhbm5lciA9IFtdLCBob3Zlckl0ZW07XG5cdFx0aWYodGhpcy5wcm9wcy5jdXJyZW50SXRlbSl7XG5cdFx0XHRmcmFtZSA9IDg7XG5cdFx0XHRpdGVtQmFubmVyID0gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbUJhbm5lcicga2V5PXt0aGlzLnByb3BzLmN1cnJlbnRJdGVtLmRhdGV9PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSduYW1lJz57dGhpcy5wcm9wcy5jdXJyZW50SXRlbS5uYW1lfTwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdkZXNjJz57dGhpcy5wcm9wcy5jdXJyZW50SXRlbS5kZXNjfTwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0XHRob3Zlckl0ZW0gPSAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdob3Zlckl0ZW0nPlxuXHRcdFx0XHRcdDxJdGVtSWNvbiBpdGVtPXt0aGlzLnByb3BzLmN1cnJlbnRJdGVtfSAvPlxuXHRcdFx0XHRcdDxpbWcgc3JjPScvYXNzZXRzL2xwZG9jL3NwYXJrbGUuZ2lmJyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmKHRoaXMucHJvcHMuc2Nyb2xsID09PSAwKXtcblx0XHRcdGZyYW1lID0gODtcblx0XHRcdC8vZml4XG5cdFx0XHQvL3RoaXMucHJvcHMuY3VycmVudFNwcml0ZSA9IHRoaXMucHJvcHMuY29uZmlnLmxhc3RTcHJpdGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J3BsYXllcic+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdjb250YWluZXInPlxuXHRcdFx0XHRcdHsvKjxSZWFjdENTU1RyYW5zaXRpb25Hcm91cCB0cmFuc2l0aW9uTmFtZT1cImZhZGVcIj4qL31cblx0XHRcdFx0XHRcdHtpdGVtQmFubmVyfVxuXHRcdFx0XHRcdHsvKjwvUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXA+Ki99XG5cdFx0XHRcdFx0e2hvdmVySXRlbX1cblx0XHRcdFx0XHQ8U3ByaXRlIGZyYW1lPXtmcmFtZX0gaW1hZ2VTcmM9e3RoaXMucHJvcHMuY3VycmVudFNwcml0ZX0gLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIFNwcml0ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0aW1nIDogbnVsbCxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRmcmFtZSA6IDAsXG5cdFx0XHRmcmFtZU9mZnNldCA6IDg0LFxuXHRcdFx0aW1hZ2VTcmMgOiAnJ1xuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IHRoaXMucHJvcHMuaW1hZ2VTcmM7XG5cdFx0dGhpcy5pbWcub25sb2FkID0gZnVuY3Rpb24oKXtcblx0XHRcdHNlbGYuZHJhdygpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgOiBmdW5jdGlvbihuZXh0UHJvcHMpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRpZihuZXh0UHJvcHMuaW1hZ2VTcmMgIT09IHRoaXMucHJvcHMuaW1hZ2VTcmMpe1xuXHRcdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHRcdHRoaXMuaW1nLnNyYyA9IG5leHRQcm9wcy5pbWFnZVNyYztcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHNlbGYuZHJhdygpO1xuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5kcmF3KG5leHRQcm9wcyk7XG5cdFx0fVxuXHR9LFxuXG5cdGRyYXcgOiBmdW5jdGlvbihwcm9wcyl7XG5cdFx0cHJvcHMgPSBwcm9wcyB8fCB0aGlzLnByb3BzO1xuXHRcdHZhciBjYW52YXMgPSB0aGlzLnJlZnMuY2FudmFzLmdldERPTU5vZGUoKTtcblx0XHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0XHRjdHguY2xlYXJSZWN0ICggMCAsIDAgLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQgKTtcblx0XHRjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZyxcblx0XHRcdHByb3BzLmZyYW1lICogLTEgKiBwcm9wcy5mcmFtZU9mZnNldCxcblx0XHRcdDAsXG5cdFx0XHR0aGlzLmltZy53aWR0aCAqIDQsXG5cdFx0XHR0aGlzLmltZy5oZWlnaHQgKiA0XG5cdFx0KTtcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nc3ByaXRlJz5cblx0XHRcdFx0PGNhbnZhcyByZWY9J2NhbnZhcyc+PC9jYW52YXM+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGU7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIFBvaW50c0JhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpdGVtcyA6IFtdXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXJQb2ludHMgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBwb2ludHNSZWdleCA9IG5ldyBSZWdFeHAoL1swLTldKyBcXHcrIHBvaW50cy8pO1xuXHRcdHZhciBwb2ludHMgPSB7fTtcblx0XHR2YXIgdGVtcCA9IF8uZWFjaCh0aGlzLnByb3BzLml0ZW1zLCBmdW5jdGlvbihpdGVtKXtcblx0XHRcdHZhciBkZXNjID0gaXRlbS5kZXNjLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRpZihwb2ludHNSZWdleC50ZXN0KGRlc2MpKXtcblx0XHRcdFx0cG9pbnREZXNjID0gcG9pbnRzUmVnZXguZXhlYyhkZXNjKVswXS5zcGxpdCgnICcpO1xuXHRcdFx0XHRwb2ludHNbcG9pbnREZXNjWzFdXSA9IHBvaW50c1twb2ludERlc2NbMV1dIHx8IDA7XG5cdFx0XHRcdHBvaW50c1twb2ludERlc2NbMV1dICs9IHBvaW50RGVzY1swXSoxO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBfLm1hcChwb2ludHMsIGZ1bmN0aW9uKHZhbCwgcG9pbnROYW1lKXtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdwb2ludFJvdycga2V5PXtwb2ludE5hbWV9PlxuXHRcdFx0XHRcdDxsYWJlbD57cG9pbnROYW1lfTwvbGFiZWw+IHt2YWx9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9KVxuXHR9LFxuXG5cdHJlbmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciBwb2ludHMgPSB0aGlzLnJlbmRlclBvaW50cygpO1xuXHRcdGlmKCFwb2ludHMubGVuZ3RoKSByZXR1cm4gPG5vc2NyaXB0IC8+O1xuXHRcdHJldHVybihcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdwb2ludHNCYXInPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ndGl0bGUnPnBvaW50cyE8L2Rpdj5cblx0XHRcdFx0e3BvaW50c31cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50c0JhcjtcblxuIiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIE1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuXG5cbnZhciBJdGVtID0gcmVxdWlyZSgnLi4vaXRlbUljb24vaXRlbUljb24uanN4Jyk7XG5cbnZhciBUaW1lbGluZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRiYWNrZ3JvdW5kUG9zaXRpb24gOiAwLFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDBcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuXG5cdFx0aWYoIXRoaXMucHJvcHMuY3VycmVudEl0ZW0pe1xuXHRcdFx0dGhpcy5iYWNrZ3JvdW5kUG9zaXRpb24gKz0gbmV4dFByb3BzLnNjcm9sbCAtIHRoaXMucHJvcHMuc2Nyb2xsO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cblx0XHR2YXIgVE9QX09GRlNFVCA9IDMwMDtcblxuXG5cblx0XHQvL2NvbnNvbGUubG9nKChNb21lbnQoKS51bml4KCkgLXN0YXJ0LnVuaXgoKSkvIChlbmQudW5peCgpIC0gc3RhcnQudW5peCgpKSk7XG5cblxuXHRcdHZhciBudW1EYXlzID0gTW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxO1xuXG5cblx0XHR2YXIgbWFya2VycyA9IF8udGltZXMoTW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxLCBmdW5jdGlvbihkYXkpe1xuXHRcdFx0cmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdtYXJrZXInIGtleT17ZGF5fSBzdHlsZT17e3RvcDogY29uZmlnLmRheVBpeGVsUmF0aW8gKiBkYXkgKyBUT1BfT0ZGU0VUfX0+XG5cdFx0XHRcdHtNb21lbnQoY29uZmlnLnN0YXJ0KS5hZGQoZGF5LCAnZGF5cycpLmZvcm1hdCgnTU1NIERvJyl9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdH0pO1xuXG5cblx0XHR2YXIgaXRlbXMgPSBfLnJlZHVjZShjb25maWcuZXZlbnRzLCBmdW5jdGlvbihyLCBldmVudCl7XG5cblx0XHRcdHZhciBkYXRlID0gTW9tZW50KGV2ZW50LmRhdGUsIFwiTU1NIERvLCBZWVlZXCIpO1xuXG5cblx0XHRcdGlmKGRhdGUudW5peCgpID4gc2VsZi5wcm9wcy5zY3JvbGxEYXkudW5peCgpKXtcblxuXHRcdFx0XHR2YXIgZGF5cyA9IGRhdGUuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJyk7XG5cblx0XHRcdFx0ci5wdXNoKDxJdGVtIGl0ZW09e2V2ZW50fSBrZXk9e2V2ZW50LmRhdGUuZm9ybWF0KCl9IHN0eWxlPXt7dG9wOiBjb25maWcuZGF5UGl4ZWxSYXRpbyAqIGRheXMgKyBUT1BfT0ZGU0VUfX0+XG5cdFx0XHRcdFx0PGkgY2xhc3NOYW1lPXsnZmEgJyArIGV2ZW50Lmljb259IC8+XG5cdFx0XHRcdDwvSXRlbT4pXG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fSxbXSk7XG5cblxuXHRcdHZhciBiYWNrZ3JvdW5kU3R5bGUgPSB7fTtcblxuXHRcdFx0YmFja2dyb3VuZFN0eWxlPXtcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXlcIiA6IC10aGlzLmJhY2tncm91bmRQb3NpdGlvblxuXHRcdFx0fVxuXG5cblxuXHRcdHJldHVybihcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aW1lbGluZScgc3R5bGU9e3toZWlnaHQgOiBudW1EYXlzICogY29uZmlnLmRheVBpeGVsUmF0aW99fT5cblxuXHRcdFx0XHR7bWFya2Vyc31cblx0XHRcdFx0e2l0ZW1zfVxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYmFja2dyb3VuZCcgc3R5bGU9e2JhY2tncm91bmRTdHlsZX0+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0b3BHcmFkaWVudCc+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib3R0b21HcmFkaWVudCc+PC9kaXY+XG5cblxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBNb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxudmFyIGdldFRpbWVPZkRheSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBob3VyID0gKG5ldyBEYXRlKS5nZXRIb3VycygpO1xuXHRpZig4ICA8PSBob3VyICYmIGhvdXIgPCAxOCl7IHJldHVybiAnZGF5JzsgfVxuXHRlbHNlIGlmKDE4IDw9IGhvdXIgJiYgaG91ciA8IDIwKXsgcmV0dXJuICdkdXNrJzsgfVxuXHRlbHNlIGlmKDYgPD0gaG91ciAmJiBob3VyIDwgOCl7IHJldHVybiAnZGF3bic7IH1cblx0ZWxzZXsgcmV0dXJuICduaWdodCc7IH1cbn1cblxudmFyIFRvcFNlY3Rpb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDAsXG5cdFx0XHRpc0RheVRpbWUgOiAoOCA8PShuZXcgRGF0ZSkuZ2V0SG91cnMoKSkgJiYgKChuZXcgRGF0ZSkuZ2V0SG91cnMoKSA8PSAyMClcblx0XHR9O1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGJhY2tncm91bmRQb3NpdGlvbiA6IDBcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblx0XHR2YXIgcGVyY2VudGFnZSA9IChNb21lbnQoKS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSkgLyAoIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykpO1xuXG5cdFx0LypcblxuXHRcdGNvbnNvbGUubG9nKGNvbmZpZy5zdGFydCwgY29uZmlnLmVuZCk7XG5cblx0XHRjb25zb2xlLmxvZyhjb25maWcuc3RhcnQuZGlmZihjb25maWcuZW5kKSk7XG5cblx0XHRjb25zb2xlLmxvZyggY29uZmlnLmVuZC5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheScpKTtcblxuXHRcdGNvbnNvbGUubG9nKE1vbWVudCgpLmRpZmYoY29uZmlnLnN0YXJ0LCAnZGF5cycpKTtcblx0XHRjb25zb2xlLmxvZyhNb21lbnQoKS5kaWZmKE1vbWVudChcIjExLTEwLTIwMTMgMDk6MDMgQU1cIiwgXCJERC1NTS1ZWVlZIGhoOm1tIEFcIiksIFwibWludXRlXCIpKTtcblx0Ki9cblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17J3RvcFNlY3Rpb24gJyArIGdldFRpbWVPZkRheSgpIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdzdGFydE1lc3NhZ2UnPlxuXHRcdFx0XHRcdDxkaXY+U2Nyb2xsIHRvIHN0YXJ0IGhlciBhZHZlbnR1cmU8L2Rpdj5cblx0XHRcdFx0XHQ8aW1nIGNsYXNzTmFtZT0nZG93bkFycm93JyBzcmM9Jy9hc3NldHMvbHBkb2MvdG9wU2VjdGlvbi9kb3duX2Fycm93LnBuZycgLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0SG93IE11Y2ggaXMgTFAgYSBEb2N0b3I/XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nc3VidGl0bGUnPlxuXHRcdFx0XHRcdEFuIEludGVyYWN0aXZlIGFkdmVudHVyZSFcblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0b3BQZXJjZW50YWdlJz5cblx0XHRcdFx0XHQ8ZGl2PntNYXRoLnJvdW5kKHBlcmNlbnRhZ2UgKiAxMDAwMCkgLyAxMDB9JTwvZGl2PlxuXHRcdFx0XHRcdDxpbWcgc3JjPScvYXNzZXRzL2xwZG9jL3NwYXJrbGUuZ2lmJyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2JvdHRvbUdyYWRpZW50Jz48L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvcFNlY3Rpb247IiwidmFyIGRpc3BhdGNoID0gcmVxdWlyZSgncGljby1mbHV4JykuZGlzcGF0Y2g7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzZXRDb25maWcgOiBmdW5jdGlvbihjb25maWcpe1xuXHRcdGRpc3BhdGNoKCdTRVRfQ09ORklHJywgY29uZmlnKTtcblx0fSxcblx0c2V0RXZlbnRzIDogZnVuY3Rpb24oZXZlbnRzKXtcblx0XHRkaXNwYXRjaCgnU0VUX0VWRU5UUycsIGV2ZW50cyk7XG5cdH0sXG5cdHNjcm9sbCA6IGZ1bmN0aW9uKHNjcm9sbFZhbCl7XG5cdFx0ZGlzcGF0Y2goJ1NDUk9MTCcsIHNjcm9sbFZhbCk7XG5cdH0sXG59IiwiY29uc3QgZmx1eCA9IHJlcXVpcmUoJ3BpY28tZmx1eCcpO1xuY29uc3QgTW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbmNvbnN0IFN0YXRlID0ge1xuXHRzdGFydCA6IG51bGwsXG5cdGVuZCA6IG51bGwsXG5cdHBpeGVsUmF0aW8gOiAzMDAsXG5cblxuXHRldmVudHMgOiBbXSxcblxuXHRzY3JvbGwgOiAwXG59O1xuXG5jb25zdCBwYXJzZURhdGUgPSAoZGF0ZSkgPT4ge1xuXHRyZXR1cm4gTW9tZW50KGRhdGUsIFwiTU1NIERvLCBZWVlZXCIpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmx1eC5jcmVhdGVTdG9yZSh7XG5cdFNFVF9DT05GSUcgOiBmdW5jdGlvbihjb25maWcpe1xuXHRcdFN0YXRlLnN0YXJ0ID0gcGFyc2VEYXRlKGNvbmZpZy5zdGFydCk7XG5cdFx0U3RhdGUuZW5kID0gcGFyc2VEYXRlKGNvbmZpZy5lbmQpO1xuXHRcdFN0YXRlLnBpeGVsUmF0aW8gPSBjb25maWcuZGF5UGl4ZWxSYXRpbztcblx0fSxcblxuXHRTRVRfRVZFTlRTIDogZnVuY3Rpb24oZXZlbnRzKXtcblx0XHRTdGF0ZS5ldmVudHMgPSBldmVudHM7XG5cdH0sXG5cdFNDUk9MTCA6IGZ1bmN0aW9uKHZhbCl7XG5cdFx0Y29uc29sZS5sb2codmFsKTtcblxuXHR9LFxufSx7XG5cdC8vQW5kIHlvdXIgU3RhdGUgZ2V0dGVycyBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlclxuXHRnZXRJbmMgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBTdGF0ZS5pbmM7XG5cdH0sXG5cblx0Z2V0UGVyY2VudGFnZSA6IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIChTdGF0ZS5zY3JvbGwgLyBTdGF0ZS5kYXlQaXhlbFJhdGlvKSAvICggU3RhdGUuZW5kLmRpZmYoU3RhdGUuc3RhcnQsICdkYXlzJykpXG5cdH1cbn0pIl19
