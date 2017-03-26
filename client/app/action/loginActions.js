var Reflux = require('reflux');
var networkActions = require('./networkActions.js');

var Actions = Reflux.createActions({
  register: {asyncResult: true},
  login: {asyncResult: true},
});

Actions.register.listen( function(profile) {
  console.log(profile);
  networkActions.post('account/register/', profile, this.completed, this.failed);
});

Actions.login.listen( function(profile) {
  console.log(profile);
  networkActions.post('account/login/', profile, this.completed, this.failed);
});

module.exports = Actions;
