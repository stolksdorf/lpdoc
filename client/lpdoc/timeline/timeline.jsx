/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;






var isPastScrollDate = function(scroll, date){

}


var Timeline = React.createClass({

	render : function(){
		var self = this;




		var dayRatio = 150;

		var config = this.props.config;



		var start = moment(config.start, "MMM Do, YYYY");
		var end = moment(config.end, "MMM Do, YYYY");


		var scrollDay = moment(start).add(Math.floor(this.props.scroll / dayRatio), 'days');




		//console.log((moment().unix() -start.unix())/ (end.unix() - start.unix()));


		var numDays = moment().diff(start, 'days') + 1;


		var markers = _.times(moment().diff(start, 'days') + 1, function(day){
			return <div className='marker' key={day} style={{top: dayRatio * day}}>
				{moment(start).add(day, 'days').format('MMM Do')}
				</div>
		});


		var items = _.reduce(config.events, function(r, event){

			var date = moment(event.date, "MMM Do, YYYY");


			if(date.unix() > scrollDay.unix()){

				var days = date.diff(start, 'days');

				r.push(<div className='item' key={event.name} style={{top: dayRatio * days}}>
					<i className={'fa ' + event.icon} />
				</div>)

			}

			return r;
		},[]);



		return(
			<div className='timeline' style={{height : numDays * dayRatio}}>
				{markers}
				{items}
				<div className='background'></div>


			</div>
		);
	}
});

module.exports = Timeline;