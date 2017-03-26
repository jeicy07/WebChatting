var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dl = require('delivery');
var fs = require('fs');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var users = [];
var dialogs = [];
var diaToSid = {};
var onliners = [];
var usernameToSid = {}; // for online users
var sidTousername = {};

var userNumber = 0;

function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

/*app.get('/',function(req, res){
  res.send('<h1>Hello World</h1>');
});

app.get('/emoji', function(req, res) {
  res.send('<span>\xF0\x9F\x98\x81</span')
});*/

app.get('/upload/:name', function(req, res) {
  var file = __dirname + '/upload/' + req.params.name;
  fs.stat(file,function(err, stat){
    if (stat && stat.isFile()) {
      res.download(file);
    } else {
      res.send('<p>此路径不合法！</p>');
    }
  })
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/account/login/', function(req, res){
  userInfo = req.body;
  console.log(userInfo);
  console.log(users);
  for (var index in users) {
    if (users[index].username === userInfo.username && users[index].password === userInfo.password) {
      res.status(200).send({ username: userInfo.username, avatar: users[index].avatar});
      return;
    }                                                                     
  }
  res.status(400).send('用户名或密码不正确');
});

app.post('/account/register/', function(req, res){
  userInfo = req.body;
  console.log(userInfo);
  if (!userInfo.username || !userInfo.password
      || userInfo.username.length > 10 || userInfo.password.length > 20
      || userInfo.password.length < 6) {
    res.status(400).send('Not Found!');                          
    return;
  }
  for (var index in users) {
    if (users[index].username === userInfo.username) {
      res.status(400).send('用户名已存在');
      return;
    }
  }
  console.log('in register');
  userInfo.avatar = String(userNumber % 2);                              
  userNumber += 1;
  users.push(userInfo);
  console.log('new account!');
  console.log(userInfo);
  console.log(users);
  res.status(200).send({ username: userInfo.username, avatar: userInfo.avatar});
});

io.on('connection', function(socket){
  var user = {name: 'vistor-' + socket.id, id: socket.id};
  console.log(socket.id + ' connectted');
  var delivery = dl.listen(socket);

  delivery.on('receive.success', function(file) {
    fs.writeFile('upload/' + file.name, file.buffer, function(err){
      if(err) {
        console.log(err);
        console.log('File could not be saved.');
      } else {
        console.log('File saved');
        console.log('get file:');
        var msg = file.params.msg;
        console.log(msg);
        if(arrayObjectIndexOf(onliners, msg.toUsr, 'username') >= 0) { // for one to one
          io.to(usernameToSid[msg.toUsr]).emit('receive-msg', msg);
          return;
        }
        if(dialogs.indexOf(msg.toUsr) >= 0) {
          var discussionName = msg.toUsr;
          var userList = diaToSid[discussionName];
          console.log(discussionName);
          console.log(userList);
          for (var index in userList) {
              var username = userList[index];
              if (usernameToSid[username] != user.id) {
                io.to(usernameToSid[username]).emit('receive-msg',msg);
                console.log('to ' + username);
                console.log(msg);
              }
          }
        }
      }
    })
  });

  socket.on('disconnect', function(){
    var sid = socket.id;
    var username = sidTousername[sid];
    delete usernameToSid[username]; // 更新在线列表
    delete sidTousername[sid];
    onliners.splice(arrayObjectIndexOf(onliners, username, 'username'), 1);
    console.log(username + ' disconnected');
    for (var index in onliners) {
      var username = onliners[index].username;
      var sid = usernameToSid[username];
      io.to(sid).emit('user-list', onliners); // 需要更新各方列表
      console.log('断开连接更新:' + sid);
      console.log(onliners);
    }
  });

  socket.on('get-user-list', function(){
    io.to(user.id).emit('user-list', onliners); // 返回列表
    console.log('to ' + user.id);
    console.log(onliners);
  });

  socket.on('get-my-info', function(){
    io.to(user.id).emit('user-info', user.id);
    console.log('give user id back!');
  });

  socket.on('get-discussion', function(username){
    var dia = [];
    for (var index in dialogs) {
      var userList = diaToSid[dialogs[index]];
      if(userList.indexOf(username) >= 0) {
        dia.push(dialogs[index]);
      }
    }
    io.to(user.id).emit('discussions', dia);
  });

  socket.on('bind-username-sid', function(data){
    console.log(data);
    var sid = user.id;
    usernameToSid[data.username] = sid;
    sidTousername[sid] = data.username;
    onliners.push(data);
    console.log('bind-username-sid!!');
    console.log(usernameToSid);
    console.log(sidTousername);
    console.log(onliners);
    for (var index in onliners) {
      var username = onliners[index].username;
      io.to(usernameToSid[username]).emit('user-list', onliners); // 有新成员加入是需要更新各方列表
      console.log('增加连接更新:' + onliners[index].username);
      console.log(onliners);
    }
  });

  socket.on('send-msg', function(msg){
    console.log('get msg:');
    console.log(msg);
    if(arrayObjectIndexOf(onliners, msg.toUsr, 'username') >= 0) { // for one to one
      io.to(usernameToSid[msg.toUsr]).emit('receive-msg', msg);
      return;
    }
    if(dialogs.indexOf(msg.toUsr) >= 0) {
      var discussionName = msg.toUsr;
      var userList = diaToSid[discussionName];
      console.log(discussionName);
      console.log(userList);
      for (var index in userList) {
          var username = userList[index];
          if (usernameToSid[username] != user.id) {
            io.to(usernameToSid[username]).emit('receive-msg',msg);
            console.log('to ' + username);
            console.log(msg);
          }
      }
    }
  });

  socket.on('add-discussion', function(discussionInfo){
    console.log('add-discussion');
    console.log(discussionInfo);
    var discussionName = discussionInfo.mates.join('+');              
    dialogs.push(discussionName);
    diaToSid[discussionName] = discussionInfo.mates;
    for (var index in discussionInfo.mates) {
      var username = discussionInfo.mates[index];
      io.to(usernameToSid[username]).emit('new-discussion',discussionName);
      console.log('to: ' + username + 'add discussion + ');
      console.log(discussionInfo);
    }
  });

  socket.on('get-all-user', function(){
    var allUserInfo = [];
    for (var index in users) {
      var temp = {};
      temp.username = users[index].username;
      temp.avatar = users[index].avatar;
    }
    io.to(user.id).emit('all-user', allUserInfo);
  });
})

http.listen(3000, function(){
  console.log('listening on port: 3000');
})

function error(str) {
  console.log(str);
}
