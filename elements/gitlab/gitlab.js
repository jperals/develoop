class Gitlab {

    constructor(options) {
        this.gists = {};
        console.log('create new Gitlab');
        this.token = options.token;
    }

    getGist(id) {
        console.log('getGist');
        var gist;
        if(typeof id == 'undefined' || this.gists[id] == 'undefined') {
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
        console.log('create');
        let headers = new Headers();
        headers.append('PRIVATE-TOKEN', this.token);
        headers.append('Content-Type', 'application/json');
        let content = options.files['designer.html'];
        let reqBody = {
            code: content,
            file_name: this.id,
            title: this.id,
            visibility_level: 10 // Internal
        };
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
        console.log('read');
        let headers = new Headers();
        headers.append('PRIVATE-TOKEN', this.token);
        let body = {
            file_name: this.id
        };
        let options = {
            headers: headers,
            method: "GET",
            body: body
        };
        fetch(
            this.host + '/api/v3/projects/1/snippets/' + this.id,
            options)
            .then(function(error, response) {
                if(typeof callback == 'function') {
                    callback(error, response);
                }
            }
        )
    }

    update(options, callback) {
        console.log('update');
    }

    createId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 15; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

}