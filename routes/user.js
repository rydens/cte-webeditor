const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const router = express.Router()
const User = require('../model/User')
const auth = require('../middleware/auth')

 
router.post(
    '/signup',
    [
        check('username', 'Please enter a valid Username')
            .not()
            .isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a valid password').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        //console.log(req.body)
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
           
            //return res.render('signup', {
            //    errors: errors.errors.map(a => a.msg)
            //})
        }
        const {
            username,
            email,
            password
        } = req.body
        
        try {
            let user = await User.findOne({
                email
            })
            if (user) {
                return res.status(400).json({
                    errors: [
                        { value: "", msg: "user already created!",
                            param: "email",
                            location: "body"
                        }
                    ]
                })
            }
            
            req.session.regenerate(() => {
                console.log(req.session)
            })
            
            user = new User({
                username,
                email,
                password
            })
            
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            
            await user.save()
            
            const payload = {
                user: {
                    id: user.id
                }
            }
            
            jwt.sign(
                payload,
                "randomString", {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err
                    
                    req.session.token = token
                    return res.redirect('/dashboard')
                }
            )
        } catch (err) {
            console.log(err.message)
            res.status(500).send('Error in Saving')
        }
    }
)

router.post(
    '/login',
    [
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a valid password').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        
        const { email, password } = req.body
        try {
            let user = await User.findOne({
                email
            })
            if (!user) {
                return res.status(400).json({
                    errors: [
                        {
                            value: "",
                            msg: "user doesn't exist!",
                            param: "email",
                            location: "body"
                        }
                    ]
                })
            }
            
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    errors: [
                        {
                            value: "",
                            msg: "incorrect password!",
                            param: "password",
                            location: "body"
                        }
                    ]
                })
            }
            
            const payload = {
                user: {
                    id: user.id
                }
            }
            
            jwt.sign(
                payload,
                "randomString",
                {
                    expiresIn: 3600
                },
                (err, token) => {
                    if (err) throw err
                    /*res.status(200).json({
                        token
                    })*/
                    req.session.token = token
                    return res.redirect('/dashboard')
                }
            )
        } catch (err) {
            console.error(err)
            res.status(500).json({
                message: "Server error"
            })
        }
    }
)

router.get('/me', auth, async (req, res) => {
    try {
        let user = await User.findById(req.session.user.id, '_id createdAt username email')
        res.send(user)
    } catch (err) {
        res.send({ message: "Error in fetching user" })
        console.log(err)
    }
})

module.exports = router
