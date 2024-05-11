const jwt = require("jsonwebtoken");
const User = require('../models/user')
const RoleModel = require('../models/roleModel')


const authMiddleware = async(req,res,next)=>{
    try {
        const {token} = req.cookies;
        if(!token){
            return res.json(null)
        }
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
            if(err) throw err;
            const data = await User.findOne({_id: user.id}).exec()
            if(!data) return res.json({error: "No user found"})
            
            const roles = await RoleModel.findOne({_id: data.roles[0]}).exec()

            user = {...user,
                avatar: data.avatar,
                username: data.username,
                id: data._id,
                seller: data.seller,
                roles: roles,
                fullName: data.fullName,
                city: data.city,
                phone: data.phone
            }

            req.body = user
            next()
        })

    } catch (error) {
        console.error(error)
    }
}

const verifySellingProfile = async (req, res, next) => {
    const user = req.body
    try {
        if(!user){
            res.json({error: "You are not logged in"});
        }

        if(!user.username || !user.fullName || !user.city || !user.phone){
            return res.json({uncomplete: "Please complete your profile"})
        }
        
        req.body = user
        next()
        
    } catch (error) {
        console.log(error)
        res.error({error: 'Error becoming a seller'})
    }
}

const verifyToken = (req, res, next) => {
        try {
            const {token} = req.cookies
            if(!token){
                res.json(null)
            }
            jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
                if(err) throw err
                next();
            })
        } catch (error) {
            console.error(error)
            res.status(201).json({error: "Error while posting."})
        }
}

module.exports = {
    authMiddleware,
    verifySellingProfile,
    verifyToken
}