var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');

var app = express(); //Create an Express route
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/logo.png'));

var port = 3000;
app.listen(port, function() {
  console.log('Server started at ' + new Date() + ', on port ' + port + '!');
});

app.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('login');
});
app.get('/login', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('login');
});
app.get('/logout', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('login');
});

app.get('/stats', function(request, response) {
  var statsData = {};
  statsData["users"] = [];
  statsData["villains"] = [];

  var userFile = fs.readFileSync('data/users.csv', 'utf8');
  var userLines = userFile.split("\n");
  for (var i = 1; i < userLines.length; i++) {
    var userInfo = userLines[i].split(",");
    var user = {};
    user["name"] = userInfo[0];
    user["total_games"] = userInfo[1];
    user["games_lost"] = userInfo[3];
    user["games_won"] = userInfo[2];
    user["games_tied"] = parseInt(user["total_games"] - parseInt(user["games_lost"]) - parseInt(user["games_won"]));

    if (user["name"]) {
      statsData["users"].push(user);
    }
  }

  var villainFile = fs.readFileSync('data/villains.csv', 'utf8');
  var villainLines = villainFile.split("\n");
  var villainsArray = [];
  for (var i = 1; i < villainLines.length; i++) {
    var villainInfo = villainLines[i].split(",");
    var villain = {};
    villain["name"] = villainInfo[0];
    villain["wins"] = parseInt(villainInfo[7]);
    villain["losses"] = parseInt(villainInfo[8]);
    villain["paper"] = villainInfo[1];
    villain["rock"] = villainInfo[2];
    villain["scissors"] = villainInfo[3];
    villain["ties"] = parseInt((parseInt(villain["paper"]) + parseInt(villain["rock"]) + parseInt(villain["scissors"])) - (parseInt(villain["wins"]) + parseInt(villain["losses"])));
    villain["winPercent"] = Math.round((villain["wins"]/(villain["wins"]+villain["losses"]+villain["ties"]))*100);

    if (villain["name"]) {
      statsData["villains"].push(villain);
    }

    statsData["villains"].sort(function(a,b) {
      return b.winPercent - a.winPercent
    });
  }

console.log(statsData["villains"]);

console.log(statsData);
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('stats', {
    data: statsData
  });
});

app.get('/about', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('about');
});

app.get('/game', function(request, response) {
  var user_data = {
    name: request.query.username,
    password: request.query.password
  };

  console.log(user_data);
  var logged_in = false;

  var userFile = fs.readFileSync('data/users.csv', 'utf8');
  var userLines = userFile.split("\n");

  for (var i = 1; i < userLines.length; i++) {
    var userInfo = userLines[i].split(",");
    if ((user_data.name == userInfo[0]) && (user_data.password == userInfo[userInfo.length -1])) {
      console.log("MATCH " + userInfo[0] + ", " + userInfo[userInfo.length - 1]);
      logged_in = true;
    }
  }

  if (logged_in) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render('game', {
      user: user_data
    });
  }

  else {
    response.status(403);
    response.setHeader('Content-Type', 'text/html')
    response.render('error');
  }
});

app.post('/:user/game', function(request, response) {
  var user_data = {
    name: request.params.user,
    weapon: request.query.weapon
  };
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.send(JSON.stringify(user_data));
});