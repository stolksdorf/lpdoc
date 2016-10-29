
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Moment = require('moment');

var Player = require('./player/player.jsx');
var ItemBar = require('./itemBar/itemBar.jsx');
var Timeline = require('./timeline/timeline.jsx');
var TopSection = require('./topSection/topSection.jsx');
var PointsBar = require('./pointsBar/pointsBar.jsx');


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

	componentWillMount: function() {
		Actions.setConfig(this.props.config);
		Actions.setEvents(this.props.events);
	},

	componentDidMount: function() {
		window.addEventListener("scroll", this.handleScroll);
		this.handleScroll();
	},


	handleScroll : function(e){
		Actions.scroll(window.pageYOffset);
	},

	render : function(){
		return <div className='lpdoc' onScroll={this.handleScroll}>
			<TopSection />
			<Timeline />

			<Player />

			<PointsBar />

			<ItemBar/>
		</div>
	}
});

module.exports = LPDoc;
