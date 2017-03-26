var reflux = require('reflux');
var chatAction = require('../action/chatAction.js');

var chatStore = reflux.createStore({
  init: function(){
    this.messageAll = {};
    this.listenTo(chatAction.updateSelf.completed, this.onUpdateSelf);
    this.listenTo(chatAction.receiveMsg.completed, this.onReceiveMsg);
  },


  onUpdateSelf: function(msg){
    console.log('store onUpdateSelf');
    var toUsr = msg.toUsr;
    if (typeof(this.messageAll[toUsr]) === 'undefined') {
      console.log(this.messageAll[toUsr]);
      console.log(typeof(this.messageAll[toUsr]));
      var newChat = [];
      newChat.push(msg);
      this.messageAll[toUsr] = newChat;
      console.log('update self');
      console.log(this.messageAll[toUsr]);
    } else {
      this.messageAll[toUsr].push(msg);
      console.log('msgs:');
      console.log(this.messageAll[toUsr]);
    }
    this.trigger(this.messageAll);
  },

  onReceiveMsg: function(fromUsr, msg){
    console.log('store onReceiveMsg');
    if (typeof(this.messageAll[fromUsr]) === 'undefined') {
      var newChat = [];
      newChat.push(msg);
      this.messageAll[fromUsr] = newChat;
      console.log('newChat set');
      console.log(this.messageAll[fromUsr]);
    } else {
      this.messageAll[fromUsr].push(msg);
      console.log(this.messageAll[fromUsr]);
    }
    this.trigger(this.messageAll);
  },
})

module.exports = chatStore;
