var express = require('express');
var request = require('request');
var settings = require('./settings');

if(settings.testing) {
    // Accept self-signed certificate.
    // This is insecure! Do this only for local testing!
    // See http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

var app = express();

app.use(express.static('client'));

app.get('/component/:id', function(req, res) {
    console.log('Try to get component', req.params.id);

    var options = {
        url: settings.gitlabHost + '/api/v3/projects/1/snippets/' + req.params.id + '/raw',
        headers: {
            'PRIVATE-TOKEN': settings.gitlabToken
        }
    };

    function callback(error, response, body) {
        console.log(error, response, body);
        if (!error && response.statusCode == 200) {
            res.send(body);
        }
    }

    request(options, callback);

});

app.listen(3000, function () {
    console.log('App listening on port 3000!');
    console.log('Settings:', settings);
});
