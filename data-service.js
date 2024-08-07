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
//A5 - 'readEmployees()' and 'readDepartments()' removed
//A5 - all export functions have been updated to work with the Postgres database

const Sequelize = require("sequelize");

// setting up sequelize to point to my postgres database
var sequelize = new Sequelize("dekoi1igp1tdna", "piwcblmhzsewwl", "60eb76d5cd6344f1cd846b8d8807c45fa39b344eaee007ca30e83c3fc42d71e1", {
    host: "ec2-34-202-65-210.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
        ssl: {
            //require: true,
            rejectUnauthorized: false
        }
    }
});


// FUNCTIONS BEGIN HERE

// initialize
function initialize()
{
    return new Promise (
        function (resolve, reject)
        {
            sequelize.sync().then(() => {
                console.log("\n"+"database sync success");
                resolve();

            }).catch(() => {
                reject("unable to sync the database")
            });

        });// end return Promise statement
}

    // GET (DATA-FECTHING) FUNCTIONS

    // getAllEmployees
    function getAllEmployees()
    {
        return new Promise (
            function (resolve, reject)
            {
                Employee.findAll().then((data) => {
                    // the database returns Employee objects containing five properties, the data we want is within the 'dataValues' property
                    data = data.map(value => value.dataValues); // this line maps the 'data' array so that each element has the each property of 'dataValues' as an "own property"
                    // i.e. To access the status of an employee we would write "data[0].dataValues.status". The above line changes it so that we write "data[0].status" instead.
                    resolve(data);
                }).catch(() => {
                    reject("no results returned");
                });

            });// end return Promise statement
    }

    // getEmployeesByStatus
    function getEmployeesByStatus (status)
    {
        const stat1 = "Full Time";
        const stat2 = "Part Time";
        var validStatus = false;

        // validate the 'status' parameter case INsensitively, if valid then explicity set it to 'stat1' or 'stat2'
        {
            if (strcmp_i(stat1, status))
            {
                status = stat1;
                validStatus = true;
            }
            else if (strcmp_i(stat2, status))
            {
                status = stat2;
                validStatus = true;
            }
            else
            {
                validStatus = false;
            }
        }

        return new Promise (
            function (resolve, reject)
            {
                if(!validStatus)
                { // if 'status' was invalid (i.e. matched neither valid option)
                    reject("invalid status parameter");
                }
                else
                { // otherwise, if the 'status' parameter is valid
                    Employee.findAll({
                        where: {
                            status: status
                        }
                    }).then((data) => {
                        // pull the data (exclusively)
                        data = data.map(value => value.dataValues);
                        resolve(data);
                    }).catch(() => {
                        reject("no results returned");
                    });
                }
            });// end return Promise statement
    }

    // getEmployeesByDepartment
    function getEmployeesByDepartment (department)
    {

        return new Promise (
            function (resolve, reject)
            {
                Employee.findAll({
                    where: {
                        department: department
                    }
                }).then((data) => {
                    // pull the data (exclusively)
                    data = data.map(value => value.dataValues);
                    resolve(data);
                }).catch(() => {
                    reject("no results returned");
                });

            });// end return Promise statement
    }

    // getEmployeesByManager
    function getEmployeesByManager (manager)
    {
        return new Promise (
            function (resolve, reject)
            {
            Employee.findAll({
                    where: {
                        employeeManagerNum: manager
                    }
                }).then((data) => {
                    // pull the data (exclusively)
                    data = data.map(value => value.dataValues);
                    resolve(data);
                }).catch(() => {
                    reject("no results returned");
                });

            });// end return Promise statement
    }

    // getEmployeeByNum
    function getEmployeeByNum (num)
    {
        return new Promise (
            function (resolve, reject)
            {
                Employee.findAll({
                    where: {
                        employeeNum: num
                    }
                }).then((data) => {
                    // pull the data (exclusively)
                    data = data.map(value => value.dataValues);
                    resolve(data[0]);
                }).catch(() => {
                    reject("no results returned");
                });
            });// end return Promise statement
    }

    // getDepartments
    function getDepartments()
    {
        return new Promise (
            function (resolve, reject)
            {
                Department.findAll().then((data) => {
                    data = data.map(value => value.dataValues);
                    resolve(data);
                }).catch(() => {
                    reject("no results returned");
                });
            });// end return Promise statement
    }

    // getDepartmentById
    function getDepartmentById(id)
    {
        return new Promise (
            function (resolve, reject)
            {
                Department.findAll({
                    where: {
                        departmentId: id
                    }
                }).then((data) => {
                    // pull the data (exclusively)
                    data = data.map(value => value.dataValues);
                    resolve(data[0]);
                }).catch(() => {
                    reject("no results returned");
                });
            });// end return Promise statement
    }


    // ADD/UPDATE FUNCTIONS

    // addEmployee
    function addEmployee(employeeData)
    {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        // explicitly set all blank-value properties to null
        for (p in employeeData)
        {
            if (employeeData[p] == "")
            {
                employeeData[p] = null;
            }
        }

        return new Promise (
            function (resolve, reject)
            {
                Employee.create(employeeData).then(() => {
                    resolve();
                }).catch(() => {
                    reject("unable to create employee");
                });
            });// end return Promise statement

    }// updated function since A3 version, no longer contains a reject statement, no longer rejects the Promise if employees is empty, no longer resolves with the array as a parameter

    function updateEmployee(employeeData)
    {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        // explicitly set all blank-value properties to null
        for (p in employeeData)
        {
            if (employeeData[p] == "")
            {
                employeeData[p] = null;
            }
        }

        return new Promise (
            function (resolve, reject)
            {
                Employee.update(
                    employeeData
                    ,{
                        where: {employeeNum: employeeData.employeeNum}
                    }
                ).then(() => {
                    resolve();
                }).catch(() => {
                    reject("unable to update employee");
                });

            });// end return Promise statement
    }

    function deleteEmployeeByNum(num)
    {
        return new Promise (
            function (resolve, reject)
            {
                Employee.delete({
                    where: {
                        employeeNum: num
                    }
                }).then(() => {
                    resolve();
                }).catch(() => {
                    reject("unable to delete employee");
                });
            });// end return Promise statement
    }

    // addDepartment
    function addDepartment(departmentData)
    {
        // explicitly set all blank-value properties to null
        for (p in departmentData)
        {
            if (departmentData[p] == "")
            {
                departmentData[p] = null;
            }
        }

        return new Promise (
            function (resolve, reject)
            {
                Department.create(departmentData).then(() => {
                    resolve();
                }).catch(() => {
                    reject("unable to create department");
                });
            });// end return Promise statement
    }

    // updateDepartment
    function updateDepartment(departmentData)
    {
        // explicitly set all blank-value properties to null
        for (p in departmentData)
        {
            if (departmentData[p] == "")
            {
                departmentData[p] = null;
            }
        }

        return new Promise (
            function (resolve, reject)
            {
                Department.update(
                    departmentData
                    ,{
                        where: {departmentId: departmentData.departmentId}
                    }
                ).then(() => {
                    resolve();
                }).catch(() => {
                    reject("unable to update department");
                });
            });// end return Promise statement
    }

