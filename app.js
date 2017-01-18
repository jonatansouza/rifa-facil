var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    shorId = require('shortid'),
    moment = require('moment');

//configs
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static('public'));
moment.locale('pt-BR');

//routes
app
    .get('/fix-db', function(req, res) {
        fs.writeFileSync('db/rifas.json', '[]', 'utf8', function(err) {
            console.log(err);
        });
        res.json({
            status: 'ok'
        });
    })
    .get('/', function(req, res) {
        res.render('form');
    })
    .post('/rifa', function(req, res) {
        var rifas = JSON.parse(fs.readFileSync('db/rifas.json'));
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
                fs.writeFile('db/rifas.json', JSON.stringify(rifas), function(err) {
                    console.log(err);
                });
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
        res.render('index', {
            total: req.params.total
        });
    })
    .get('/rifa/:id', function(req, res) {
        var rifas = JSON.parse(fs.readFileSync('db/rifas.json'));
        var rifa = null;
        rifas.forEach(function(el, i) {
            if (el._id === req.params.id) {
                rifa = el;
            }
        });
        if (rifa == null) {
            res.status(404).json({
                error: "rifa nao encontrada"
            });
        } else {
            res.render('rifa', {
                data: rifa
            });
        }

    })
    .get('/rifas', function(req, res) {
        fs.readFile('db/rifas.json', 'utf8', function(err, data) {
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
var port = process.env.PORT || 8080
app.listen(port, function() {
    console.log('Server running!');
});
