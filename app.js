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

app.get('/', (req, res) => {
    res.send('hola')
})

app.get('/map', requiresAuth(), (req, res) => {
    let htmlPath = path.resolve(__dirname, 'dist/index.html')
    //res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
    // if (req.oidc.isAuthenticated()) {
    //     res.sendFile(htmlPath)
    // } else {
    //     res.send('ASHE')
    // }
    res.sendFile(htmlPath);
})

// app.get('/map', requiresAuth(), (req, res) => {
//     //let htmlPath = path.resolve(__dirname, 'index.html')
//     //res.sendFile(htmlPath);
// })


app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user))
    //let htmlPath = path.resolve(__dirname, 'index.html')
    //res.sendFile(htmlPath);
})
