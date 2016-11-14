var express = require('express');
var app = express();
var server = require('http').createServer(app);
var redis = require('redis');
var redisClient = redis.createClient();
var PORT=8080;


redisClient.on('error',function(error){
    console.log("redis error : "+error);
});


var io = require('socket.io')(server);
// to hold the offline messages later this will be stored to redis
var messages = [];

function saveMessages(chatMessage) {
    var jsonstring = JSON.stringify(chatMessage);
    redisClient.lpush("messages", jsonstring, function (err, response) {
        redisClient.ltrim("messages", 0, 9);
    })
    messages.push(chatMessage);
    if (messages.length > 10) {
        messages.shift();
    }
}

io.on('connection', function (client) {

    console.log('client connected');

        client.on('join', function (nickName) {
        client.nickName = nickName;

        client.emit('add chatter',nickName);

        // iterate through chatters to show online users
        redisClient.smembers('chatters',function(err,names){
         names.forEach(function(name){
             client.emit('add chatter',name);
         })
        });
        redisClient.sadd('chatters',nickName);

        //iterate stored messages to display when user joins chat
        redisClient.lrange("messages", 0, -1, function (err, redisMessages) {
            redisMessages = redisMessages.reverse();
            redisMessages.forEach(function(chat){
                console.log("emitting ..."+ JSON.stringify(chat));
               client.emit('messages',JSON.parse( chat));
            });


        });


    });



    client.on('messages', function (data) {
        client.broadcast.emit('messages', data);
        saveMessages(data);
    });
    // temp comment
   /* client.on('disconnect',function(name){
        client.get('nickName',function(err,name){
        client.broadcast.emit('remove chatter',name);
            redisClient.srem('chatters',name);
        });
    })*/

});



app.use(express.static('public'));
app.use(express.static('src'));
app.get('/', function (req, res) {

    res.sendFile(__dirname + "/index.html");
});

server.listen(PORT, function () {
    console.log("server is running at port:"+PORT);

})
