/**
 * Tony Tea
 * 10125896
 * LAB B01
 * For starting code: https://socket.io/get-started/chat/ was used.
 * 
 * Javascript serverside part of the application
 * We emit messages from clients to all the other clients
 * store messages in a list to keep a chat log
 * Make the changes when a user requests a color change or a name change
 * handles connect/disconnects
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userNameList = [];
var chatLog = [];
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var currentUsers = {};
var today = new Date();
var time = today.getHours() + ":" + today.getMinutes();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(cookieParser());

app.get('/styles.css', function (req, res) {
  res.sendFile(__dirname + '/styles.css');
});

app.get('/clientSide.js', function (req, res) {
  res.sendFile(__dirname + '/clientSide.js');
});

io.on('connection', function (socket) {

  // for a new user, we will add a user name, generate a uniqueID
  socket.on('addUserName', function () {
    let uniqueVal = "Anonymous" + Math.floor(Math.random() * 100 + 1);
    // prevent duplicates
    for (var i = 0; i<currentUsers.length; i++){
      if (uniqueVal == currentUsers[i].nickName){
        uniqueVal = "Anonymous" + Math.floor(Math.random() * 100 + 1);
        break;
      }
    }
    currentUsers[socket.id] = { nickName: uniqueVal, color: "000000" };
    userNameList.push(currentUsers[socket.id].nickName);
    userOnline();
  });

  /**
  * restore information for existing users, cookies passed in from clientside
  */
  socket.on('existingUser', function (info) {
    let existingName = info.nickName;
    let existingColor = info.color;
    currentUsers[socket.id] = { nickName: existingName, color: existingColor };
    userNameList.push(currentUsers[socket.id].nickName);
    userOnline();
  });

  /**
   * nick name is changed when user enters /nick <newname> on clientside
   will refuse if name is already taken 
   */
  socket.on('changeName', function (name) {
    for (var i = 0; i < userNameList.length; i++) {
      var sameName = false;
      if (userNameList[i] == name) {
        // edit this later for error msg in chat
        console.log("username already taken");
        sameName = true;
        break;
      }
    }
    if (sameName == false) {
      var index = userNameList.indexOf(currentUsers[socket.id].nickName);
      if (index != -1) {
        userNameList[index] = name;
      }
      currentUsers[socket.id].nickName = name;
      editInfo();
    }
  });

  /**
   * color change request
   */
  socket.on('changeColor', function (colorVal) {
    currentUsers[socket.id].color = colorVal;
    editInfo();
  });

  /**
   * simple function that sends the changes made to client
   */
  function editInfo() {
    io.emit('usernames', userNameList);
    socket.emit('updateUser', currentUsers[socket.id]);
  }

  /**
   * simple function that will set up the display when user is online
   */
  function userOnline() {
    socket.emit('getChatLog', { chat: chatLog, userID: currentUsers[socket.id].nickName });
    socket.emit('notify', currentUsers[socket.id]);
    io.emit('usernames', userNameList);
    socket.emit('updateUser', currentUsers[socket.id]);
  }

  /**
   * sends messages to all clients.
   */
  socket.on('chat message', function (msg) {
    var clientMessage = msg.message;
    var msgColor = msg.color;

    if (chatLog.length < 200) { // stores up to 200 messages
      chatLog.push(time + " " + "<font color='" + msgColor + "'>" + msg.nickName + "</font>" + ": " + msg.message + "\n");
    }
    io.emit('chat message', { data: clientMessage, nick: msg.nickName, timeStamp: time, color: msgColor }); 
  });

  /**
   * update the list of names whenever something changes
   */
  function updateNames() {
    io.emit('usernames', userNameList);
  }

  /**
   * When disconnecting, remove from list and notify other users that 
   * the person left
   */
  socket.on('disconnect', function (data) {
    io.emit('notifyLeft', currentUsers[socket.id]);
    userNameList.splice(userNameList.indexOf(currentUsers[socket.id].nickName), 1);
    updateNames();
  });
  
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});