( async ()=> {
	const ChromeWrapper = require( "./main.js" );
	const chrome_wrapper = new ChromeWrapper();
	function disney_plus_page_ready() {
		return new Promise( async ( resolve , reject ) => {
			try {
				await chrome_wrapper.xdotool.centerMouse();
				resolve();
				return;
			}
			catch( error ) { console.log( error ); reject( error ); return; }
		});
	}
	chrome_wrapper.events.on( "websocket_message_disney_plus" , ( data ) => {
		console.log( data );
		if ( data[ "message" ] === "agent_ready" ) {
			disney_plus_page_ready();
		}
		else if ( data[ "message" ] === "mouse_inside_video_window" ) {
			chrome_wrapper.events.emit( "websocket_broadcast_to_clients" , { "channel": "disney_plus" , "message": "manual_get_time" } );
		}
		else if ( data[ "message" ] === "time_update" ) {
			//console.log( "We Should Be Tracking Time Updates to Detect a Pause" );
		}
	});
	await chrome_wrapper.openURLInAppMode( "https://www.disneyplus.com/video/e85916bf-5b05-4414-978d-a8c797a7d0c2" , "Disney+" );
	// Need to Register Emitter , and ability to register custom functions for each site
})();