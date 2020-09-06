var savedLocations = [];
var currentLocation;

function startUp() {
    //grab previous locations from local storage
    savedLocations = JSON.parse(localStorage.getItem("weathercities"));
    var lastSearch;
    //buttons for previous searches
    if (savedLocations) {
        //get the last city searched
        currentLocation = savedLocations[savedLocations.length - 1];
        showPrevious();
        getCurrent(currentLocation);
    }
    else {
        //try to geolocate, otherwise set city to San Francisco
        if (!navigator.geolocation) {
            //can't locate/no permission and no previous searches, provide one
            getCurrent("San Francisco");
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

}

function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=7e4c7478cc7ee1e11440bf55a8358ec3";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        currentLocation = response.name;
        saveLoaction(response.name);
        getCurrent(currentLocation);
    });

}

function error(){
    //can't locate and no previous searches, provide one
    currentLocation = "San Francisco"
    getCurrent(currentLocation);
}

function showPrevious() {
    //show the previously searched for locations in local storage
    if (savedLocations) {
        $("#prevSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedLocations.length; i++) {
            var locationBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i]);
            if (savedLocations[i] == currentLocation){
                locationBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locationBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locationBtn);
        }
        $("#prevSearches").append(btns);
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=7e4c7478cc7ee1e11440bf55a8358ec3&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedLocations.splice(savedLocations.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedLocations));
            startUp();
        }
    }).then(function (response) {
        //create the card
        var currCard = $("<div>").attr("class", "card bg-light");
        $("#earthforecast").append(currCard);

        //add location to card header
        var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);

        //get icon for weather conditions
        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        var imgDiv = $("<div>").attr("class", "col-md-4").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);

        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        //append city name
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));
        //append last updated
        var currdate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currdate)));
        //append Temperature
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        //append Humidity
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        //append Wind Speed
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));

        //get UV Index
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=7e4c7478cc7ee1e11440bf55a8358ec3&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse) {
            var uvindex = uvresponse.value;
            var bgcolor;
            if (uvindex <= 3) {
                bgcolor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                bgcolor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                bgcolor = "orange";
            }
            else {
                bgcolor = "red";
            }
            var uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvdisp.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
            cardBody.append(uvdisp);

        });

        cardRow.append(textDiv);
        getForecast(response.id);
    });
}

function getForecast(city) {
    //get 5 day forecast
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=7e4c7478cc7ee1e11440bf55a8358ec3&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //add container div for forecast cards
        var newrow = $("<div>").attr("class", "forecast");
        $("#earthforecast").append(newrow);

        //loop through array response to find the forecasts for 15:00
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "day");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    //clear weather
    $("#earthforecast").empty();
}

function saveLoaction(location){
    //add this to the saved locations array
    if (savedLocations === null) {
        savedLocations = [location];
    }
    else if (savedLocations.indexOf(location) === -1) {
        savedLocations.push(location);
    }
    //save the new array to localstorage
    localStorage.setItem("weathercities", JSON.stringify(savedLocations));
    showPrevious();
}

$("#searchbtn").on("click", function () {
    //don't refresh the screen
    event.preventDefault();
    //grab the value of the input field
    var location = $("#searchinput").val().trim();
    //if location wasn't empty
    if (location !== "") {
        //clear the previous forecast
        clear();
        currentLocation = location;
        saveLoaction(location);
        //clear the search field value
        $("#searchinput").val("");
        //get the new forecast
        getCurrent(location);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLocation = $(this).text();
    showPrevious();
    getCurrent(currentLocation);
});

startUp();
