const express = require('express')
const User = require('../models/user')
const RoleModel = require('../models/roleModel')
const jwt = require('jsonwebtoken')

const requestForSeller = async (req, res) => {

    const data = req.body
    try {
            const role = await RoleModel.findOne({_id: data.roles._id}).exec()
            await RoleModel.updateMany({_id: role._id}, { $set: { name: 'seller', permissions: ['read', 'create', 'update', 'delete'] } })

            await User.findOneAndUpdate({_id: data.id}, { $set: { seller: true } })

            res.json({success: "You are now a seller!"})
            
    } catch (error) {
        console.log(error)
        res.error({error: 'Error becoming a seller'})
    }
}

const profileImageUpload = async(req, res) => {
    const {token} = req.cookies
    const {avatar} = req.body

    try {
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
            if(err) throw err;

            const updatedUser = await User.findOneAndUpdate({_id: user.id}, { $set: {
                avatar: avatar
            }}).exec()
            if(updatedUser){
                return res.status(200).json({success: "Image uploaded successfully"})
            }
        })
    } catch (error) {
        console.log(error);
        res.status(401).json({error: "Failed to upload Image"})
    }
}

const completeProfile = async (req, res) => {
    const { username, email, fullName, phone, city, requestSellerSession} = req.body
    
    try {
        const user = await User.findOne({email: email}).exec()

        if(!user){
            return res.json({error: "No user found with this email, Try logging in again"})
        }
        const findUsername = await User.findOne({username: username}).exec()

        if(findUsername && findUsername._id.toString() !== user._id.toString()){
            console.log(findUsername._id)
            console.log(user._id)
            return res.json({error: "Username already exists"})
        }

        const updatedUser = await User.findOneAndUpdate({email: email}, { $set: {
            email: email,
            username: username,
            fullName: fullName,
            phone: phone,
            city: city,
        }}).exec()

        console.log(updatedUser.username);


        if(requestSellerSession){
            console.log(requestSellerSession)
            await RoleModel.findOneAndUpdate(
                { _id: updatedUser.roles[0] },
                {
                    $set: {
                        roles: { name: 'seller',  permissions: ['read', 'create', 'update', 'delete'] }
                    }
                }
            )
            await User.findOneAndUpdate({email: email}, { $set: { seller: true } })
            res.status(201).json({success: "Profile updated, You are now a seller!"})
        } else {
            res.status(201).json({success: "Profile updated Sucessfully!"})
        }
        
    } catch (error) {
        console.error(error)
        res.status(401).json({error: "Error while updating your profile"})
    }
}

const toggleSelling = async (req, res) => {
    let user  = req.body
    
    try {
        const roleId = user.roles._id
        const role = await RoleModel.findOne({ _id: roleId }).exec()

        if(role.name === 'buyer'){
            const newRole = await RoleModel.findOneAndUpdate({_id: role._id}, { $set: { name: 'seller',  permissions: ['read', 'create', 'update', 'delete'] } })
            user = {...user, roles: newRole}
            res.status(201).json({success: "Switched to selling", ...user})
        }
        if(role.name === 'seller'){
            const newRole = await RoleModel.findOneAndUpdate({_id: role._id}, { $set: { name: 'buyer',  permissions: ['read'] } })
            user = {...user, roles: newRole}
            res.status(201).json({success: "Switched to buying", ...user})
        }
    } catch (error) {
        console.error(error)
        res.status(401).json({error: "Error while switching mode"})
    }
}

module.exports = {
    requestForSeller,
    profileImageUpload,
    completeProfile,
    toggleSelling,
}