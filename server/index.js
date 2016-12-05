const express = require('express');
const fs = require('fs');
const indentString = require('indent-string');
const bodyParser = require('body-parser');
const readline = require('readline');
const rmdirAsync = require('./rmdirAsync');
const settings = require('./settings');
const gitlab = require('./gitlab');

const COMPONENTS_ROOT = 'server/components';
const MAIN_METADATA_FILE = COMPONENTS_ROOT + '/metadata.html';

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

app.use(function(req, res, next) {
    console.log(req.originalUrl);
    next();
});

app.use(bodyParser.json());
app.use(express.static('client'));
app.use('/components', express.static(COMPONENTS_ROOT));


app.put('/api/component', function(req, res) {
    var code = req.body.code;
    var componentName = req.body.componentName;
    var newDir = COMPONENTS_ROOT + '/' + componentName;
    var metadataFile = newDir + '/metadata.html';
    var metadata = '<x-meta id="' + componentName + '" label="' + componentName + '">\n    <template>\n        <' + componentName + '></' + componentName + '>\n    </template>\n    <template id="imports">\n        <link rel="import" href="index.html">\n    </template>\n</x-meta>';
    var metadataMeta = '<link rel="import" href="/components/' + componentName + '/metadata.html">\n';
    fs.mkdir(newDir, function(err) {
        console.error(err);
        fs.writeFile(newDir + '/' + 'index.html', code, function() {
            fs.writeFile(metadataFile, metadata, function() {
                fs.appendFile(MAIN_METADATA_FILE, metadataMeta, function(err) {
                    console.error(err);
                });
                res.send({
                    componentName: req.params.componentName,
                    status: 'OK'
                });
            });
        })
    });
});


function deleteComponentFromMetadata(name) {
    return new Promise(function(resolve, reject) {
        fs.readFile(MAIN_METADATA_FILE, 'utf8', function(err, data) {
            if(err) {
                reject(err);
            }
            let regExp = new RegExp('<link rel="import" href="\/components\/' + name + '\/metadata\.html">');
            var result = data.replace(regExp, '');
            fs.writeFile(MAIN_METADATA_FILE, result, 'utf8', function(err) {
                console.log('err:', err);
                if(err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });

    });
}


function deleteComponentDirectory(name) {
    return new Promise(function(resolve, reject) {
        rmdirAsync.rmdirAsync(COMPONENTS_ROOT + '/' + name, function(err) {
            console.log(err);
            if(err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}


app.delete('/api/component', function(req, res) {
    var name = req.body.name;
    var deleteReference = deleteComponentFromMetadata(name);
    var deleteFiles = deleteComponentDirectory(name);
    Promise.all([deleteReference, deleteFiles]).then(function(value) {
        console.log('Component deleted');
        console.log('value:', value);
        res.send({
            componentName: name,
            status: 'OK'
        });
    })
    .catch(function(err) {
        console.log('fail!');
        console.error(err);
    })
    ;
});


app.get('/component/:name', function(req, res) {
    console.log('Trying to get component named', req.params.name);

    gitlab.getAllSnippets()
        .then(function(snippets) {
            return gitlab.getIdByTitle(snippets, req.params.name)
        })
        .then(gitlab.getSnippetById)
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


function extractElementName(code) {
    var name;
    var re = /<polymer-element[^>]*name=(?:'|")([^'"]*)(?:'|")/;
    var match = code && code.match(re);
    if (match) {
        name = match[1];
    }
    return name;
}