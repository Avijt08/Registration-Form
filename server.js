const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const encodeURL = bodyParser.urlencoded({ extended: false });
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html')); 
});
app.use(session({
    secret: "thisismysecretkey",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false
}));

app.use(cookieParser());

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "form1"
});

con.connect(function(err) {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + con.threadId);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

app.post('/register.html', encodeURL, async (req, res) => {
    const { name, age, DOB, company_name, phone_no, email, password, user_type } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    con.query(`SELECT * FROM form_details1 WHERE email = '${email}'`, async function(err, result) {
        if (err) {
            console.error('Error querying data: ' + err.stack);
            return;
        }

        if (result.length > 0) {
            res.sendFile(__dirname + '/fail_reg.html');
        } else {
            if (password.length < 8) {
                res.sendFile(__dirname + '/fail_reg.html');
                return;
            }

            const sql = `INSERT INTO form_details1 (First_Name,Last_Name, age, DOB, Company_name, Phone_number, email, password, user_type) VALUES('${First_Name}','${Last_Name}', '${age}', '${DOB}', '${Company_name}', '${Phone_number}', '${email}', '${hashedPassword}', '${user_type}')`;

            con.query(sql, function(err, result) {
                if (err) {
                    console.error(err);
                    return;
                }
                res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <title>Registration Form</title>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                        <script>
                        setTimeout(function() {
                            alert('Registration successful!');
                            window.location.href = '/login'; // Redirect to login page
                        }, 1000); 
                    </script>
                    </head>
                    <body>
                        <div class="container">
                            <a href="/login.html">Log in</a>
                        </div>
                    </body>
                    </html>
                `);
            });
        }
    });
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});
app.post("/dashboard", encodeURL, (req, res) => {
    const Email = req.body.email;
    const Password = req.body.password;

    con.query(`SELECT * FROM form_details1 WHERE email = '${Email}'`, async function(err, result) {
        if (err) {
            console.error('Error querying data: ' + err.stack);
            res.sendFile(__dirname + '/fail_login.html');
            return;
        }

        if (result.length > 0) {
            const passwordMatch = await bcrypt.compare(Password, result[0].password);
            if (passwordMatch) {
                const user = result[0];
                let profilePhotoHTML = '';
                if (user.profile_photo) {
                    profilePhotoHTML = `<img id="profilePhoto" src="${user.profile_photo}" class="rounded-circle profile-photo" alt="Profile Photo" width="100" height="100">`;
                } 
                else {
                    profilePhotoHTML = `<div class="profile-photo-upload">
                                          <label for="fileInput">
                                            <div id="profilePhoto" class="rounded-circle empty-profile-photo"></div>
                                            <input type="file" id="fileInput" name="profilePhoto" accept="image/*" style="display: none;">
                                          </label>
                                       </div>`;
                }
                let userDetails = `
                    ${profilePhotoHTML}
                    <h3>${user.user_type === 'admin' ? 'Admin' : ''} ${user.name}</h3>
                    <ul>
                        <li>Name: ${user.name}</li>
                        <li>Age: ${user.age}</li>
                        <li>DOB: ${user.DOB}</li>
                        <li>Company Name: ${user.company_name}</li>
                        <li>Phone: ${user.phone_no}</li>
                        <li>Email: ${user.email}</li>
                    </ul>
                `;

                if (user.user_type === 'admin') {
                    userDetails =`<h3>Admin</h3>${userDetails}`;
                }

                res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <title>Login Form</title>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                        <style>
                            .rounded-circle {
                                border-radius: 50%;
                            }
                            .empty-profile-photo {
                                width: 100px;
                                height: 100px;
                                background-color: #ccc;
                                cursor: pointer;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                            }
                            .profile-photo-upload input[type=file] {
                                display: none;
                            }
                            .profile-photo {
                                object-fit: cover;
                            }
                        </style>
                        <script>
                            document.getElementById('fileInput').addEventListener('change', function() {
                                const file = this.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = function(e) {
                                        document.getElementById('profilePhoto').src = e.target.result;
                                        document.getElementById('profilePhoto').classList.remove('empty-profile-photo');
                                    }
                                    reader.readAsDataURL(file);
                                }
                            });
                        </script>
                    </head>
                    <body>
                        <div class="container">
                            ${userDetails}
                            <a href="/">Log out</a>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                res.sendFile(__dirname + '/fail_login.html');
            }
        } else {
            res.sendFile(__dirname + '/fail_login.html');
        }
    });
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});

