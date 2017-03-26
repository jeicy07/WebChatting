var Reflux = require('reflux');
var Actions = Reflux.createActions({
    request: { asyncResult: true },
    get: {  },
    post: {  },
    put: {  },
    patch: {  },
    delete: {  }
});
var $ = require('jquery');

var BASE_URL = 'http://localhost:3000/';
if (window.location.host==='tramory.me:4000'){
    BASE_URL = 'http://tramory.me:3000/';
}

Actions.request.listen( function(uri, data, method, callback, fallback){
    var options = {
        url: BASE_URL+uri,
        type: method,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType : 'application/json',
        // headers: {
        //
        // }
        success: function(_data){
            callback && callback(_data);
            Actions.request.completed(_data);
        },
        error: function(xhr, statusCode, textContent){
            fallback && fallback(xhr, statusCode, textContent);
            Actions.request.failed(xhr.responseText);
        },
    };

    if(data){
        options.data = JSON.stringify(data);
    };

    $.ajax(options);
});

Actions.get.listen ( function(url, data, callback, fallback){
    if (data){
        var _d = $.param(data);
        Actions.request(url+'?'+_d, '', 'get', callback, fallback);
    }else{
        Actions.request(url, null, 'get', callback, fallback);
    }
});

Actions.post.listen( function(url, data, callback, fallback){
    Actions.request(url, data, 'post', callback, fallback);
});

Actions.put.listen( function(url, data, callback, fallback){
    Actions.request(url, data, 'put', callback, fallback);
});

Actions.patch.listen( function(url, data, callback, fallback){
    Actions.request(url, data, 'patch', callback, fallback);
});

Actions.delete.listen( function(url, data, callback, fallback){
    Actions.request(url, data, 'delete', callback, fallback);
});


module.exports = Actions;
