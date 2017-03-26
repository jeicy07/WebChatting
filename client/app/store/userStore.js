var reflux = require('reflux');
var loginAction = require('../action/loginActions.js');

var userStore = reflux.createStore({
  init: function(){
    this.userInfo = {};
    this.listenTo(loginAction.register.completed, this.onRegisterCompleted);
    this.listenTo(loginAction.login.completed, this.onLoginCompleted);
    this.listenTo(loginAction.login.failed, this.onLoginFailed);
  },

  onRegisterCompleted: function(data){
    console.log(data);
    this.userInfo.username = data.username;
    this.userInfo.avatar = data.avatar;
    this.trigger(data);
  },

  onLoginCompleted: function(data) {
    console.log(data);
    this.userInfo.username = data.username;
    this.userInfo.avatar = data.avatar;
    console.log(this.userInfo);
    console.log('login sueecss!');
    this.trigger(data);
  },

  onLoginFailed: function() {
    console.log('login failed');
  },
});

module.exports = userStore;
