const express = require('express');
const pdf_generator = require('./routes/pdf_file');
const moment = require('moment');

const app = express();

app.use(express.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, DataContent");
    next();
});



app.get('/pdf', (req, res) => {
    let {capital, lucros, saques, usuario} = JSON.parse(req.headers.datacontent);
    let result = lucros.filter(lcr => moment(lcr.data, 'DD/MM/YYYY').month() === moment().month());
    
    pdf_generator(res, capital, result, saques, usuario);
});


app.listen(3000, '0.0.0.0', () => console.log('Listening...'));