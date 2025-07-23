const express = require('express')
const router = express.Router()
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
// require('dotenv').config();



router.post('/signup', async (req, res) => {
    try {
        const data = req.body; // Assuming the requst body contains the User Data
        // Chake if is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (User.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user alrady exists' })
        }

        // validate Adhar Card Number must have exactiy 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Adhar Card number must be exactly 12 digits' })

        }
        // Chake if a user with the same Adhar Card Number alrady exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Adhar Card Number alrady exists' })

        }
        //Create a new User document using the Mongoose model
        const newUser = new User(data);
        // Save the new User to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload)
        // console.log("token is :", token);
        res.status(200).json({ response: response, token: token })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})


// Login Route

router.post('/login', async (req, res) => {
    try {
        // Extract aadharCardNumber and password from requst body
        const { aadharCardNumber, password } = req.body;

        // check if aadharCardNumber or password is missing
        if(!aadharCardNumber || !password){
            return res.status(400).json({error: 'Aadhar Card Number and password are required'})
        }
        // Find the uservby aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // If user does not exist or password das not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        // generate Token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({ token })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

// profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        // console.log("User Data:",userData);
        const userId = userData.id;
        const user = await User.findById(userId)
        res.status(200).json({ user })
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Internal Server Error' })
    }
})


// GET person

router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const data = await User.find();
        console.log("data Fetched");
        res.status(200).json(data)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})




router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user; // Extract the id from the token 
        const { currentPassword, newPassword } = req.body // Extract Current and new password from request body

            // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }
        // Find the user by user id
        const user = await User.findById({ userId })

        // If  password das not match, return error
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Update the user's password
        user.password = newPassword
        await user.save()

        console.log('password Updated');
        res.status(202).json({ message: "Password Updated" })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })
    }
})



module.exports = router