// DEPENDENCIES
// API - Polygon.io (for stock data)
// var polygonURL = "https://api.polygon.io/v1/open-close/AAPL/2022-10-11?adjusted=true&apiKey=2MYBRhMYEstgP3SY5prEcQsMFsRc40TO"
// fetch(polygonURL)
//     .then(function (response) {
//         return response.json();
//     })

//     .then(function (data) {
//         console.log(data);
//     })

// API - SerpAPI (for Google Trends)

var searchInputEl = $("#stock-name");
var searchButtonEl = $(".pure-button");
var recentSearchListEl = $("#recent-stock-list");
var relatedTitleEl = $("#related-title");
var sp500Data;
var autoCompleteOptions;
var apiKey = "LTUSnoXHn7D2TptGlI2Us7u3R7nO2efZ";

// Date
var lastWeekDay = new Date();
var yesterday = new Date();
var dateOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
};

yesterday.setDate(yesterday.getDate()-1);

if (yesterday.getDate() == 6) {
    lastWeekDay.setDate(lastWeekDay.getDate()-2);
} else if (yesterday.getDate() == 0) {
    lastWeekDay.setDate(lastWeekDay.getDate()-3);
} else {
    lastWeekDay.setDate(lastWeekDay.getDate()-1);
};

lastWeekDay = 
    lastWeekDay.getFullYear() + "-" + 
    ("0" + (lastWeekDay.getMonth()+1)).slice(-2) + "-" +
    ("0" + lastWeekDay.getDate()).slice(-2);

// DATA
// Datahub.io JSON - list of all stocks in S&P 500 with stock name, ticker, and sector
// var datahubURL = "https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/297344d8dc0a9d86b8d107449c851cc8/constituents_json.json"
// fetch(datahubURL)
//     .then(function (response) {
//         return response.json();
//     })

//     .then(function (data) {
//         console.log(data);
//     })

// FUNCTION
// Fetch stock/sector data from Datahub.io JSON
// If it is single stock name/ticker, use Polygon.io API to retrieve stock data
// Use SerpAPI to get investor sentiment on the stock/sector
// Save search to local storage and append as re-searchable list item underneath search

// function that makes a fetch call to datahub API and gets list of S&P 500 stocks
// $(document).ready(function () {
//     recentSearchListEl = JSON.parse(localStorage.getItem("recent-stock-list"));
//     cityArray.forEach(city =>{
//       printSearch(city);
//     })
//   });

async function getSP500Data() {
    var datahubURL = "https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/297344d8dc0a9d86b8d107449c851cc8/constituents_json.json"

    var response = await fetch(datahubURL);
    return await response.json();
    
}

function getAutoCompleteOptions() {
    var sp500Data = JSON.parse(localStorage.getItem("sp500Data"));
    var options = [];
    for (var i = 0; i < sp500Data.length; i++) {
        options.push(sp500Data[i].Symbol + " - " + sp500Data[i].Name);
    }
    return options;
}

// function that takes in a sector, searches datahub data and returns a list of stocks that match that sector

function getSymbolsMatchingSector(searchSector, sp500Data) {
    console.log(searchSector, sp500Data);
    var matches = [];
    for (var i = 0; i < sp500Data.length; i++) {
        if (sp500Data[i].Sector === searchSector) {
            matches.push(sp500Data[i].Symbol);
        }
    }
    return matches;
}

// function that takes in a stock symbol, makes a fetch call to polygon API, and returns data on that stock
async function getStockDataBySymbol(symbol) {
    // Make sure date will update dynamically too
    var polygonURL = "https://api.polygon.io/v1/open-close/" + symbol.toUpperCase() + "/" + lastWeekDay + "?adjusted=true&apiKey=" + apiKey;


    var response = await fetch(polygonURL);
    var data = await response.json();
    console.log(data);
    return data;
};

