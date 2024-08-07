/*********************************************************************************
* BTI325 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Arryell Parris         Student ID: 134838192      Date: 12/12/2020
*
* Online (Heroku) URL: https://ap3-bti325-a6.herokuapp.com/
*
********************************************************************************/
const path = require("path");
const dataserv = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js"); 
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");
//const { resourceUsage } = require("process");

const app = express();

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const HTTP_PORT = process.env.PORT || 8080;

// including the 'static' middleware
app.use( express.static('public') );

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "bti325_a6", // this should be a long un-guessable string.
    duration: 5 * (60*1000), // duration of the session in milliseconds (5 minutes)
    activeDuration: (60*1000) // the session will be extended by this many ms each request (1 minute)
}));

// Changed the 'extended' property to false
app.use(bodyParser.urlencoded({ extended: false }));


// Custom middleware function to ensure that all templates will have access to a "session" object
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// This is a helper middleware function that checks if a user is logged in
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

// Fixing the nav bar to show the correct item
app.use( function(req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.engine( ".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
            navLink: function(url, options){
                return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
            },
            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                    throw new Error("Handlebars Helper equal needs 2 parameters");
                    
                if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            }
        } // end of helpers
    }) //end exphbs

); //end app.engine

// set the view engine to hbs
app.set("view engine", ".hbs");


