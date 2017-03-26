var serverUrl = "http://localhost:3000";
var React = require('react');
var reflux = require('reflux');
var moment = require('moment');
var browserHistory = require('react-router').browserHistory;
var User = require('../component/user.jsx')
var socket = require('socket.io-client');
var $ = require('jquery');
var delivery;

var userStore = require('../store/userStore.js');
var chatAction = require('../action/chatAction.js');
var chatStore = require('../store/chatStore.js');

moment.locale('zh-cn');
console.log(window.location.host);
var clientUrl = 'http://' + window.location.host;
if (window.location.host === "tramory.me:4000") {
  serverUrl = "http://tramory.me:3000";
}

function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

var Chat = React.createClass({
  mixins: [
    reflux.connect(userStore, 'userInfo'),
    reflux.connect(chatStore, 'messageAll'),
  ],

  getInitialState: function(){
    return {
      username: userStore.userInfo.username,
      avatar: userStore.userInfo.avatar,
      messageAll: chatStore.messageAll,
      user: null,
      users: [],
      allUsers: [],
      discussions: [],
      message: '',
      focusId: null,
      unreadInfo: [],
      discussionMates: [],
      error: '',
    };
  },

  componentDidMount: function(){
    console.log(this.state.username);
    if (typeof(this.state.username) === 'undefined') {
      browserHistory.push('/');
    } else {
      this.connectSocket();
    }
  },

  connectSocket: function(){
    socket = socket(serverUrl);
    var temp = {};
    temp.username = this.state.username;
    temp.avatar = this.state.avatar;

    socket.on('connect', this.onConect);
    socket.emit('bind-username-sid', temp);
    socket.emit('get-my-info');
    socket.emit('get-user-list');
    socket.emit('get-all-user');
    socket.emit('get-discussion', this.state.username);
    socket.on('user-list', this.onReceiveUserList);
    socket.on('user-info', this.onReceiveUserInfo);
    socket.on('all-user',this.onReceiveAllUser)
    socket.on('discussions', this.onReceiveDiscussions);
    socket.on('receive-msg', this.onReceiveMessage);  // todo
    socket.on('disconnect', this.onDisconect);
    socket.on('error', this.onError);
    socket.on('reconnect', this.onReconnext);
    socket.on('new-discussion', this.onNewDiscussion);
  },

  sendFile: function() {
    console.log('in sendFile');
    if (this.state.focusId) {
        var file = $('#file')[0].files[0];
        if (file) {
            var msg = {
              fromUsr: this.state.username,
              toUsr: this.state.focusId,
              content: file.name,
              time: moment(new Date()).format('a h:mm:ss'),
              type: 'file',
              avatar: this.state.avatar,
            };
            var extraParams = {
                msg: msg
            };
            console.log('send file');
            $(this).val(null);
            delivery.send(file, extraParams);

            this.updateSelfDialog(msg);
        }
    }
  },

  onConect: function() {
    delivery = new Delivery(socket);

    delivery.on('delivery.connect', function(delivery) {
        $('#sendFile').click(function(){
          console.log('click sendFile');
        });
    });

    delivery.on('send.success',function(fileUID){
      console.log("file was successfully sent.");
    });
  },

  onReceiveAllUser: function(users){
    this.setState({
      allUsers: users,
    },function(){
      console.log('receive all users');
      console.log(this.state.allUsers);
    });
  },

  onReceiveDiscussions: function(discussionList) {
    console.log('on receive discussions');
    console.log(discussionList);
    var discussions = this.state.discussions;
    discussions = discussions.concat(discussionList);
    console.log(discussions);
    this.setState({
      discussions: discussions,
    },function(){
      console.log(this.state.discussions);
    });
  },

  onNewDiscussion: function(discussionName) {
    var discussions = this.state.discussions;
    discussions.push(discussionName);
    this.setState({
      discussions: discussions,
    });
    if(this.state.focusId === 'addDiscussion'){
      this.setState({
        focusId: null,
        error: '',
        discussionMates: [],
      });
    }
  },

  onDisconect: function() {
    console.log('disconnected with server');
    // handle network broken
    this.setState({
      focusId: 'offline',
    });
  },

  onReconnext: function() {
    console.log('reconnected with new id: ' + socket.id);
    socket.emit('get-my-info');
    var temp = [];
    temp.username = this.state.username;
    temp.avatar = this.state.avatar;
    socket.emit('bind-username-sid', temp);
    this.setState({
      focusId: null,
    });
  },

  onError: function() {
    console.log('error happened');
  },

  onReceiveUserList: function(userList) {
    console.log('receive user list');
    this.setState({
      users: userList,
    });
    if(this.state.focusId !== null && arrayObjectIndexOf(userList, this.state.focusId, 'username') === -1) {//用户下线
      this.setState({
        focusId: null,
      });
    }
  },

  onReceiveUserInfo: function(sid) {
    console.log('receive user info');
    this.setState({
      user: sid,
    });
    console.log(this.state);
  },

  onReceiveMessage: function(msg) {
    var fromUsr = '';

    if(arrayObjectIndexOf(this.state.users, msg.toUsr, 'username') >= 0){ // 用户消息
      fromUsr = msg.fromUsr;
      console.log('receive msg from ' + fromUsr);
      console.log(msg);
    } else {
      fromUsr = msg.toUsr;
      console.log('receive msg from ' + fromUsr);
      console.log(msg);
    }
    chatAction.receiveMsg(fromUsr, msg);
    if (this.state.focusId !== fromUsr) {
      var unread = this.state.unreadInfo;
      if (unread.indexOf(fromUsr) == -1) {
        unread.push(fromUsr);
      }
      this.setState({
        unreadInfo: unread,
      });
    }
  },

  showState: function() {
    console.log(this.state);
  },

  chooseDialog: function(user) {
    console.log('chooseDialog: ');
    console.log(user);
    this.setState({
      focusId: user,
    });
    if (this.state.unreadInfo.indexOf(user) >= 0) {
      var unread = this.state.unreadInfo;
      unread.splice(unread.indexOf(user), 1);
      this.setState({
        unreadInfo: unread,
      });
    }
  },

  handleInput: function(event) {
    this.setState({
      message: event.target.value,
    },function(){
      console.log(this.state.message);
    });
  },

  updateSelfDialog: function(msg){
    console.log('updateSelfDialog');
    chatAction.updateSelf(msg);
  },

  sendMsg: function() {
    if (this.state.message === '') {
      return ;
    } else {
      var msg = {
        fromUsr: this.state.username,
        toUsr: this.state.focusId,
        content: this.state.message,
        time: moment(new Date()).format('a h:mm:ss'),
        type: 'msg',
        avatar: this.state.avatar,
      };
       this.updateSelfDialog(msg);
       socket.emit('send-msg', msg);
       console.log(msg);
       this.setState({
         message: '',
       });
    }
  },

  addDiscussionMate: function(user) {
    var mates = this.state.discussionMates;
    if (mates.indexOf(user) >= 0) {
      mates.splice(mates.indexOf(user), 1);
    } else {
      mates.push(user);
    }
    this.setState({
      discussionMates: mates,
    },function(){
      console.log('讨论组成员：');
      console.log(this.state.discussionMates);
    });
  },

  checkAddDiscussion: function() {
    this.setState({
      focusId: 'addDiscussion',
    });
  },

  addDiscussion: function() {
    if (this.state.discussionMates.length < 2) {
      this.setState({
        error: '请至少选择两位成员',
      });
      return ;
    } else {
      var mates = this.state.discussionMates;
      mates.push(this.state.username);
      var discussionInfo = {
        mates: mates,
        owner: this.state.username,
        time: moment(new Date()).format('a h:mm:ss'),
      };
      socket.emit('add-discussion', discussionInfo);
    }
  },

  renderUserList: function(){
    console.log('render user list');
    var self = this;
    console.log(this.state.users);
    return this.state.users.filter(function(user){
      return user.username != self.state.username;
    }).map(function(user){
      console.log(user);
      return <div className={self.state.focusId === user.username ? ' focused-user' : 'single-user'} key={user.username} onClick={function(){
                                                                  self.chooseDialog(user.username);
                                                              }}>
                  <div className='user-avatar'>
                    <img src={clientUrl + '/dist/images/avatars/' + user.avatar + '.jpeg'} />
                  </div>
                  <div className='user-name'>
                    {user.username}
                    {self.state.unreadInfo.indexOf(user.username) >= 0 ? '[new message]' : null}
                  </div>
             </div>;
    });
  },

  renderDiscussions: function(){
    var self = this;
    console.log('renderDiscussions');
    console.log(this.state.discussions);
    return this.state.discussions.map(function(user){
      return <div className={self.state.focusId === user ? ' focused-user' : 'single-user'} key={user} onClick={function(){
                                                                  self.chooseDialog(user);
                                                              }}>
                  <div className='user-avatar'>
                    <img src={clientUrl + '/dist/images/avatars/discussion.jpeg'} />
                  </div>
                  <div className='user-name'>
                    {user.length > 10 ? user.slice(0,10) + '...' : user}
                    {self.state.unreadInfo.indexOf(user) >= 0 ? '[new message]' : null}
                  </div>
             </div>;
    });
  },

  renderDialog: function(){
    var self = this;
    if (typeof(this.state.messageAll[this.state.focusId]) !== 'undefined') {
      return this.state.messageAll[this.state.focusId].map(function(msg){
          if (msg.type === 'msg') {
            return <div className='single-msg' key={msg.content + msg.time}>
              { msg.fromUsr !== self.state.username ? <div className='left'>
                                                        <div className='chat-avatar'><img src={clientUrl + '/dist/images/avatars/' + msg.avatar + '.jpeg'} /></div>
                                                        <div className='msg-left'>{msg.content}</div></div> : null}
              { msg.fromUsr === self.state.username ? <div className='right'>
                                                        <div className='chat-avatar'><img src={clientUrl + '/dist/images/avatars/' + msg.avatar + '.jpeg'} /></div>
                                                        <div className='msg-right'>{msg.content}</div></div> : null}
            </div>;
          } else if (msg.type === 'file') {
            return <div className='single-msg' key={msg.content + msg.time}>
              { msg.fromUsr !== self.state.username ? <div className='left'>
                                                        <div className='chat-avatar'><img src={clientUrl + '/dist/images/avatars/' + msg.avatar + '.jpeg'} /></div>
                                                        <a href={serverUrl + '/upload/' + msg.content} target="_blank">{msg.content}</a></div> : null}
              { msg.fromUsr === self.state.username ? <div className='right'>
                                                        <div className='chat-avatar'><img src={clientUrl + '/dist/images/avatars/' + msg.avatar + '.jpeg'} /></div>
                                                        <a href={serverUrl + '/upload/' + msg.content} target="_blank">{msg.content}</a></div> : null}
            </div>;
          }

      });
    }
    return null;
  },

  renderDiscussionMate: function(){
    var self = this;
    console.log(this.state.users);
    return this.state.users.filter(function(user){
      return user.username != self.state.username;
    }).map(function(user){
      return <label key={user.username}><input type='checkbox' value={user.username} onChange={function(){
                                                                  self.addDiscussionMate(user.username);
                                                                }}></input>{user.username}</label>
    });
  },

  renderChatRoom: function(){
    console.log('in render');
    console.log(this.state.focusId);
    if (this.state.focusId === null) {
      return <div className='default'>
                <h1>Welcome to HiChat!</h1>
      </div>;
    }
    if (this.state.focusId === 'addDiscussion') {
      return <div className='addDiscussion'>
                <p>请选择讨论组成员！</p>
                { this.renderDiscussionMate() }<br/>
                <button onClick={this.addDiscussion}>确定</button>
                {this.state.error ? <p>{this.state.error}</p> : null}
             </div>;
    }
    return  <div className='chat-room'>
              <div className='chat-header'>
                <div className='name'>{ this.state.focusId }</div>
              </div>
              <div className='dialog'>
                { this.renderDialog() }
              </div>
              <div className='message'>
                <div className='text'>
                  <textarea type='text' id='inputMsg' autoFocus='true' value={this.state.message} onChange={this.handleInput} />
                </div>
                <div className='submit'>
                  <a onClick={this.sendMsg}>发送</a>
                </div>
                <div className='file'>
                  <input type='file' id='file' name='file'/>
                  <button onClick={this.sendFile} id='sendFile'>发送文件</button>
                </div>
              </div>
    </div>;
  },

  render: function(){
      console.log('render!!!');
      if(this.state.focusId !== 'offline') {
        return <div className='background-wrapper'>
                <div className='chat'>
                  <div className='chat-left'>
                      <div className='user-header'>
                          <div className='user-avatar'>
                            <img src={clientUrl + '/dist/images/avatars/' + this.state.avatar + '.jpeg'} />
                          </div>
                          <div className='user-name'>
                          { this.state.username }
                          </div>
                      </div>
                      <div className='setDiscussion'>
                        <button onClick={this.checkAddDiscussion}>建立讨论组</button> <br/>
                      </div>
                      <div className='user-list'>
                        { this.state.users.length - 1 > 0 ? null :
                          <div className='no-onliner'>
                            当前无在线用户
                          </div> }

                        { this.renderUserList() }
                        { this.state.discussions.length > 0 ? '讨论组:' : null }
                        { this.renderDiscussions() }
                        </div>
                  </div>
                  { this.renderChatRoom() }
              </div>
              </div>;
      } else {
        return <p>与服务器断开连接，请检查网络设置，连接回复后将自动登录！</p>;
      }
  }
});

module.exports = Chat;
