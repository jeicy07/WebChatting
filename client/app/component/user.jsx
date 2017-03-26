var React = require('react');
var Formsy = require('formsy-react');

var User = React.createClass({
    getDefaultProps: function(){
        return {
            text: "",
            onClick: null,
            canSubmit: true
        };
    },

    render: function(){
        return <Formsy.Form
                onValidSubmit = {this.props.onValidSubmit}/>

    }
});


module.exports = User;