function showStockData(data) {
    // Name here (from the DataHub.io)
    var dataSet = JSON.parse(localStorage.getItem("sp500Data"));
    for (let i = 0; i < dataSet.length; i++) {
        if (data.symbol == dataSet[i].Symbol) {
            $("#current").append($("<div>").text(dataSet[i].Name).attr("id", "current-name"));
            $("#related-title").append($("<div>").text(dataSet[i].Sector));
        };
    };
    var liTicker = $("<div>").text("Symbol: " + data.symbol).attr("id", "current-symbol");
    var liDate = $("<div>").text(data.from).attr("id", "current-date");
    var liOpen = $("<div>").text("Open: $" + data.open).attr("id", "current-open");
    var liHigh = $("<div>").text("High: $" + data.high).attr("id", "current-high");
    var liLow = $("<div>").text("Low: $" + data.low).attr("id", "current-low");
    var liClose = $("<div>").text("Close: $" + data.close).attr("id", "current-close");
    // FORMAT!!!
    var liVolume = $("<div>").text(data.volume);
    $("#current").append(liTicker);
    $("#current").append(liDate);
    $("#current").append(liOpen);
    $("#current").append(liHigh);
    $("#current").append(liLow);
    $("#current").append(liClose);
    $("#current").append(liVolume);

    // Append to recent searches
    // var liTickerBtn = $("<button>").text(data.symbol);
    // $("#recent-stock-list").append(liTickerBtn);

    // If ANY of the list elements in recent searches list contains the symbol
    // Do NOT place a new button
    // Else DO place a new button

    var index = 0;

    for (let i = 0; i < $("#recent-stock-list").children().length; i++) {
        if ($("#recent-stock-list").children().eq(i).text() == data.symbol) {
            index++;
        };
    };

    if (index === 0) {
        var liTickerBtn = $("<button>").text(data.symbol);
        $("#recent-stock-list").append(liTickerBtn);
    };

    


    // Show related stocks in related stocks section
    // Probably use for loop to go through datahub.io dataset for matching sectors
    // Or use getSymbolsMatchingSector() function

    var sectorName = $("#related-title").children().eq(0).text();
    var sectorStocks = $("#sectorStocks");

    for (let i = 0; i < dataSet.length; i++) {
        if (dataSet[i].Sector == sectorName) {
            console.log(dataSet[i].Name);
            var sectorStockBtn = $("<button>").text(dataSet[i].Name + " - " + dataSet[i].Symbol);
            sectorStocks.append(sectorStockBtn);
        }
    }


};

// Function to clear page and reset to default values upon update of page information
function clearPage() {
    searchInputEl.text("Search");
    $("#current").text("");
    if (relatedTitleEl.children().length > 0) {
        relatedTitleEl.children().empty();
    };
};

async function init () {
    // If localstorage getitem (key) returns undefined,
    // Call getsp500data function
    // otherwise it's ready to be used
    if (!localStorage.getItem("sp500Data")) {
        sp500Data =  await getSP500Data();
        localStorage.setItem("sp500Data", JSON.stringify(sp500Data));
        console.log("Stored S&P Data in Local Storage");
    }
    autoCompleteOptions = getAutoCompleteOptions()



    // var searchResults = getSymbolsMatchingSector('Industrials', sp500Data);
    // var stockData = {
    //     exp: Date.now() + (300 * 1000),
    //     data: sp500Data
    // }

    // for (let symbol of searchResults) {

    //     var stockData = await getStockDataBySymbol(symbol);
    //     // rate limited 5 requests / min
    //     console.log(stockData); 
    // }

};

// USER INTERACTION
// User inputs stock or sector name and presses “Search”
searchButtonEl.on("click", async function(event) {
    event.preventDefault();
    clearPage();
    console.log(searchInputEl.val());
    var symbol = searchInputEl.val().split(" - ")[0];
    var data = await getStockDataBySymbol(symbol);
    console.log("Symbol");
    showStockData(data);
});

init();

$( function() {
    $( "#stock-name" ).autocomplete({
      source: autoCompleteOptions
    });
  } );

$("#recent-stock-list").on("click", "button", async function(event) {
    event.preventDefault();
    clearPage();
    var symbol = $(event.target).text();
    var data = await getStockDataBySymbol(symbol);
    console.log("Symbol");
    showStockData(data);
});

// RELATEDSTOCKS.on("click", function(event){
//     showStockData(event);
// });
// INITIALIZATION

