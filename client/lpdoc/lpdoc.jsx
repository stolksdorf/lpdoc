/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;
var $ = require('jquery');

var Player = require('./player/player.jsx');
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

	componentDidMount: function() {
		var self = this;
		window.title = 'PACHOW!';

		$.getJSON('https://dl.dropboxusercontent.com/u/562800/lpdoc_config.json', function(config){
			console.log(config);
			self.setState({
				config : config
			})
		})

		$(window).on('scroll', function(e) {
			self.handleScroll(window.pageYOffset);
		});

		$(document)
			.mousedown(function(e) {
				self.setState({
					PACHOW : {
						show : false,
						x : e.clientX,
						y : e.clientY
					}
				})
			})
			.mouseup(function(e) {
				self.setState({
					PACHOW : {
						show : false
					}
				})
			})

	},




	handleScroll: function(top) {
		this.setState({
			scroll : top
		})
	},

	render : function(){
		var self = this;

		if(!this.state.config) return <noscript />

		return(
			<div className='lpdoc'>
				<TopSection />



				<Player config={this.state.config} scroll={this.state.scroll}/>

				<img src="/assets/lpdoc/pachow.png" className={cx({
					PACHOW : true,
					show : this.state.PACHOW.show
				})} style={{
					top : this.state.PACHOW.y,
					left : this.state.PACHOW.x,
				}}></img>



				<Timeline config={this.state.config} scroll={this.state.scroll} />






			</div>
		);
	}
});

module.exports = lpdoc;