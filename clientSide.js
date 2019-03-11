/**
 * Tony Tea
 * 10125896
 * LAB B01
 * For starting code: https://socket.io/get-started/chat/ was used.
 * 
 * Client side part of the application. Here we receive/send messages
 * Update the users that are online
 * Detect when users request to change their names and colors
 * Create cookies/modify cookies for saved information
 */
$(function () {

    var socket = io.connect();

    /**
     * When connect, check if user already stored exists (cookies) or if it is a new user. Set the display name to be person online. 
     */
    socket.on('connect', function (data) {
        var currentUser = getCookie("username");
        var userColor = getCookie("color");
        if (currentUser == "") {
            socket.emit('addUserName'); // create new user
        } else {
            socket.emit('existingUser', { nickName: currentUser, color: userColor }); // Set the existing user to its stored values.
        }
    });

    /**
     * listen to a submit event, so when user enters/clicks sends their message
     */
    $('#chatBox').submit(function (e) {
        var currentUser = getCookie("username");
        var currentColor = getCookie("color");
        e.preventDefault(); // prevents page reloading
        var mess = $('#m').val();

        // if the user enters /nick, they're requesting a nickname change
        if (mess.substring(0, 6) == '/nick ') {
            var nameArray = mess.split(" ", 2);
            var newName = nameArray[1]; // split the message, get the requested name
            socket.emit('changeName', newName); // calls changeName server side
        }

        // if the user enters /nickcolor, they're requesting a color change
        else if (mess.substring(0, 11) == '/nickcolor ') {
            var nameArray = mess.split(" ", 2);
            var colorString = nameArray[1]; // get the color in RRGGBB
            socket.emit('changeColor', colorString); // calls changeColor server side
        }

        // emit message + other info to server so it can emit to all users.
        else{
        socket.emit('chat message', { message: mess, nickName: currentUser, color: currentColor });
        }
        $('#m').val(''); 
    });

    /**
     * Receive chat messages from the server. Adds them to list of messages and 
     * displys them.
     */
    socket.on('chat message', function (msg) {
        currentColor = getCookie('color');
        currentUser = getCookie('username');
        var ms = msg.data;
        var msColor = msg.color;
        var final = ms.bold();
        var time = msg.timeStamp;

        if (msg.nick != currentUser) { // dont bold if msg not sent by current user
            $('#messages').append($('<li>').append(time + " " + "<font color='" + msColor + "'>" + msg.nick + "</font>" + ": " + msg.data));
        }
        else {
            $('#messages').append($('<li>').append(time + " " + "<font color='" + currentColor + "'>" + msg.nick + "</font>" + ": " + final));
        }
    });

    /**
     * This is only called by the server when an existing user reconnects
     */
    socket.on('getChatLog', function (chatLog) {
        chatHistory = chatLog.chat;
        currentUser = getCookie("username");
    
        for (var i = 0; i < chatHistory.length; i++) {
            var chatList = chatHistory[i].split(" ");
            var name = chatList[1].slice(0, -1);
            
            if (currentUser == name) { // bold if message belongs to current user.
                chatHistory[i] = chatHistory[i].bold();
            }

            $('#messages').append($('<li>').append(chatHistory[i]));
        }
    });

    /**
     * A display list of all online users.
     */
    socket.on('usernames', function (users) {
        var addToUsers = "";
        for (var i = 0; i < users.length; i++) {
            addToUsers += '<li>' + users[i] + '<li>';
        }
        $('#onlineUsers').html(addToUsers);
    });

    /**
     * called by server whenever the client makes changes 
     * for ex. color change request and nick name change request
     */
    socket.on('updateUser', function (name) {
        let clientName = name.nickName;
        let clientColor = name.color;
        setCookie("username", clientName); // cookies changed
        setCookie("color", clientColor);
        $('#currentName').html("<h1 id='currentNick' >" + clientName + "</h1>");
    });

    /**
     * notifies when a user has joined.
     */
    socket.on('notify', function (info) {
        var justJoined = info.nickName;
        $('#messages').append($('<li>').text(justJoined + " has just joined the chat"));
    });
  
    socket.on('notifyLeft', function(info){
        var left = info.nickName;
        $('#messages').append($('<li>').text(left + " has just left the chat"));
    });
});

// Reference: https://www.w3schools.com/js/js_cookies.asp
function setCookie(cookieName, cookieValue, cookieExDay) {
    var d = new Date();
    d.setTime(d.getTime() + (cookieExDay * 24 * 60 * 60 * 1000));
    var expiryDate = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expiryDate + ";path=/";
}

//Reference: https://www.w3schools.com/js/js_cookies.asp
function getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}