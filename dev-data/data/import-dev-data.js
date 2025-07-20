const fs = require('fs');
const mongose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourmodel');

dotenv.config({ path: './config.env' });
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongose.connect(db).then(() => console.log('DB Connection Successful'));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Successfully Lodaed');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
