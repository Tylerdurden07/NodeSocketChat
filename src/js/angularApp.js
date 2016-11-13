var app=angular.module("chatapp",[]);

app.controller("chatController",function($scope){

    $scope.chatMessages=[];
    $scope.onlinePeople=[];
    $scope.userName=prompt("Enter your ChatName");

    var socket=io.connect('http://localhost:8080');
    socket.on("connect",function(){

        socket.emit('join',$scope.userName);
    });

    socket.on("messages",function(data){
    $scope.$apply(function(){
        addChat(data,true);
    });
    });

    socket.on('add chatter',function(name){
           $scope.$apply(function(){
        addChatters(name);
    });
    });

    socket.on('remove chatter',function(name){
        $scope.$apply(function(){
           removeChatters(name);
        });
    });

    $('#sendChat').click(function(){
   // contruct the message object and emit the messages event to server
    var chatText=$('#chatText').val();
    var messageObj={ username:$scope.userName,chat:chatText}

    socket.emit("messages",messageObj);
        $scope.$apply(function(){
           addChat(messageObj,false);
        });
    });


    function addChat(msgObj,fromServer){
        $scope.chatMessages.push(msgObj);
        if(!fromServer){
             $('#chatText').val('');
        }


    }

    function addChatters(name){
        $scope.onlinePeople.push(name);
    }

    function removeChatters(name){

        var index = $scope.onlinePeople.indexOf(name);
        $scope.onlinePeople.splice(index, 1);
    }
});









