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

var LPDoc = React.createClass({
	displayName: 'LPDoc',

	getDefaultProps: function getDefaultProps() {
		return {
			url: '',
			config: {},
			events: []
		};
	},

	getInitialState: function getInitialState() {

		return this.getUpdatedState(0, this.processConfig(this.props.old_config));
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

	componentWillMount: function componentWillMount() {
		Actions.setConfig(this.props.config);
		Actions.setEvents(this.props.events);
	},

	handleScroll: function handleScroll(e) {
		this.setState(this.getUpdatedState(window.pageYOffset));

		Actions.scroll(window.pageYOffset);

		console.log(Store.getPercentage());
	},

	//Probably move
	renderPercentage: function renderPercentage() {
		if (Store.getScroll() == 0) return;

		return React.createElement(
			'div',
			{ className: 'percentage' },
			Math.round(Store.getPercentage() * 10000) / 100,
			'%'
		);
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'lpdoc', onScroll: this.handleScroll },
			React.createElement(TopSection, null),
			this.renderPercentage()
		);
	}
});

module.exports = LPDoc;
/*
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
<PointsBar items={this.state.itemsCollected} />
*/

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

var Store = require('lpdoc/store.js');

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
			//scroll : 0,
			//isDayTime : (8 <=(new Date).getHours()) && ((new Date).getHours() <= 20)
		};
	},

	/*
 getInitialState: function() {
 	return {
 		backgroundPosition : 0
 	};
 },
 	componentDidMount: function() {
 },
 */
	render: function render() {
		//var config = this.props.config;
		//var percentage = (Moment().diff(config.start, 'days')) / ( config.end.diff(config.start, 'days'));

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
					_.round(Store.getPercentComplete(), 2),
					'%'
				),
				React.createElement('img', { src: '/assets/lpdoc/sparkle.gif' })
			),
			React.createElement('div', { className: 'bottomGradient' })
		);
	}
});

