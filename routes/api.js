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
    //regex for checking if the date is number or not
    let myRegex = new RegExp(/^[0-9]*$/);

    try {
        // destructure the req.body
        const { year, month, day } = req.body;

        //check if the year, month and day are not empty
        if (year === "" || month === "" || day === "") {
            res.status(400).json({ message: "Please enter a valid date" });
            return;
        }

        //check if the year, month and day are numbers
        else if (!myRegex.test(year) || !myRegex.test(month) || !myRegex.test(day)) {
            res.status(400).json({ message: "Please enter a valid date" });
            return;
        }
        //check for data in the database

        const data = await apod.findOne({ date: `${year}-${month}-${day}` });

        //if data is not found in the database

        if (!data) {
            // console.log("No data found");


            //if data is not found then get data from nasa api

            const url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&date=${year}-${month}-${day}`;

            //using axios to make http request
            const response = await axios.get(url);

            //if response stattus in not 200 then response with not found
            if (response.status !== 200) {
                res.status(400).json({ message: "No data found" });
                return;
            }

            //if response is not empty then proceed


            const apodData = response.data;
            // console.log(apodData);
            // sending data retrived from nasa api to client as json
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
                            // console.log('Successfully downloaded file!');
                            const newApod = new apod({
                                date: apodData.date,
                                explanation: apodData.explanation,
                                hdurl: apodData.hdurl,
                                media_type: apodData.media_type,
                                service_version: apodData.service_version,
                                title: apodData.title,
                                url: `/uploads/${fileName}`,
                                copyright: apodData.copyright
                            })

                            //save data to database by save() method

                            newApod.save().then(() => {
                                // console.log("saved to database");
                            }).catch((err) => {
                                //  console.log(err) 
                            })

                            return;


                        });
                    } catch (err) {
                        // console.log(err);
                    }
                };

                //call the function to download the image and save it in /uploads folder
                downloadFile(apodData.url, '../public/uploads');


            }

            //if media type is video then save the video url in the database
            else if (apodData.media_type === "video") {
                const newApod = new apod({
                    date: apodData.date,
                    explanation: apodData.explanation,
                    hdurl: apodData.hdurl,
                    media_type: apodData.media_type,
                    service_version: apodData.service_version,
                    title: apodData.title,
                    url: apodData.url,
                    copyright: apodData.copyright
                })

                //save data to database by save() method

                newApod.save().then(() => {
                    // console.log("saved to database");
                }).catch((err) => {
                    // console.log(err)
                })


            }
            return;
        }


        //if data is found in database then send data to client
        res.status(200).json({ "message": data });


    } catch (error) {
        // console.log(error);

        res.status(404).json({ "message": "Data does not exits for current date .Try another date." });
    }

})

//exporting router to be used in index.js
module.exports = router;