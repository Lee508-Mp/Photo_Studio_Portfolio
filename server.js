const { createApp } = require('./app');
const { port } = require('./config');

createApp().listen(port, () => console.log(`Running at http://localhost:${port}`));