// authenticate db connection (A5)
sequelize.authenticate().then(() => {
    console.log("Connection success.");
}).catch((err) => {
    console.log("Unable to connect to DB.", err);
});


// MODEL DEFINITIONS (A5)

    // Define the 'Employee' model
    var Employee = sequelize.define("Employee", {
        employeeNum: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING,
        SSN: Sequelize.STRING,
        addressStreet: Sequelize.STRING,
        addressCity: Sequelize.STRING,
        addressState: Sequelize.STRING,
        addressPostal: Sequelize.STRING,
        maritalStatus: Sequelize.STRING,
        isManager: Sequelize.BOOLEAN,
        employeeManagerNum: Sequelize.INTEGER,
        status: Sequelize.STRING,
        department: Sequelize.INTEGER,
        hireDate: Sequelize.STRING
    });

    // Define the 'Department' model
    var Department = sequelize.define("Department", {
        departmentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        departmentName: Sequelize.STRING
    });


// HELPER FUNCTIONS

// checks if its parameter is a string, returns 1 if it is a string literal, returns 2 if it is a String object, otherwise returns 0
function isString(str)
{
    if (typeof(str) == "string")
    {
        return 1;
    }
    else if (str instanceof String)
    {
        return 2;
    }
    else
    {
        return 0;
    }
}

// compares two strings case INsensitively, returns 1 if they are the same, returns 0 if they are not the same, does nothing if either object was not a string
function strcmp_i(str1, str2)
{
    var ret = false;

    if (isString(str1) && isString(str2))
    {
        var cpy1 = "";
        var cpy2 = "";
        cpy1 = str1.toUpperCase();
        cpy2 = str2.toUpperCase();

        if (cpy1 == cpy2)
        {
            ret = true;
        }
        else
        {
            ret = false;
        }
    }

    return ret;
}


// EXPORTS
module.exports = {
    initialize,
    getAllEmployees,
    //getManagers,
    getEmployeesByStatus,
    getEmployeesByDepartment,
    getEmployeesByManager,
    getEmployeeByNum,
    getDepartments,
    getDepartmentById,
    addEmployee,
    updateEmployee,
    deleteEmployeeByNum,
    addDepartment,
    updateDepartment,
    isString
}



function makeMockUpEmps()
{
    var emps = [
        {
        employeeNum: 1,
        firstName: "Foster",
        lastName: "Thorburn",
        email: "fthorburn0@myCompany.com",
        SSN: "935-74-9919",
        addressStreet: "8 Arapahoe Park",
        addressCity: "New York",
        addressState: "NY",
        addressPostal: "20719",
        maritalStatus: "single",
        isManager: true,
        employeeManagerNum: null,
        status: "Full Time",
        department: 2,
        hireDate: "4/30/2014"
      },
      {
        employeeNum: 2,
        firstName: "Emmy",
        lastName: "Trehearne",
        email: "etrehearne1@myCompany.com",
        SSN: "906-43-6273",
        addressStreet: "66965 Shelley Circle",
        addressCity: "New York",
        addressState: "NY",
        addressPostal: "33605",
        maritalStatus: "single",
        isManager: false,
        employeeManagerNum: 1,
        status: "Part Time",
        department: 2,
        hireDate: "6/25/2016"
      }
    ];

    return emps;
}