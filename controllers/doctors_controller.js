const Doctor = require('../models/doctor_model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.hello = function(){
    return 'hello world';
}

//Register a doctor
module.exports.register = async function (req, res) {

    try {

        //check if email already exists
        const emailExists = await Doctor.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).send({
                status: 'Failure',
                message: 'Email already exists'
            })
        }

        //check if username exists
        const usernameExists = await Doctor.findOne({ username: req.body.username });
        if (usernameExists) {
            return res.status(400).send({
                status: 'Failure',
                message: 'Username already exists'
            })
        }

        //if email and username are unique, register new user (doctor)

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //create new user
        const user = await Doctor.create({
            email: req.body.email,
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword
        });

        //return the info of the newly created user as json

        return res.status(201).send({
            status: 'Success',
            message: 'User registered',
            data: {
                email: user.email,
                name: user.name,
                username: user.username
            }
        });

    } catch (err) {
        console.log("error in registering ",err);
        res.status(400).send({ message: 'error in registering', err });
    }


};

//Login a registered doctor using passport jwt authentication
module.exports.login = async function (req, res) {

    try {

        //check if user exists (using username)
        const user = await Doctor.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).json({
                status: 'Failure',
                message: 'Incorrect username or password'
            })
        };

        //check if password is correct
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                status: 'Failure',
                message: 'Incorrect username or password'
            })
        };

        //create and assign a token, and return the JWT as json
        const token = jwt.sign(user.toJSON(), process.env.TOKEN_SECRET);
        res.status(200).json({
            status: 'Success',
            JWT_token: token
        });
       
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', err });
    }

}
