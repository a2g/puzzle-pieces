import express from 'express';
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});

app.get('/', function(req, res) {
  res.send(`Hello World! ${req.originalUrl}`);
});
