import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import roomsRouter from './routes/roomsRouter';
import cardSetManager from './services/cardManager';
import cardRouter from './routes/cardRouter';
import './services/testDataGenerator';
import process from 'process';
import Debug from 'debug';
const debug = Debug('tixid:app');

const _app_client_folder = 'dist/client';
const _app_context_folder = 'dist/context';
cardSetManager.init();

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routers setup
app.use(express["static"](_app_client_folder));
app.use(express["static"](_app_context_folder))
app.use('/api/rooms', roomsRouter);
app.use('/card', cardRouter);

// Serve application paths
app.get('*', function (req, res) {
  res.status(200).sendFile(`/`, { root: _app_client_folder });
});

debug(`Process id: ${process.pid}`);

export default app;
