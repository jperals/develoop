var express = require('express');
var fs = require('fs');
var gitlab = require('./gitlab');
var indentString = require('indent-string');
var settings = require('./settings');
var bodyParser = require('body-parser');

const COMPONENTS_ROOT = 'server/components';

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

app.use(bodyParser.json());
app.use(express.static('client'));
app.use('/components', express.static(COMPONENTS_ROOT));

app.put('/api/component', function(req, res) {
    var code = req.body.code;
    var mainMetadataFile = COMPONENTS_ROOT + '/' + 'metadata.html';
    var componentName = req.body.componentName;
    var newDir = COMPONENTS_ROOT + '/' + componentName;
    var metadataFile = newDir + '/metadata.html';
    var metadata = '<x-meta id="' + componentName + '" label="' + componentName + '">\n    <template>\n        <' + componentName + '></' + componentName + '>\n    </template>\n    <template id="imports">\n        <link rel="import" href="index.html">\n    </template>\n</x-meta>';
    var metadataMeta = '<link rel="import" href="/components/' + componentName + '/metadata.html">\n';
    fs.mkdir(newDir, function() {
        fs.writeFile(newDir + '/' + 'index.html', code, function() {
            fs.writeFile(metadataFile, metadata, function() {
                fs.appendFile(mainMetadataFile, metadataMeta, function(err) {
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