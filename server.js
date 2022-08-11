require('dotenv').config();
const express = require('express');
const path = require('path');
const { logger } = require('./middlewares/logger');
const { errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { constants } = require('buffer');
const { corsOptions } = require('./config/corsOptions');
const mongoose = require('mongoose');
const { logEvents } = require('./middlewares/logger');
const { dbConnection } = require('./utils/dbConnection');

const app = express();

const PORT = process.env.PORT || 3500;

// console.log(process.env.NODE_ENV);

dbConnection();

app.use(cors(corsOptions));
app.use(logger);
app.use(express.json());
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/root'));

app.use('/users', require('./routes/userRoutes'));

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`this server is running on port of ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log'
  );
});
