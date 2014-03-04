var exec = require('child_process').exec;
var child;
var path = require('path');
var twitter_update_with_media = require('./twitter_update_with_media.js');
var config = require('./config.js')['tumw'];
var drive = require('./config.js')['drive'];
var tuwm = new twitter_update_with_media(config);
var image_dir=path.join(__dirname, 'images/');


/*
 * @shoot 
 * @param name twitter handler
 * @param save to google drive
 * @exec raspistill, tweet image
 * 
 */
exports.shoot = function(name, save){
	var image_name = Number(new Date()) + ".jpg";
	var image_path = image_dir + image_name;

	function uploadImage(){
		tuwm.post("There you go! @"+name, image_path, function(err, response) {
			if (err) console.log(err);
			else console.log(response)
			if(save){
				upload();
				// child = exec("python bin/gdrive.py -u "+drive.username+" -p "+drive.password+" -f "+ image_path, 
				// 	function(err, stdout, stderr){
				// 		console.log(stdout);
				// 	})
				// }
			});
	}

	child = exec("raspistill -o "+ image_path +" -w 640 -h 480", function (err, stdout, stderr) {
		if(err) console.log(stderr);
		else {
			uploadImage();
		} 
	});

	var upload = function () {
		client.drive.files
		.insert({
			title: image_name,
			mimeType: 'image/jpeg'
		})
		.withMedia('image/jpeg', image_path)
		.withAuthClient(auth).execute(console.log);
	};
}