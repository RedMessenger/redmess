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
			console.log(socket.id);
			socket.on('registeruser', function (user_details) {
				
				console.log(user_details);
				activeSockets[socket.id]['user_details'] = user_details;
				
				var users = [];
				Object.keys(activeSockets).forEach(function (key) {
					if(key !== socket.id) {
						users.push(activeSockets[key]['user_details']);
					}
				});
				console.log(users);
				
				socket.emit('online_user_list', users);
			});
		}
	};

	module.exports = connector;
})();