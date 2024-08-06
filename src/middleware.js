const jwt = require('jsonwebtoken');
const pool = require('./config');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = req.headers.authorization
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

exports.authenticateAdmin = async (req, res, next) => {
    const token = req.headers.authorization;
    const adminApiKey = req.headers['x-admin-api-key'];

    if (!token) return res.sendStatus(401);
    if (!adminApiKey || adminApiKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({
            status: 'Forbidden',
            status_code: 403,
            message: 'Invalid or missing admin API key',
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403);

        // Optionally check if user exists in the database
        const result = await pool.query('SELECT id FROM users WHERE id = $1', [user.userId]);
        if (result.rows.length === 0) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
};
