document.addEventListener("DOMContentLoaded", ()=>{
    let obj = {
        latitude: 49.2819,
        longitude: -123.11874,
        name: "Vancouver"
    };
    weatherRequest(obj);
    
    async function weatherRequest (obj){
        let latitude = obj.latitude;
        let longitude = obj.longitude;

        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };
        await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min`, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                var result = JSON.parse(result);
                let tempH1 = document.getElementById("tempH1");
                tempH1.innerHTML = result.current.temperature_2m + "°";
                let humidity = document.getElementById("humidity");
                humidity.innerHTML = result.current.relative_humidity_2m + "%";
                let wind = document.getElementById("wind");
                wind.innerHTML = result.current.wind_speed_10m + "Km/h";
                let highTemperature = document.getElementById("high_temperature");
                highTemperature.innerHTML = result.current.
                apparent_temperature + "°";
                let timeWeather = document.getElementById("time_weather");
                timeWeather.innerHTML = result.current.rain;
                console.log(result);
            })
            .catch((error) => console.error(error));
    }

})

