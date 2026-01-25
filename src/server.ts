// import './bootstrap.js';

// import app from './app.js';
// import { initDb } from './database/init.js';

// const port = process.env.PORT || 8080;

// (async () => {
//   await initDb();
//   app.listen(port, () => {
//     console.log('CMS running on', port);
//   });
// })();

import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Bharat Varta Backend running on ${PORT}`);
});