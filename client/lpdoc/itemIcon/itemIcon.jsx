
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var ItemIcon = React.createClass({

	render : function(){
		var self = this;
		var item = this.props.item;
		return(
			<div className='itemIcon' style={this.props.style}>
				<i className={"fa fa-fw " + item.icon}></i>
			</div>
		);
	}
});

module.exports = ItemIcon;