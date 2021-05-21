const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const token = req.session.token
    if (!token) return res.redirect('login')
    
    try {
        const decoded = jwt.verify(token, 'randomString')
        req.session.user = decoded.user
        next()
    } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'Invalid token' })
    }
}