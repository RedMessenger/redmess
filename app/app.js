(function () {

	var App = Ember.Application.create();
	window.App = App;

	var socket = io.connect('http://localhost:5000');
	App.socket = socket;

	App.Router.map(function () {

	});
})();