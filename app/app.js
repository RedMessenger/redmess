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
		hasJoined : false,
		users : [],
		otherUser : null,
		messages : [],

		actions : {
			submitForm : function () {
				if(this.get('userid') === "")
					return;

				var user_details = {name: this.get('name'), userid : this.get('userid')},
					socket = io.connect(SOCKET_SERVER_ADDR, {forceNew : true}),
					_this = this;
				App.socket = socket;

				socket.on('connect', this.handleConnection(socket, user_details));
			},
			selectUser : function (user) {
				var socket = App.socket;
				this.set("otherUser", user);
				socket.emit("otheruser", user);
			}
		},
		handleConnection : function (socket, user_details) {
			var _this = this;
			return function () {
				socket.emit('registeruser', user_details);
				socket.on('online_user_list', function (data) {
					_this.set('users', data);
					_this.set('hasJoined', true);
				});
			};
		},
		_clearBlankScreen : function () {
			var users = this.get('users');
			users = users.map(function (user) { return user.userid; });
			console.log(users);
			console.log(this.get('otherUser'));
			if(this.get('otherUser') && users.indexOf(this.get('otherUser').userid) < 0) {
				this.set('otherUser', null);
			}
		}.observes('users')
	});
})();