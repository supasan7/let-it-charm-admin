const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (username) => {
    return jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

class AuthController {
    // @desc    Auth user & get token
    // @route   POST /api/auth/login
    // @access  Public
    async login(req, res) {
        const { username, password } = req.body;

        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (username === adminUser && password === adminPass) {
            res.json({
                success: true,
                data: {
                    username: adminUser,
                    token: generateToken(adminUser),
                },
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
        }
    }
}

module.exports = new AuthController();
