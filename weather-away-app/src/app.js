//Global variable
var apiKey = "10a81d6318c2a72a6e26b0c6227d2fa9";

//Display the current date and time using JavaScript
function formatDate(timestamp) {
  let date = new Date(timestamp);

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let day = days[date.getDay()]; //pulling index value from array for the relevant day based on API response, and assigns the name of the day (string)
  return `${day} ${formatHours(timestamp)}`; //the ${formatHours(timestamp)} is going to call the formatHours function, below, and return `${hours}:${minutes}`
}

function formatHours(timestamp) {
  //function to format the "dt" raw timestamp returned with the Forecast API response, pulled and formated timestamp from API response data (UTC)
  let date = new Date(timestamp);
  let hours = date.getHours(); // JS syntax, getHours
  if (hours < 10) {
    //two digits, if hours is <10, then `0${hours}`
    hours = `0${hours}`;
  }
  let minutes = date.getMinutes();
  if (minutes < 10) {
    //two digits, if minutes is <10, then `0${minutes}`
    minutes = `0${minutes}`;
  }
  return `${hours}:${minutes}`;
}

//format weekday function for 5-Day Outlook
function formatWeekDay(timestamp) {
  let dateTime = new Date(timestamp);
  let days = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  let currentDay = days[dateTime.getDay()];
  return `${currentDay}`;
}

//** C to F Toggle Button Conversions, script is pulling the user's selected city, once it is loaded to the HTML form, e.g., id = "#city"  **
let cityName = document.querySelector("#city");

let fahrenheitLink = document.querySelector("#fahrenheit-link");
fahrenheitLink.addEventListener("click", function () {
  getApiDataImperial(cityName.innerHTML);
});

let celsiusLink = document.querySelector("#celsius-link");
celsiusLink.addEventListener("click", function () {
  getApiDataMetric(cityName.innerHTML);
});

//Detailed Current Weather Information

