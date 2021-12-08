//importing express
const express = require('express');
const app = express();

//importing compression for gzip compression
const compression = require('compression');

//using compression
app.use(compression());


//importing dotenv
const dotenv = require('dotenv');
//using dotenv to load environment variables
dotenv.config();

//port number
const port = process.env.PORT

//importing cors
const cors = require('cors');
//using cors in express to allow cross origin resource sharing
app.use(cors());



// express using url-encoded
app.use(express.urlencoded({ extended: true }))

// express using json
app.use(express.json())

// importing path for serving static files
const path = require('path');


//public folder
app.use(express.static(path.join(__dirname, './public')));

//sanitizing middleware for sanitizing inputs
const mongoSanitize = require('express-mongo-sanitize');

//using mongoSanitize in express
app.use(mongoSanitize());


//error handling middleware for handling errors which throws error
app.use((error, req, res, next) => {
    res.json({
        message: error.message
    });
});


//importing express routers
const apiRouter = require("./routes/api");


//sending different endpoints to different routers
app.use('/api', apiRouter);


app.get("/", async (req, res) => {
    res.status(200).sendFile(path.join(__dirname, './public/view/index.html'));
})

app.get("*", async (req, res) => {
    res.status(404).send("<h1>404 Page Not Found</h1>");
})



//listening to port
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})