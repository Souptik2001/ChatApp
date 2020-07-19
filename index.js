// CREATE TABLE logins (
// 	id INT(225) AUTO_INCREMENT NOT NULL,
//     username VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL,
//     PRIMARY KEY (id)
// )
const cookieParser = require('cookie-parser');
const express = require('express');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
const { readFile } = require('fs').promises;
const bodyParser = require('body-parser');
var mysql = require('mysql');
var ejs = require('ejs');
const app = express();
require('dotenv').config();
// Instead of bodyParser we could directly use express.json ,etc...also
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.set('views', './chatApp_frontend/views');
app.set('view engine', 'ejs');
var connection = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DB || 'funchat',
    connectionLimit: 10
});
// var connection = mysql.createConnection({
//     host: 'db4free.net ',
//     user: 'souptik',
//     password: 'af38e435',
//     database: 'souptik'
// });
// connection.connect((err) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Connection eshtablished succesfully....");
//     }
// });
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testify2001@gmail.com',
        pass: process.env.MAIL_PASS
    }
});

function generateRandomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var random_string = '';
    if (length > 0) {
        for (var i = 0; i < length; i++) {
            random_string += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    return random_string;
}

// GENRAL APIs

app.post('/pushData', (req, res) => {
    // SAMPLE BODY
    // {
    //     "txt":"Hey wht's up",
    //     "sender":"abc",
    //      "receiver":"xyz"
    // }
    if (req.body.sender != undefined & req.body.receiver != undefined & req.body.txt != undefined) {
        // var q = `INSERT INTO (SELECT dbName FROM ${req.body.receiver} WHERE contact=${req.body.sender}) SET ?`;
        var q = `INSERT INTO chats SET ?`;
        var post = {
            txt: req.body.txt,
            sender: req.body.sender,
            receiver: req.body.receiver
        };
        connection.query(q, post, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send("Success....");
            }
        });
    } else {
        res.json({
            "Error": "Pass all three params in the body !"
        });
    }
});
app.get('/getData', (req, res) => {
    // queries -> upto
    // var q = "SELECT max(id) as last from souptikrounak";
    if (req.query.sender != undefined & req.query.receiver != undefined & req.query.items != undefined) {
        var q = `SELECT * FROM chats WHERE id<=(SELECT max(id) FROM chats) AND ((sender=\'${req.query.sender}\' AND receiver=\'${req.query.receiver}\') OR (sender=\'${req.query.receiver}\' AND receiver=\'${req.query.sender}\')) ORDER BY id DESC LIMIT ${req.query.items}`;
        connection.query(q, (err, result) => {
            if (err) {
                res.json({
                    "Error": err
                });
            } else {
                result.reverse();
                // console.log(result);
                res.json(result);
            }
        });
    } else {
        res.json({
            "Error": "Please write all the query parmeters"
        });
    }
});
app.get('/loadData', (req, res) => {
    // queries -> index, upto
    // req.query.items
    // req.query.index
    var q = `SELECT * FROM chats WHERE id<${req.query.index} AND ((sender=\'${req.query.sender}\' AND receiver=\'${req.query.receiver}\') OR (sender=\'${req.query.receiver}\' AND receiver=\'${req.query.sender}\')) ORDER BY id DESC LIMIT ${req.query.items}`;
    if (req.query.index != undefined & req.query.items != undefined & req.query.sender != undefined & req.query.receiver != undefined) {
        connection.query(q, (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    "Error": err
                });
            } else {
                result.reverse();
                res.json(result);
            }
        });
    } else {
        res.json({
            "Error": "Provide all the parameters"
        });
    }
});
app.post('/createUser', (req, res) => {
    if (req.body.username != undefined & req.body.email != undefined) {
        var data = {
            username: req.body.username,
            email: req.body.email
        };
        var q = "INSERT INTO logins SET ?";
        connection.query(q, data, (err, result) => {
            if (err) {
                console.log(err);
                res.send("Err : " + err);
            } else {
                res.send("Success");
            }
        });
    } else {
        res.send("Pass the body 'username' and 'email'");
    }
});
app.get('/newMessage', (req, res) => {
    if (req.query.sender != undefined & req.query.receiver != undefined & req.query.index != undefined) {
        var q = `SELECT * FROM chats WHERE id>${req.query.index} AND ((sender=\'${req.query.sender}\' AND receiver=\'${req.query.receiver}\') OR (sender=\'${req.query.receiver}\' AND receiver=\'${req.query.sender}\'))`;
        connection.query(q, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        });
    } else {
        console.log("Pass all the queries");
    }
});
app.get('/getContacts', (req, res) => {
    if (req.query.user != undefined) {
        var q = `SELECT * FROM contacts WHERE user1=\'${req.query.user}\' OR user2=\'${req.query.user}\'`;
        connection.query(q, (err, result) => {
            if (err) {
                res.json({
                    "Error": err
                });
            } else {
                res.json(result);
            }
        });
    } else {
        console.log("Psss params");
        res.json({
            "Error": "Pass params"
        });
    }
});
app.get('/lastMessage', (req, res) => {
    if (req.query.sender != undefined & req.query.receiver != undefined) {
        var q = `SELECT id FROM chats WHERE ((sender=\'${req.query.sender}\' AND receiver=\'${req.query.receiver}\') OR (sender=\'${req.query.receiver}\' AND receiver=\'${req.query.sender}\')) ORDER BY id DESC LIMIT 1`;
        connection.query(q, (err, result) => {
            if (err) {
                res.json({
                    "Error": err
                });
            } else {
                if (result.length == 0) {
                    res.json(0);
                } else {
                    res.json(result[0].id);
                }
            }
        });
    } else {
        res.json({
            "Error": "Pass all the params"
        });
    }
});

