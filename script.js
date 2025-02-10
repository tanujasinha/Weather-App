
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
const liveWeatherBtn = document.getElementById("live-weather");


const APIkey = "c8d47b3c69227c3bba7dd17a791dc037";
let tempUnits = "Celcius";
let unitsMode = "metric";
let tempUnitSymbol = "\u00B0C";
let windUnitSymbol = "m/s";

let para;

// At the top with other variables
let liveWeatherInterval = null;  // To track the interval


// Updated live weather button functionality
liveWeatherBtn.addEventListener("click", event => {
    if (liveWeatherBtn.textContent === "Start live weather") {
       
       
        // Show clock during live weather sessions
        document.getElementById("real-time-clock").style.display = "block";
        updateClock();
        setInterval(updateClock, 1000);
        // Clear any existing interval first
        if (liveWeatherInterval) {
            clearInterval(liveWeatherInterval);
        }

        // Initial immediate update
        setGeoCoords();
        getCurrentWeather();
        clearErrorMessage();
        // Set new interval - using 5 minutes instead of 1 second
        liveWeatherInterval = setInterval(() => {
            setGeoCoords();
            getCurrentWeather();
        }, 1000); // 300000ms = 5 minutes

        liveWeatherBtn.textContent = "Stop live weather";
        liveWeatherBtn.classList = "stop";
    } else {
        if (liveWeatherInterval) {
            clearInterval(liveWeatherInterval);
            liveWeatherInterval = null;
        }
        weatherInfo.style.display="none";
        cityInputBox.value="";
        clearErrorMessage();
        document.getElementById("real-time-clock").style.display = "none";
        liveWeatherBtn.textContent = "Start live weather";
        liveWeatherBtn.classList = "start"; 
    }
    if(cityInputBox.value===""){
        weatherInfo.style.display="none";
    }
});

// Add real-time clock functionality
function updateClock() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    document.getElementById("real-time-clock").textContent = formattedTime;
}
// Ensure no error message appears when starting live weather
function clearErrorMessage() {
    messageDisplay.textContent = "";
    messageDisplay.className = ""; // Clear styles
}

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
    if(mainDropdown.style.display==="block"){
        mainDropdown.style.display="none";
    }
    else if(unitDropdown.style.display==="block"){
        unitDropdown.style.display="none";
    }
    else{
        mainDropdown.style.display="block";
    }
})
//change unit dropdown toogle
changeUnitOption.addEventListener("click", event => {
    mainDropdown.style.display="none";
    unitDropdown.style.display="block";
    }
)
//unit dropdown disappear after clicking a unit
unitOptions.forEach(unitElement => {
    unitElement.addEventListener("click", event => {
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
    weatherInfo.style.display = "none";
    try {
        let enteredAddress = cityInputBox.value;
        if (enteredAddress.length === 0) {
            suggestionList.style.display = "none";
            cityInputBox.style.borderRadius = "10px";
            return;
        }
        suggestionList.style.display = "block";
        cityInputBox.style.borderRadius = "10px 10px 0px 0px";

        let fetchedCities = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${enteredAddress}&limit=5&appid=${APIkey}&units=${unitsMode}`);
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


function setGeoCoords() {
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
function recordInputLocationData() {
    let city = cityInputBox.value;
    if (city) {
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

    }
    else {
        messageDisplay.textContent = "Field empty! Enter a city";
        messageDisplay.classList = "error";
        messageFadeOut();
    }


}

async function getCurrentWeather() {
    recordInputLocationData();
    try {

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
    document.getElementById("weather-city-box").textContent = name;
    document.getElementById("weather-temp").textContent = `${temp.toFixed(1)} ${tempUnitSymbol}`;
    document.getElementById("weather-feels-like").textContent = `Feels like ${feels_like.toFixed(1)} ${tempUnitSymbol}`;
    document.getElementById("weather-main-desc").textContent = main;
    document.getElementById("weather-humidity-value-box").textContent = `${humidity} % `;
    document.getElementById("weather-pressure-value-box").textContent = `${pressure} hPa`;
    document.getElementById("weather-visibility-value-box").textContent = `${visibility} m`;
    document.getElementById("weather-wind-value-box").textContent = `${wind.toFixed(1)} ${windUnitSymbol}`;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherInfo.style.display = "flex";
}
function messageFadeOut() {
    setTimeout(() => { messageDisplay.textContent = "" }, 3000);
}
// Add these references at the top with your other references
const forecastInfo = document.getElementById("forecast-info");
const forecastBoxes = document.getElementById("forecast-boxes");

// Add this function to fetch forecast data
async function getWeatherForecast() {
    recordInputLocationData();
    try {
        let fetchedForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${para}&appid=${APIkey}&units=${unitsMode}`);
        if (!fetchedForecast.ok) {
            throw new Error(`Error fetching forecast data`);
        }
        fetchedForecast = await fetchedForecast.json();
        displayForecast(fetchedForecast);
    }
    catch (error) {
        messageDisplay.textContent = error.message;
        messageDisplay.classList = "error";
        messageFadeOut();
    }
}

// Function to display forecast data
function displayForecast(forecast) {
    // Hide weather info if showing
    weatherInfo.style.display = "none";

    // Show forecast container
    forecastInfo.style.display = "block";

    // Set city name
    document.querySelector("#forecast-info .city-box").textContent = forecast.city.name;

    // Get forecast boxes
    const forecastBoxElements = document.querySelectorAll(".forecast-box");

    // Process forecasts for next 4 time periods (each 3 hours apart)
    for (let i = 0; i < 4; i++) {
        const forecastData = forecast.list[i];
        const forecastBox = forecastBoxElements[i];

        if (forecastData && forecastBox) {
            // Format date
            const date = new Date(forecastData.dt * 1000);
            const formattedDate = formatDate(date);

            // Update forecast box content
            forecastBox.querySelector(".date-box").textContent = formattedDate;
            forecastBox.querySelector(".forecast-temp").textContent = `${forecastData.main.temp.toFixed(1)} ${tempUnitSymbol}`;
            forecastBox.querySelector(".forecast-icon").src = `https://openweathermap.org/img/wn/${forecastData.weather[0].icon}@2x.png`;
            forecastBox.querySelector(".forecast-main-desc").textContent = forecastData.weather[0].main;
            forecastBox.querySelector(".forecast-feels-like").textContent = `Feels like ${forecastData.main.feels_like.toFixed(1)} ${tempUnitSymbol}`;

            // Update detailed info
            forecastBox.querySelector(".forecast-humidity-value-box").textContent = `${forecastData.main.humidity} %`;
            forecastBox.querySelector(".forecast-pressure-value-box").textContent = `${forecastData.main.pressure} hPa`;
            forecastBox.querySelector(".forecast-visibility-value-box").textContent = `${forecastData.visibility} m`;
            forecastBox.querySelector(".forecast-wind-value-box").textContent = `${forecastData.wind.speed.toFixed(1)} ${windUnitSymbol}`;
        }
    }
}

// Helper function to format date
function formatDate(date) {
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Add these event listeners to handle visibility toggling
cityInputBox.addEventListener("input", () => {
    forecastInfo.style.display = "none";
});

// Modify the city suggestion click handler to hide forecast info
suggestionList.addEventListener("click", () => {
    forecastInfo.style.display = "none";
});