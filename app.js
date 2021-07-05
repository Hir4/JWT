const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('pages'));

let path = require('path');
let login = path.join(__dirname, '/pages/login/');
let admin = path.join(__dirname, '/pages/admin/');
let client = path.join(__dirname, '/pages/client/');
let publicLogo = path.join(__dirname, '/public/logo/');
let publicImg = path.join(__dirname, '/public/img/');

let tokenCheck;
const saltRounds = 10;
let newIdTokenGenerate;
let userId;
let token;

///////////////////////////////////////
//////////////IMAGES//////////////////
/////////////////////////////////////

app.get('/public/logo/login.svg', (req, res) => {
  res.sendFile(path.join(publicLogo, 'login.svg'))
});

app.get('/public/logo/signin.svg', (req, res) => {
  res.sendFile(path.join(publicLogo, 'signin.svg'))
});

app.get('/public/img/fest.svg', (req, res) => {
  res.sendFile(path.join(publicImg, 'fest.svg'))
});

app.get('/public/img/fest2.png', (req, res) => {
  res.sendFile(path.join(publicImg, 'fest2.png'))
});

app.get('/public/img/fest3.jpg', (req, res) => {
  res.sendFile(path.join(publicImg, 'fest3.jpg'))
});

app.get('/public/img/fest4.png', (req, res) => {
  res.sendFile(path.join(publicImg, 'fest4.png'))
});

///////////////////////////////////////
/////////////Login PAGE///////////////
/////////////////////////////////////

app.get('/', (req, res) => {
  res.clearCookie("newIdToken");
  res.sendFile(path.join(login, 'index.html'))
});

///////////////////////////////////////
/////////////ADMIN PAGE///////////////
/////////////////////////////////////

app.get('/admin', (req, res) => {
  const newIdToken = req.cookies[`newIdToken`];
  if (newIdToken) {
    try {
      jwt.verify(newIdToken, tokenCheck, function (err, decoded) {
        if (decoded.class === "admin" && decoded.name === "admin") {
          res.sendFile(path.join(admin, 'admin.html'));
        }
      });
    } catch (err) {
      res.redirect("/");
    }
  } else { res.redirect("/"); }
});

///////////////////////////////////////
////////////CLIENT PAGE///////////////
/////////////////////////////////////

app.get('/client', (req, res) => {
  const newIdToken = req.cookies[`newIdToken`];
  if (newIdToken) {
    try {
      jwt.verify(newIdToken, tokenCheck, function (err, decoded) {
        if (decoded.class === "user" && decoded.name !== "admin") {
          res.sendFile(path.join(client, 'client.html'));
        }
      });
    } catch (err) {
      res.redirect("/");
    }
  } else { res.redirect("/"); }
});

///////////////////////////////////////
///////////LOGIN DATA/////////////////
/////////////////////////////////////

app.post('/login', (req, res) => {
  try {
    const login = req.body.user;
    const password = req.body.password;
    let user;

    fs.readFile('./users.json', function (err, data) {
      const dataUser = JSON.parse(data);

      for (let key in dataUser) {
        if (login === dataUser[key].userName) {
          user = key
        }
      }

      if (typeof user == "undefined") {
        res.send("/");
        return true;
      }

      const foundName = dataUser[user].userName;
      const foundClassType = dataUser[user].class;

      if (typeof foundName !== undefined) {
        bcrypt.compare(password, dataUser[user].password, function (err, result) {
          if (result === true) {
            newIdTokenGenerate = `7573756172696f${(new Date()).getTime()}:${foundName}`;
            const hashIdToken = crypto.createHash('sha256').update(newIdTokenGenerate).digest('base64');
            if (dataUser[user].class === "admin") {
              newHashIdToken = `${hashIdToken}:${hashIdToken}:${dataUser[user].class}`;
              tokenCheck = newHashIdToken;

              jwt.sign({ name: foundName, class: foundClassType }, newHashIdToken, { algorithm: 'HS256' }, function (err, token) {
                res.cookie(`newIdToken`, token, { httpOnly: true });
                res.send("/admin");
                token = token;
              });

            } else {
              if (typeof foundName !== undefined) {
                newHashIdToken = `${hashIdToken}:${user}`;
                tokenCheck = newHashIdToken;

                jwt.sign({ name: foundName, class: foundClassType }, newHashIdToken, { algorithm: 'HS256' }, function (err, token) {
                  res.cookie(`newIdToken`, token, { httpOnly: true });
                  res.send("/client");
                  token = token;
                });

              } else { console.log("usuario nao existe") }
            }
          }
        });
      } else { res.redirect("/") }
    })

  } catch (err) {
    console.error('Error post /login');
  }
});

///////////////////////////////////////
///////////SIGNIN DATA////////////////
/////////////////////////////////////

app.post('/signinuser', (req, res) => {
  const newIdToken = req.cookies[`newIdToken`];
  if (newIdToken) {
    jwt.verify(newIdToken, tokenCheck, function (err, decoded) {
      if (decoded.class === "admin" && decoded.name === "admin") {

        try {
          const user = req.body.user;
          const name = req.body.name;
          const email = req.body.email;
          const password = req.body.password;

          fs.readFile('./users.json', function (err, data) {
            const dataUser = JSON.parse(data);
            userId = Object.keys(dataUser).length + 1;
          });

          bcrypt.hash(password, saltRounds, function (err, hash) {
            const newUser = {
              'userName': user,
              'name': name,
              'email': email,
              'password': hash,
              'class': "user",
              'active': "true"
            };

            fs.readFile('./users.json', function (err, data) {
              const dataUser = JSON.parse(data);
              let foundName = false;
              let foundEmail = false;

              for (let key in dataUser) {
                if (dataUser[key].email === email) {
                  foundEmail = true;
                  console.log("Email repetido");
                  return true;
                }
                if (dataUser[key].userName === user) {
                  foundName = true;
                  console.log("nome de usuário repetido");
                  return true;
                }
              }

              if (foundName === false && foundEmail === false) {
                dataUser[userId] = newUser;
                res.send(newUser);
                fs.writeFile("./users.json", JSON.stringify(dataUser), function () {
                });
              } else {
                res.send("");
              }
            });
          });

        } catch (err) {
          console.error('Error post /signinuser');
          res.redirect("/");
        }

      } else { res.redirect("/") }
    });
  } else { res.send("/") }
});

///////////////////////////////////////
///////////GET USERS DATA/////////////
/////////////////////////////////////

app.get('/getuserlist', (req, res) => {
  const newIdToken = req.cookies[`newIdToken`];
  if (newIdToken) {
    jwt.verify(newIdToken, tokenCheck, function (err, decoded) {
      if (decoded.class === "user" || decoded.class === "admin") {
        try {
          fs.readFile('./users.json', function (err, data) {
            const dataUser = JSON.parse(data);
            res.send(dataUser);
          });
        } catch (err) {
          console.error('Error get /getuserlist');
        }
      }
    });
  } else { res.redirect("/") }
});

app.listen(8080);