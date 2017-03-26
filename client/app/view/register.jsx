var React = require('react');
var reflux = require('reflux');
var loginAction = require('../action/loginActions.js');
var browserHistory = require('react-router').browserHistory;

var Register = React.createClass({
  mixins: [
    reflux.listenTo(loginAction.register.completed, 'onRegisterCompleted'),
    reflux.listenTo(loginAction.register.failed, 'onRegisterFailed'),
  ],

  getInitialState: function(){
    return {
      username: '',
      password: '',
      error: '',
    };
  },

  onRegisterCompleted: function(){
    console.log('register succeed!');
    browserHistory.push('/chat');
  },

  onRegisterFailed: function(data){
    console.log('register failed!');
    console.log(typeof(data.responseText));
    console.log(data.responseText);
    this.setState({
      error: data.responseText,
    });
  },

  handleUsername: function(event) {
    this.setState({
      username: event.target.value,
    },function(){
      console.log(this.state.username);
    });
  },

  handlePassword: function(event) {
    this.setState({
      password: event.target.value,
    },function(){
      console.log(this.state.password);
    });
  },

  register: function() {
    if( !this.state.username || !this.state.password ) {
      this.setState({
        error: '请输入用户名以及密码！',
      });
      return;
    }
    else if (this.state.username.length > 10) {
      console.log(this.state.username.length);
      this.setState({
        error: '用户名需小于10个字符！',
      });
      return;
    }
    else if (this.state.password.length > 20 || this.state.password.length < 6) {
      console.log(this.state.password.length);
      this.setState({
        error: '密码需大于等于6个字符小于等于20个字符！',
      });
      return;
    }
    else {
      var userInfo = {
        username: this.state.username,
        password: this.state.password,
      };
      loginAction.register(userInfo);
    }
  },

  render: function(){
    return <div className='register'>
              <div className='form'>
                <input type='text' autoFocus='true' placeholder='用户名' value={this.state.username} style={{"width":"150px","height":"40px","position":"absolute","left":"35%","top":"20%"}}  onChange={this.handleUsername} />
                <input type='password' placeholder='密码' value={this.state.password} style={{"width":"150px","height":"40px","position":"absolute","left":"35%","top":"50%"}} onChange={this.handlePassword} />
                <button onClick={this.register} style={{"color":"#222","position":"absolute","left":"35%","top":"75%"}}>注册</button>
                { this.state.error ? this.state.error : null}
              </div>
           </div>;
  },
});

module.exports = Register;
