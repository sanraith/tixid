import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import roomsRouter from './routes/roomsRouter';
import './services/testDataGenerator';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routers setup
app.use('/api/rooms', roomsRouter);

const _app_folder = 'dist/client';
// ---- SERVE STATIC FILES ---- //
app.get('*.*', express.static(_app_folder, { maxAge: '1y' }));
// ---- SERVE APPLICATION PATHS ---- //
app.all('*', function (req, res) {
  res.status(200).sendFile(`/`, { root: _app_folder });
});

export default app;
