import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import roomsRouter from './routes/roomsRouter';
import cardSetManager from './services/cardManager';
import './services/testDataGenerator';

const _app_folder = 'dist/client';
cardSetManager.init();

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routers setup
app.use(express["static"](_app_folder));
app.use('/api/rooms', roomsRouter);

// Serve application paths
app.get('*', function (req, res) {
  res.status(200).sendFile(`/`, { root: _app_folder });
});

export default app;
