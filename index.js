require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const glob = require('glob');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

glob
  .sync(path.resolve(__dirname, 'routes', '**/*.js'))
  .forEach(file => require(file)(app));

const server = app.listen(
  process.env.PORT,
  process.env.HOST || 'localhost',
  error => {
    if (error) return console.error(error);
    console.log(
      `server started at ${server.address().address}:${server.address().port}`
    );
  }
);
