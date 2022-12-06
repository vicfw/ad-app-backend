const mongoose = require('mongoose');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  
  
  process.exit(1);
});

const app = require('./app.js');

let DB;

if (process.env.NODE_ENV === 'production') {
  DB = process.env.MONGODB_PROD;
} else {
  DB = process.env.MONGODB_PROD;
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => 
  .catch((e) => 

app.listen(process.env.PORT, () => {
  
});

process.on('unhandledRejection', (err) => {
  
  
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  
  server.close(() => {
    
  });
});
