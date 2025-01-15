//References to elements
const header = document.getElementsByTagName("header");
const messageDisplay = document.getElementById("message");
const unitOptions = document.querySelectorAll(".unit-options");
const menu = document.getElementById("menu");
const mainDropdown = document.getElementById("main-dropdown");
const unitDropdown = document.getElementById("unit-dropdown");
const changeUnitOption = document.getElementById("change-unit-option");
const cityInputBox = document.getElementById("city-input-box");
const suggestionList = document.getElementById("suggestions-list");
const locationIcon = document.getElementById("location-icon");
const weatherInfo = document.getElementById("weather-info")
const liveWeatherBtn=document.getElementById("live-weather");


const APIkey = "c8d47b3c69227c3bba7dd17a791dc037";
let tempUnits = "Celcius";
let unitsMode = "metric";
let tempUnitSymbol = "\u00B0C";
let windUnitSymbol = "m/s";

//Live weather button functionality
liveWeatherBtn.addEventListener("click",event=>{
    if(liveWeatherBtn.textContent==="Start live weather"){
        let liveId=setInterval(() => {
            setGeoCoords();
            getCurrentWeather();
        },1000);
        liveWeatherBtn.textContent="Stop live weather";
        liveWeatherBtn.classList="stop";
      
    }
    else{
        clearInterval(liveId);
        liveWeatherBtn.textContent="Start live weather";
        liveWeatherBtn.classList="start";    
    }
})

//Updates units according to user selection
function updateUnit() {
    switch (tempUnits) {
        case "Kelvin":
            unitsMode = "standard";
            tempUnitSymbol = "K";
            windUnitSymbol = "m/s";
            break;
        case "Celcius":
            unitsMode = "metric";
            tempUnitSymbol = "\u00B0C";
            windUnitSymbol = "m/s";
            break;
        case "Fahrenheit":
            unitsMode = "imperial";
            tempUnitSymbol = "\u00B0F";
            windUnitSymbol = "mph";
            break;
    }
}

//dropdown toogle
menu.addEventListener("click", event => {
    if (mainDropdown.style.display === "none") {
        mainDropdown.style.display = "block";
    }
    else {
        mainDropdown.style.display = "none";
    }
})
//change unit dropdown toogle
changeUnitOption.addEventListener("click", event => {
    if (unitDropdown.style.display === "none") {
        unitDropdown.style.display = "block";
    }
    else {
        unitDropdown.style.display = "none";
    }
})
//unit dropdown disappear after clicking a unit
unitOptions.forEach(unitElement => {
    unitElement.addEventListener("click", event => {
        mainDropdown.style.display = "none";
        unitDropdown.style.display = "none";
        tempUnits = event.target.textContent;
        messageDisplay.textContent = `Unit has been successfully changed to ${tempUnits}`;
        updateUnit();
        messageDisplay.classList = "success";
        messageFadeOut();
    })
})

//Suggestions on typing
cityInputBox.addEventListener("input", async () => {
    weatherInfo.style.visibility = "hidden";
    try {
        let enteredAddress = cityInputBox.value;
        if (enteredAddress.length === 0) {
            suggestionList.style.display = "none";
            cityInputBox.style.borderRadius = "10px";
            return;
        }
        suggestionList.style.display = "block";
        cityInputBox.style.borderRadius = "10px 10px 0px 0px";

        let fetchedCities = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${enteredAddress}&limit=5&appid=${APIkey}&units=${unitsMode}`);
        if (fetchedCities.ok) {
            fetchedCities = await fetchedCities.json();
            suggestionList.innerHTML = "";
            Array.from(fetchedCities).forEach(city => {
                if (city.name.toLowerCase().startsWith(enteredAddress.toLowerCase())) {
                    const cityItem = document.createElement("li");
                    cityItem.textContent = `${city.name} ${city.state ? "," + city.state : ""} ${city.country ? "," + city.country : ""}`;
                    suggestionList.appendChild(cityItem);
                    cityItem.addEventListener("click", event => {
                        enteredAddress = cityItem.textContent;
                        cityInputBox.value = enteredAddress;
                        suggestionList.style.display = "none";
                        cityInputBox.style.borderRadius = "10px";

                    })
                }
            });
        }
        else {
            throw new Error("City not found");
        }
    }
    catch (error) {
        messageDisplay.textContent = error.message;
        messageDisplay.classList = "error";
        messageFadeOut();
    }
})
//Get user's location by clicking on location icon
locationIcon.addEventListener("click", event => {
   setGeoCoords();
})


function setGeoCoords(){
    if (!navigator.geolocation) {
        messageDisplay.textContent = "Geolocation is not supported by this browser. Please type manually";
        messageDisplay.classList = "error";
        messageFadeOut();
    }
    else {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    }
}
function successCallback(result) {
    let { latitude, longitude } = result.coords;
    cityInputBox.value = `${latitude},${longitude}`;

}
function errorCallback(error) {
    let errorMsg;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMsg = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            errorMsg = "The request to get user location timed out.";
            break;
        default:
            errorMsg = "An unknown error occurred.";
            break;
    }
    messageDisplay.textContent = errorMsg;
    messageDisplay.classList = "error";
    messageFadeOut();
}
function getCurrentWeather() {

    let city = cityInputBox.value;
    if (city) {
        fetchCurrentWeather(city);
    }
    else {
        messageDisplay.textContent = "Field empty! Enter a city";
        messageDisplay.classList = "error";
        messageFadeOut();
    }
}
async function fetchCurrentWeather(city) {
    try {
        let para;
        if (isNaN(city.charAt(0))) {
            const parts = city.split(',').map(part => part.trim());
            const cityName = parts[0];
            const state = parts[1];
            const country = parts[parts.length - 1];
            para = `q=${cityName}${state ? ',' + state : ''},${country}`;
        }
        else {
            let [latitude, longitude] = city.split(',').map(coord => parseFloat(coord.trim()));
            para = `lat=${latitude}&lon=${longitude}`;
        }

        let fetchedWeather = await fetch(`https://api.openweathermap.org/data/2.5/weather?${para}&appid=${APIkey}&units=${unitsMode}`);
        if (!fetchedWeather.ok) {
            throw new Error(`Error fetching weather data`);
        }
        fetchedWeather = await fetchedWeather.json();

        displayWeather(fetchedWeather);
    }
    catch (error) {
        messageDisplay.textContent = error.message;
        messageDisplay.classList = "error";
        messageFadeOut();
    }
}

function displayWeather(weather) {
    let { name, visibility } = weather;
    let { temp, feels_like, humidity, pressure } = weather.main;
    let { speed: wind } = weather.wind;
    let { main, icon } = weather.weather[0];
    document.getElementById("city-box").textContent = name;
    document.getElementById("temp").textContent = `${temp.toFixed(1)} ${tempUnitSymbol}`;
    document.getElementById("feels-like").textContent = `Feels like ${feels_like.toFixed(1)} ${tempUnitSymbol}`;
    document.getElementById("main-desc").textContent = main;
    document.getElementById("humidity-value-box").textContent = `${humidity} % `;
    document.getElementById("pressure-value-box").textContent = `${pressure} hPa`;
    document.getElementById("visibility-value-box").textContent = `${visibility} m`;
    document.getElementById("wind-value-box").textContent = `${wind.toFixed(1)} ${windUnitSymbol}`;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherInfo.style.visibility = "visible";
}
function messageFadeOut() {
    setTimeout(() => { messageDisplay.textContent = "" }, 3000);
}