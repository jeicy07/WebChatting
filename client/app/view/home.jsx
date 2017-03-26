var React = require('react');
var reflux = require('reflux');
var loginAction = require('../action/loginActions.js');
var userStore = require('../store/userStore.js');
var browserHistory = require('react-router').browserHistory;
var Link = require('react-router').Link;

var Home = React.createClass({
  mixins: [
    reflux.listenTo(loginAction.login.completed, 'onLoginCompleted'),
    reflux.listenTo(loginAction.login.failed, 'onLoginFailed'),
  ],

  getInitialState: function(){
    return {
        username: '',
        password: '',
        error: '',
    };
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

  login: function() {
    if( !this.state.username || !this.state.password ) {
      this.setState({
        error: '请输入用户名以及密码！',
      });
      return;
    }
    else {
      var userInfo = {
        username: this.state.username,
        password: this.state.password,
      };
      loginAction.login(userInfo);
    }
  },

  onLoginCompleted: function(){
    console.log('login succeed');
    browserHistory.push('/chat');
  },

  onLoginFailed: function(){
    console.log('login failed');
    this.setState({
      error: '用户名或密码错误！',
    });
  },

  render: function(){
    return <div className='home'>
              <div className='form'>
                <input type='text' autoFocus='true' placeholder='用户名' value={this.state.username} style={{"width":"150px","height":"40px","position":"absolute","left":"35%","top":"20%"}} onChange={this.handleUsername} />
                <input type='password' placeholder='密码' style={{"width":"150px","height":"40px","position":"absolute","left":"35%","top":"50%"}} value={this.state.password} onChange={this.handlePassword} />
               <button style={{"padding":"10px","position":"absolute","left":"60%","top":"70%","border-radius":"10px"}} onClick={this.login}>登陆</button>
                { this.state.error ? this.state.error : null}
              </div>
              <Link to="/register" style={{"color":"#222","position":"absolute","left":"35%","top":"75%"}}>注册</Link>
           </div>;
  }
});

module.exports = Home;
