const express = require('express')
const dotenv = require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const {mongoose} = require('mongoose')


//database connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Database connected'))
.catch((err) => console.log('Database connection failed', err))

const app = express();

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

app.use('/', require('./Routes/authRoutes'))
app.use('/', require('./Routes/sellerRoutes'))
app.use('/', require('./Routes/listingsRoute'))

const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`))
