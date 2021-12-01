// console.log("connected");


//select all the elements
const mediaBox = document.querySelector('#image-box');
const title = document.querySelector('#title');
const dateBox = document.querySelector('#date');
const explanation = document.querySelector('#explanation');
const credit = document.querySelector('#credit');

const year = document.querySelector('#year');
const month = document.querySelector('#month');
const day = document.querySelector('#day');

//setting up the date picker or you  can just use the date picker in the html
const months = [
    { month: "january", value: "01" },
    { month: "february", value: "02" },
    { month: "march", value: "03" },
    { month: "april", value: "04" },
    { month: "may", value: "05" },
    { month: "june", value: "06" },
    { month: "july", value: "07" },
    { month: "august", value: "08" },
    { month: "september", value: "09" },
    { month: "october", value: "10" },
    { month: "november", value: "11" },
    { month: "december", value: "12" }


]
const days = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31"
]

const years = [
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
]


//maping all dates values to date picker
year.innerHTML = years.map(year => `<option value="${year}">${year}</option>`).join('');
month.innerHTML = months.map(month => `<option value="${month.value}">${month.month}</option>`).join('');
day.innerHTML = days.map(day => `<option value="${day}">${day}</option>`).join('');

const date = {
    year: "",
    month: "",
    day: ""
}


//listening event on dom
year.addEventListener('change', (e) => {

    date.year = e.target.value;
    // console.log(date);
})
month.addEventListener('change', (e) => {
    date.month = e.target.value;
    // console.log(date);
})
day.addEventListener('change', (e) => {
    date.day = e.target.value;
    // console.log(date);
})


//on window load
window.addEventListener('load', () => {

    //setting date for todays astro pic

    date.year = `${new Date().getFullYear()}`;
    year.value = date.year;
    let thismonth = `${new Date().getMonth() + 1}`;
    date.month = thismonth.toString().padStart(2, "0");
    month.value = date.month;
    date.day = `${new Date().getDate().toString().padStart(2, "0")}`;
    day.value = date.day;

    return getAPOD();

})


//on calling the function call the api from node js backend
const getAPOD = async () => {
    if (date.year === "" || date.month === "" || date.day === "") {
        alert("Please select a date");
        return;
    }
    try {

        const url = "/api/apod";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

            },
            body: JSON.stringify(
                {
                    year: date.year,
                    month: date.month,
                    day: date.day
                }
            )
        })
        const data = await response.json();
        // console.log(data);

        //displaying the data on the dom
        if (response.status !== 200) {
            // console.log(response.status);
            alert(data.message)
        }
        else {
            dateBox.innerText = data.message.date;
            title.innerText = data.message.title;
            explanation.innerText = data.message.explanation;
            data.message.copyright ? credit.innerHTML = ` Credit-${data.message.copyright}` : credit.innerText = "";
            if (data.message.media_type === "video") {
                mediaBox.innerHTML = `<iframe width="70%" height="500"
            
            src=${data.message.url}
           
            >

            </iframe>`
            }

            else {

                mediaBox.innerHTML = `<img src="${data.message.url}" alt="${data.message.title}" class="img-fluid" > `;
            }
        }
    } catch (error) {
        // console.log(error);
        alert(error);
    }

}