function showTemperature(response) {
  console.log(response);
  let degrees = Math.round(response.data.main.temp);
  let temperature = document.querySelector("#currentDegrees");
  temperature.innerHTML = `${degrees}°`;

  let city = document.querySelector("#city");
  city.innerHTML = response.data.name;

  let desc = document.querySelector("#currentWeatherDetail");
  desc.innerHTML = response.data.weather[0].description;

  let high = Math.round(response.data.main.temp_max);
  let highTemp = document.querySelector("#highTemp");
  highTemp.innerHTML = `${high}°`;

  let feels = Math.round(response.data.main.feels_like);
  let feelsLike = document.querySelector("#feelsLike");
  feelsLike.innerHTML = `${feels}°`;

  let sunrise = document.querySelector("#sunrise");
  sunrise.innerHTML = UTCtoTwentyFourHours(
    response.data.timezone,
    response.data.sys.sunrise
  );

  let low = Math.round(response.data.main.temp_min);
  let lowTemp = document.querySelector("#lowTemp");
  lowTemp.innerHTML = `${low}°`;

  let humidity = document.querySelector("#humidity");
  humidity.innerHTML = `${response.data.main.humidity}%`;

  let sunset = document.querySelector("#sunset");
  sunset.innerHTML = UTCtoTwentyFourHours(
    response.data.timezone,
    response.data.sys.sunset
  );

  let iconElement = document.querySelector("#currentWeatherImg");
  iconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
  );
  iconElement.setAttribute("alt", response.data.weather[0].description);

  //Daily Forecast

  let lat = response.data.coord.lat;
  let lon = response.data.coord.lon;
  let apiurl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&
  exclude=current,minutely,hourly&appid=${apiKey}&units=metric`;
  axios.get(apiurl).then(dailyForecast);
}

//GeoLocation
function retrievePosition(position) {
  console.log(position.coords.latitude);
  console.log(position.coords.longitude);
  let apiKey = "10a81d6318c2a72a6e26b0c6227d2fa9";

  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(showTemperature);
}

function getCurrentPosition(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(retrievePosition);
}

let currentLocation = document.querySelector("#current-btn");
currentLocation.addEventListener("click", getCurrentPosition);

//**Forecast Functionality (Description) - You can search/view weather forecast for 5 days with data every 3 hours by city name.**

//Every 3 Hour Forecast
function displayForecast(response) {
  //created function to display extended forecast (e.g., forecast for next 6 3-hour chunks of time) below. Function displays forecast data every 3 hours/on the hour six times, API documentation: https://openweathermap.org/forecast5
  let forecastElement = document.querySelector("#forecast"); //pulling this id from HTML
  forecastElement.innerHTML = null; //updated to prevent bug; when user searches for another city,overwrites each value in forecast with whatever the API returns
  let forecast = null; //updated forecast variable for "for" loop to run without bug

  for (let index = 0; index < 6; index++) {
    //created "for" loop below
    forecast = response.data.list[index]; //Using a "for" loop, I injected this HTML 6 times but each time I am overwriting each value by whatever the API is giving me, and I am doing this 6 times.
    forecastElement.innerHTML += `
    <div class="col-2">
              <h3>
                ${formatHours(forecast.dt * 1000)}
              </h3>
              <img src="http://openweathermap.org/img/wn/${
                forecast.weather[0].icon
              }@2x.png" alt="">
              <div class="weather-forecast-temperature">
                  <strong>${Math.round(
                    forecast.main.temp_max
                  )}°</strong> | ${Math.round(forecast.main.temp_min)}°
                </div>
    </div>
  `;
  }
}

//Five Day Forecast
function dailyForecast(response) {
  let dayForecastElement = document.querySelector("#dayForecast");
  dayForecastElement.innerHTML = null;
  let dayForecast = null;

  for (let index = 1; index < 6; index++) {
    dayForecast = response.data.daily[index];
    // console.log(response.data.daily);

    dayMax = `${Math.round(dayForecast.temp.max)}`;
    dayMin = `${Math.round(dayForecast.temp.min)}`;

    dayForecastElement.innerHTML += `
    
    <div class="col">
  <h3>${formatWeekDay(dayForecast.dt * 1000)}</h3>
  <img src="http://openweathermap.org/img/wn/${
    dayForecast.weather[0].icon
  }@2x.png" />
            <p class="forecast-temperature"><strong>${dayMax}°C</strong> | ${dayMin}°C</p>
            </div>
    `;
  }
}

//**Search City Functions**

//Search function invoked when selecting | °F toggle - for Imperial
function getApiDataImperial(inputCity) {
  let apiKey = "10a81d6318c2a72a6e26b0c6227d2fa9";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${apiKey}&units=imperial`;
  axios.get(apiUrl).then(showTemperature);

  //TB Refactored, API call to pull data for hourly forecast feature ("Today's Forecast") - for Imperial
  apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${inputCity}&appid=${apiKey}&units=imperial`; //second API call made to OpenWeather, this part of the search function is going to make an AJAX call to get the 5-day forecast
  console.log(axios.get(apiUrl));
  axios.get(apiUrl).then(displayForecast);
}

//Search function invoked *immediately* upon page load, upon execution of search function (search of city name), and upon selection of | °C toggle - DEFAULT is Metric
function getApiDataMetric(inputCity) {
  let apiKey = "10a81d6318c2a72a6e26b0c6227d2fa9";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${apiKey}&units=metric`;
  //quick reference to apiURL data https://api.openweathermap.org/data/2.5/weather?q=London&appid=10a81d6318c2a72a6e26b0c6227d2fa9&units=imperial
  axios.get(apiUrl).then(showTemperature);

  //TB Refactored, API call to pull data for hourly forecast feature - for Metric
  apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${inputCity}&appid=${apiKey}&units=metric`; //second API call made to OpenWeather, this part of the search function is going to make an AJAX call to get the 5-day forecast
  console.log(axios.get(apiUrl));
  axios.get(apiUrl).then(displayForecast);
}

function search(event) {
  event.preventDefault();
  let inputCity = document.querySelector("#search-bar");
  getApiDataMetric(inputCity.value);
}

let form = document.querySelector("#search-form");
form.addEventListener("submit", search);

//Convert UTC time from API response to 24hr clock
function UTCtoTwentyFourHours(timeZone, time) {
  let newTime = (time + timeZone) * 1000;
  let convertedDate = new Date(newTime);
  let convertedHrs = convertedDate.getUTCHours().toString().padStart(2, "0");
  let convertedMins = convertedDate.getUTCMinutes().toString().padStart(2, "0");
  let returnedString = convertedHrs + ":" + convertedMins;
  return returnedString;
}

//Default city, searched upon initial load
getApiDataMetric("Lausanne");
