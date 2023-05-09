if (window == top) {
	window.stop ? window.stop() : document.execCommand("Stop");
	if ( _config ) {
		window.location.href = _config.server.appointment + "manage";
	} else {
		window.location.href = "/manage";
	}
}