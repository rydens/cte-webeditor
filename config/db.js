const mongoose = require('mongoose')

const MONGOURI = 'mongodb://cte:webeditor@192.168.1.102:27017/cte-webeditor?authSource=admin&w=1'

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connected to DB!')
    } catch (err) {
        console.log(err)
        throw err
    }
}

module.exports = InitiateMongoServer