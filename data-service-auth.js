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

const dataServ = require("./data-service.js");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
//const { isColString } = require("sequelize/types/lib/utils");
//changing that ^ to `const { isColString } = require("sequelize");` works

//const dbName = "dekoi1igp1tdna";
const dbName = "bti325_app";
const dbURL = `mongodb+srv://dbUser1:p%40ssDBc0de@senecaweb.gpewm.mongodb.net/${dbName}?retryWrites=true&w=majority`;



// included following statement before defining schema
mongoose.set('useCreateIndex', true);

// creating a 'Schema' variable to point to 'mongoose.Schema'
var Schema = mongoose.Schema;

// Schema definitions
var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": 
        [{ "dateTime": Date, "userAgent": String }]
});


var User;

// initialize function
function initialize()
{
    return new Promise((resolve, reject) => {
        var scs = false;
        var errm;
        var dbA6 = mongoose.createConnection(`${dbURL}`, {useNewUrlParser: true, useUnifiedTopology: true});
        
        // Checking whether the connection was successful
        dbA6.on("error", (err) => {
            console.log("db connection error!");
            scs = false;
            reject(err);
        });
        
        dbA6.once("open", () => {
            console.log("db connection success!");
            User = dbA6.model("users", userSchema);
            resolve();
        });

    }); // end of return Promise statement
}

// registerUser
function registerUser (userData)
{
    //console.log("inside register user fuction");
    //console.log("userdata is", userData);
    return new Promise((resolve, reject) => {
        var validUser = false;
        var validPass = false;
        var validPass2 = false;
        var passMatch = false;

        // validating data within parameter
        {
            // checking username
            if ((userData.userName) && !whtSpcOnly(userData.userName))
            {
                validUser = true;
            } else {
                validUser = false;
            }
            //console.log("userData.userName = "+userData.userName);
            //console.log("validuser = ", validUser);

            // checking password
            if ((userData.password) && !whtSpcOnly(userData.password))
            {
                validPass = true;
            } else {
                validPass = false;
            }

            // checking 2nd entry of password
            if ((userData.password2) && !whtSpcOnly(userData.password2))
            {
                validPass2 = true;
            } else {
                validPass2 = false;
            }

            // check for password match
            if (userData.password === userData.password2)
            {
                passMatch = true;
            } else {
                passMatch = false;
            }
        }

        if (!validUser || !validPass || !validPass2)
        {
            reject("User name or password cannot be empty or only white spaces!");
        }
        else if (!passMatch)
        {
            reject("Passwords do not match");
        }
        else {
            let newUser = new User(userData);

            bcrypt.genSalt(10, (err, salt) => { // Generate a "salt" using 10 rounds
                if (err)
                { // If an error occurred when generating the salt
                    reject("There was an error encrypting the password");
                }
                else
                { // Otherwise
                    bcrypt.hash(newUser.password, salt, (err, hashValue) => { // encrypt the password: "myPassword123"
                        if (err)
                        { // If an error occurred when hashing the password
                            reject("There was an error encrypting the password");
                        }
                        else
                        { // Otherwise
                            // Store the resulting "hashValue" value in 'newUser' object
                            newUser.password = hashValue;

                            newUser.save((err) => {
                                if (err)
                                {
                                    if (err.code == 11000)
                                    {
                                        reject("User Name already taken");
                                    } else {
                                        reject("There was an error creating the user: ", err);
                                    }
                                } else {
                                    console.log(`${newUser.userName} successfully created`);
                                    resolve();
                                }
                            }); // end save
                        }
                    }); // end hash statement
                }
            }); // end genSalt statement
        }

    }); // end of return Promise statement
}

// checkUser
function checkUser (userData)
{
    return new Promise((resolve, reject) => {

        User.findOne({ userName: userData.userName }).exec()
        .then((foundUser) => {
            if (!foundUser)
            {   // If no user was found then reject the promise.
                console.log('huh?');
                reject(`Unable to find user: ${userData.userName}`); 
            } else {
                // Otherwise if the user was found then compare the input password to the stored password
                bcrypt.compare(userData.password, foundUser.password).then((res) => {
                    // res === true if it matches and res === false if it does not match
                    if (res===false)
                    {   // ... but the recorded password does not match the input then reject the promise.
                        reject(`Incorrect password for user: ${userData.userName}`);
                        //reject("Unable to find user: ", userData.userName);
                    } else {
                        // ... and the recorded password matches the input, then add this login attempt to 'foundUser.loginHistory'.
                        foundUser.loginHistory.push(
                            {dateTime: (new Date()).toString(), userAgent: userData.userAgent}
                        );
    
                        // Update the matching user record in the database to show the new login attempt.
                        User.updateOne(
                            { userName: foundUser.userName },
                            { $set: { loginHistory: foundUser.loginHistory } }
                        ).exec()
                        .then(() => {
                            // If the update was successful then resolve the promise with 'foundUser'
                            resolve(foundUser);
                        }).catch((err) => {
                            // If there was an error when updating the user then reject the promise.
                            reject("There was an error verifying the user: ", err);
                        });
                    } // end else passwords match

                }); // end bcrypt compare statement

            } // end else user was found
        }).catch((err) => {
            // If there was an error finding the user then reject the promise.
            console.log("why is it rejecting here");
            reject("Unable to find user: ", err);
        });
    }); // end of return Promise statement
}

// EXPORTS
module.exports = {
    initialize,
    registerUser,
    checkUser
}

// this function counts the number of whitespace characters in a string, if the num of whitespace chars is equal to the string's length then it returns true, otherwise return false
function whtSpcOnly(str)
{
    var ret = false;
    var count = 0;

    if (dataServ.isString(str))
    {
        for(var i=0; i<str.length; i++)
        {
            if (str[i] == ' ')
            {
                count++;
            }
        }

        if (count == str.length)
        {
            ret = true;
        }
    }
    
    return ret;
}