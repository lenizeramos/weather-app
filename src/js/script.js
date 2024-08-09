document.addEventListener("DOMContentLoaded", () => {
  let latitude = document.getElementById("latitude");
  let longitude = document.getElementById("longitude");
  var obj = {};

  setInitialCity();
  main();
  favoriteCitiesList();
});

function setInitialCity() {
  if (localStorage.getItem("currentCity")) {
    let currentCity = JSON.parse(localStorage.getItem("currentCity"));
    weatherRequest(currentCity);
  } else {
    getUserCurrentLocation()
      .then((obj) => {
        weatherRequest(obj);
      })
      .catch((error) => {
        console.log(error);
        obj = {
          latitude: 49.2819,
          longitude: -123.11874,
          name: "Vancouver",
          stateCode: "BC",
          countryCode: "CA",
          formattedAddress: "Vancouver, BC CA",
        };
        weatherRequest(obj);
      });
  }
}
function isFavorited(currentCity, favoriteCities) {
  if (!favoriteCities) {
    return false;
  }
  return favoriteCities.some(
    (favoriteCity) =>
      favoriteCity.formattedAddress === currentCity.formattedAddress
  );
}

function loadFavoriteStar(currentCity) {
  let favoriteStar = document.getElementById("favorite_star");
  let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities")) || [];

  if (isFavorited(currentCity, favoriteCities)) {
    favoriteStar.classList.add("favorited");
  } else {
    favoriteStar.classList.remove("favorited");
  }

  favoriteStarEvent(currentCity, favoriteStar, favoriteCities);
}

function favoriteStarEvent(currentCity, favoriteStar, favoriteCities) {
  favoriteStar.addEventListener("click", () => {
   
    if (isFavorited(currentCity, favoriteCities)) {
      favoriteCities = favoriteCities.filter(
        (city) => city.formattedAddress !== currentCity.formattedAddress
      );
      favoriteStar.classList.remove("favorited");
    } else {
      favoriteCities.push(currentCity);
      favoriteStar.classList.add("favorited");
    }

    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
    updateFavoriteCitiesList();
  });
}

function updateFavoriteCitiesList() {
  let selectCities = document.getElementById("select_cities");
  let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities")) || [];
  selectCities.innerHTML = "";

  let option = document.createElement("option");
  option.textContent = "Favorite Cities";
  option.classList.add("select-city");
  option.value = "";
  option.setAttribute("disabled", "true");
  option.setAttribute("selected", "true");
  selectCities.appendChild(option);

  favoriteCities.forEach((city, index) => {
    const option = document.createElement("option");
    option.textContent = city.formattedAddress;
    option.value = index;
    option.classList.add("select-city");
    selectCities.appendChild(option);
  });
}

function favoriteCitiesList() {
  updateFavoriteCitiesList();
  let selectCities = document.getElementById("select_cities");
  selectCities.addEventListener("change", (event) => {
    const numericIndex = Number(event.target.value);

    let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities"));
    weatherRequest(favoriteCities[numericIndex]);
  });
}