// ROUTES START HERE
{
    // default & About routes
    {
        // default url path (http://localhost)
        app.get("/", (req, res) => {
            //res.sendFile(path.join(__dirname,"./views/home.html"));
            res.render("home");
        });

        // route to listen on /about
        app.get("/about", (req, res) => {
            //res.sendFile(path.join(__dirname,"./views/about.html"));
            res.render("about");
        });    
    }

    // basic Employee, Department and Image routes (i.e. all of the 'employee', 'department' and 'image' routes that are NOT 'add' or 'update' routes)
    {
        // route to listen on '/employees'
        app.get("/employees", ensureLogin, (req, res) => {

            if (req.query.status)
            {
                dataserv.getEmployeesByStatus (req.query.status)
                .then((data) => {
                    if(data.length > 0) {
                        res.render("employees", { employees: data });
                    }
                    else {
                        res.render("employees", { message: "no results returned" });
                    }

                }).catch((err) => {
                    res.render("employees", { message: err });
                });
            }
            else if (req.query.department)
            {
                dataserv.getEmployeesByDepartment (req.query.department)
                .then((data) => {
                    if(data.length > 0) {
                        res.render("employees", {employees: data});
                    }
                    else {
                        res.render("employees", {message: "no results returned"});
                    }

                }).catch((err) => {
                    res.render("employees", {message: err});
                });
            }
            else if (req.query.manager)
            {
                dataserv.getEmployeesByManager (req.query.manager)
                .then((data) => {
                    if(data.length > 0) {
                        res.render("employees", {employees: data});
                    }
                    else {
                        res.render("employees", {message: "no results returned"});
                    }

                }).catch((err) => {
                    res.render("employees", {message: err});
                });
            }
            else
            {   // if no query was defined then respond with all of the employees
                dataserv.getAllEmployees().then((data) => {
                    if(data.length > 0) {
                        res.render("employees", { employees: data });
                    }
                    else {
                        res.render("employees", { message: "no results returned" });
                    }

                }).catch((err) => {
                    res.render({message: err});
                });
            }
        });

        // GET route to listen on 'employee/value'
        app.get("/employee/:empNum", ensureLogin, (req, res) => {
            // initialize an empty object to store the employee and departments data
            var viewData = {};

            dataserv.getEmployeeByNum(req.params.empNum).then((data) => {
                if (data)
                {   // if data was returned
                    viewData.employee = data; // store the employee data in 'viewData' as the 'employee' property
                }
                else
                {   // otherwise, if no data was returned
                    viewData.employee = null; // set the 'employee' property to null
                }
            }).catch(() => {
                viewData.employee = null; // set the 'employee' property to null if an error occurred
            })
            .then(dataserv.getDepartments) // if the above chain executed succesfully, then fetch the departments
            .then((data) => {
                viewData.departments = data; // store the deparments data (which should be an array) in 'viewData' as a 'departments' property

                // loop through 'viewData.departments'
                for (var i=0; i < viewData.departments.length; i++)
                {
                    // upon finding the department whose ID number matches the Employee's department number
                    if (viewData.departments[i].departmentId == viewData.employee.department)
                    { 
                        viewData.departments[i].selected = true; // add a 'selected' property to that department and set it to true
                    }
                }
            }).catch(() => {
                viewData.departments = []; // set the 'departments' property to an empty array if an error occurred
            })
            .then(() => {
                // if there is no employee data in 'viewData'
                if (viewData.employee == null)
                {
                    // then return an error
                }
                else
                { // otherwise, render the "employee" view
                    res.render("employee", { viewData: viewData });
                }
            }); // no catch block required here since the above 'then' block does not contain a returned Promise
        });

        // GET route to listen on 'employees/delete/:empNum'
        app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
            dataserv.deleteEmployeeByNum(req.params.empNum)
            .then(() => {
                res.redirect("/employees");
            })
            .catch(() => {
                res.status(500).send("Unable to Remove Employee / Employee not found");
            });
        });


        // route to listen on '/managers' was removed


        // route to listen on '/departments'
        app.get("/departments", ensureLogin, (req, res) => {
            dataserv.getDepartments().then((data) => {
                if(data.length > 0) {
                    res.render("departments", { departments: data });
                }
                else {
                    res.render("departments", { message: "no results returned" });
                }

            }).catch((err) => {
                res.render("departments", { message: err });
            });
        });

        // GET route to listen on 'department/value'
        app.get("/department/:departmentId", ensureLogin, (req, res) => {
            dataserv.getDepartmentById(req.params.departmentId).then((data) => {
                if (data)
                {
                    res.render("department", { department: data });
                }
                else
                {
                    res.status(404).send("Department Not Found<br /><a href='/about'>Click here to return to Home.</a>");
                }
            }).catch((err) => {
                res.status(404).send("Department Not Found<br /><a href='/about'>Click here to return to Home.</a>");
            });
        });

        // GET route to listen on '/images'
        app.get("/images", ensureLogin, (req, res) => {
        const imgDirPath = "/images/uploaded/";
        var imagesArr = new Array();
        
        fs.readdir(path.join(__dirname,"./public/images/uploaded"), (err, items) => {
            if (err) {
                console.log(err);
            }
            else {
                items.forEach( (item) => {
                    var image = {filepath: imgDirPath};
                    image.filepath += item;

                    imagesArr.push(image);
                });

                res.render("images", {data: imagesArr});
            }
        });

    });
    }

    // ADD & UPDATE routes for Employees, Departments and Images
    {
        // GET route to listen on '/employees/add'
        app.get("/employees/add", ensureLogin, (req, res) => {
            dataserv.getDepartments().then(() => {
                res.render("addEmployee", { departments: data });
            }).catch(() => {
                res.render("addEmployee", { departments: [] });
            });
        });

        // POST route to listen on '/employees/add'
        app.post("/employees/add", ensureLogin, (req, res) => {
            dataserv.addEmployee(req.body).then(() => { 
                res.redirect("/employees");
            }).catch((err) => {
                res.status(500).send("Unable to Add Employee");
            });
        });

        // POST route to listen on 'employee/update'
        app.post("/employee/update", ensureLogin, (req, res) => {
            //console.log(req.body);
            dataserv.updateEmployee(req.body).then(() => {
                res.redirect("/employees");
            }).catch((err) => {
                res.status(500).send("Unable to Update Employee");
            });
        });

        // GET route to listen on '/images/add'
        app.get("/images/add", ensureLogin, (req, res) => {
            //res.sendFile(path.join(__dirname,"./views/addImage.html"));
            res.render("addImage");
        });

        // POST route to listen on '/images/add'
        app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
            res.redirect("/images");
        });

        // GET route to listen on '/departments/add'
        app.get("/departments/add", ensureLogin, (req, res) => {
            res.render("addDepartment");
        });

        // POST route to listen on '/departments/add'
        app.post("/departments/add", ensureLogin, (req, res) => {
            dataserv.addDepartment(req.body).then(() => { 
                res.redirect("/departments");
            }).catch((err) => {
                res.status(500).send("Unable to Add Department");
            });
        });

        // POST route to listen on 'department/update'
        app.post("/department/update", ensureLogin, (req, res) => {
            dataserv.updateDepartment(req.body).then(() => {
                res.redirect("/departments");
            }).catch((err) => {
                res.status(500).send("Unable to Update Department");
            });
        });
    }

    // User session (login, logout, register, userhistory) routes
    {
        // GET route to listen on '/login'
        app.get("/login", (req, res) => {
            res.render("login");
        });

        // GET route to listen on '/register'
        app.get("/register", (req, res) => {
            console.log("       awa");
            res.render("register");
        });

        // POST route to listen on '/register'
        app.post("/register", (req, res) => {
            //console.log(">>   req.body pass = " + req.body.password);

            dataServiceAuth.registerUser(req.body)
            .then(() => {
                res.render("register", {successMessage: "User created"});
            }).catch((err) => {
                res.render("register", {errorMessage: err, userName: req.body.userName});
            });
        });

        // POST route '/login'
        app.post("/login", (req, res) => {
            req.body.userAgent = req.get('User-Agent');

            console.log("req body = ", req.body);

            dataServiceAuth.checkUser(req.body)
            .then((user) => {
                // If promise resolved successfully, then add the return user's username, email and login-history to the session.

                req.session.user = {
                    userName: user.userName,
                    email: user.email,
                    loginHistory: user.loginHistory
                }

                // Then redirect to the "/employees" route
                res.redirect("/employees");
            }).catch((err) => {
                res.render("login", {errorMessage: err, userName: req.body.userName});
            });
        });

        // GET route '/logout'
        app.get("/logout", (req, res) => {
            req.session.reset();
            res.redirect("/");
        });

        // GET 'userHistory'
        app.get("/userHistory", ensureLogin, (req, res) => {
            res.render("userHistory");
        });
    }

} // ROUTES END HERE

    // error 404 message for all other possible URL entries
    app.get("*", (req, res) => {
        res.status(404).send("*ERROR 404*<br />*PAGE NOT FOUND*<br /><br /><a href='/about'>Click here to return to Home.</a>");
    });




// initialize the data, then start the server if 'initialize()' was executed sucessfully
//dataserv.initialize().then(dataServiceAuth.initialize).then(startTheServer)
dataserv.initialize()
.then(dataServiceAuth.initialize)
.then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on: " + HTTP_PORT);
    });
}).catch(function(err) {
    console.log("unable to start server: " + err);
});