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
    });
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
    //if loc wasn't empty
    if (location !== "") {
        currentLocation = location;
        saveLoaction(location);
        //clear the search field value
        $("#searchinput").val("");
        //get the new forecast
        getCurrent(location);
    }
});

$(document).on("click", "#loc-btn", function () {
    currentLocation = $(this).text();
    showPrevious();
    getCurrent(currentLocation);
});

startUp();
