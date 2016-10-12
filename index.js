var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var ParseDashboard = require('parse-dashboard');

var databaseUri = 'mongodb://gara:garagara@ds011389.mlab.com:11389/gara';
var app = express();
app.use('/public', express.static(path.join(__dirname, '/public')));

var api = new ParseServer({
    databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || 'myAppId',
    restAPIKey: "master",
    clientKey: "master",
    masterKey: process.env.MASTER_KEY || 'master', //Add your master key here. Keep it secret!
    serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
    liveQuery: {
        classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
    },
    websocketTimeout: 10 * 1000,
    cacheTimeout: 60 * 600 * 1000,
    logLevel: 'VERBOSE',
    oauth: {
        facebook: {
            appIds: "272167913140392"
        }
    },
    revokeSessionOnPasswordReset: true,
    accountLockout: {
        duration: 5,
        threshold: 3
    }
    ,
    filesAdapter: {
        module: "parse-server-fs-adapter",
        options: {
            filesSubDirectory: ""
        }
    }

});


var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.get('/', function (req, res) {
    var query = new Parse.Query(Parse.User);
    res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
    parse.User.logIn
});

var dashboard = new ParseDashboard({
    "apps": [
        {
            "serverURL": "http://localhost:1337/parse",
            "appId": "myAppId",
            "masterKey": "master",
            "appName": "MyApp"
        }
    ]
});
app.use('/dashboard', dashboard);


var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
});

ParseServer.createLiveQueryServer(httpServer);


// parse-dashboard --appId myAppId --masterKey master --serverURL "http://localhost:1337/parse"


