const mongoose = require('mongoose')
const dotenv = require('dotenv');
const cors = require("cors");
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT REJECTION!!! SHUTTING DOWN.....')
    process.exit(1);
})

dotenv.config({ path: './config.env' })
const app = require('./app')

// cors
app.use(cors());

mongoose.connect(process.env.DATABASE_LOCAL).then(() => {
    console.log('DB connection successful')
})

const PORT = process.env.PORT || 3000
const server= app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`)
})

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION!!! SHUTTING DOWN.....')
    server.close(() => {
        process.exit(1);
    })
});