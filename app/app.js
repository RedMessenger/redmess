(function () {

	var App = Ember.Application.create();
	var SOCKET_SERVER_ADDR = 'http://localhost:5000';
	
	window.App = App;

	App.Router.map(function () {
		this.route("index", {path : "/"});
	});

	App.IndexController = Ember.Controller.extend({
		name : "",
		userid : "",
		actions : {
			submitForm : function () {
				if(this.get('userid') === "")
					return;

				var user_details = {name: this.get('name'), userid : this.get('userid')},
					socket = io.connect(SOCKET_SERVER_ADDR, {forceNew : true}),
					_this = this;
				App.socket = socket;

				socket.on('connect', this.handleConnection(socket, user_details));
			}
		},
		handleConnection : function (socket, user_details) {
			var _this = this;
			return function () {
				socket.emit('registeruser', user_details);
				socket.on('online_user_list', function (data) {
					// Set user list here
				});
			};
		}
	});
})();