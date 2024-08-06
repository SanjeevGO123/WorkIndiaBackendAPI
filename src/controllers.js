const pool = require('./config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { username, password, email, is_admin } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const check=await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if(check.rows.length>0){
            return res.status(400).json({
                status: 'User already exists with the provided username or email',
                status_code: 400,
            });
        }
        const result = await pool.query(
            'INSERT INTO users (username, password, email, is_admin) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, hashedPassword, email, is_admin || false]
        );
        res.status(200).json({
            status: 'Account successfully created',
            status_code: 200,
            user_id: result.rows[0].id,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 'Incorrect username/password provided. Please retry',
                status_code: 401,
            });
        }
        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'Incorrect username/password provided. Please retry',
                status_code: 401,
            });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            status: 'Login successful',
            status_code: 200,
            user_id: user.id,
            access_token: token,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addCar = async (req, res) => {
    const { category, model, number_plate, current_city, rent_per_hr } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO cars (category, model, number_plate, current_city, rent_per_hr) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [category, model, number_plate, current_city, rent_per_hr]
        );
        res.status(200).json({
            message: 'Car added successfully',
            car_id: result.rows[0].id,
            status_code: 200,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRides = async (req, res) => {
    const { origin, destination, category, required_hours } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM cars WHERE current_city = $1 AND category = $2',
            [origin, category]
        );
        const car_ids = result.rows.map(car => car.id);
        const rent_history = await pool.query(`SELECT origin,destination,amount FROM rent_history where car_id = ${car_ids}`,[]);
        const rides = result.rows.map(car => {
            return {
                ...car,
                rent_history: rent_history.rows,
                total_payable_amt: car.rent_per_hr * required_hours,
            };
        });
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rentCar = async (req, res) => {
    const { car_id, origin, destination, hours_requirement } = req.body;
    try {
        const carResult = await pool.query('SELECT * FROM cars WHERE id = $1', [car_id]);
        if (carResult.rows.length === 0) {
            return res.status(400).json({
                status: 'No car is available at the moment',
                status_code: 400,
            });
        }
        const car = carResult.rows[0];
        const total_payable_amt = car.rent_per_hr * hours_requirement;
        await pool.query(
            'INSERT INTO rent_history (car_id, origin, destination, hours_requirement, amount) VALUES ($1, $2, $3, $4, $5)',
            [car_id, origin, destination, hours_requirement, total_payable_amt]
        );
        res.status(200).json({
            status: 'Car rented successfully',
            status_code: 200,
            rent_id: car_id,
            total_payable_amt,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRentHistory = async (req, res) => {
    const { car_id, ride_details } = req.body;
    try {
        const result=await pool.query('SELECT * FROM cars WHERE id = $1', [car_id]);
        if(result.rows.length===0){
            return res.status(400).json({
                status: 'Requested Car not found in the database',
                status_code: 400,
            });
        }
        const rentHistoryResult = await pool.query('SELECT * FROM rent_history WHERE car_id = $1', [car_id]);
        if (rentHistoryResult.rows.length === 0) {
            return res.status(400).json({
                status: 'No rent history found for the requested car',
                status_code: 400,
            });
        }
        await pool.query(
            'UPDATE rent_history SET origin = $1, destination = $2, hours_requirement = $3 WHERE car_id = $4',
            [ride_details.origin, ride_details.destination, ride_details.hours_requirement, car_id]
        );
        res.status(200).json({
            status: "Car's rent history updated successfully",
            status_code: 200,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
