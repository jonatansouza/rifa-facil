var express = require('express'),
    http = require('http'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    shorId = require('shortid'),
    moment = require('moment'),
    path = require('path'),
    session = require('client-sessions'),
    io = require('socket.io');

//configs
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static('public'));
moment.locale('pt-BR');

app.use(session({
    cookieName: 'session',
    secret: 'rifa-facil-session',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

var database = path.join(process.cwd(), '/db/rifas.json');
var counterPath = path.join(process.cwd(), '/db/counter');
var counter = parseInt(fs.readFileSync(counterPath));

//routes
app
    .get('/fix-db', function(req, res) {
        fs.writeFileSync(database, '[]', 'utf8', function(err) {
            console.log(err);
        });
        res.json({
            status: 'ok'
        });
    })
    .get('/', function(req, res) {
        if (req.session.visitor) {
            res.render('welcome', {
                counter: counter
            });
        } else {
            req.session.visitor = true;
            counter = counter + 1;
            fs.writeFileSync(counterPath, counter, 'utf8', (err) => {
                console.log(err);
            });
            res.render('welcome', {
                counter: counter
            });
        }
    })

    .get('/form', function(req, res) {
        res.render('form');
    })
    .post('/rifa', function(req, res) {
        var rifas = JSON.parse(fs.readFileSync(database));
        var rifa = null;
        rifas.forEach(function(el, i) {
            if (el.name === req.body.name) {
                rifa = el;
            }
        });
        if (rifa == null) {
            req.body._id = shorId.generate();
            req.body.date = moment().format("DD/MM/YYYY");
            if (req.body.template) {
                rifas.push(req.body);
                fs.writeFile(database, JSON.stringify(rifas), function(err) {
                    console.log(err);
                });
                res.render('rifa', {
                    data: req.body
                });
            } else {
                res.render('rifa', {
                    data: req.body
                });
            }
        } else {
            res.render('rifa', {
                data: rifa
            });
        }

    })
    .get('/kalel/:total', function(req, res) {
        res.render('kalel', {
            total: req.params.total
        });
    })
    .get('/rifa/:id', function(req, res) {
        var rifas = JSON.parse(fs.readFileSync(database));
        var rifa = null;
        rifas.forEach(function(el, i) {
            if (el._id === req.params.id) {
                rifa = el;
            }
        });
        if (rifa == null) {
            res.render('error', {
                msg: "Rifa não encontrada"
            });
        } else {
            res.render('rifa', {
                data: rifa
            });
        }

    })
    .get('/rifas', function(req, res) {
        fs.readFile(database, 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            res.json(JSON.parse(data));
        });
    })
    .get('/templates', function(req, res) {
        res.render('rifas');
    });

//server
var port = process.env.PORT || 8080;
var addr = process.env.ADDR || '0.0.0.0';

var server = http.createServer(app);
server.listen(port, addr, function() {
    console.log('Server running!');
});

var ss = io.listen(server);

ss.sockets.on('connection', function(socket) {
    socket.on('getVisitors', function(data) {
        getVisitors();
    });

    function getVisitors() {
        ss.sockets.emit('setVisitors', {
            visitors: counter
        });
    }


});
