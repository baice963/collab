var express = require('express');
var app = express(); 
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;


var username = 'neversatisfied';
var key = '2aec449f821d4b699e96de4cf4a06a78';
var feed = 'enc-test';
var feed2 = 'pot-test';

const request = require('request');

app.use(express.static(__dirname+"/public"));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  // request last data
    console.log('a user connected');

  var url = 'https://io.adafruit.com/api/v2/'+username+'/feeds/'+feed+'/data/last';
  console.log(url);
  request(url,{json:true},(err,res,body)=>{
    if(err){ console.log(err); return;}
    console.log(body);
    // send to our page
    io.emit('prev_enc',body);
  });
});

http.listen(port, function(){
  console.log('Listening on *:'+port);
});


//-------- Adafruit + MQTT


// include mqtt with feed we want to use
var mqtt = require('mqtt');
var client = mqtt.connect('mqtts://io.adafruit.com',{
  port: 8883,
  username: username,
  password: key
});

var my_topic_name = username + '/f/' + feed;
var my_topic_name2 = username + '/f/' + feed2;

// connect to adafruit io


// create event callback that triggers when receive new data
client.on('connect', () => {
  console.log('MQTT connect. 2');

    client.subscribe(my_topic_name);
    client.subscribe(my_topic_name2);
});

// if an error occurs 
client.on('error', (error) => {
    console.log('MQTT Client Errored');
    console.log(error);
});

// this is where data is received
client.on('message',  (topic, message) => {
  if (topic == my_topic_name){
      
    try{
      let json = JSON.parse(message.toString());
      console.log(message.toString()); 
      // console.log("yo");
      io.emit('message', message.toString());
      
      
    }catch(error){
      console.log(error);
    }
  }
  else if (topic == my_topic_name2){
      
    try{
      let json = JSON.parse(message.toString());
      console.log(message.toString()); 
      io.emit('message2', message.toString());
      
      
    }catch(error){
      console.log(error);
    }
  }



});