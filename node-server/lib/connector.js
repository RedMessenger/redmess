(function () {

	var activeSockets = {};

	var connector = {
		createChannel : function (io) {
			this.io = io;
			io.on('connection', this.handleConnection(io));
		},
		handleConnection : function (io) {
			var _this = this;
			return function (socket) {
				if(!activeSockets[socket.id]) {
					activeSockets[socket.id] = {};
					activeSockets[socket.id]['socket'] = socket;
					_this.registerEvents(socket);
				}
			};
		},
		registerEvents : function (socket) {
			var _this = this;
			socket.on('registeruser', function (user_details) {
				activeSockets[socket.id]['user_details'] = user_details;
				
				var keys = Object.keys(activeSockets);
				for(var i = 0; i < keys.length; i += 1) {
					var oSock = activeSockets[keys[i]]['socket'];
					oSock.emit('online_user_list', _this.get_online_users(oSock));
				}
			});
			
			socket.on("otheruser", function (user_details) {
				var keys = Object.keys(activeSockets);
				for(var i = 0; i < keys.length; i += 1) {
					if(activeSockets[keys[i]]['user_details'].userid == user_details.userid) {
						activeSockets[socket.id]['other_socket_id'] = activeSockets[keys[i]].socket.id;
					}
				}
			});

			socket.on("messageTo", function (messageToSend) {
				var oSock = activeSockets[activeSockets[socket.id]['other_socket_id']];
				
				oSock['socket'].emit("messageFrom", {
					from : activeSockets[socket.id]['user_details'],
					to : oSock['user_details'],
					message : messageToSend
				});
			});

			socket.on('disconnect', function () {
				delete activeSockets[socket.id];

				var keys = Object.keys(activeSockets);
				for(var i = 0; i < keys.length; i += 1) {
					var oSock = activeSockets[keys[i]]['socket'];
					oSock.emit('online_user_list', _this.get_online_users(oSock));
				}
			});
		},
		get_online_users: function (socket) {
			var users = [];
			Object.keys(activeSockets).forEach(function (key) {
				if(key !== socket.id) {
					users.push(activeSockets[key]['user_details']);
				}
			});
			return users;
		}
	};

	module.exports = connector;
})();