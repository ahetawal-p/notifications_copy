
console.log("##### MyCheez Starting up ##### " +  new Date());


var Firebase = require('firebase');
var gcm = require('node-gcm');
var API_KEY = 'AIzaSyD4QRxJV4ZIvrgq4IFe23wFLrkZYR9rnho';


// Get a reference to history 
var ref = new Firebase("https://torrid-inferno-8611.firebaseio.com/mycheez/audit_trail");
var presenceBaseRefUrl = "https://torrid-inferno-8611.firebaseio.com/mycheez/presence/";

var start = 0;
// Get the each newly added audit trail for cheese theft
ref.limitToLast(1).on("child_added", function(snapshot) {
	// hack to skip the last added node, when the process startsup again
	if(start == 0){
		start = 1; 
    console.log("This is first object skipping...");
	} else {
  		var audit = snapshot.val();
  		console.log("Audit object is " + JSON.stringify(audit));
  		var victimId = audit.victimId;
  		var thiefName = audit.thiefName;

  		var presenceRef = new Firebase(presenceBaseRefUrl + victimId);
  		presenceRef.once("value", function(data) {
  			var presenceData = data.val();
  			//console.log("Presence object is " + JSON.stringify(presenceData));
  			var isVictimOnline = presenceData.isOnline;
  			// if victim is offine send notification
  			if(!isVictimOnline){
  				var victimDeviceToken = presenceData.gcmToken;
  				if(victimDeviceToken)
  					sendPushNotification(victimDeviceToken, thiefName);
  			}
		});
  		
  	}
});


function sendPushNotification(victimDeviceToken, thiefName){
	var sender = new gcm.Sender('AIzaSyD4QRxJV4ZIvrgq4IFe23wFLrkZYR9rnho');
	var msgString = thiefName + ' just snatched your cheese!'
	var message = new gcm.Message();
	message.addData('message', msgString);
	console.log("About to send the message: " + JSON.stringify(message));
	var ids = [];
	ids.push(victimDeviceToken)
	sender.send(message, ids, 10, function(err, data) {
	    if (!err) {
		       console.log("SUCESS "); 
	    } else {
	        console.log("ERROR : " + err); 
	    }
	});
}



function exitHandler(options, err) {
	var currentTime = new Date();
	console.log("##### MyCheez Stopping ##### " + currentTime);
    if (options.cleanup) console.log('Event Type : Process Exit');
    if (err){
    	console.log(err.stack);	
    } 
    if (options.exit) {
    	console.log('Event Type : ctrl+c');
    	process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

