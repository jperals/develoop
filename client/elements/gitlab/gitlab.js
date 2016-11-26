class Gitlab {

    constructor(options) {
        this.gists = {};
        this.token = options.token;
    }

    getGist(id) {
        console.log('getGist');
        var gist;
        if(typeof id == 'undefined' || typeof this.gists[id] == 'undefined') {
            let options = {
                token: this.token,
                id: id
            };
            gist = new Gist(options);
            this.gists[id] = gist;
        }
        else {
            gist = this.gists[id];
        }
        return gist;
    }

    save(projectName, isPublic, options, callback) {
        this.getGist().create(options, callback);
    }

    update(fileId, projectName, isPublic, options, callback) {
        this.getGist(fileId).create(options, callback);
    }

}

class Gist {

    constructor(options) {
        console.log('create new gist');
        this.token = options.token;
        this.id = typeof options.id == 'undefined'
            ? this.createId()
            : options.id;
        this.host = 'https://127.0.0.1:8443';
    }

    create(options, callback) {
        console.log('create gist');
        let headers = new Headers();
        headers.append('PRIVATE-TOKEN', this.token);
        headers.append('Content-Type', 'application/json');
        let content = options.files['designer.html'].content;
        let reqBody = {
            code: content,
            file_name: this.id,
            title: this.id,
            visibility_level: 10 // Internal
        };
        console.log('content:', content);
        let opts = {
            headers: headers,
            method: "POST",
            body: JSON.stringify(reqBody)
        };
        fetch(
            this.host + '/api/v3/projects/1/snippets/',
            opts)
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                if(typeof callback == 'function') {
                    callback(undefined, json);
                }
            })
    }

    read(callback) {
        console.log('read gist');
        let headers = new Headers();
        headers.append('PRIVATE-TOKEN', this.token);
        headers.append('Content-Type', 'application/json');
        let options = {
            headers: headers,
            method: "GET"
        };
        fetch(
            this.host + '/api/v3/projects/1/snippets/' + this.id + '/raw',
            options)
            .then(function(response) {
                return response.text();
            })
            .then(function(response) {
                if(typeof callback == 'function') {
                    callback(undefined, response);
                }
            })
            .catch(function(error) {
                console.error('There has been a problem with your fetch operation: ' + error.message);
            });
    }

    update(options, callback) {
        console.log('update gist');
        let headers = new Headers();
        headers.append('PRIVATE-TOKEN', this.token);
        headers.append('Content-Type', 'application/json');
        let content = options.files['designer.html'].content;
        let reqBody = {
            code: content,
            file_name: this.id,
            title: this.id,
            visibility_level: 10 // Internal
        };
        console.log('content:', content);
        let opts = {
            headers: headers,
            method: "PUT",
            body: JSON.stringify(reqBody)
        };
        fetch(
            this.host + '/api/v3/projects/1/snippets/' + this.id,
            opts)
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                if(typeof callback == 'function') {
                    callback(undefined, json);
                }
            })
    }

    createId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 15; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

}