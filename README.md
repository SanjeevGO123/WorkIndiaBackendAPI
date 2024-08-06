# ZoomCar API

## Description
This is a simple API for a car rental service. It allows users to sign up, log in, add cars, get available rides, rent a car, and update rent history.

## Dependencies Used
1. Express
2. Bcrypt
3. JWT
4. Dotenv
5. PG
6. Nodemon

## Installation

1. Clone the repository
```bash
git clone https://github.com/SanjeevGO123/WorkIndiaBackendAPI
```
2. Install the required packages
```bash
npm install
```
3. Create a .env file in the root directory and add the following environment variables
```bash
DB_HOST=<your-database-host>
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>
DB_NAME=<your-database-name>
DB_PORT=<your-database-port>
JWT_SECRET=<your-jwt-secret>
ADMIN_API_KEY=<your-admin-api-key>
```
4. Run the server
```bash
node index.js
```

## Database Schema
The database schema is as follows:
1. Users
    - id
    - name
    - email
    - password
2. Cars
    - id
    - category
    - model
    - number_plate
    - current_city
    - rent_per_hr
3. Rent_History
    - id
    - car_id
    - origin
    - destination
    - hours_requirement
    - amount
The database used in this project is PostgreSQL.

## API Documentation
The API documentation can be found [here : API Documentation](https://documenter.getpostman.com/view/30687639/2sA3rxqtGH)
