(function () {
	var express = require('express'),
		lib = require('./lib'),
		connector = lib.connector,
		http = require('http'),
		app, io, server,
		PORT_NO = 5000;

	app = express();
	app.use(express.Router());

	server = http.createServer(app);
	server.listen(PORT_NO);

	io = require('socket.io')(server);
	connector.createChannel(io);

	console.log('Server is running successfully at ' + PORT_NO);
})();