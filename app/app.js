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
				user.set('areMessages', false);
				if(!user.get('messages'))
					user.set('messages', []);
				this.set('messages', user.get('messages'));
				this.set("otherUser", user);
				socket.emit("otheruser", user);
			}
		},
		mod_users: function () {
			return this.get('users');
		}.property('users','users.[]'),

		handleConnection : function (socket, user_details) {
			var _this = this;
			return function () {
				socket.emit('registeruser', user_details);
				
				socket.on('online_user_list', function (data) {
					var users = [];
					data.forEach(function (user) {
						users.pushObject(Ember.Object.create(user));
					});
					_this.set('users', users);
					_this.set('hasJoined', true);
				});

				socket.on("messageFrom", function (msgObj) {
					var users = _this.get('users'),
						isNotInView = (_this.get('otherUser') && _this.get('otherUser.userid') !== msgObj.from.userid) ||
										!_this.get('otherUser');

					for(var i = 0; i < users.length; i += 1) {
						var user = users[i];
						if(user.get('userid') == msgObj.from.userid) {
							var messages = user.hasOwnProperty('messages') ?
											user.get('messages') : [];

							messages.pushObject({
								direction : 'other',
								body : msgObj.message
							});
							user.set('messages', messages);
							user.set('messageCount', messages.length);
							user.set('areMessages', messages.length > 0 && isNotInView);
						}
						users[i] = user;
					}

					_this.set('users', users);

					if(isNotInView) {
						return;
					}
				});
			};
		},
		
		_sendMessage: function () {
			var messageToSend = this.get('messageToSend'),
				_this = this;
			if(messageToSend.indexOf('\n') > 0) {
				var socket = App.socket;
				_this.set('messageToSend',"");

				socket.emit("messageTo", messageToSend);
				
				_this.get('messages').pushObject({
					direction : 'self',
					body : messageToSend
				});
			}
		}.observes('messageToSend'),

		_clearBlankScreen : function () {
			var users = this.get('users');
			users = users.map(this.mapUserId);
			
			if(this.get('otherUser') && users.indexOf(this.get('otherUser.userid')) < 0) {
				this.set('otherUser', null);
			}
		}.observes('users'),

		mapUserId : function (user) {
			return user.userid;
		}
	});
})();