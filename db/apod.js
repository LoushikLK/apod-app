//importing mongoose and using as mongoose
const mongoose = require('mongoose');


//connecting to mongodb
mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    // console.log("connected to mongodb 😀");
}).catch((err) => {
    // console.log(err);
});


//creating schema for the database
const apodSchema = mongoose.Schema({
    copyright: String,
    date: {
        type: String,
        required: true
    },
    explanation: String,
    hdurl: String,
    media_type: {
        type: String,
        required: true
    },
    service_version: String,
    title: String,
    url: {
        type: String,
        required: true
    }
})


//creating model for the database
const apod = mongoose.model('APOD', apodSchema);


//exporting the model
module.exports = apod;