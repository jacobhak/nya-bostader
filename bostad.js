/*global $, React, Parse */
Parse.initialize('Xpq523EklDzaw99pfrCVOUJ5JiseTm3WftkAfZUG', 'lSZplVIr7QrB2gJTwsr1Qsq084PqVDq9QrXdKcyW');
var Bostad = Parse.Object.extend('Bostad');
var Lol = React.createClass({
  getInitialState: function() {
    return {data: [], numberOfNew: 0, filteredParsedObjects:[]};
  },
  fetchHTML: function() {
    $.get('https://bostad.stockholm.se/Lista/', function(data) {
      var parsed = $.parseHTML(data);
      var table = $(data).find('tbody');
      var coll = table.children().map(function(index, object){
	console.log("new row");
	var elements = $(object).children();
	var model = {
	  kommun: ''+$(elements[0]).text().trim(),
	  stadsdel: ''+$(elements[1]).text().trim(),
	  gatuadress: ''+$(elements[2]).text().trim(),
	  vaning: parseFloat($(elements[3]).text().trim()),
	  rum: parseFloat($(elements[4]).text().trim()),
	  yta: parseInt($(elements[5]).text().trim()),
	  hyra: parseInt($(elements[6]).text().trim()),
	  slut: ""+$(elements[7]).text().trim(),
	  typ:''+$(elements[8]).find('span.objProp.small').text().trim(),
	  link: ''+$(elements[2]).children().first().attr('href')
	};
//	var bostad = new Bostad();
	//	bostad.save(model);
	this.saveIfNew(model);
	return model;
//	console.log($(object).children().first().html());	
      }.bind(this));
//      console.log(coll);
      this.setState({data: coll});
//      this.setState({data: parsed});
    }.bind(this));
  },
  saveIfNew: function(newBostad) {
    var query = new Parse.Query(Bostad);
    query.equalTo('kommun', newBostad.kommun);
    query.equalTo('gatuadress', newBostad.gatuadress);
    query.equalTo('vaning', newBostad.vaning);
    query.equalTo('yta', newBostad.yta);
    query.equalTo('hyra', newBostad.hyra);
    query.count({
      success: function(count) {
	if (count === 0) {
	  var bostad = new Bostad();
	  bostad.save(newBostad);
	  console.log("added new bostad");
	  console.log(newBostad);
	  
	}
      }.bind(this)
    });
  },
  newToday: function() {
    var query = new Parse.Query(Bostad);
    var date = new Date();
    date.setDate(date.getDate() - 1);
    query.greaterThanOrEqualTo("createdAt", date);
    query.count({
      success: function(count) {
	this.setState({numberOfNew: count});
      }.bind(this)
    });
  },
  newTodayWithFilter: function () {
    var query = new Parse.Query(Bostad);
    var date = new Date();
    date.setDate(date.getDate() - 1);
    query.greaterThanOrEqualTo("createdAt", date);
    query.greaterThanOrEqualTo("hyra", 3000);
    query.lessThanOrEqualTo("hyra", 7000);
    query.greaterThanOrEqualTo("yta", 20);
    query.lessThanOrEqualTo("yta", 50);
//    query.greaterThanOrEqualTo("rum", 1);
//    query.lessThanOrEqualTo("rum", 2);
    query.notEqualTo('kommun', 'Uppsala');
    query.ascending('hyra');
    query.find({
      success: function(objects) {
	this.setState({filteredParsedObjects: objects, numberOfNew: objects.length});
      }.bind(this)
    });    
  },
  componentDidMount: function() {
    this.fetchHTML();
    //    this.newToday();
    this.newTodayWithFilter();
  },
  render: function() {
    //	<p>{JSON.stringify(this.state.filteredParsedObjects)}</p>
    return (
      <div>
	<h1>Nya Bostäder</h1>
	<p>Nya idag: {this.state.numberOfNew} </p>
	<BostadTable data={this.state.filteredParsedObjects} />
	</div>
    );
  }
});
var BostadRow = React.createClass({
  render: function() {
//    var nodes = this.props.data.map(function(param) {
//      return (
//          <td>{param}</td>
//      );
//    });
    return (
	<tr>
	<td>{this.props.data.get('kommun')}</td>
	<td>{this.props.data.get('stadsdel')}</td>
	<td>{this.props.data.get('rum')}</td>
	<td>{this.props.data.get('hyra')} kr</td>
	<td>
	<a href={'https://bostad.stockholm.se'+this.props.data.get('link')}>
	{this.props.data.get('gatuadress')}
      </a>
      </td>
	<td>{this.props.data.get('yta')}</td>
	<td>{this.props.data.get('slut')}</td>
	<td>{this.props.data.get('typ')}</td>
	
	</tr>
    );
  }
});
var BostadTable = React.createClass({
  render: function() {
    var nodes = this.props.data.map(function(bostad) {
      console.log(bostad);
      return (
          <BostadRow data={bostad} />
      );
    });
    return (
	<div>
	<table>
	<thead>
	<td>{'Kommun'}</td>
	<td>{'Stadsdel'}</td>
	<td>{'Rum'}</td>
	<td>{'Hyra'}</td>
	<td>{'Adress'}</td>
	<td>{'Yta'}</td>
	<td>{'Slutar'}</td>
	<td>{'Typ'}</td>
	
	</thead>
	<tbody>
	{nodes}
      </tbody>
	</table>
	</div>
    );
  }
});
React.render(
    <Lol />, document.getElementById('main')
);