function main() {
  let autocompleteInput = document.getElementById("autocomplete_input");
  let autocompleteCities = document.getElementById("autocomplete_cities");
  let isSearching = false;

  autocompleteInput.addEventListener("input", () => {
    const city = autocompleteInput.value.trim().toLowerCase();
    autocompleteCities.innerHTML = "";
    if (city.length > 2 && !isSearching) {
      isSearching = true;
      fetchAutocompleteRadarApi(city, 10).then((filteredCities) => {
        if (filteredCities.length === 0) {
          const noResultsDiv = document.createElement("div");
          noResultsDiv.textContent = "No results found";
          noResultsDiv.classList.add("autocomplete-city");
          autocompleteCities.appendChild(noResultsDiv);
        } else {
          filteredCities.forEach((city) => {
            const div = document.createElement("div");
            div.textContent = city.formattedAddress;
            div.classList.add("autocomplete-city");
            div.addEventListener("click", () => {
              obj = {
                name: city.city,
                stateCode: city.stateCode,
                countryCode: city.countryCode,
                formattedAddress: city.formattedAddress,
                latitude: city.latitude,
                longitude: city.longitude,
              };

              autocompleteInput.value = obj.formattedAddress;
              autocompleteCities.innerHTML = "";

              weatherRequest(obj);
            });
            autocompleteCities.appendChild(div);
          });
        }
        isSearching = false;
      });
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target !== autocompleteInput) {
      autocompleteCities.innerHTML = "";
    }
  });

  async function fetchAutocompleteRadarApi(city, limit) {
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "prj_test_pk_3d00dceaab6b3dd8142567ff19565bcf79df6489"
    );

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const url = `https://api.radar.io/v1/search/autocomplete?query=${city}&limit=${limit}&layers=locality`;

    try {
      const response = await fetch(url, requestOptions);
      const result = await response.json();
      return result.addresses.map((address) => address);
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
}
async function getCityFromCoordinates(latitude, longitude) {
  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "prj_test_pk_3d00dceaab6b3dd8142567ff19565bcf79df6489"
  );

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  return fetch(
    `https://api.radar.io/v1/geocode/reverse?coordinates=${latitude},${longitude}`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      return result.addresses[0];
    })
    .catch((error) => console.error(error));
}

function getUserCurrentLocation() {
  return new Promise((result, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          obj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: "",
            stateCode: "",
            countryCode: "",
            formattedAddress: "",
          };

          getCityFromCoordinates(obj.latitude, obj.longitude).then((city) => {
            obj.name = city.city;
            obj.stateCode = city.stateCode;
            obj.countryCode = city.countryCode;
            obj.formattedAddress = `${city.city}, ${city.stateCode} ${city.countryCode}`;
            result(obj);
          });
        },
        (error) => {
          reject(new Error("Error getting location: " + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      obj = {
        latitude: 49.2819,
        longitude: -123.11874,
        name: "Vancouver",
        stateCode: "BC",
        countryCode: "CA",
        formattedAddress: "Vancouver, BC CA",
      };
      weatherRequest(obj);
      result(obj);
    }
  });
}

var locationDayObj;
var cityLocationWeather = document.getElementById("city_location-weather");

cityLocationWeather.addEventListener("click", function () {        
    changeHourlyWeather(locationDayObj);
});


