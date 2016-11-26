var express = require('express');
var Promise = require('promise');
var request = require('request');
var settings = require('./settings');

require('promise/lib/rejection-tracking').enable(
    {allRejections: true}
);

if(settings.testing) {
    // Accept self-signed certificate.
    // This is insecure! Do this only for local testing!
    // See http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

var app = express();

app.use(express.static('client'));

app.get('/component/:name', function(req, res) {
    console.log('Trying to get component named', req.params.name);

    getAllSnippets()
        .then(function(snippets) {
            return getIdByTitle(snippets, req.params.name)
        })
        .then(getSnippetById)
        .then(function(snippet) {
            res.send(snippet);
        })
        .catch(function(error) {
            console.error('Error!', error);
            res.sendStatus(500);
        });

});

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});

function getAllSnippets () {
    var promise = new Promise(function (resolve, reject) {
        var options = {
            url: settings.gitlabHost + '/api/v3/projects/1/snippets/',
            headers: {
                'PRIVATE-TOKEN': settings.gitlabToken
            }
        };
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            else {
                reject(error);
            }
        }
        request(options, callback);
    });
    return promise;
}

function getIdByTitle (snippets, title) {
    var promise = new Promise(function (resolve, reject) {
        var snippet = snippets.find(function(s) {
            return s.title === title;
        });
        console.log('snippet:', snippet);
        if (typeof snippet !== 'undefined') {
            resolve(snippet.id);
        }
        else {
            reject('No snippet found with the given name.');
        }
    });
    return promise;
}

function getSnippetById (id) {
    var promise = new Promise(function (resolve, reject) {
        var options = {
            url: settings.gitlabHost + '/api/v3/projects/1/snippets/' + id + '/raw',
            headers: {
                'PRIVATE-TOKEN': settings.gitlabToken
            }
        };
        function callback(error, response, body) {
            // console.log(error, response, body);
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
            else {
                reject(error);
            }
        }
        request(options, callback);
    });
    return promise;
}
