
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Sprite = React.createClass({
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
			<div className='sprite'>
				<canvas ref='canvas'></canvas>
			</div>
		);
	}
});

module.exports = Sprite;