async function weatherRequest(obj) {
  let latitude = obj.latitude;
  let longitude = obj.longitude;
  let cityName = document.getElementById("city_name");

  cityName.textContent = `${obj.name}`;

  loadFavoriteStar(obj);

  localStorage.setItem("currentCity", JSON.stringify(obj));

  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&current=is_day,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FLos_Angeles`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      let bodyBackground = document.getElementById("body");
      bodyBackground.style.backgroundImage = getBackgroundImgBody(
        result.current.weather_code
      );

      let tempH1 = document.getElementById("tempH1");
      tempH1.innerHTML = result.current.temperature_2m + "°C";
      let humidity = document.getElementById("humidity");
      humidity.innerHTML = result.current.relative_humidity_2m + "%";
      let wind = document.getElementById("wind");
      wind.innerHTML = result.current.wind_speed_10m + "Km/h";
      let highTemperature = document.getElementById("high_temperature");
      highTemperature.innerHTML = result.current.wind_direction_10m + "°";
      let windDirection = document.getElementById("wind_direction");
      windDirection.innerHTML = result.current.wind_direction_10m+ "°";
      let weatherIcon = document.getElementById("weather_icon");
      weatherIcon.src = getImgAndVideoWheather(result.current.weather_code);
      const dates = result.daily.time;

      locationDayObj = {
        latitude: latitude,
        longitude: longitude,
        time: result.daily.time[0],
      };
      
      const days = dates.map((date) => {
        const day = new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
        });
        return day;
      });
      /* first day after today */
      let minFirstDay = document.getElementById("min_first_day");
      minFirstDay.innerHTML = result.daily.temperature_2m_min[1] + "°C";
      let maxFirstDay = document.getElementById("max_first_day");
      maxFirstDay.innerHTML = result.daily.temperature_2m_max[1] + "°C";
      let firstWeatherImg = document.getElementById("first_weather_img");
      firstWeatherImg.src = getImgAndVideoWheather(
        result.daily.weather_code[1]
      );
      let firstDateWeather = document.getElementById("first_date_weather");
      firstDateWeather.innerHTML = days[2];

      var firstDayDaily = document.getElementById("first_day_daily");
      firstDayDaily.addEventListener("click", function () {
        var dayObj = {
          latitude: latitude,
          longitude: longitude,
          time: result.daily.time[1],
        };
        changeHourlyWeather(dayObj);
      });

      /* second day after today */
      let minSecondDay = document.getElementById("min_second_day");
      minSecondDay.innerHTML = result.daily.temperature_2m_min[2] + "°C";
      let maxSecondDay = document.getElementById("max_second_day");
      maxSecondDay.innerHTML = result.daily.temperature_2m_max[2] + "°C";
      let secondWeatherImg = document.getElementById("second_weather_img");
      secondWeatherImg.src = getImgAndVideoWheather(
        result.daily.weather_code[2]
      );
      let secondDateWeather = document.getElementById("second_date_weather");
      secondDateWeather.innerHTML = days[3];

      var secondDayDaily = document.getElementById("second_day_daily");
      secondDayDaily.addEventListener("click", function () {
        var dayObj = {
          latitude: latitude,
          longitude: longitude,
          time: result.daily.time[2],
        };
        changeHourlyWeather(dayObj);
      });

      /* third day after today */
      let minThirdDay = document.getElementById("min_third_day");
      minThirdDay.innerHTML = result.daily.temperature_2m_min[3] + "°C";
      let maxThirdDay = document.getElementById("max_third_day");
      maxThirdDay.innerHTML = result.daily.temperature_2m_max[3] + "°C";
      let thirdWeatherImg = document.getElementById("third_weather_img");
      thirdWeatherImg.src = getImgAndVideoWheather(
        result.daily.weather_code[3]
      );
      let thirdDateWeather = document.getElementById("third_date_weather");
      thirdDateWeather.innerHTML = days[4];

      var thirdDayDaily = document.getElementById("third_day_daily");
      thirdDayDaily.addEventListener("click", function () {
        var dayObj = {
          latitude: latitude,
          longitude: longitude,
          time: result.daily.time[3],
        };
        changeHourlyWeather(dayObj);
      });

      /* fourth day after today */
      let minFourthDay = document.getElementById("min_fourth_day");
      minFourthDay.innerHTML = result.daily.temperature_2m_min[4] + "°C";
      let maxFourthDay = document.getElementById("max_fourth_day");
      maxFourthDay.innerHTML = result.daily.temperature_2m_max[4] + "°C";
      let fourthWeatherImg = document.getElementById("fourth_weather_img");
      fourthWeatherImg.src = getImgAndVideoWheather(
        result.daily.weather_code[4]
      );
      let fourthDateWeather = document.getElementById("fourth_date_weather");
      fourthDateWeather.innerHTML = days[5];

      var fourthDayDaily = document.getElementById("fourth_day_daily");
      fourthDayDaily.addEventListener("click", function () {
        var dayObj = {
          latitude: latitude,
          longitude: longitude,
          time: result.daily.time[4],
        };
        changeHourlyWeather(dayObj);
      });

      /* fifth day after today */
      let minFifthDay = document.getElementById("min_fifth_day");
      minFifthDay.innerHTML = result.daily.temperature_2m_min[5] + "°C";
      let maxFifthDay = document.getElementById("max_fifth_day");
      maxFifthDay.innerHTML = result.daily.temperature_2m_max[5] + "°C";
      let fifthWeatherImg = document.getElementById("fifth_weather_img");
      fifthWeatherImg.src = getImgAndVideoWheather(
        result.daily.weather_code[5]
      );
      let fifthDateWeather = document.getElementById("fifth_date_weather");
      fifthDateWeather.innerHTML = days[6];

      var fifthDayDaily = document.getElementById("fifth_day_daily");
      fifthDayDaily.addEventListener("click", function () {
        var dayObj = {
          latitude: latitude,
          longitude: longitude,
          time: result.daily.time[5],
        };
        changeHourlyWeather(dayObj);
      });

      /*  */
      var hourlyContainer = document.getElementById("hourly_container");
      hourlyContainer.innerHTML = "";

      var arrayHourly = [];
      var current_temperatures = document.getElementById(
        "current_temperatures"
      );
      for (
        let index = 0;
        index < result.hourly.temperature_2m.length;
        index++
      ) {
        const element = result.hourly.temperature_2m[index];
        const date = new Date(result.hourly.time[index]);
        const options = {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };

        var humanDate = date.toLocaleDateString("en-US", options);
        arrayHourly.push(`Vancouver, BC ${humanDate} ${element}°C"`);
      }

      cities = arrayHourly.join(" - ");
      current_temperatures.innerHTML = cities;

      for (let i = 0; i < 24; i++) {
        var temp = result.hourly.temperature_2m[i];
        var newdiv = document.createElement("div");

        var day = document.createElement("h4");
        day.innerHTML = result.hourly.time[i].split("T")[1];
        day.classList.add("black-background");
        day.setAttribute("style", "margin-bottom:0;");

        var dayImage = document.createElement("img");
        dayImage.width = 50;
        dayImage.height = 50;
        dayImageFunction = getImgAndVideoWheather(
          result.hourly.weather_code[i]
        );
        dayImage.src = dayImageFunction;

        var p = document.createElement("p");
        p.innerHTML = temp + " °C";
        p.classList.add("black-background");
        p.setAttribute(
          "style",
          "font-size: 20px;margin-top:0;margin-bottom:0;"
        );

        var divContainer = document.createElement("div");
        divContainer.setAttribute("style", "max-width: 100px;");
        divContainer.classList.add("glass-card");
        divContainer.append(dayImage);
        divContainer.append(p);
        divContainer.append(day);

        newdiv.append(divContainer);
        hourlyContainer.append(newdiv);
        i = i + 2;
      }
    })
    .catch((error) => console.error(error));
}

