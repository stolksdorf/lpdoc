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

		console.log('scoll!');
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
			React.createElement(Timeline, {
				itemsCollected: this.state.itemsCollected,
				currentItem: this.state.currentItem,
				scrollDay: this.state.scrollDay,
				config: this.state.config,
				scroll: this.state.scroll }),
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

var Store = require('lpdoc/store.js');

var Player = React.createClass({
	displayName: 'Player',

	mixins: [Store.mixin()],

	getDefaultProps: function getDefaultProps() {
		return {
			scroll: 0,
			currentItem: null,
			percentage: 0
		};
	},

	getInitialState: function getInitialState() {
		return this.getState();
	},
	onStoreChange: function onStoreChange() {
		this.setState(this.getState());
	},

	getState: function getState() {
		return {
			frame: Math.floor(Store.getScroll() / 150) % 8,

			currentEvent: Store.getCurrentEvent(),
			currentSprite: Store.getCurrentSprite()
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

},{"../itemIcon/itemIcon.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemIcon\\itemIcon.jsx","./sprite/sprite.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\sprite\\sprite.jsx","classnames":"classnames","lodash":"lodash","lpdoc/store.js":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\shared\\lpdoc\\store.js","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\player\\sprite\\sprite.jsx":[function(require,module,exports){
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

var Store = require('lpdoc/store.js');

var TOP_OFFSET = 300;

var Timeline = React.createClass({
	displayName: 'Timeline',

	mixins: [Store.mixin()],

	/*
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
 
 */
	getInitialState: function getInitialState() {
		return this.getState();
	},
	onStoreChange: function onStoreChange() {
		this.setState(this.getState());
	},

	getState: function getState() {
		return {
			upcomingEvents: Store.getUpcomingEvents()
		};
	},

	renderMarkers: function renderMarkers() {

		return _.times(Store.getTotalDays(), function (dayIndex) {
			return React.createElement(
				'div',
				{
					className: 'marker',
					key: dayIndex,
					style: { top: Store.getState().pixelRatio * dayIndex + TOP_OFFSET } },
				Moment(Store.getState().start).add(dayIndex, 'days').format('MMM Do')
			);
		});
	},

	renderItems: function renderItems() {
		return _.map(this.state.upcomingEvents, function (event) {
			var days = event.date.diff(Store.getState().start, 'days');
			return React.createElement(
				Item,
				{ item: event, key: event.date.format(), style: { top: Store.getState().pixelRatio * days + TOP_OFFSET } },
				React.createElement('i', { className: 'fa ' + event.icon })
			);
		});
	},

	render: function render() {

		/*
  var self = this;
  var config = this.props.config;
  
  		//console.log((Moment().unix() -start.unix())/ (end.unix() - start.unix()));
  		var numDays = Moment().diff(config.start, 'days') + 1;
  		var markers = _.times(Moment().diff(config.start, 'days') + 1, function(day){
  	});
  		var items = _.reduce(config.events, function(r, event){
  		var date = Moment(event.date, "MMM Do, YYYY");
  			if(date.unix() > self.props.scrollDay.unix()){
  			var days = date.diff(config.start, 'days');
  			r.push(<Item item={event} key={event.date.format()} style={{top: config.dayPixelRatio * days + TOP_OFFSET}}>
  			<i className={'fa ' + event.icon} />
  		</Item>)
  		}
  		return r;
  },[]);
  */

		var backgroundStyle = {};

		backgroundStyle = {
			"background-position-y": -this.backgroundPosition
		};

		return React.createElement(
			'div',
			{ className: 'timeline', style: { height: Store.getTotalDays() * Store.getState().pixelRatio } },
			this.renderMarkers(),
			this.renderItems(),
			React.createElement('div', { className: 'background', style: backgroundStyle }),
			React.createElement('div', { className: 'topGradient' }),
			React.createElement('div', { className: 'bottomGradient' })
		);
	}
});

module.exports = Timeline;

},{"../itemIcon/itemIcon.jsx":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\itemIcon\\itemIcon.jsx","classnames":"classnames","lodash":"lodash","lpdoc/store.js":"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\shared\\lpdoc\\store.js","moment":"moment","react":"react"}],"C:\\Dropbox\\root\\Programming\\Javascript\\lpdoc\\client\\lpdoc\\topSection\\topSection.jsx":[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('lodash');
var flux = require('pico-flux');
var Moment = require('moment');

var State = {
	start: null,
	end: null,
	pixelRatio: 300,

	events: [],

	scroll: 0,

	currentDay: null,
	lastCompletedEventIndex: 0,
	currentEvent: {},
	currentSprite: 'base.png',

	lastSprite: 'base.png'
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
		State.events = _.map(events, function (event) {
			if (event.sprite) State.lastSprite = event.sprite;
			return _extends({}, event, {
				date: parseDate(event.date)
			});
		});
	},
	SCROLL: function SCROLL(scroll) {
		console.log(val);

		State.scroll = scroll;
		State.currentDay = Moment(State.start).add(Math.floor(State.scroll / State.pixelRatio), 'days');

		var testEvent = function testEvent(_x, _x2) {
			var _again = true;

			_function: while (_again) {
				var event = _x,
				    idx = _x2;
				_again = false;

				if (event.date.unix() <= State.currentDay.unix()) {
					if (event.sprite) State.current = event.sprite;
					State.currentEvent = event;
					State.lastCompletedEventIndex = idx;
					_x = State.events[idx + 1];
					_x2 = idx + 1;
					_again = true;
					continue _function;
				}
			}
		};
	}
}, {
	getState: function getState() {
		return State;
	},

	getScroll: function getScroll() {
		return State.scroll;
	},

	getCurrentDay: function getCurrentDay() {
		return Moment(State.start).add(Math.floor(State.scroll / State.pixelRatio), 'days');
	},

	getPercentComplete: function getPercentComplete() {
		return Moment().diff(State.start, 'days') / State.end.diff(State.start, 'days');
	},

	getCurrentPercentage: function getCurrentPercentage() {
		return State.scroll / State.pixelRatio / State.end.diff(State.start, 'days');
	},

	getCompletedEvents: function getCompletedEvents() {
		return _.slice(State.events, 0, State.lastCompletedEventIndex);
	},
	getUpcomingEvents: function getUpcomingEvents() {
		return _.slice(State.events, State.lastCompletedEventIndex);
	},

	getCurrentEvent: function getCurrentEvent() {
		return State.currentEvent;
	},
	getCurrentSprite: function getCurrentSprite() {
		return State.currentSprite;
	},

	getTotalDays: function getTotalDays() {
		return Moment().diff(State.start, 'days') + 1;
	}
});

},{"lodash":"lodash","moment":"moment","pico-flux":"pico-flux"}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvaXRlbUJhci9pdGVtQmFyLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy9pdGVtSWNvbi9pdGVtSWNvbi5qc3giLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvbHBkb2MuanN4IiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2MvY2xpZW50L2xwZG9jL3BsYXllci9wbGF5ZXIuanN4IiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2MvY2xpZW50L2xwZG9jL3BsYXllci9zcHJpdGUvc3ByaXRlLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy9wb2ludHNCYXIvcG9pbnRzQmFyLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL2NsaWVudC9scGRvYy90aW1lbGluZS90aW1lbGluZS5qc3giLCJDOi9Ecm9wYm94L3Jvb3QvUHJvZ3JhbW1pbmcvSmF2YXNjcmlwdC9scGRvYy9jbGllbnQvbHBkb2MvdG9wU2VjdGlvbi90b3BTZWN0aW9uLmpzeCIsIkM6L0Ryb3Bib3gvcm9vdC9Qcm9ncmFtbWluZy9KYXZhc2NyaXB0L2xwZG9jL3NoYXJlZC9scGRvYy9hY3Rpb25zLmpzIiwiQzovRHJvcGJveC9yb290L1Byb2dyYW1taW5nL0phdmFzY3JpcHQvbHBkb2Mvc2hhcmVkL2xwZG9jL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSxJQUFJLEtBQUssR0FB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QU0sQ0FBQyxBQUFDLENBQUE7RUFDakY7O0FBR0QsbUJBQWtCLEVBQUcsOEJBQVU7QUFDOUIsU0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0VBQy9EO0FBQ0Qsa0JBQWlCLEVBQUcsNkJBQVU7QUFDN0IsU0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7RUFDNUQ7O0FBR0QsZ0JBQWUsRUFBRywyQkFBVTtBQUMzQixTQUFPLEtBQUssQ0FBQyxZQUFZLENBQUM7RUFDMUI7QUFDRCxpQkFBZ0IsRUFBRyw0QkFBVTtBQUM1QixTQUFPLEtBQUssQ0FBQyxhQUFhLENBQUM7RUFDM0I7O0FBRUQsYUFBWSxFQUFHLHdCQUFVO0FBQ3hCLFNBQU8sTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQzlDO0NBQ0QsQ0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG4vL3ZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBJdGVtQmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzZWxlY3RlZEl0ZW0gOiBudWxsLFxuXHRcdFx0aXRlbXMgOiBbXVxuXHRcdH07XG5cdH0sXG5cblx0Ly9UaGlzIG1ha2VzIHBpY2tpbmcgdXAgaXRlbXMgXCJzdGlja3lcIi5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG5cdFx0aWYobmV4dFByb3BzLml0ZW1zLmxlbmd0aCA+IHRoaXMuc3RhdGUuaXRlbXMubGVuZ3RoKXtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpdGVtcyA6IG5leHRQcm9wcy5pdGVtc1xuXHRcdFx0fSlcblx0XHR9XG5cdH0sXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGl0ZW1zIDogW11cblx0XHR9O1xuXHR9LFxuXHRjbGlja0l0ZW0gOiBmdW5jdGlvbihpdGVtKXtcblx0XHR2YXIgdGltZSA9IE1hdGguYWJzKGRhdGVUb1BpeGVsKGl0ZW0uZGF0ZSwgdGhpcy5wcm9wcy5jb25maWcpIC0gdGhpcy5wcm9wcy5zY3JvbGwpICogMC41O1xuXHRcdGlmKHRpbWUgPiA1MDAwKSB0aW1lID0gNTAwMDtcblxuXHRcdGFsZXJ0KCdjbGlja2VkIGl0ZW0hJyk7XG5cblx0XHQvKlxuXHRcdCQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe1xuXHRcdFx0c2Nyb2xsVG9wOiBkYXRlVG9QaXhlbChpdGVtLmRhdGUsIHRoaXMucHJvcHMuY29uZmlnKVxuXHRcdH0sIHRpbWUpO1xuXG5cdFx0Ki9cblx0fSxcblx0c2VsZWN0SXRlbSA6IGZ1bmN0aW9uKGl0ZW0pe1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogaXRlbVxuXHRcdH0pO1xuXHR9LFxuXHRkZXNlbGVjdEl0ZW0gOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWRJdGVtIDogbnVsbFxuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXG5cdFx0aWYodGhpcy5zdGF0ZS5pdGVtcy5sZW5ndGggPT09IDApIHJldHVybiA8bm9zY3JpcHQgLz47XG5cblx0XHR2YXIgaXRlbXMgPSBfLm1hcCh0aGlzLnN0YXRlLml0ZW1zLCBmdW5jdGlvbihpdGVtLCBpbmRleCl7XG5cdFx0XHRyZXR1cm4gPGRpdiBjbGFzc05hbWU9J2l0ZW0nIGtleT17aW5kZXh9XG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtzZWxmLmNsaWNrSXRlbS5iaW5kKHNlbGYsIGl0ZW0pfVxuXHRcdFx0XHRcdFx0b25Nb3VzZUVudGVyPXtzZWxmLnNlbGVjdEl0ZW0uYmluZChzZWxmLCBpdGVtKX1cblx0XHRcdFx0XHRcdG9uTW91c2VMZWF2ZT17c2VsZi5kZXNlbGVjdEl0ZW0uYmluZChzZWxmLCBpdGVtKX0+XG5cdFx0XHRcdDxpIGNsYXNzTmFtZT17J2ZhIGZhLWZ3ICcgKyBpdGVtLmljb259IC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHR9KTtcblxuXG5cdFx0dmFyIHpvb21DbGFzcyA9ICdzdGFuZGFyZCdcblx0XHRpZihpdGVtcy5sZW5ndGggPiAxMikgem9vbUNsYXNzID0gJ21pbmknO1xuXHRcdGlmKGl0ZW1zLmxlbmd0aCA+IDMyKSB6b29tQ2xhc3MgPSAnc3VwZXJfbWluaSc7XG5cblxuXHRcdHZhciBkZXNjcmlwdGlvbkJveDtcblx0XHRpZih0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbSl7XG5cdFx0XHRkZXNjcmlwdGlvbkJveCA9IDxkaXYgY2xhc3NOYW1lPSdkZXNjcmlwdGlvbkJveCc+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtTmFtZSc+e3RoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLm5hbWV9PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtRGF0ZSc+e3RoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtLmRhdGUuZm9ybWF0KFwiTU1NIERvLCBZWVlZXCIpfTwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbURlc2NyaXB0aW9uJz57dGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW0uZGVzY308L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdH1cblxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1BcmVhJz5cblx0XHRcdFx0e2Rlc2NyaXB0aW9uQm94fVxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT17J2l0ZW1CYXIgJyArIHpvb21DbGFzc30+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1UaXRsZSc+SXRlbXMgY29sbGVjdGVkPC9kaXY+XG5cdFx0XHRcdFx0e2l0ZW1zfVxuXG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbUJhcjtcblxuXG52YXIgZGF0ZVRvUGl4ZWwgPSBmdW5jdGlvbihkYXRlLCBjb25maWcpe1xuXHRyZXR1cm4gZGF0ZS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSAqIGNvbmZpZy5kYXlQaXhlbFJhdGlvO1xufSIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBJdGVtSWNvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naXRlbUljb24nIHN0eWxlPXt0aGlzLnByb3BzLnN0eWxlfT5cblx0XHRcdFx0PGkgY2xhc3NOYW1lPXtcImZhIGZhLWZ3IFwiICsgaXRlbS5pY29ufT48L2k+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtSWNvbjsiLCJcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgTW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci9wbGF5ZXIuanN4Jyk7XG52YXIgSXRlbUJhciA9IHJlcXVpcmUoJy4vaXRlbUJhci9pdGVtQmFyLmpzeCcpO1xudmFyIFRpbWVsaW5lID0gcmVxdWlyZSgnLi90aW1lbGluZS90aW1lbGluZS5qc3gnKTtcbnZhciBUb3BTZWN0aW9uID0gcmVxdWlyZSgnLi90b3BTZWN0aW9uL3RvcFNlY3Rpb24uanN4Jyk7XG52YXIgUG9pbnRzQmFyID0gcmVxdWlyZSgnLi9wb2ludHNCYXIvcG9pbnRzQmFyLmpzeCcpO1xuXG5cblxudmFyIHNwcml0ZXMgPSB7XG5cdGJhc2UgICAgICAgICAgICAgOiAnYXNzZXRzL2xwZG9jL3BsYXllci9zcHJpdGUvYmFzZS5wbmcnLFxuXHR3aGl0ZV9jb2F0ICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL3doaXRlX2NvYXQucG5nJyxcblx0d2hpdGVfY29hdF9zY29wZSA6ICdhc3NldHMvbHBkb2MvcGxheWVyL3Nwcml0ZS93aGl0ZV9jb2F0X3Njb3BlLnBuZycsXG5cdHNob3J0X2hhaXIgICAgICAgOiAnYXNzZXRzL2xwZG9jL3BsYXllci9zcHJpdGUvc2hvcnRfaGFpci5wbmcnLFxuXHRzaGF2ZV9oYWlyICAgICAgIDogJ2Fzc2V0cy9scGRvYy9wbGF5ZXIvc3ByaXRlL3NoYXZlX2hhaXIucG5nJ1xufTtcblxuXG5jb25zdCBBY3Rpb25zID0gcmVxdWlyZSgnbHBkb2MvYWN0aW9ucy5qcycpO1xuY29uc3QgU3RvcmUgPSByZXF1aXJlKCdscGRvYy9zdG9yZS5qcycpO1xuXG5cbnZhciBMUERvYyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dXJsIDogJycsXG5cdFx0XHRjb25maWcgOiB7fSxcblx0XHRcdGV2ZW50cyA6IFtdXG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VXBkYXRlZFN0YXRlKDAsXG5cdFx0XHR0aGlzLnByb2Nlc3NDb25maWcodGhpcy5wcm9wcy5vbGRfY29uZmlnKSk7XG5cblx0fSxcblxuXHQvL0NvbnZlcnRzIGRhdGVzIHdpdGhpbiB0aGUgY29uZmlnIHRvIG1vbWVudCBkYXRhIHN0cnVjdHVyZXNcblx0cHJvY2Vzc0NvbmZpZyA6IGZ1bmN0aW9uKGNvbmZpZyl7XG5cblx0XHRjb25maWcuc3RhcnQgPSBNb21lbnQoY29uZmlnLnN0YXJ0LCBcIk1NTSBEbywgWVlZWVwiKTtcblx0XHRjb25maWcuZW5kID0gTW9tZW50KGNvbmZpZy5lbmQsIFwiTU1NIERvLCBZWVlZXCIpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZygnQ09SRScsIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykpO1xuXG5cblx0XHRjb25maWcubGFzdFNwcml0ZSA9IHNwcml0ZXMuYmFzZTtcblx0XHRjb25maWcuZXZlbnRzID0gXy5tYXAoY29uZmlnLmV2ZW50cywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0ZXZlbnQuZGF0ZSA9IE1vbWVudChldmVudC5kYXRlLCBcIk1NTSBEbywgWVlZWVwiKTtcblx0XHRcdGlmKGV2ZW50LmxwX3Nwcml0ZSl7XG5cdFx0XHRcdGNvbmZpZy5sYXN0U3ByaXRlID0gc3ByaXRlc1tldmVudC5scF9zcHJpdGVdO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKCdzcHJpdGUnLCBjb25maWcubGFzdFNwcml0ZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGNvbmZpZztcblx0fSxcblxuXHRnZXRVcGRhdGVkU3RhdGUgOiBmdW5jdGlvbihzY3JvbGwsIGNvbmZpZyl7XG5cdFx0dmFyIGNvbmZpZyA9IGNvbmZpZyB8fCB0aGlzLnN0YXRlLmNvbmZpZztcblxuXHRcdC8vdXBkYXRlIHNjcm9sbCwgbnVtYmVyIG9mIGRheXMgcGFzc2VkLCBpdGVtcyBjb2xsZWN0ZWQsIGN1cnJlbnQgaXRlbVxuXHRcdHZhciBzY3JvbGxEYXkgPSBNb21lbnQoY29uZmlnLnN0YXJ0KS5hZGQoTWF0aC5mbG9vcihzY3JvbGwgLyBjb25maWcuZGF5UGl4ZWxSYXRpbyksICdkYXlzJyk7XG5cdFx0dmFyIGN1cnJlbnRJdGVtLCBjdXJyZW50U3ByaXRlID0gc3ByaXRlcy5iYXNlO1xuXHRcdHZhciBpdGVtc0NvbGxlY3RlZCA9IF8ucmVkdWNlKGNvbmZpZy5ldmVudHMsIGZ1bmN0aW9uKHIsIGV2ZW50KXtcblx0XHRcdGlmKGV2ZW50LmRhdGUudW5peCgpIDw9IHNjcm9sbERheS51bml4KCkpe1xuXHRcdFx0XHRyLnB1c2goZXZlbnQpO1xuXHRcdFx0XHRpZihldmVudC5scF9zcHJpdGUpIGN1cnJlbnRTcHJpdGUgPSBzcHJpdGVzW2V2ZW50LmxwX3Nwcml0ZV07XG5cdFx0XHR9XG5cdFx0XHRpZihldmVudC5kYXRlLmRpZmYoc2Nyb2xsRGF5LCAnZGF5cycpID09PSAwKSBjdXJyZW50SXRlbSA9IGV2ZW50O1xuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fSxbXSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Y29uZmlnIDogY29uZmlnLFxuXHRcdFx0c2Nyb2xsIDogc2Nyb2xsLFxuXHRcdFx0c2Nyb2xsRGF5IDogc2Nyb2xsRGF5LFxuXHRcdFx0aXRlbXNDb2xsZWN0ZWQgOiBpdGVtc0NvbGxlY3RlZCxcblx0XHRcdGN1cnJlbnRJdGVtIDogY3VycmVudEl0ZW0sXG5cdFx0XHRjdXJyZW50U3ByaXRlIDogY3VycmVudFNwcml0ZSxcblx0XHRcdHBlcmNlbnRhZ2UgOiAoc2Nyb2xsIC8gY29uZmlnLmRheVBpeGVsUmF0aW8pIC8gKCBjb25maWcuZW5kLmRpZmYoY29uZmlnLnN0YXJ0LCAnZGF5cycpKVxuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHRBY3Rpb25zLnNldENvbmZpZyh0aGlzLnByb3BzLmNvbmZpZyk7XG5cdFx0QWN0aW9ucy5zZXRFdmVudHModGhpcy5wcm9wcy5ldmVudHMpO1xuXHR9LFxuXG5cblxuXG5cdGhhbmRsZVNjcm9sbCA6IGZ1bmN0aW9uKGUpe1xuXG5cdFx0Y29uc29sZS5sb2coJ3Njb2xsIScpO1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5nZXRVcGRhdGVkU3RhdGUod2luZG93LnBhZ2VZT2Zmc2V0KSk7XG5cblx0XHRBY3Rpb25zLnNjcm9sbCh3aW5kb3cucGFnZVlPZmZzZXQpO1xuXG5cdFx0Y29uc29sZS5sb2coU3RvcmUuZ2V0UGVyY2VudGFnZSgpKTtcblxuXHR9LFxuXG5cdC8vUHJvYmFibHkgbW92ZVxuXHRyZW5kZXJQZXJjZW50YWdlIDogZnVuY3Rpb24oKXtcblx0XHRpZihTdG9yZS5nZXRTY3JvbGwoKSA9PSAwKSByZXR1cm47XG5cblx0XHRyZXR1cm4gXHQ8ZGl2IGNsYXNzTmFtZT0ncGVyY2VudGFnZSc+XG5cdFx0XHR7TWF0aC5yb3VuZChTdG9yZS5nZXRQZXJjZW50YWdlKCkgKiAxMDAwMCkgLyAxMDB9JVxuXHRcdDwvZGl2PlxuXHR9LFxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiA8ZGl2IGNsYXNzTmFtZT0nbHBkb2MnIG9uU2Nyb2xsPXt0aGlzLmhhbmRsZVNjcm9sbH0+XG5cdFx0XHQ8VG9wU2VjdGlvbiAvPlxuXG5cblx0XHRcdDxUaW1lbGluZVxuXHRcdFx0XHRpdGVtc0NvbGxlY3RlZD17dGhpcy5zdGF0ZS5pdGVtc0NvbGxlY3RlZH1cblx0XHRcdFx0Y3VycmVudEl0ZW09e3RoaXMuc3RhdGUuY3VycmVudEl0ZW19XG5cdFx0XHRcdHNjcm9sbERheT17dGhpcy5zdGF0ZS5zY3JvbGxEYXl9XG5cdFx0XHRcdGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdHNjcm9sbD17dGhpcy5zdGF0ZS5zY3JvbGx9IC8+XG5cblx0XHRcdHsvKlxuXG5cdFx0XHQ8UGxheWVyXG5cdFx0XHRcdGN1cnJlbnRTcHJpdGU9e3RoaXMuc3RhdGUuY3VycmVudFNwcml0ZX1cblx0XHRcdFx0Y3VycmVudEl0ZW09e3RoaXMuc3RhdGUuY3VycmVudEl0ZW19XG5cdFx0XHRcdGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdHNjcm9sbD17dGhpcy5zdGF0ZS5zY3JvbGx9Lz5cblxuXG5cblxuXG5cblxuXHRcdFx0PEl0ZW1CYXIgaXRlbXM9e3RoaXMuc3RhdGUuaXRlbXNDb2xsZWN0ZWR9XG5cdFx0XHRcdFx0IGNvbmZpZz17dGhpcy5zdGF0ZS5jb25maWd9XG5cdFx0XHRcdFx0IHNjcm9sbD17dGhpcy5zdGF0ZS5zY3JvbGx9Lz5cblxuXHRcdFx0PFBvaW50c0JhciBpdGVtcz17dGhpcy5zdGF0ZS5pdGVtc0NvbGxlY3RlZH0gLz5cblx0XHRcdCovfVxuXHRcdFx0e3RoaXMucmVuZGVyUGVyY2VudGFnZSgpfVxuXHRcdDwvZGl2PlxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMUERvYztcbiIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL3ZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG5cbnZhciBTcHJpdGUgPSByZXF1aXJlKCcuL3Nwcml0ZS9zcHJpdGUuanN4Jyk7XG52YXIgSXRlbUljb24gPSByZXF1aXJlKCcuLi9pdGVtSWNvbi9pdGVtSWNvbi5qc3gnKTtcblxuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2xwZG9jL3N0b3JlLmpzJyk7XG5cblxudmFyIFBsYXllciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zIDogW1N0b3JlLm1peGluKCldLFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDAsXG5cdFx0XHRjdXJyZW50SXRlbSA6IG51bGwsXG5cdFx0XHRwZXJjZW50YWdlIDogMFxuXHRcdH07XG5cdH0sXG5cblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRTdGF0ZSgpXG5cdH0sXG5cdG9uU3RvcmVDaGFuZ2U6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlKCkpO1xuXHR9LFxuXG5cdGdldFN0YXRlIDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZnJhbWUgOiBNYXRoLmZsb29yKFN0b3JlLmdldFNjcm9sbCgpIC8gMTUwKSAlIDgsXG5cblx0XHRcdGN1cnJlbnRFdmVudCA6IFN0b3JlLmdldEN1cnJlbnRFdmVudCgpLFxuXHRcdFx0Y3VycmVudFNwcml0ZSA6IFN0b3JlLmdldEN1cnJlbnRTcHJpdGUoKVxuXHRcdH07XG5cdH0sXG5cblxuXG5cdHJlbmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0dmFyIGZyYW1lID0gTWF0aC5mbG9vcih0aGlzLnByb3BzLnNjcm9sbCAvIDE1MCkgJSA4O1xuXG5cdFx0dmFyIGl0ZW1CYW5uZXIgPSBbXSwgaG92ZXJJdGVtO1xuXHRcdGlmKHRoaXMucHJvcHMuY3VycmVudEl0ZW0pe1xuXHRcdFx0ZnJhbWUgPSA4O1xuXHRcdFx0aXRlbUJhbm5lciA9IChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2l0ZW1CYW5uZXInIGtleT17dGhpcy5wcm9wcy5jdXJyZW50SXRlbS5kYXRlfT5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nbmFtZSc+e3RoaXMucHJvcHMuY3VycmVudEl0ZW0ubmFtZX08L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZGVzYyc+e3RoaXMucHJvcHMuY3VycmVudEl0ZW0uZGVzY308L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdFx0aG92ZXJJdGVtID0gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0naG92ZXJJdGVtJz5cblx0XHRcdFx0XHQ8SXRlbUljb24gaXRlbT17dGhpcy5wcm9wcy5jdXJyZW50SXRlbX0gLz5cblx0XHRcdFx0XHQ8aW1nIHNyYz0nL2Fzc2V0cy9scGRvYy9zcGFya2xlLmdpZicgLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblx0XHRpZih0aGlzLnByb3BzLnNjcm9sbCA9PT0gMCl7XG5cdFx0XHRmcmFtZSA9IDg7XG5cdFx0XHQvL2ZpeFxuXHRcdFx0Ly90aGlzLnByb3BzLmN1cnJlbnRTcHJpdGUgPSB0aGlzLnByb3BzLmNvbmZpZy5sYXN0U3ByaXRlO1xuXHRcdH1cblxuXHRcdHJldHVybihcblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdwbGF5ZXInPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nY29udGFpbmVyJz5cblx0XHRcdFx0XHR7Lyo8UmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAgdHJhbnNpdGlvbk5hbWU9XCJmYWRlXCI+Ki99XG5cdFx0XHRcdFx0XHR7aXRlbUJhbm5lcn1cblx0XHRcdFx0XHR7Lyo8L1JlYWN0Q1NTVHJhbnNpdGlvbkdyb3VwPiovfVxuXHRcdFx0XHRcdHtob3Zlckl0ZW19XG5cdFx0XHRcdFx0PFNwcml0ZSBmcmFtZT17ZnJhbWV9IGltYWdlU3JjPXt0aGlzLnByb3BzLmN1cnJlbnRTcHJpdGV9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBTcHJpdGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGltZyA6IG51bGwsXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZnJhbWUgOiAwLFxuXHRcdFx0ZnJhbWVPZmZzZXQgOiA4NCxcblx0XHRcdGltYWdlU3JjIDogJydcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSB0aGlzLnByb3BzLmltYWdlU3JjO1xuXHRcdHRoaXMuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRzZWxmLmRyYXcoKTtcblx0XHR9XG5cblx0fSxcblxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIDogZnVuY3Rpb24obmV4dFByb3BzKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0aWYobmV4dFByb3BzLmltYWdlU3JjICE9PSB0aGlzLnByb3BzLmltYWdlU3JjKXtcblx0XHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0XHR0aGlzLmltZy5zcmMgPSBuZXh0UHJvcHMuaW1hZ2VTcmM7XG5cdFx0XHR0aGlzLmltZy5vbmxvYWQgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRzZWxmLmRyYXcoKTtcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuZHJhdyhuZXh0UHJvcHMpO1xuXHRcdH1cblx0fSxcblxuXHRkcmF3IDogZnVuY3Rpb24ocHJvcHMpe1xuXHRcdHByb3BzID0gcHJvcHMgfHwgdGhpcy5wcm9wcztcblx0XHR2YXIgY2FudmFzID0gdGhpcy5yZWZzLmNhbnZhcy5nZXRET01Ob2RlKCk7XG5cdFx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0Y3R4LmNsZWFyUmVjdCAoIDAgLCAwICwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0ICk7XG5cdFx0Y3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsXG5cdFx0XHRwcm9wcy5mcmFtZSAqIC0xICogcHJvcHMuZnJhbWVPZmZzZXQsXG5cdFx0XHQwLFxuXHRcdFx0dGhpcy5pbWcud2lkdGggKiA0LFxuXHRcdFx0dGhpcy5pbWcuaGVpZ2h0ICogNFxuXHRcdCk7XG5cdH0sXG5cblx0cmVuZGVyIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J3Nwcml0ZSc+XG5cdFx0XHRcdDxjYW52YXMgcmVmPSdjYW52YXMnPjwvY2FudmFzPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlOyIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBQb2ludHNCYXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aXRlbXMgOiBbXVxuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyUG9pbnRzIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgcG9pbnRzUmVnZXggPSBuZXcgUmVnRXhwKC9bMC05XSsgXFx3KyBwb2ludHMvKTtcblx0XHR2YXIgcG9pbnRzID0ge307XG5cdFx0dmFyIHRlbXAgPSBfLmVhY2godGhpcy5wcm9wcy5pdGVtcywgZnVuY3Rpb24oaXRlbSl7XG5cdFx0XHR2YXIgZGVzYyA9IGl0ZW0uZGVzYy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0aWYocG9pbnRzUmVnZXgudGVzdChkZXNjKSl7XG5cdFx0XHRcdHBvaW50RGVzYyA9IHBvaW50c1JlZ2V4LmV4ZWMoZGVzYylbMF0uc3BsaXQoJyAnKTtcblx0XHRcdFx0cG9pbnRzW3BvaW50RGVzY1sxXV0gPSBwb2ludHNbcG9pbnREZXNjWzFdXSB8fCAwO1xuXHRcdFx0XHRwb2ludHNbcG9pbnREZXNjWzFdXSArPSBwb2ludERlc2NbMF0qMTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gXy5tYXAocG9pbnRzLCBmdW5jdGlvbih2YWwsIHBvaW50TmFtZSl7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ncG9pbnRSb3cnIGtleT17cG9pbnROYW1lfT5cblx0XHRcdFx0XHQ8bGFiZWw+e3BvaW50TmFtZX08L2xhYmVsPiB7dmFsfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fSlcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgcG9pbnRzID0gdGhpcy5yZW5kZXJQb2ludHMoKTtcblx0XHRpZighcG9pbnRzLmxlbmd0aCkgcmV0dXJuIDxub3NjcmlwdCAvPjtcblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0ncG9pbnRzQmFyJz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J3RpdGxlJz5wb2ludHMhPC9kaXY+XG5cdFx0XHRcdHtwb2ludHN9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludHNCYXI7XG5cbiIsIlxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBNb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuXG52YXIgSXRlbSA9IHJlcXVpcmUoJy4uL2l0ZW1JY29uL2l0ZW1JY29uLmpzeCcpO1xuXG5jb25zdCBTdG9yZSA9IHJlcXVpcmUoJ2xwZG9jL3N0b3JlLmpzJyk7XG5cbmNvbnN0IFRPUF9PRkZTRVQgPSAzMDA7XG5cbnZhciBUaW1lbGluZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zIDogW1N0b3JlLm1peGluKCldLFxuXG4vKlxuXHRiYWNrZ3JvdW5kUG9zaXRpb24gOiAwLFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjcm9sbCA6IDBcblx0XHR9O1xuXHR9LFxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcblxuXHRcdGlmKCF0aGlzLnByb3BzLmN1cnJlbnRJdGVtKXtcblx0XHRcdHRoaXMuYmFja2dyb3VuZFBvc2l0aW9uICs9IG5leHRQcm9wcy5zY3JvbGwgLSB0aGlzLnByb3BzLnNjcm9sbDtcblx0XHR9XG5cdH0sXG5cbiovXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0U3RhdGUoKTtcblx0fSxcblx0b25TdG9yZUNoYW5nZSA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlKCkpXG5cdH0sXG5cblx0Z2V0U3RhdGUgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiB7XG5cdFx0XHR1cGNvbWluZ0V2ZW50cyA6IFN0b3JlLmdldFVwY29taW5nRXZlbnRzKClcblx0XHR9XG5cdH0sXG5cblx0cmVuZGVyTWFya2VycyA6IGZ1bmN0aW9uKCl7XG5cblxuXHRcdHJldHVybiBfLnRpbWVzKFN0b3JlLmdldFRvdGFsRGF5cygpLCAoZGF5SW5kZXgpID0+IHtcblx0XHRcdHJldHVybiA8ZGl2XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPSdtYXJrZXInXG5cdFx0XHRcdFx0a2V5PXtkYXlJbmRleH1cblx0XHRcdFx0XHRzdHlsZT17e3RvcDogU3RvcmUuZ2V0U3RhdGUoKS5waXhlbFJhdGlvICogZGF5SW5kZXggKyBUT1BfT0ZGU0VUfX0+XG5cblx0XHRcdFx0e01vbWVudChTdG9yZS5nZXRTdGF0ZSgpLnN0YXJ0KS5hZGQoZGF5SW5kZXgsICdkYXlzJykuZm9ybWF0KCdNTU0gRG8nKX1cblx0XHRcdDwvZGl2PlxuXHRcdH0pO1xuXHR9LFxuXG5cdHJlbmRlckl0ZW1zIDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gXy5tYXAodGhpcy5zdGF0ZS51cGNvbWluZ0V2ZW50cywgKGV2ZW50KSA9PiB7XG5cdFx0XHR2YXIgZGF5cyA9IGV2ZW50LmRhdGUuZGlmZihTdG9yZS5nZXRTdGF0ZSgpLnN0YXJ0LCAnZGF5cycpO1xuXHRcdFx0cmV0dXJuIDxJdGVtIGl0ZW09e2V2ZW50fSBrZXk9e2V2ZW50LmRhdGUuZm9ybWF0KCl9IHN0eWxlPXt7dG9wOiBTdG9yZS5nZXRTdGF0ZSgpLnBpeGVsUmF0aW8gKiBkYXlzICsgVE9QX09GRlNFVH19PlxuXHRcdFx0XHQ8aSBjbGFzc05hbWU9eydmYSAnICsgZXZlbnQuaWNvbn0gLz5cblx0XHRcdDwvSXRlbT5cblx0XHR9KTtcblx0fSxcblxuXHRyZW5kZXIgOiBmdW5jdGlvbigpe1xuXG5cdFx0Lypcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG5cblxuXG5cblx0XHQvL2NvbnNvbGUubG9nKChNb21lbnQoKS51bml4KCkgLXN0YXJ0LnVuaXgoKSkvIChlbmQudW5peCgpIC0gc3RhcnQudW5peCgpKSk7XG5cblxuXHRcdHZhciBudW1EYXlzID0gTW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxO1xuXG5cblx0XHR2YXIgbWFya2VycyA9IF8udGltZXMoTW9tZW50KCkuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykgKyAxLCBmdW5jdGlvbihkYXkpe1xuXG5cdFx0fSk7XG5cblxuXHRcdHZhciBpdGVtcyA9IF8ucmVkdWNlKGNvbmZpZy5ldmVudHMsIGZ1bmN0aW9uKHIsIGV2ZW50KXtcblxuXHRcdFx0dmFyIGRhdGUgPSBNb21lbnQoZXZlbnQuZGF0ZSwgXCJNTU0gRG8sIFlZWVlcIik7XG5cblxuXHRcdFx0aWYoZGF0ZS51bml4KCkgPiBzZWxmLnByb3BzLnNjcm9sbERheS51bml4KCkpe1xuXG5cdFx0XHRcdHZhciBkYXlzID0gZGF0ZS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKTtcblxuXHRcdFx0XHRyLnB1c2goPEl0ZW0gaXRlbT17ZXZlbnR9IGtleT17ZXZlbnQuZGF0ZS5mb3JtYXQoKX0gc3R5bGU9e3t0b3A6IGNvbmZpZy5kYXlQaXhlbFJhdGlvICogZGF5cyArIFRPUF9PRkZTRVR9fT5cblx0XHRcdFx0XHQ8aSBjbGFzc05hbWU9eydmYSAnICsgZXZlbnQuaWNvbn0gLz5cblx0XHRcdFx0PC9JdGVtPilcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9LFtdKTtcblx0XHQqL1xuXG5cdFx0dmFyIGJhY2tncm91bmRTdHlsZSA9IHt9O1xuXG5cdFx0XHRiYWNrZ3JvdW5kU3R5bGU9e1xuXHRcdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teVwiIDogLXRoaXMuYmFja2dyb3VuZFBvc2l0aW9uXG5cdFx0XHR9XG5cblxuXG5cdFx0cmV0dXJuKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9J3RpbWVsaW5lJyBzdHlsZT17e2hlaWdodCA6IFN0b3JlLmdldFRvdGFsRGF5cygpICogU3RvcmUuZ2V0U3RhdGUoKS5waXhlbFJhdGlvfX0+XG5cblx0XHRcdFx0e3RoaXMucmVuZGVyTWFya2VycygpfVxuXHRcdFx0XHR7dGhpcy5yZW5kZXJJdGVtcygpfVxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYmFja2dyb3VuZCcgc3R5bGU9e2JhY2tncm91bmRTdHlsZX0+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0b3BHcmFkaWVudCc+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdib3R0b21HcmFkaWVudCc+PC9kaXY+XG5cblxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7IiwiXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuXG52YXIgTW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnbHBkb2Mvc3RvcmUuanMnKTtcblxudmFyIGdldFRpbWVPZkRheSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBob3VyID0gKG5ldyBEYXRlKS5nZXRIb3VycygpO1xuXHRpZig4ICA8PSBob3VyICYmIGhvdXIgPCAxOCl7IHJldHVybiAnZGF5JzsgfVxuXHRlbHNlIGlmKDE4IDw9IGhvdXIgJiYgaG91ciA8IDIwKXsgcmV0dXJuICdkdXNrJzsgfVxuXHRlbHNlIGlmKDYgPD0gaG91ciAmJiBob3VyIDwgOCl7IHJldHVybiAnZGF3bic7IH1cblx0ZWxzZXsgcmV0dXJuICduaWdodCc7IH1cbn1cblxudmFyIFRvcFNlY3Rpb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdC8vc2Nyb2xsIDogMCxcblx0XHRcdC8vaXNEYXlUaW1lIDogKDggPD0obmV3IERhdGUpLmdldEhvdXJzKCkpICYmICgobmV3IERhdGUpLmdldEhvdXJzKCkgPD0gMjApXG5cdFx0fTtcblx0fSxcblxuXHQvKlxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRiYWNrZ3JvdW5kUG9zaXRpb24gOiAwXG5cdFx0fTtcblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cdH0sXG5cdCovXG5cdHJlbmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0Ly92YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cdFx0Ly92YXIgcGVyY2VudGFnZSA9IChNb21lbnQoKS5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheXMnKSkgLyAoIGNvbmZpZy5lbmQuZGlmZihjb25maWcuc3RhcnQsICdkYXlzJykpO1xuXG5cdFx0LypcblxuXHRcdGNvbnNvbGUubG9nKGNvbmZpZy5zdGFydCwgY29uZmlnLmVuZCk7XG5cblx0XHRjb25zb2xlLmxvZyhjb25maWcuc3RhcnQuZGlmZihjb25maWcuZW5kKSk7XG5cblx0XHRjb25zb2xlLmxvZyggY29uZmlnLmVuZC5kaWZmKGNvbmZpZy5zdGFydCwgJ2RheScpKTtcblxuXHRcdGNvbnNvbGUubG9nKE1vbWVudCgpLmRpZmYoY29uZmlnLnN0YXJ0LCAnZGF5cycpKTtcblx0XHRjb25zb2xlLmxvZyhNb21lbnQoKS5kaWZmKE1vbWVudChcIjExLTEwLTIwMTMgMDk6MDMgQU1cIiwgXCJERC1NTS1ZWVlZIGhoOm1tIEFcIiksIFwibWludXRlXCIpKTtcblx0Ki9cblx0XHRyZXR1cm4oXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17J3RvcFNlY3Rpb24gJyArIGdldFRpbWVPZkRheSgpIH0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdzdGFydE1lc3NhZ2UnPlxuXHRcdFx0XHRcdDxkaXY+U2Nyb2xsIHRvIHN0YXJ0IGhlciBhZHZlbnR1cmU8L2Rpdj5cblx0XHRcdFx0XHQ8aW1nIGNsYXNzTmFtZT0nZG93bkFycm93JyBzcmM9Jy9hc3NldHMvbHBkb2MvdG9wU2VjdGlvbi9kb3duX2Fycm93LnBuZycgLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0aXRsZSc+XG5cdFx0XHRcdFx0SG93IE11Y2ggaXMgTFAgYSBEb2N0b3I/XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nc3VidGl0bGUnPlxuXHRcdFx0XHRcdEFuIEludGVyYWN0aXZlIGFkdmVudHVyZSFcblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSd0b3BQZXJjZW50YWdlJz5cblx0XHRcdFx0XHQ8ZGl2PntfLnJvdW5kKFN0b3JlLmdldFBlcmNlbnRDb21wbGV0ZSgpLCAyKX0lPC9kaXY+XG5cdFx0XHRcdFx0PGltZyBzcmM9Jy9hc3NldHMvbHBkb2Mvc3BhcmtsZS5naWYnIC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nYm90dG9tR3JhZGllbnQnPjwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9wU2VjdGlvbjsiLCJ2YXIgZGlzcGF0Y2ggPSByZXF1aXJlKCdwaWNvLWZsdXgnKS5kaXNwYXRjaDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNldENvbmZpZyA6IGZ1bmN0aW9uKGNvbmZpZyl7XG5cdFx0ZGlzcGF0Y2goJ1NFVF9DT05GSUcnLCBjb25maWcpO1xuXHR9LFxuXHRzZXRFdmVudHMgOiBmdW5jdGlvbihldmVudHMpe1xuXHRcdGRpc3BhdGNoKCdTRVRfRVZFTlRTJywgZXZlbnRzKTtcblx0fSxcblx0c2Nyb2xsIDogZnVuY3Rpb24oc2Nyb2xsVmFsKXtcblx0XHRkaXNwYXRjaCgnU0NST0xMJywgc2Nyb2xsVmFsKTtcblx0fSxcbn0iLCJjb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5jb25zdCBmbHV4ID0gcmVxdWlyZSgncGljby1mbHV4Jyk7XG5jb25zdCBNb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxuY29uc3QgU3RhdGUgPSB7XG5cdHN0YXJ0IDogbnVsbCxcblx0ZW5kIDogbnVsbCxcblx0cGl4ZWxSYXRpbyA6IDMwMCxcblxuXHRldmVudHMgOiBbXSxcblxuXHRzY3JvbGwgOiAwLFxuXG5cdGN1cnJlbnREYXkgOiBudWxsLFxuXHRsYXN0Q29tcGxldGVkRXZlbnRJbmRleCA6IDAsXG5cdGN1cnJlbnRFdmVudCA6IHt9LFxuXHRjdXJyZW50U3ByaXRlIDogJ2Jhc2UucG5nJyxcblxuXHRsYXN0U3ByaXRlIDogJ2Jhc2UucG5nJ1xufTtcblxuY29uc3QgcGFyc2VEYXRlID0gKGRhdGUpID0+IHtcblx0cmV0dXJuIE1vbWVudChkYXRlLCBcIk1NTSBELCBZWVlZXCIpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmx1eC5jcmVhdGVTdG9yZSh7XG5cdFNFVF9DT05GSUcgOiBmdW5jdGlvbihjb25maWcpe1xuXHRcdFN0YXRlLnN0YXJ0ID0gcGFyc2VEYXRlKGNvbmZpZy5zdGFydCk7XG5cdFx0U3RhdGUuZW5kID0gcGFyc2VEYXRlKGNvbmZpZy5lbmQpO1xuXHRcdFN0YXRlLnBpeGVsUmF0aW8gPSBjb25maWcuZGF5UGl4ZWxSYXRpbztcblx0fSxcblxuXHRTRVRfRVZFTlRTIDogZnVuY3Rpb24oZXZlbnRzKXtcblx0XHRTdGF0ZS5ldmVudHMgPSBfLm1hcChldmVudHMsIChldmVudCkgPT4ge1xuXHRcdFx0aWYoZXZlbnQuc3ByaXRlKSBTdGF0ZS5sYXN0U3ByaXRlID0gZXZlbnQuc3ByaXRlXG5cdFx0XHRyZXR1cm4gey4uLmV2ZW50LFxuXHRcdFx0XHRkYXRlIDogcGFyc2VEYXRlKGV2ZW50LmRhdGUpXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdFNDUk9MTCA6IGZ1bmN0aW9uKHNjcm9sbCl7XG5cdFx0Y29uc29sZS5sb2codmFsKTtcblxuXHRcdFN0YXRlLnNjcm9sbCA9IHNjcm9sbDtcblx0XHRTdGF0ZS5jdXJyZW50RGF5ID0gTW9tZW50KFN0YXRlLnN0YXJ0KS5hZGQoTWF0aC5mbG9vcihTdGF0ZS5zY3JvbGwgLyBTdGF0ZS5waXhlbFJhdGlvKSwgJ2RheXMnKTtcblxuXHRcdGNvbnN0IHRlc3RFdmVudCA9IChldmVudCwgaWR4KSA9PiB7XG5cdFx0XHRpZihldmVudC5kYXRlLnVuaXgoKSA8PSBTdGF0ZS5jdXJyZW50RGF5LnVuaXgoKSl7XG5cdFx0XHRcdGlmKGV2ZW50LnNwcml0ZSkgU3RhdGUuY3VycmVudCA9IGV2ZW50LnNwcml0ZTtcblx0XHRcdFx0U3RhdGUuY3VycmVudEV2ZW50ID0gZXZlbnQ7XG5cdFx0XHRcdFN0YXRlLmxhc3RDb21wbGV0ZWRFdmVudEluZGV4ID0gaWR4O1xuXHRcdFx0XHRyZXR1cm4gdGVzdEV2ZW50KFN0YXRlLmV2ZW50c1tpZHggKyAxXSwgaWR4ICsgMSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHR9LFxufSx7XG5cdGdldFN0YXRlIDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gU3RhdGU7XG5cdH0sXG5cblx0Z2V0U2Nyb2xsIDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gU3RhdGUuc2Nyb2xsXG5cdH0sXG5cblx0Z2V0Q3VycmVudERheSA6IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIE1vbWVudChTdGF0ZS5zdGFydCkuYWRkKE1hdGguZmxvb3IoU3RhdGUuc2Nyb2xsIC8gU3RhdGUucGl4ZWxSYXRpbyksICdkYXlzJyk7XG5cdH0sXG5cblx0Z2V0UGVyY2VudENvbXBsZXRlIDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gTW9tZW50KCkuZGlmZihTdGF0ZS5zdGFydCwgJ2RheXMnKSAvIFN0YXRlLmVuZC5kaWZmKFN0YXRlLnN0YXJ0LCAnZGF5cycpXG5cdH0sXG5cblx0Z2V0Q3VycmVudFBlcmNlbnRhZ2UgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiAoU3RhdGUuc2Nyb2xsIC8gU3RhdGUucGl4ZWxSYXRpbykgLyAoIFN0YXRlLmVuZC5kaWZmKFN0YXRlLnN0YXJ0LCAnZGF5cycpKVxuXHR9LFxuXG5cblx0Z2V0Q29tcGxldGVkRXZlbnRzIDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gXy5zbGljZShTdGF0ZS5ldmVudHMsIDAsIFN0YXRlLmxhc3RDb21wbGV0ZWRFdmVudEluZGV4KTtcblx0fSxcblx0Z2V0VXBjb21pbmdFdmVudHMgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBfLnNsaWNlKFN0YXRlLmV2ZW50cywgU3RhdGUubGFzdENvbXBsZXRlZEV2ZW50SW5kZXgpO1xuXHR9LFxuXG5cblx0Z2V0Q3VycmVudEV2ZW50IDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gU3RhdGUuY3VycmVudEV2ZW50O1xuXHR9LFxuXHRnZXRDdXJyZW50U3ByaXRlIDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gU3RhdGUuY3VycmVudFNwcml0ZTtcblx0fSxcblxuXHRnZXRUb3RhbERheXMgOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBNb21lbnQoKS5kaWZmKFN0YXRlLnN0YXJ0LCAnZGF5cycpICsgMTtcblx0fVxufSkiXX0=
