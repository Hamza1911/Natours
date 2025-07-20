const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(db).then(() => console.log('DB Connection Successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`App running on Port ${port}...`)
);

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UnHandled Rejection shuttiing Down');
  server.close(() => {
    process.exit(1);
  });
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