function getBackgroundImgBody(value) {
  switch (value) {
    case 0:
      var image = 'url("media/images/pexels-sunny.jpg")';
      break;
    case 1:
    case 2:
    case 3:
      var image = 'url("media/images/pexels-partly-cloudy.jpg")';
      break;
    case 45:
    case 48:
      var image = 'url("media/images/pexels-fogging.jpg")';
      break;
    case 51:
    case 53:
    case 55:
      var image = 'url("media/images/pexels-drizzle.jpg")';
      break;
    case 56:
    case 57:
      var image = 'url("media/images/pexels-snowing.jpg")';
      break;
    case 61:
    case 63:
    case 65:
      var image = 'url("media/images/pexels-raining.jpg")';
      break;
    case 66:
    case 67:
      var image = 'url("media/images/pexels-freezing rain.jpg")';
      break;
    case 71:
    case 73:
    case 75:
      var image = 'url("media/images/pexels-snowing.jpg")';
      break;
    case 77:
      var image = 'url("media/images/pexels-snowing.jpg")';
      break;
    case 80:
    case 81:
    case 82:
      var image = 'url("media/images/pexels-raining.jpg")';
      break;
    case 85:
    case 86:
      var image = 'url("media/images/pexels-snowing.jpg")';
      break;
    case 95:
    case 96:
    case 99:
      var image = 'url("media/images/pexels-storm.jpg")';
      break;
    default:
      var image = 'url("media/images/pexels-clearly-sky.jpg")';
      break;
  }
  let finalObj = {
    image: image,
  };

  return finalObj.image;
}

