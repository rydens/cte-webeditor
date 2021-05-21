const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const user = require('./routes/user')
const auth = require('./middleware/auth')
const InitiateMongoServer = require('./config/db')

InitiateMongoServer()

const app = express()
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
//app.use(bodyParser.json())

app.use(session({
    resave: false,               // don't save session if unmodified
    saveUninitialized: false,    // don't save session until something stored
    secret: "haha look a secret phrase"
}))
app.use((req, res, next) => {
    let err = req.session.error
    let msg = req.session.success
    delete req.session.error
    delete req.session.success
    res.locals.message = ''
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>'
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>'
    next()
})


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard')
    }
    res.render('login')
})

app.get('/signup', (req, res) => {
    /*req.session.regenerate(() => {
        console.log(req.session)
    })*/
    res.render('signup')
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

app.get('/dashboard', auth, (req, res) => {
    res.render('dashboard', {user:req.session.user})
    //console.log(req.session.user)
})


app.use('/user', user)

app.listen(3000, (req, res) => {
    console.log('Server started at port 3000')
})