// APIs for web app
app.get('/login', (req, res) => {
    var cookies_s = req.headers.cookie;
    var auth_token;
    if (cookies_s != undefined) {
        var cookies = cookies_s.split("; ");
        for (var i = 0; i < cookies.length; i++) {
            if (cookies[i].indexOf("authorization=") == 0) {
                auth_token = cookies[i].substring("authorization=".length, cookies[i].length);
                break;
            }
        }
        if (auth_token != undefined) {
            jwt.verify(auth_token, 'secret_key', (err, user) => {
                if (err) {
                    res.render('login');
                }
                res.redirect('/');
            });
        } else {
            res.render('login');
        }
    } else {
        res.render('login');
    }
});
app.post('/login', (req, res) => {
    console.log("Hey");
    if (req.body.email != undefined & req.body.endpoint != undefined) {
        var q = `SELECT * FROM logins WHERE username=\'${req.body.email}\' OR email=\'${req.body.email}\'`;
        connection.query(q, (err, result) => {
            if (err) {
                console.log(err);
                res.send("Somme internal error occuder try after sometime");
            } else {
                if (result[0] != undefined) {
                    var secret_token = generateRandomString(30);
                    var mailOptions = {
                        from: 'FunChat',
                        to: result[0].email,
                        subject: 'Email verification',
                        html: `<strong>Click on this link to verify your email and log in (It is valid for only one hour) :</strong> <a href="${req.body.endpoint}/verify?secretToken=${secret_token}">Verify Here</a>`
                    };
                    var q = `UPDATE logins SET token=\'${secret_token}\',token_expire=${(Math.round((new Date()).getTime() / 1000))+3600} WHERE username=\'${req.body.email}\' OR email=\'${req.body.email}\'`;
                    connection.query(q, (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send("Some err occured");
                        } else {
                            transporter.sendMail(mailOptions, function(error, info) {
                                if (error) {
                                    console.log(error);
                                    res.send("Some error occured please check the email");
                                } else {
                                    console.log('Email sent: ' + info.response);
                                    res.send("Click on the link send to the email to log in. It is valid for only one hour.");
                                }
                            });
                        }
                    });
                } else {
                    res.send("User doesn't exist"); //Later will put redirection
                }
            }
        });
    } else {
        res.send("Email or endpoint not properly typed");
    }
});
app.get('/verify', (req, res) => {
    var userNameAndEmail;
    if (req.query.secretToken != undefined) {
        var q = `SELECT * FROM \`logins\` WHERE token=\'${req.query.secretToken}\' AND token_expire>${Math.round((new Date()).getTime() / 1000)}`;
        connection.query(q, (err, result) => {
            if (err) {
                res.send(err);
            } else {
                if (result[0] != undefined) {
                    userNameAndEmail = {
                        username: result[0].username,
                        email: result[0].email
                    };
                    var q = `UPDATE logins SET token="",token_expire=0 WHERE username=\'${result[0].username}\' AND email=\'${result[0].email}\'`;
                    connection.query(q, (err, result) => {
                        if (err) {
                            res.json({
                                "Error": "Try again"
                            });
                        } else {
                            const access_token = jwt.sign(userNameAndEmail, 'secret_key');
                            res.cookie('authorization', access_token, { maxAge: 9000000000000 });
                            res.redirect('/');
                        }
                    });
                } else {
                    res.send("The url is invalid or expired ! ");
                }
            }
        });
    } else {
        res.send("Secret token was not found");
    }
});
app.get('/', (req, res) => {
    var cookies_s = req.headers.cookie;
    var auth_token;
    if (cookies_s != undefined) {
        var cookies = cookies_s.split("; ");
        for (var i = 0; i < cookies.length; i++) {
            if (cookies[i].indexOf("authorization=") == 0) {
                auth_token = cookies[i].substring("authorization=".length, cookies[i].length);
                break;
            }
        }
        if (auth_token != undefined) {
            jwt.verify(auth_token, 'secret_key', (err, user) => {
                if (err) {
                    res.send("Some error occured in your token verification or token has been tampered. Try logging in again :[");
                }
                res.render('index', { data: { user: user } });
            });
        } else {
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
});
app.get('/searchUser', (req, res) => {
    if (req.query.pat != undefined) {
        var q = `SELECT * FROM logins WHERE username LIKE '${req.query.pat}%' OR email LIKE '${req.query.pat}%'`;
        connection.query(q, (err, result) => {
            if (err) {
                res.json(err);
            } else {
                res.json(result);
            }
        });
    } else {
        res.json({
            "Error": "No pattern provided"
        });
    }
});
app.post('/startUser', (req, res) => {
    if (req.query.sender != undefined & req.query.rec != undefined) {
        var q = `INSERT INTO contacts SET ?`;
        var post = {
            user1: req.query.sender,
            user2: req.query.rec
        };
        connection.query(q, post, (err, result) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                console.log(result);
                res.send(result);
            }
        });
    } else {
        res.send("Enter params");
    }
});
// app.get('/logout', (req, res) => {
// Logout logic to be written in frontend. We have to only delete the cookie in the frontend.
// });
app.listen(process.env.PORT || 3000, () => { console.log("App available on http://localhost:3000"); });