const apiKey = "5c5475e25715b57a5752bca9e526e30a";
let savedCityArr;
$(document).ready(function() {
    if (localStorage.getItem("savedCities")) {
        savedCityArr =  JSON.parse(localStorage.getItem("savedCities"));
        loadSavedCities();
    }
    $("#city-search").submit(function(event) {
        event.preventDefault();
        searchCity($("#city-name").val());
    });
});

function searchCity(cityName) {
    $("#current").empty();
    $("#forecast").empty();
    if (cityName) {
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?q=${cityName.split().join("+")}&appid=${apiKey}`,
            type: "GET",
            crossDomain: true,
            dataType: 'jsonp',
        })
        .done(function(data) {
            displayCity(data);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        })
    }
}

function displayCity(cityData) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/uvi?lat=${cityData.coord.lat}&lon=${cityData.coord.lon}&appid=${apiKey}`,
        type: "GET",
        crossDomain: true,
        dataType: 'json',
    })
    .done(function(uvData) {
        const date = new Date(cityData.dt * 1000);
        const currentData = $("<div>").addClass("col-md-6")
        const cityName = $("<h1>").text(`${cityData.name} (${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}) `);
        const weatherImg = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + cityData.weather[0].icon + "@2x.png")
        cityName.append(weatherImg);
        const temp = $("<p>").text("Temperature: " + (Math.round((cityData.main.temp - 273.15) * 9 / 5 + 32) * 100) / 100 + " °F");
        const hum = $("<p>").text("Humidity: " + cityData.main.humidity + "%");
        const wind = $("<p>").text("Wind Speed: " + Math.round(cityData.wind.speed * 2.237 * 100) / 100 + " MPH");
        const uvIndex = $("<p>").text("UV Index: ");
        const uvValue = $(`<span>${uvData.value}</span>`);
        if (uvData.value < 2) {
            uvValue.addClass("favorable");
        } else if (uvData.value < 4) {
            uvValue.addClass("moderate");
        } else {
            uvValue.addClass("severe");
        }
        uvIndex.append(uvValue);
        currentData
            .append(cityName)
            .append($("<br />"))
            .append(temp)
            .append($("<br />"))
            .append(wind)
            .append($("<br />"))
            .append(hum)
            .append($("<br />"))
            .append(uvIndex)
            .append($("<br />"));
        $("#current").append(currentData);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    })
    forecast(cityData.name);
}

function forecast(cityName) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${cityName.split().join("+")}&appid=${apiKey}`,
        type: "GET",
        crossDomain: true,
        dataType: 'json',
    })
    .done(function(forecast) {
        for (let i = 3; i < 40; i+=8) {
            const cityForecast = $("<div>").addClass("col-md-2 bg-primary mx-auto");
            const unamericanDate = forecast.list[i].dt_txt.substring(0, forecast.list[i].dt_txt.indexOf(" "));
            const datePieces = unamericanDate.split("-");
            const americanDate = `${datePieces[1]}/${datePieces[2]}/${datePieces[0]}`;
            const date = $("<h4>").text(americanDate).addClass("text-white");
            const weatherImg = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + forecast.list[i].weather[0].icon + "@2x.png");
            const temp = $("<p>").text("Temp: " + (Math.round((forecast.list[i].main.temp - 273.15) * 9 / 5 + 32) * 100) / 100 + " °F").addClass("text-white");
            const hum = $("<p>").text("Humidity: " + forecast.list[i].main.humidity + "%").addClass("text-white");
            cityForecast
                .append(date)
                .append($("<br />"))
                .append(weatherImg)
                .append($("<br />"))
                .append(temp)
                .append($("<br />"))
                .append(hum);
            $("#forecast").append(cityForecast);
        }
        saveCity(cityName);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    })
}

function saveCity(cityName) {
    if (savedCityArr) {
        if (!savedCityArr.includes(cityName)) {
            savedCityArr.push(cityName);
            if (savedCityArr.length > 10) {
                savedCityArr.shift();
            }   
        }
    } else {
        savedCityArr = [cityName];
    }
    localStorage.setItem("savedCities", JSON.stringify(savedCityArr));
    loadSavedCities();
}

function loadSavedCities() {
    $("#saved").empty();
    for (let i = savedCityArr.length - 1; i >= 0; i--) {
        const savedCity = $("<button>").html(savedCityArr[i]).addClass("btn btn-lg btn-block btn-light text-left").attr("id", savedCityArr[i]);
        savedCity.click(function() {
            searchCity($(this).attr("id"));
        });
        $("#saved").append(savedCity);
    }
}