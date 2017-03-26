var reflux = require('reflux');

var Actions = reflux.createActions({
  updateSelf: {children: ["completed", "failed"]},
  receiveMsg: {children: ["completed", "failed"]},
  chooseDialog: {children: ["completed", "failed"]},
});

Actions.updateSelf.listen( function(msg) {
  console.log('action updateSelf');
  Actions.updateSelf.completed(msg);
});

Actions.receiveMsg.listen( function(fromUsr, msg) {
  console.log('action receiveMsg');
  Actions.receiveMsg.completed(fromUsr, msg);
});

Actions.chooseDialog.listen( function(usr) {
  console.log('action chooseDialog');
  Actions.chooseDialog.completed(usr);
});

module.exports = Actions;
