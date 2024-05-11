const express = require('express')
const User = require('../models/user')
const RoleModel = require('../models/roleModel')
const jwt = require('jsonwebtoken')
const { hashPassword, comparePasswords } = require('../helpers/auth')
const otpGenerator = require('otp-generator')
const { sendMail } = require('./mailer')
const Otp = require('../models/otp')

const test = (req, res) => {
    res.json('test is working')
}

const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        //check if name was entered
        if(!username){
            return res.json({
                error: 'Name is required'
            })
        }
        //check if Password was entered and is 6 characters long
        if(!password || password.length < 6){
            return res.json({
                error: 'Password is required and should be atleast 6 characters'
            })
        }

        //check if email was entered
        if(!email){
            return res.json({
                error: 'Email is required'
            })
        }

        //check for the existing email
        const exist = await User.findOne({email})
        if(exist){
            return res.json({
                error: 'Email already exists'
            })
        }

        //hashing password
        const hashedPassword = await hashPassword(password)

        const buyerRole = new RoleModel({
            name: 'buyer',
            permissions: ['read'],
        });
        const savedBuyerRole = await buyerRole.save()
        const buyerRoleId = savedBuyerRole._id

        const user = await User.create({
            username, 
            email, 
            password: hashedPassword,
            roles: [buyerRoleId],
            seller: false,
            fullName: null,
            phone: null,
            city: null,
        })
        sendMail({username: username, userEmail: email})
        //Register | Storing the new user info in the database
        return res.json(user)

    } catch (error) {
        console.log(error)
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email){
            return res.json({
                error: 'Email required to login'
            })
        }

        if(!password){
            return res.json({
                error: 'Password required to login'
            })
        }

        //check if email exists
        const user = await User.findOne({email})
        if(!user){
            return res.json({
                error: 'User does not exist with this email!'
            })
        }

        //Sending cookie using jwt and Check for password match
        const match = await comparePasswords(password, user.password)
        if(match){
            jwt.sign({
                email: user.email,
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                roles: [user.roles[0]],
                seller: user.seller,
            }, process.env.JWT_SECRET, {}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json(user)
            })
        }
        if(!match) {
            return res.json({
                error: 'Password do not match'
            })
        }

    } catch (error) {
        console.log(error)
    }
}

const getProfile = async (req, res) => {
    const user = req.body
    try {
        if(user){
            res.json(user)
        } else {
            res.json(null)
        }
    } catch (error) {
        console.error("Error getting profile", error)
    }
}

const logoutUser = (req, res) => {
    res.clearCookie('token')
    return res.json({message: 'Logged out successfully'})
}

const generateOtp = async (req, res) => {
    const {email} = req.query;
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.json({
                error: 'No user exist with this email'
            })
        }
        const code = otpGenerator.generate(6, {lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});

        const otp = await Otp.findOne({email})
        if(!otp){
            const user = await Otp.create({email: email, otp: code})
            console.log("Otp generated")
        } else {
            const user = await Otp.updateOne({email: email}, {otp: code})
            console.log("Otp generated")
        }
        sendMail({username: user.username, userEmail: email, text: `Your otp is: ${code}`, subject: "Forgot Password"})
        console.log(`Email sent to ${email}`)
        res.status(201).json({message: "A 6 digit OTP has been sent to your mail"})

    } catch (error) {
        res.status(401).json({error: "OTP generation failed"})
    }

}
const verifyOtp = async (req, res) => {
    const {email, otp} = req.query

    try {
        const otpDoc = await Otp.findOne({email}).exec()

        if(otpDoc && otpDoc.otp == otp){
            await Otp.deleteOne({email: email})
            return res.status(201).json({message: "Otp matched"})
        } else {
            return res.status(201).json({error: "OTP does not match"})
        }
    } catch (error) {
        return res.json({error: "Error while verifying otp"})
    }
}

const resetPassword = async (req, res) => {
    try {
        const {email, password} = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Hash the new password
      const hashedPassword = await hashPassword(password);
  
      // Update the user's password
      await User.updateOne({ email: user.email }, { password: hashedPassword });
  
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error while resetting the password", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

const testEmail = (req, res) => {
    sendMail({username: 'user123', userEmail: 'saadankhalidaid@gmail.com'})
    res.send({success: true})
}

const googleAuth = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})

        if(user){

            // const buyerRole = new RoleModel({
            //     name: 'buyer',
            //     permissions: ['read'],
            // });
            // const savedBuyerRole = await buyerRole.save()
            // const buyerRoleId = savedBuyerRole._id

            const token = jwt.sign({
                email: user.email,
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                roles: user.roles,
                seller: user.seller,
            }, process.env.JWT_SECRET);

            const {password: password, ...rest} = user._doc
            res.cookie('token', token, {httpOnly: true}).status(200).json(rest)
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8)
            const hashedPassword = await hashPassword(generatedPassword)
            
            const buyerRole = new RoleModel({
                name: 'buyer',
                permissions: ['read'],
            });
            const savedBuyerRole = await buyerRole.save()
            const buyerRoleId = savedBuyerRole._id
            
            const newUser = new User({
                username: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                avatar: req.body.photo,
                roles: [buyerRoleId],
                seller: false,
                fullName: null,
                phone: null,
                city: null,
            })
            await newUser.save()
            const token = jwt.sign({
                email: newUser.email,
                id: newUser._id,
                username: newUser.username,
                avatar: newUser.avatar,
                roles: [buyerRoleId],
                seller: newUser.seller,
            }, process.env.JWT_SECRET)

            const { password: password, ...rest} = newUser._doc
            res.cookie('token', token).status(200).json(rest)
        }
    } catch (error) {
        res.json({error: "Login failed with google"})
    }
}

module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile,
    logoutUser,
    generateOtp,
    verifyOtp,
    resetPassword,
    testEmail,
    googleAuth
}