module.exports = TopSection;

},{"classnames":"classnames","lodash":"lodash","lpdoc/store.js":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\shared\\lpdoc\\store.js","moment":"moment","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\shared\\lpdoc\\actions.js":[function(require,module,exports){
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
	return Moment(date, "MMM D, YYYY");
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

	getScroll: function getScroll() {
		return State.scroll;
	},

	getPercentComplete: function getPercentComplete() {
		return Moment().diff(State.start, 'days') / State.end.diff(State.start, 'days');
	},

	getCurrentPercentage: function getCurrentPercentage() {
		return State.scroll / State.pixelRatio / State.end.diff(State.start, 'days');
	}
});

},{"moment":"moment","pico-flux":"pico-flux"}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvaXRlbUJhci9pdGVtQmFyLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy9pdGVtSWNvbi9pdGVtSWNvbi5qc3giLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvbHBkb2MuanN4IiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2MvY2xpZW50L2xwZG9jL3BsYXllci9wbGF5ZXIuanN4IiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2MvY2xpZW50L2xwZG9jL3BsYXllci9zcHJpdGUvc3ByaXRlLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy9wb2ludHNCYXIvcG9pbnRzQmFyLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy90aW1lbGluZS90aW1lbGluZS5qc3giLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvdG9wU2VjdGlvbi90b3BTZWN0aW9uLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL3NoYXJlZC9scGRvYy9hY3Rpb25zLmpzIiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2Mvc2hhcmVkL2xwZG9jL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSxJQUFJLEtBQUssR0FB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QyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLEdBQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQUFBQyxDQUFBO0VBQ2pGO0NBQ0QsQ0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG4vL3ZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBJdGVtQmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzZWxlY3RlZEl0ZW0gOiBudWxsLFxuXHRcdFx0aXRlbXMgOiBbXVxuXHRcdH07XG5cdH0sXG5cblx0Ly9UaGlzIG1ha2VzIHBpY2tpbmcgdXAgaXRlbXMgXCJzdGlja3lcIi5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG5cdFx0aWYobmV4dFByb3BzLml0ZW1zLmxlbmd0aCA+IHRoaXMuc3RhdGUuaXRlbXMubGVuZ3RoKXtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpdGVtcyA6IG5leHRQcm9wcy5pdGVtc1xuXHRcdFx0fSlcblx0XHR9XG5cdH0sXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGl0ZW1zIDogW11cblx0XHR9O1xuXHR9LFxuXHRjbGlja0l0ZW0gOiBmdW5jdGlvbihpdGVtKXtcblx0XHR2YXIgdGltZSA9IE1hdGguYWJzKGRhdGVUb1BpeGVsKGl0ZW0uZGF0ZSwgdGhpcy5wcm9wcy5jb25maWcpIC0gdGhpcy5wcm9wcy5zY3JvbGwpICogMC41O1xuXHRcdGlmKHRpbWUgPiA1MDAwKSB0aW1lID0gNTAwMDtcblxuXHRcdGFsZXJ0KCdjbGlja2VkIGl0ZW0hJyk7XG5cblx0XHQvKlxuXHRcdCQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe1xuXHRcdFx0c2Nyb2xsVG9wOiBkYXRlVG9QaXhlbChpdGVtLmRhdGUsIHRoaXMucHJvcHMuY29uZmlnKVxuXHRcdH0sIHRpbWUpO1xuXG5cdFx0Ki9cblx0fSxcblx0c2VsZWN0SXRlbSA6IGZ1bmN0aW9uKGl0ZW0pe1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogaXRlbVxuXHRcdH0pO1xuXHR9LFxuXHRkZXNlbGVjdEl0ZW0gOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogbnVsbFxuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXG5cdFx0aWYodGhpcy5zdGF0ZS5pdGVtcy5sZW5ndGggPT09IDApIHJldHVybiA8bm9zY3JpcHQgLz47XG5cblx0XHR2YXIgaXRlbXMgPSBfLm1hcCh0aGlzLnN0YXRlLml0ZW1zLCBmdW5jdGlvbihpdGVtLCBpbmRleCl7XG5cdFx0XHRyZXR1cm4gPGRpdiBjbGFzc05hbWU9J2l0ZW0nIGtleT17aW5kZXh9XG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtzZWxmLmNsaWNrSXRlbS5iaW5kKHNlbGYsIGl0ZW0pfVxuXHRcdFx0XHRcdFx0b25Nb3VzZUVudGVyPXtzZWxmLnNlbGVjdEl0ZW0uYmluZChzZWxmLCBpdGVtKX1cblx0XHRcdFx0XHRcdG9uTW91c2VMZWF2ZT17c2VsZi5kZXNlbGVjdEl0ZW0uYmluZChzZWxmLCBpdGVtKX0+XG5cdFx0XHRcdDxpIGNsYXNzTmFtZT17J2ZhIGZhLWZ3ICcgKyBpdGVtLmljb259IC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHR9KTtcblxuXG5cdFx0dmFyIHpvb21DbGFzcyA9ICdzdGFuZGFyZCdcblx0XHRpZihpdGVtcy5sZW5ndGggPiAxMikgem9vbUNsYXNzID0gJ21pbmknO1xuXHRcdGlmKGl0ZW1zLmxlbmd0aCA+IDMyKSB6b29tQ2xhc3MgPSAnc3VwZXJfbWluaSc7XG5cblxuXHRcdHZhciBkZXNjcmlwdGlvbkJveDtcblx0XHRpZih0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbSl7XG5cdFx0XHRkZXNjcmlwdGlvbkJveCA9IDxkaXYgY2xhc3NOYW1lPSdkZXNjcmlwdGlvbkJveCc+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtTmFtZSc+e3RoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLm5hbWV9PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtRGF0ZSc+e3RoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLmRhdGUuZm9ybWF0KFwiTU1NIERvLCBZWVlZXCIpfTwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbURlc2NyaXB0aW9uJz57dGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW0uZGVzY308L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdH1cblxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1BcmVhJz5cblx0XHRcdFx0e2Rlc2NyaXB0aW9uQm94fVxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT17J2l0ZW1CYXIgJyArIHpvb21DbGFzc30+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1UaXRsZSc+SXRlbXMgY29sbGVjdGVkPC9kaXY+XG5cdFx0XHRcdFx0e2l0ZW1zfVxuXG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbUJhcjtcblxuXG52YXIgZGF0ZVRvUGl4ZWwgPSBmdW5jdGlvbihkYXRlLCBjb25maWcpe1xuXHRyZXR1cm4gZGF0ZS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSAqIGNvbmZpZy5kYXlQaXhlbFJhdGlvO1xufSIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBJdGVtSWNvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbUljb24nIHN0eWxlPXt0aGlzLnByb3BzLnN0eWxlfT5cblx0XHRcdFx0PGkgY2xhc3NOYW1lPXtcImZhIGZhLWZ3IFwiICsgaXRlbS5pY29ufT48L2k+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtSWNvbjsiLCJcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgTW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci9wbGF5ZXIuanN4Jyk7XG52YXIgSXRlbUJhciA9IHJlcXVpcmUoJy4vaXRlbUJhci9pdGVtQmFyLmpzeCcpO1xudmFyIFRpbWVsaW5lID0gcmVxdWlyZSgnLi90aW1lbGluZS90aW1lbGluZS5qc3gnKTtcbnZhciBUb3BTZWN0aW9uID0gcmVxdWlyZSgnLi90b3BTZWN0aW9uL3RvcFNlY3Rpb24uanN4Jyk7XG52YXIgUG9pbnRzQmFyID0gcmVxdWlyZSgnLi9wb2ludHNCYXIvcG9pbnRzQmFyLmpzeCcpO1xuXG5cblxudmFyIHNwcml0ZXMgPSB7XG5cdGJhc2UgICAgICAgICAgICAgOiAnYXNzZXRzL2xwZG9jL3BsYXllci9zcHJpdGUvYmFzZS5wbmcnLFxuXHR3aGl0ZV9jb2F0ICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL3doaXRlX2NvYXQucG5nJyxcblx0d2hpdGVfY29hdF9zY29wZSA6ICdhc3NldHMvbHBkb2MvcGxheWVyL3Nwcml0ZS93aGl0ZV9jb2F0X3Njb3BlLnBuZycsXG5cdHNob3J0X2hhaXIgICAgICAgOiAnYXNzZXRzL2xwZG9jL3BsYXllci9zcHJpdGUvc2hvcnRfaGFpci5wbmcnLFxuXHRzaGF2ZV9oYWlyICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL3NoYXZlX2hhaXIucG5nJ1xufTtcblxuXG5jb25zdCBBY3Rpb25zID0gcmVxdWlyZSgnbHBkb2MvYWN0aW9ucy5qcycpO1xuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdscGRvYy9zdG9yZS5qcycpO1xuXG5cbnZhciBMUERvYyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dXJsIDogJycsXG5cdFx0XHRjb25maWcgOiB7fSxcblx0XHRcdGV2ZW50cyA6IFtdXG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VXBkYXRlZFN0YXRlKDAsXG5cdFx0XHR0aGlzLnByb2Nlc3NDb25maWcodGhpcy5wcm9wcy5vbGRfY29uZmlnKSk7XG5cblx0fSxcblxuXHQvL0NvbnZlcnRzIGRhdGVzIHdpdGhpbiB0aGUgY29uZmlnIHRvIG1vbWVudCBkYXRhIHN0cnVjdHVyZXNcblx0cHJvY2Vzc0NvbmZpZyA6IGZ1bmN0aW9uKGNvbmZpZyl7XG5cblx0XHRjb25maWcuc3RhcnQgPSBNb21lbnQoY29uZmlnLnN0YXJ0LCBcIk1NTSBEbywgWVlZWVwiKTtcblx0XHRjb25maWcuZW5kID0gTW9tZW50KGNvbmZpZy5lbmQsIFwiTU1NIERvLCBZWVlZXCIpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZygnQ09SRScsIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykpO1xuXG5cblx0XHRjb25maWcubGFzdFNwcml0ZSA9IHNwcml0ZXMuYmFzZTtcblx0XHRjb25maWcuZXZlbnRzID0gXy5tYXAoY29uZmlnLmV2ZW50cywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0ZXZlbnQuZGF0ZSA9IE1vbWVudChldmVudC5kYXRlLCBcIk1NTSBEbywgWVlZWVwiKTtcblx0XHRcdGlmKGV2ZW50LmxwX3Nwcml0ZSl7XG5cdFx0XHRcdGNvbmZpZy5sYXN0U3ByaXRlID0gc3ByaXRlc1tldmVudC5scF9zcHJpdGVdO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKCdzcHJpdGUnLCBjb25maWcubGFzdFNwcml0ZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGNvbmZpZztcblx0fSxcblxuXHRnZXRVcGRhdGVkU3RhdGUgOiBmdW5jdGlvbihzY3JvbGwsIGNvbmZpZyl7XG5cdFx0dmFyIGNvbmZpZyA9IGNvbmZpZyB8fCB0aGlzLnN0YXRlLmNvbmZpZztcblxuXHRcdC8vdXBkYXRlIHNjcm9sbCwgbnVtYmVyIG9mIGRheXMgcGFzc2VkLCBpdGVtcyBjb2xsZWN0ZWQsIGN1cnJlbnQgaXRlbVxuXHRcdHZhciBzY3JvbGxEYXkgPSBNb21lbnQoY29uZmlnLnN0YXJ0KS5hZGQoTWF0aC5mbG9vcihzY3JvbGwgLyBjb25maWcuZGF5UGl4ZWxSYXRpbyksICdkYXlzJyk7XG5cdFx0dmFyIGN1cnJlbnRJdGVtLCBjdXJyZW50U3ByaXRlID0gc3ByaXRlcy5iYXNlO1xuXHRcdHZhciBpdGVtc0NvbGxlY3RlZCA9IF8ucmVkdWNlKGNvbmZpZy5ldmVudHMsIGZ1bmN0aW9uKHIsIGV2ZW50KXtcblx0XHRcdGlmKGV2ZW50LmRhdGUudW5peCgpIDw9IHNjcm9sbERheS51bml4KCkpe1xuXHRcdFx0XHRyLnB1c2goZXZlbnQpO1xuXHRcdFx0XHRpZihldmVudC5scF9zcHJpdGUpIGN1cnJlbnRTcHJpdGUgPSBzcHJpdGVzW2V2ZW50LmxwX3Nwcml0ZV07XG5cdFx0XHR9XG5cdFx0XHRpZihldmVudC5kYXRlLmRpZmYoc2Nyb2xsRGF5LCAnZGF5cycpID09PSAwKSBjdXJyZW50SXRlbSA9IGV2ZW50O1xuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fSxbXSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Y29uZmlnIDogY29uZmlnLFxuXHRcdFx0c2Nyb2xsIDogc2Nyb2xsLFxuXHRcdFx0c2Nyb2xsRGF5IDogc2Nyb2xsRGF5LFxuXHRcdFx0aXRlbXNDb2xsZWN0ZWQgOiBpdGVtc0NvbGxlY3RlZCxcblx0XHRcdGN1cnJlbnRJdGVtIDogY3VycmVudEl0ZW0sXG5cdFx0XHRjdXJyZW50U3ByaXRlIDogY3VycmVudFNwcml0ZSxcblx0XHRcdHBlcmNlbnRhZ2UgOiAoc2Nyb2xsIC8gY29uZmlnLmRheVBpeGVsUmF0aW8pIC8gKCBjb25maWcuZW5kLmRpZmYoY29uZmlnLnN0YXJ0LCAnZGF5cycpKVxuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHRBY3Rpb25zLnNldENvbmZpZyh0aGlzLnByb3BzLmNvbmZpZyk7XG5cdFx0QWN0aW9ucy5zZXRFdmVudHModGhpcy5wcm9wcy5ldmVudHMpO1xuXHR9LFxuXG5cblxuXG5cdGhhbmRsZVNjcm9sbCA6IGZ1bmN0aW9uKGUpe1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5nZXRVcGRhdGVkU3RhdGUod2luZG93LnBhZ2VZT2Zmc2V0KSk7XG5cblx0XHRBY3Rpb25zLnNjcm9sbCh3aW5kb3cucGFnZVlPZmZzZXQpO1xuXG5cdFx0Y29uc29sZS5sb2coU3RvcmUuZ2V0UGVyY2VudGFnZSgpKTtcblxuXHR9LFxuXG5cdC8vUHJvYmFibHkgbW92ZVxuXHRyZW5kZXJQZXJjZW50YWdlIDogZnVuY3Rpb24oKXtcblx0XHRpZihTdG9yZS5nZXRTY3JvbGwoKSA9PSAwKSByZXR1cm47XG5cblx0XHRyZXR1cm4gXHQ8ZGl2IGNsYXNzTmFtZT0ncGVyY2VudGFnZSc+XG5cdFx0XHR7TWF0aC5yb3VuZChTdG9yZS5nZXRQZXJjZW50YWdlKCkgKiAxMDAwMCkgLyAxMDB9JVxuXHRcdDwvZGl2PlxuXHR9LFxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiA8ZGl2IGNsYXNzTmFtZT0nbHBkb2MnIG9uU2Nyb2xsPXt0aGlzLmhhbmRsZVNjcm9sbH0+XG5cdFx0XHQ8VG9wU2VjdGlvbiAvPlxuXG5cdFx0XHR7LypcblxuXHRcdFx0PFBsYXllclxuXHRcdFx0XHRjdXJyZW50U3ByaXRlPXt0aGlzLnN0YXRlLmN1cnJlbnRTcHJpdGV9XG5cdFx0XHRcdGN1cnJlbnRJdGVtPXt0aGlzLnN0YXRlLmN1cnJlbnRJdGVtfVxuXHRcdFx0XHRjb25maWc9e3RoaXMuc3RhdGUuY29uZmlnfVxuXHRcdFx0XHRzY3JvbGw9e3RoaXMuc3RhdGUuc2Nyb2xsfS8+XG5cblxuXG5cblx0XHRcdDxUaW1lbGluZVxuXHRcdFx0XHRpdGVtc0NvbGxlY3RlZD17dGhpcy5zdGF0ZS5pdGVtc0NvbGxlY3RlZH1cblx0XHRcdFx0Y3VycmVudEl0ZW09e3RoaXMuc3RhdGUuY3VycmVudEl0ZW19XG5cdFx0XHRcdHNjcm9sbERheT17dGhpcy5zdGF0ZS5zY3JvbGxEYXl9XG5cdFx0XHRcdGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdHNjcm9sbD17dGhpcy5zdGF0ZS5zY3JvbGx9IC8+XG5cblxuXHRcdFx0PEl0ZW1CYXIgaXRlbXM9e3RoaXMuc3RhdGUuaXRlbXNDb2xsZWN0ZWR9XG5cdFx0XHRcdFx0IGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdFx0IHNjcm9sbD17dGhpcy5zdGF0ZS5zY3JvbGx9Lz5cblxuXHRcdFx0PFBvaW50c0JhciBpdGVtcz17dGhpcy5zdGF0ZS5pdGVtc0NvbGxlY3RlZH0gLz5cblx0XHRcdCovfVxuXHRcdFx0e3RoaXMucmVuZGVyUGVyY2VudGFnZSgpfVxuXHRcdDwvZGl2PlxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMUERvYztcbiIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL3ZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG5cbnZhciBTcHJpdGUgPSByZXF1aXJlKCcuL3Nwcml0ZS9zcHJpdGUuanN4Jyk7XG52YXIgSXRlbUljb24gPSByZXF1aXJlKCcuLi9pdGVtSWNvbi9pdGVtSWNvbi5qc3gnKTtcblxuXG52YXIgUGxheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDAsXG5cdFx0XHRjdXJyZW50SXRlbSA6IG51bGwsXG5cdFx0XHRwZXJjZW50YWdlIDogMFxuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR2YXIgZnJhbWUgPSBNYXRoLmZsb29yKHRoaXMucHJvcHMuc2Nyb2xsIC8gMTUwKSAlIDg7XG5cblx0XHR2YXIgaXRlbUJhbm5lciA9IFtdLCBob3Zlckl0ZW07XG5cdFx0aWYodGhpcy5wcm9wcy5jdXJyZW50SXRlbSl7XG5cdFx0XHRmcmFtZSA9IDg7XG5cdFx0XHRpdGVtQmFubmVyID0gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbUJhbm5lcicga2V5PXt0aGlzLnByb3BzLmN1cnJlbnRJdGVtLmRhdGV9PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSduYW1lJz57dGhpcy5wcm9wcy5jdXJyZW50SXRlbS5uYW1lfTwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdkZXNjJz57dGhpcy5wcm9wcy5jdXJyZW50SXRlbS5kZXNjfTwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0XHRob3Zlckl0ZW0gPSAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdob3Zlckl0ZW0nPlxuXHRcdFx0XHRcdDxJdGVtSWNvbiBpdGVtPXt0aGlzLnByb3BzLmN1cnJlbnRJdGVtfSAvPlxuXHRcdFx0XHRcdDxpbWcgc3JjPScvYXNzZXRzL2xwZG9jL3NwYXJrbGUuZ2lmJyAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmKHRoaXMucHJvcHMuc2Nyb2xsID09PSAwKXtcblx0XHRcdGZyYW1lID0gODtcblx0XHRcdC8vZml4XG5cdFx0XHQvL3RoaXMucHJvcHMuY3VycmVudFNwcml0ZSA9IHRoaXMucHJvcHMuY29uZmlnLmxhc3RTcHJpdGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J3BsYXllcic+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdjb250YWluZXInPlxuXHRcdFx0XHRcdHsvKjxSZWFjdENTU1RyYW5zaXRpb25Hcm91cCB0cmFuc2l0aW9uTmFtZT1cImZhZGVcIj4qL31cblx0XHRcdFx0XHRcdHtpdGVtQmFubmVyfVxuXHRcdFx0XHRcdHsvKjwvUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXA+Ki99XG5cdFx0XHRcdFx0e2hvdmVySXRlbX1cblx0XHRcdFx0XHQ8U3ByaXRlIGZyYW1lPXtmcmFtZX0gaW1hZ2VTcmM9e3RoaXMucHJvcHMuY3VycmVudFNwcml0ZX0gLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIFNwcml0ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0aW1nIDogbnVsbCxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRmcmFtZSA6IDAsXG5cdFx0XHRmcmFtZU9mZnNldCA6IDg0LFxuXHRcdFx0aW1hZ2VTcmMgOiAnJ1xuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IHRoaXMucHJvcHMuaW1hZ2VTcmM7XG5cdFx0dGhpcy5pbWcub25sb2FkID0gZnVuY3Rpb24oKXtcblx0XHRcdHNlbGYuZHJhdygpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgOiBmdW5jdGlvbihuZXh0UHJvcHMpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRpZihuZXh0UHJvcHMuaW1hZ2VTcmMgIT09IHRoaXMucHJvcHMuaW1hZ2VTcmMpe1xuXHRcdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHRcdHRoaXMuaW1nLnNyYyA9IG5leHRQcm9wcy5pbWFnZVNyYztcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHNlbGYuZHJhdygpO1xuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5kcmF3KG5leHRQcm9wcyk7XG5cdFx0fVxuXHR9LFxuXG5cdGRyYXcgOiBmdW5jdGlvbihwcm9wcyl7XG5cdFx0cHJvcHMgPSBwcm9wcyB8fCB0aGlzLnByb3BzO1xuXHRcdHZhciBjYW52YXMgPSB0aGlzLnJlZnMuY2FudmFzLmdldERPTU5vZGUoKTtcblx0XHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0XHRjdHguY2xlYXJSZWN0ICggMCAsIDAgLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQgKTtcblx0XHRjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZyxcblx0XHRcdHByb3BzLmZyYW1lICogLTEgKiBwcm9wcy5mcmFtZU9mZnNldCxcblx0XHRcdDAsXG5cdFx0XHR0aGlzLmltZy53aWR0aCAqIDQsXG5cdFx0XHR0aGlzLmltZy5oZWlnaHQgKiA0XG5cdFx0KTtcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nc3ByaXRlJz5cblx0XHRcdFx0PGNhbnZhcyByZWY9J2NhbnZhcyc+PC9jYW52YXM+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGU7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIFBvaW50c0JhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpdGVtcyA6IFtdXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXJQb2ludHMgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBwb2ludHNSZWdleCA9IG5ldyBSZWdFeHAoL1swLTldKyBcXHcrIHBvaW50cy8pO1xuXHRcdHZhciBwb2ludHMgPSB7fTtcblx0XHR2YXIgdGVtcCA9IF8uZWFjaCh0aGlzLnByb3BzLml0ZW1zLCBmdW5jdGlvbihpdGVtKXtcblx0XHRcdHZhciBkZXNjID0gaXRlbS5kZXNjLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRpZihwb2ludHNSZWdleC50ZXN0KGRlc2MpKXtcblx0XHRcdFx0cG9pbnREZXNjID0gcG9pbnRzUmVnZXguZXhlYyhkZXNjKVswXS5zcGxpdCgnICcpO1xuXHRcdFx0XHRwb2ludHNbcG9pbnREZXNjWzFdXSA9IHBvaW50c1twb2ludERlc2NbMV1dIHx8IDA7XG5cdFx0XHRcdHBvaW50c1twb2ludERlc2NbMV1dICs9IHBvaW50RGVzY1swXSoxO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBfLm1hcChwb2ludHMsIGZ1bmN0aW9uKHZhbCwgcG9pbnROYW1lKXtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdwb2ludFJvdycga2V5PXtwb2ludE5hbWV9PlxuXHRcdFx0XHRcdDxsYWJlbD57cG9pbnROYW1lfTwvbGFiZWw+IHt2YWx9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9KVxuXHR9LFxuXG5cdHJlbmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciBwb2ludHMgPSB0aGlzLnJlbmRlclBvaW50cygpO1xuXHRcdGlmKCFwb2ludHMubGVuZ3RoKSByZXR1cm4gPG5vc2NyaXB0IC8+O1xuXHRcdHJldHVybihcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdwb2ludHNCYXInPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ndGl0bGUnPnBvaW50cyE8L2Rpdj5cblx0XHRcdFx0e3BvaW50c31cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50c0JhcjtcblxuIiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIE1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuXG5cbnZhciBJdGVtID0gcmVxdWlyZSgnLi4vaXRlbUljb24vaXRlbUljb24uanN4Jyk7XG5cbnZhciBUaW1lbGluZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRiYWNrZ3JvdW5kUG9zaXRpb24gOiAwLFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDBcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuXG5cdFx0aWYoIXRoaXMucHJvcHMuY3VycmVudEl0ZW0pe1xuXHRcdFx0dGhpcy5iYWNrZ3JvdW5kUG9zaXRpb24gKz0gbmV4dFByb3BzLnNjcm9sbCAtIHRoaXMucHJvcHMuc2Nyb2xsO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cblx0XHR2YXIgVE9QX09GRlNFVCA9IDMwMDtcblxuXG5cblx0XHQvL2NvbnNvbGUubG9nKChNb21lbnQoKS51bml4KCkgLXN0YXJ0LnVuaXgoKSkvIChlbmQudW5peCgpIC0gc3RhcnQudW5peCgpKSk7XG5cblxuXHRcdHZhciBudW1EYXlzID0gTW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxO1xuXG5cblx0XHR2YXIgbWFya2VycyA9IF8udGltZXMoTW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxLCBmdW5jdGlvbihkYXkpe1xuXHRcdFx0cmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdtYXJrZXInIGtleT17ZGF5fSBzdHlsZT17e3RvcDogY29uZmlnLmRheVBpeGVsUmF0aW8gKiBkYXkgKyBUT1BfT0ZGU0VUfX0+XG5cdFx0XHRcdHtNb21lbnQoY29uZmlnLnN0YXJ0KS5hZGQoZGF5LCAnZGF5cycpLmZvcm1hdCgnTU1NIERvJyl9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdH0pO1xuXG5cblx0XHR2YXIgaXRlbXMgPSBfLnJlZHVjZShjb25maWcuZXZlbnRzLCBmdW5jdGlvbihyLCBldmVudCl7XG5cblx0XHRcdHZhciBkYXRlID0gTW9tZW50KGV2ZW50LmRhdGUsIFwiTU1NIERvLCBZWVlZXCIpO1xuXG5cblx0XHRcdGlmKGRhdGUudW5peCgpID4gc2VsZi5wcm9wcy5zY3JvbGxEYXkudW5peCgpKXtcblxuXHRcdFx0XHR2YXIgZGF5cyA9IGRhdGUuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJyk7XG5cblx0XHRcdFx0ci5wdXNoKDxJdGVtIGl0ZW09e2V2ZW50fSBrZXk9e2V2ZW50LmRhdGUuZm9ybWF0KCl9IHN0eWxlPXt7dG9wOiBjb25maWcuZGF5UGl4ZWxSYXRpbyAqIGRheXMgKyBUT1BfT0ZGU0VUfX0+XG5cdFx0XHRcdFx0PGkgY2xhc3NOYW1lPXsnZmEgJyArIGV2ZW50Lmljb259IC8+XG5cdFx0XHRcdDwvSXRlbT4pXG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fSxbXSk7XG5cblxuXHRcdHZhciBiYWNrZ3JvdW5kU3R5bGUgPSB7fTtcblxuXHRcdFx0YmFja2dyb3VuZFN0eWxlPXtcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXlcIiA6IC10aGlzLmJhY2tncm91bmRQb3NpdGlvblxuXHRcdFx0fVxuXG5cblxuXHRcdHJldHVybihcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aW1lbGluZScgc3R5bGU9e3toZWlnaHQgOiBudW1EYXlzICogY29uZmlnLmRheVBpeGVsUmF0aW99fT5cblxuXHRcdFx0XHR7bWFya2Vyc31cblx0XHRcdFx0e2l0ZW1zfVxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYmFja2dyb3VuZCcgc3R5bGU9e2JhY2tncm91bmRTdHlsZX0+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0b3BHcmFkaWVudCc+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib3R0b21HcmFkaWVudCc+PC9kaXY+XG5cblxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuXG52YXIgTW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnbHBkb2Mvc3RvcmUuanMnKTtcblxudmFyIGdldFRpbWVPZkRheSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBob3VyID0gKG5ldyBEYXRlKS5nZXRIb3VycygpO1xuXHRpZig4ICA8PSBob3VyICYmIGhvdXIgPCAxOCl7IHJldHVybiAnZGF5JzsgfVxuXHRlbHNlIGlmKDE4IDw9IGhvdXIgJiYgaG91ciA8IDIwKXsgcmV0dXJuICdkdXNrJzsgfVxuXHRlbHNlIGlmKDYgPD0gaG91ciAmJiBob3VyIDwgOCl7IHJldHVybiAnZGF3bic7IH1cblx0ZWxzZXsgcmV0dXJuICduaWdodCc7IH1cbn1cblxudmFyIFRvcFNlY3Rpb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdC8vc2Nyb2xsIDogMCxcblx0XHRcdC8vaXNEYXlUaW1lIDogKDggPD0obmV3IERhdGUpLmdldEhvdXJzKCkpICYmICgobmV3IERhdGUpLmdldEhvdXJzKCkgPD0gMjApXG5cdFx0fTtcblx0fSxcblxuXHQvKlxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRiYWNrZ3JvdW5kUG9zaXRpb24gOiAwXG5cdFx0fTtcblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cdH0sXG5cdCovXG5cdHJlbmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0Ly92YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cdFx0Ly92YXIgcGVyY2VudGFnZSA9IChNb21lbnQoKS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSkgLyAoIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykpO1xuXG5cdFx0LypcblxuXHRcdGNvbnNvbGUubG9nKGNvbmZpZy5zdGFydCwgY29uZmlnLmVuZCk7XG5cblx0XHRjb25zb2xlLmxvZyhjb25maWcuc3RhcnQuZGlmZihjb25maWcuZW5kKSk7XG5cblx0XHRjb25zb2xlLmxvZyggY29uZmlnLmVuZC5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheScpKTtcblxuXHRcdGNvbnNvbGUubG9nKE1vbWVudCgpLmRpZmYoY29uZmlnLnN0YXJ0LCAnZGF5cycpKTtcblx0XHRjb25zb2xlLmxvZyhNb21lbnQoKS5kaWZmKE1vbWVudChcIjExLTEwLTIwMTMgMDk6MDMgQU1cIiwgXCJERC1NTS1ZWVlZIGhoOm1tIEFcIiksIFwibWludXRlXCIpKTtcblx0Ki9cblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17J3RvcFNlY3Rpb24gJyArIGdldFRpbWVPZkRheSgpIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdzdGFydE1lc3NhZ2UnPlxuXHRcdFx0XHRcdDxkaXY+U2Nyb2xsIHRvIHN0YXJ0IGhlciBhZHZlbnR1cmU8L2Rpdj5cblx0XHRcdFx0XHQ8aW1nIGNsYXNzTmFtZT0nZG93bkFycm93JyBzcmM9Jy9hc3NldHMvbHBkb2MvdG9wU2VjdGlvbi9kb3duX2Fycm93LnBuZycgLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0SG93IE11Y2ggaXMgTFAgYSBEb2N0b3I/XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nc3VidGl0bGUnPlxuXHRcdFx0XHRcdEFuIEludGVyYWN0aXZlIGFkdmVudHVyZSFcblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0b3BQZXJjZW50YWdlJz5cblx0XHRcdFx0XHQ8ZGl2PntfLnJvdW5kKFN0b3JlLmdldFBlcmNlbnRDb21wbGV0ZSgpLCAyKX0lPC9kaXY+XG5cdFx0XHRcdFx0PGltZyBzcmM9Jy9hc3NldHMvbHBkb2Mvc3BhcmtsZS5naWYnIC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm90dG9tR3JhZGllbnQnPjwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9wU2VjdGlvbjsiLCJ2YXIgZGlzcGF0Y2ggPSByZXF1aXJlKCdwaWNvLWZsdXgnKS5kaXNwYXRjaDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNldENvbmZpZyA6IGZ1bmN0aW9uKGNvbmZpZyl7XG5cdFx0ZGlzcGF0Y2goJ1NFVF9DT05GSUcnLCBjb25maWcpO1xuXHR9LFxuXHRzZXRFdmVudHMgOiBmdW5jdGlvbihldmVudHMpe1xuXHRcdGRpc3BhdGNoKCdTRVRfRVZFTlRTJywgZXZlbnRzKTtcblx0fSxcblx0c2Nyb2xsIDogZnVuY3Rpb24oc2Nyb2xsVmFsKXtcblx0XHRkaXNwYXRjaCgnU0NST0xMJywgc2Nyb2xsVmFsKTtcblx0fSxcbn0iLCJjb25zdCBmbHV4ID0gcmVxdWlyZSgncGljby1mbHV4Jyk7XG5jb25zdCBNb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY29uc3QgU3RhdGUgPSB7XG5cdHN0YXJ0IDogbnVsbCxcblx0ZW5kIDogbnVsbCxcblx0cGl4ZWxSYXRpbyA6IDMwMCxcblxuXG5cdGV2ZW50cyA6IFtdLFxuXG5cdHNjcm9sbCA6IDBcbn07XG5cbmNvbnN0IHBhcnNlRGF0ZSA9IChkYXRlKSA9PiB7XG5cdHJldHVybiBNb21lbnQoZGF0ZSwgXCJNTU0gRCwgWVlZWVwiKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZsdXguY3JlYXRlU3RvcmUoe1xuXHRTRVRfQ09ORklHIDogZnVuY3Rpb24oY29uZmlnKXtcblx0XHRTdGF0ZS5zdGFydCA9IHBhcnNlRGF0ZShjb25maWcuc3RhcnQpO1xuXHRcdFN0YXRlLmVuZCA9IHBhcnNlRGF0ZShjb25maWcuZW5kKTtcblx0XHRTdGF0ZS5waXhlbFJhdGlvID0gY29uZmlnLmRheVBpeGVsUmF0aW87XG5cdH0sXG5cblx0U0VUX0VWRU5UUyA6IGZ1bmN0aW9uKGV2ZW50cyl7XG5cdFx0U3RhdGUuZXZlbnRzID0gZXZlbnRzO1xuXHR9LFxuXHRTQ1JPTEwgOiBmdW5jdGlvbih2YWwpe1xuXHRcdGNvbnNvbGUubG9nKHZhbCk7XG5cdH0sXG59LHtcblxuXHRnZXRTY3JvbGwgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBTdGF0ZS5zY3JvbGxcblx0fSxcblxuXHRnZXRQZXJjZW50Q29tcGxldGUgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBNb21lbnQoKS5kaWZmKFN0YXRlLnN0YXJ0LCAnZGF5cycpIC8gU3RhdGUuZW5kLmRpZmYoU3RhdGUuc3RhcnQsICdkYXlzJylcblx0fSxcblxuXHRnZXRDdXJyZW50UGVyY2VudGFnZSA6IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIChTdGF0ZS5zY3JvbGwgLyBTdGF0ZS5waXhlbFJhdGlvKSAvICggU3RhdGUuZW5kLmRpZmYoU3RhdGUuc3RhcnQsICdkYXlzJykpXG5cdH1cbn0pIl19
