//importing express and using as app
const express = require('express');
const app = express();
//using express router for routing different endpoints
const router = express.Router();

//impost fs for file system
const fs = require('fs');

//import path 
const path = require('path');



//importing axios for making http requests
const axios = require('axios');



//importing moogoose models for database
const apod = require('../db/apod');

//using router to route different endpoints

router.post("/apod", async (req, res) => {
    // console.log(req.body);


    // destructure the req.body
    const { year, month, day } = req.body;

    //check if the year, month and day are not empty
    if (year === "" || month === "" || day === "") {
        res.status(400).json({ message: "Please enter a valid date" });
        return;
    }
    try {
        //check for data in the database

        const data = await apod.findOne({ date: `${year}-${month}-${day}` });

        //if data is not found in the database

        if (!data) {
            // console.log("No data found");


            //if data is not found then get data from nasa api

            const url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&date=${year}-${month}-${day}`;
            const response = await axios.get(url);

            //if response is not empty then proceed
            if (response.status === 200) {

                const apodData = response.data;
                // console.log(apodData);
                res.status(200).json({ "message": apodData });


                // console.log(apodData);

                //download the image from the url and save it in /uploads folder

                if (apodData.media_type === "image") {

                    const downloadFile = async (fileUrl, upload) => {
                        // Get the file name
                        const fileName = path.basename(fileUrl);

                        // The path of the downloaded file on our machine
                        const localFilePath = path.resolve(__dirname, upload, fileName);
                        try {
                            const response = await axios({
                                method: 'GET',
                                url: fileUrl,
                                responseType: 'stream',
                            });

                            const savetofolder = response.data.pipe(fs.createWriteStream(localFilePath));
                            savetofolder.on('finish', () => {
                                //after downloading log 
                                console.log('Successfully downloaded file!');
                            });
                        } catch (err) {
                            // console.log(err);
                        }
                    };

                    //call the function to download the image and save it in /uploads folder
                    downloadFile(apodData.url, '../uploads');


                }

                //save data to database for later use using mongoose model
                const newApod = new apod({
                    date: apodData.date,
                    explanation: apodData.explanation,
                    hdurl: apodData.hdurl,
                    media_type: apodData.media_type,
                    service_version: apodData.service_version,
                    title: apodData.title,
                    url: apodData.url,
                    copyright: apodData.copyright
                });

                //save data to database by save() method
                let saveApod = await newApod.save();
                // if (saveApod) {
                //     console.log("Data saved to database");
                // }
                return;
            }
        }


        //if data is found in database then send data to client
        res.status(200).json({ "message": data });


    } catch (error) {
        // console.log(error);

        res.status(404).json({ "message": "Data does not exits for the day .Try another." });
    }

})

//exporting router to be used in index.js
module.exports = router;