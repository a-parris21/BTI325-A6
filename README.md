# BTI325 Assignment 6

## Overview
This project is a web-based employee database management system (DBMS) developed for Assignment 6 (A6) of the BTI325 class. The application features CRUD operations for employee records, user authentication, data storage, session management, and file uploads.

## Features
- CRUD Operations: Create, Read, Update, and Delete employee records.
- User Authentication: Secure login and registration using BcryptJS for password hashing.
- Data Storage: Employee data stored in MongoDB with Mongoose for data modeling.
- Session Management: User sessions managed to maintain login state.  
- File Uploads: Capability to upload and manage employee-related files.

## Technologies
- Front-End: Handlebars.js
- Back-End: Node.js, Express.js
- Database: MongoDB, Mongoose
- Security: BcryptJS for password encryption

## Installation
### Prerequesites
- Node.js (14.0.0 or later)
- MongoDB

### Steps
1. Clone the repository:
    ```sh
    git clone https://github.com/a-parris21/bti325-assignment6.git
    ```
2. Navigate to the project directory:
    ```sh
    cd bti325-assignment6
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
4. (Optional) Set the port number in an environment variable if desired. This can be done by creating a `.env` file in the root directory of the project and defining the `PORT` variable:
    ```
    PORT=8080
    ```

5. Start the application:
    ```sh
    node server.js
    ```
6. Open your browser and navigate to `http://localhost:8080`

## Acknowledgements
This project was developed as part of the BTI325 course at Seneca Polytechnic. Special thanks to my course instructor for her support and feedback.

## Notice
Please note that the application was previously hosted on Heroku. Due to changes in hosting arrangements, the previous hosting service is no longer available. As a result, the live version of the app is currently inaccessible.

Additionally, the MongoDB database used in the previous setup has been closed due to inactivity. To use the application, you will need to update the database connection information and user credentials in the following files:

- `data-service.js`: Update the database connection information to reflect the new MongoDB instance.
- `data-service-auth.js`: Modify the connection details and any user authentication settings as needed.

The repository is now intended for local development and testing purposes.