function getImgAndVideoWheather(value) {
  switch (value) {
    case 0:
      var image = "media/images/Sunny_icon.svg";
      break;
    case 1:
    case 2:
    case 3:
      var image = "media/images/Sunny_with_cloud_icon.svg";
      break;
    case 45:
    case 48:
      var image = "media/images/Cloudy_icon.svg";
      break;
    case 51:
    case 53:
    case 55:
      var image = "media/images/Sunny_Rain_icon.svg";
      break;
    case 56:
    case 57:
      var image = "media/images/Storm_Cloud_icon.svg";
      break;
    case 61:
    case 63:
    case 65:
      var image = "media/images/Thunder_Storm_icon.svg";
      break;
    case 66:
    case 67:
      var image = "media/images/cloud.png";
      break;
    case 71:
    case 73:
    case 75:
      var image = "media/images/snow.png";
      break;
    case 77:
      var image = "media/images/snowflake.png";
      break;
    case 80:
    case 81:
    case 82:
      var image = "media/images/rainy-day.png";
      break;
    case 85:
    case 86:
      var image = "media/images/snowy.png";
      break;
    case 95:
    case 96:
    case 99:
      var image = "media/images/Lightning.svg";
      break;
    default:
      var image = "media/images/Sunny_icon.svg";
      break;
  }
  let finalObj = {
    image: image,
  };

  return finalObj.image;
}

async function changeHourlyWeather(obj) {
  console.log("click2")
  var latitude = obj.latitude;
  var longitude = obj.longitude;
  var objTime = obj.time;
  console.log(latitude)

  await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&timezone=America%2FLos_Angeles`
  )
    .then((response) => response.text())
    .then((result) => {
      var result = JSON.parse(result);
      console.log("click3")

      var hourlyContainer = document.getElementById("hourly_container");
      hourlyContainer.innerHTML = "";

      let temperatureArr = [];
      let timeArr = [];
      let weatherCodeArr = [];

      for (let index = 0; index < result.hourly.time.length; index++) {
        if (result.hourly.time[index].includes(objTime)) {
          temperatureArr.push(result.hourly.temperature_2m[index]);
          timeArr.push(result.hourly.time[index]);
          weatherCodeArr.push(result.hourly.weather_code[index]);
        }
      }
      var newObjHour = {
        temperature_2m: temperatureArr,
        time: timeArr,
        weather_code: weatherCodeArr,
      };

      for (let i = 0; i < 24; i++) {
        var temp = newObjHour.temperature_2m[i];
        var newdiv = document.createElement("div");

        var day = document.createElement("h4");
        day.innerHTML = newObjHour.time[i].split("T")[1];
        day.classList.add("black-background");
        day.setAttribute("style", "margin-bottom:0;");

        var dayImage = document.createElement("img");
        dayImage.width = 50;
        dayImage.height = 50;
        dayImageFunction = getImgAndVideoWheather(newObjHour.weather_code[i]);
        dayImage.src = dayImageFunction;

        var p = document.createElement("p");
        p.innerHTML = temp + " °C";
        p.classList.add("black-background");
        p.setAttribute(
          "style",
          "font-size: 20px;margin-top:0;margin-bottom:0;"
        );

        var divContainer = document.createElement("div");
        divContainer.setAttribute("style", "max-width: 100px;");
        divContainer.classList.add("glass-card");
        divContainer.append(dayImage);
        divContainer.append(p);
        divContainer.append(day);

        newdiv.append(divContainer);
        hourlyContainer.append(newdiv);
        i = i + 2;
      }
    })
    .catch((error) => console.log(error));
}
