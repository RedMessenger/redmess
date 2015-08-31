(function () {

	var connector = {
		createChannel : function (io) {
			this.io = io;
			io.of("/messenger.html").on('connection', this.handleConnection(io));
		},
		handleConnection : function (io) {
			return function (socket) {
				console.log("Connection message received");
			};
		}
	};

	module.exports = connector;
})();