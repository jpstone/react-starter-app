'use strict';

const express = require('express');
const router = require('./router');

const app = express();

app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');
app.use(express.static('./'));
app.use(router)

app.listen(3000, () => console.log('Listening on port 3000'));