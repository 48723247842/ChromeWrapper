require( "shelljs/global" );
const spawn = require("child_process").spawn;
const WebSocket = require( "ws" );
const EventEmitter = require( "events" );

const XDoToolWrapper = require( "xdotoolwrappernode" );

class ChromeWrapper {

	constructor( options = { websocket_server: { port: 10081 } } ) {
		this.options = options;
		console.log( this.options );
		this.events = new EventEmitter();
		this.startWebSocketServer();
	}

	sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

	startWebSocketServer() {
		try {
			this.wss = new WebSocket.Server({ port: this.options.websocket_server.port });
			this.wss.on( "connection" , ( ws ) => {
				console.log( "New Client Connected to Chrome WebSocket Server" );
				this.events.on( "websocket_broadcast_to_clients" , ( message ) => {
					ws.send( JSON.stringify( message ) );
				});
				ws.on( "message" , ( data ) => {
					let parsed;
					try { parsed = JSON.parse( data ); }
					catch ( e ) { console.log( e ); return; }
					if ( !!!parsed[ "message" ] ) { return; }
					if ( !!!parsed[ "channel" ] ) { return; }
					this.events.emit( `websocket_message_${ parsed[ "channel" ] }` , parsed );
				});
			});
		}
		catch( e ) { console.log( e ); return false; }
	}

	exec( bash_command ) {
		try {
			const result = exec( bash_command , { silent: true } );
			if ( !!result.code ) {
				if ( result.code !== 0 ) {
					console.log( result.stderr );
					return false;
				}
			}
			else if ( result.stderr.length > 1 ) {
				console.log( result.stderr );
				return false;
			}
			return result.stdout.trim();
		}
		catch( error ) { console.log( error ); return false; }
	}

	killChrome() {
		return new Promise( function( resolve , reject ) {
			try {
				this.exec( "pkill -9 chrome" );
				resolve();
				return;
			}
			catch( error ) { console.log( error ); resolve( false ); return; }
		}.bind( this ) );
	}

	openURLInAppMode( url , custom_xdo_search_string = "Chrome" ) {
		return new Promise( async function ( resolve , reject ) {
			try {
				await this.killChrome();
				this.xdotool = false;
				const chrome_open_command = `require("shelljs/global"),exec("/usr/bin/google-chrome-stable --password-store=basic --enable-extensions --app=${ url } &",{silent:!0,async:!1});`;
				const spawned_chrome = spawn( "node" , [ "-e" , chrome_open_command ] , { stdio: "ignore" , detatched: true } );
				spawned_chrome.unref();
				await this.sleep( 1000 );
				this.xdotool = new XDoToolWrapper( custom_xdo_search_string );
				await this.xdotool.ensureWindowNameIsReady({ number_of_tries: 20 });
				await this.xdotool.fullScreen();
				resolve();
				return;
			}
			catch( error ) { console.log( error ); resolve( false ); return; }
		}.bind( this ) );
	}
};

module.exports = ChromeWrapper;