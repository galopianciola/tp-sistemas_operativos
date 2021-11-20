const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();
const { auth, requiresAuth } = require('express-openid-connect');

app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    idpLogout: true,
  })
);

app.use(express.static('dist'));

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});

app.get('/get-user-data', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user))
})

app.get('/', requiresAuth(), (req, res) => {
    let htmlPath = path.resolve(__dirname, 'dist/map.html')
    res.sendFile(htmlPath);
})

app.get('/profile', requiresAuth(), (req, res) => {
    let htmlPath = path.resolve(__dirname, 'dist/profile.html')
    res.sendFile(htmlPath);
})

