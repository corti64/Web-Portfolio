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
  let day = days[date.getDay()]; // pulling index value from array for the relevant day based on API response, and assigns the name of the day (string)
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

function displayTemperature(response) {
  let temperatureElement = document.querySelector("#temperature");
  let cityElement = document.querySelector("#city");
  let descriptionElement = document.querySelector("#description");
  let feelsElement = document.querySelector("#feels");
  let humidityElement = document.querySelector("#humidity");
  let windElement = document.querySelector("#wind");
  let dateElement = document.querySelector("#date");
  let iconElement = document.querySelector("#icon");
  celsiusTemperature = response.data.main.temp; //
  temperatureElement.innerHTML = Math.round(response.data.main.temp);
  cityElement.innerHTML = response.data.name;
  descriptionElement.innerHTML = response.data.weather[0].description;
  feelsElement.innerHTML = Math.round(response.data.main.feels_like);
  humidityElement.innerHTML = response.data.main.humidity;
  windElement.innerHTML = Math.round(response.data.wind.speed);
  dateElement.innerHTML = formatDate(response.data.dt * 1000); // *1000, due to milliseconds
  iconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
  );
  iconElement.setAttribute("alt", response.data.weather[0].description);
}

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
                  )}°</strong> ${Math.round(forecast.main.temp_min)}°
                </div>
    </div>
  `;
  }
}

function search(city) {
  //this search function is going to take care of making an AJAX call
  let apiKey = "10a81d6318c2a72a6e26b0c6227d2fa9";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; //first API call to OpenWeather
  //and it's going to take care of displaying the city
  axios.get(apiUrl).then(displayTemperature);

  apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`; //second API call made to OpenWeather, this part of the search function is going to make an AJAX call to get the 5-day forecast
  console.log(axios.get(apiUrl));
  axios.get(apiUrl).then(displayForecast);
}

function handleSubmit(event) {
  event.preventDefault(); //prevents addEventListener, specifically the "event" default behavior, which automatically reloads the page
  cityInputElement = document.querySelector("#city-input"); // id, #city-input", is value user types into search-form
  search(cityInputElement.value);
}

function displayFahrenheitTemperature(event) {
  event.preventDefault(); //prevent default behavior of page reload
  let temperatureElement = document.querySelector("#temperature");
  //remove active class from the celsius link
  celsiusLink.classList.add("active");
  fahrenheitLink.classList.remove("active");
  let fahrenheiTemperature = (celsiusTemperature * 9) / 5 + 32;
  temperatureElement.innerHTML = Math.round(fahrenheiTemperature);
}

function displayCelsiusTemperature(event) {
  event.preventDefault();
  celsiusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  let temperatureElement = document.querySelector("#temperature");
  temperatureElement.innerHTML = Math.round(celsiusTemperature);
}

let celsiusTemperature = null; //to avoid Celcius or Fahrenheit being calculated over and over again, had to create a global variable

let fahrenheitLink = document.querySelector("#fahrenheit-link");
fahrenheitLink.addEventListener("click", displayFahrenheitTemperature);

let celsiusLink = document.querySelector("#celsius-link");
celsiusLink.addEventListener("click", displayCelsiusTemperature);

let form = document.querySelector("#search-form");
form.addEventListener("submit", handleSubmit);

search("New York"); //Calling this function on load, also search function is invoked when handleSubmit function is triggered
