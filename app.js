/**
 * Module dependecies
 */

var path = require('path');
var config = require('./config.js')['ntwitter'];
var twitter = require('ntwitter');
var controller = require('./controller.js');
var drive = require('./config.js')['drive'];
var googleapis = require('googleapis');
var readline = require('readline');
var auth = new googleapis.OAuth2Client(drive.client_id, drive.client_secret, drive.redirect_url);

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

googleapis.discover('drive', 'v2').execute(function (err, client) {
	var url = auth.generateAuthUrl({
		scope: drive.scope
	});
	var getAccessToken = function (code) {
		auth.getToken(code, function (err, tokens) {
			if (err) {
				console.log('Google Drive: Error while trying to retrieve access token', err);
				return;
			}
			auth.credentials = tokens;
			console.log('Authenticated successfully with Google Drive.');

			//Twitter API Config
			var twit = new twitter(config);

			// Twitter symbols array
			var watch = ['#GBeamCam', '#GBeamSave'];
			var restrictedScreenNames = ['derekhaddad', 'r_hamzeh'];

			twit.verifyCredentials(function (err, data) {
				if (err) console.log(err);
			})
				.stream('user', {
					track: watch
				}, function (stream) {
					console.log('Twitter stream is ready and waiting for incoming tweets...')
					stream.on('data', function (data) {

						if (data.text !== undefined) {

							var name = data.user.screen_name;
							// If no restricted names are given, accept everything
							if (restrictedScreenNames.length < 1 || restrictedScreenNames.indexOf(name) !== -1) {
								var hashtags = data.entities.hashtags;

								var options = {
									cam: false,
									save: false
								}

								for (var i = 0, l = hashtags.length; i < l; i++) {
									if (hashtags[i].text.toLowerCase() == 'gbeamcam') options.cam = true;
									if (hashtags[i].text.toLowerCase() == 'gbeamsave') options.save = true;
								}
								if (options.cam) {
									if (options.save) controller.shoot(name, true);
									else controller.shoot(name, false);
								}
							}
						}
					});

					stream.on('error', function (err, code) {
						console.log('Twiiter: Error in retrieving stream (' + err + ' ' + code + ')');
					});
				});

		});
	};

	console.log('To authenticate using Google Drive, please visit the url: ', url);
	rl.question('Enter the code here:', getAccessToken);
});