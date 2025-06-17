const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('Live backend up!'));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
