var Promise = require('promise');
var request = require('request');

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

module.exports = {
    getAllSnippets: getAllSnippets,
    getIdByTitle: getIdByTitle,
    getSnippetById: getSnippetById
};