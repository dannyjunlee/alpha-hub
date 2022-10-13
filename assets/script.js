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
async function getSP500Data() {
    var datahubURL = "https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/297344d8dc0a9d86b8d107449c851cc8/constituents_json.json"

    var response = await fetch(datahubURL);
    return await response.json();
    
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
    var polygonURL = "https://api.polygon.io/v1/open-close/" + symbol + "/2022-10-12?adjusted=true&apiKey=2hADQm8N9VGyKk1VcGYJfubevX9k2BHY"


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
        }
    }
    var stockTicker = $("<div>").text("Symbol: " + data.symbol).attr("id", "current-symbol");
    var stockDate = $("<div>").text(data.from).attr("id", "current-date");
    var stockOpen = $("<div>").text("Open: $" + data.open).attr("id", "current-open");
    var stockHigh = $("<div>").text("High: $" + data.high).attr("id", "current-high");
    var stockLow = $("<div>").text("Low: $" + data.low).attr("id", "current-low");
    var stockClose = $("<div>").text("Close: $" + data.close).attr("id", "current-close");
    // FORMAT!!!
    var stockVolume = $("<div>").text(data.volume);
    $("#current").append(stockTicker);
    $("#current").append(stockDate);
    $("#current").append(stockOpen);
    $("#current").append(stockHigh);
    $("#current").append(stockLow);
    $("#current").append(stockClose);
    $("#current").append(stockVolume);

    // Append to recent searches
    var recentTickerBtn = $("<li>").text(data.symbol);
    recentSearchListEl.append(recentTickerBtn);

    // Show related stocks in related stocks section
    // Probably use for loop to go through datahub.io dataset for matching sectors
    // Or use getSymbolsMatchingSector() function
};

// Function to clear page and reset to default values upon update of page information
function clearPage() {
    searchInputEl.text("Search");
}

async function init () {
    // If localstorage getitem (key) returns undefined,
    // Call getsp500data function
    // otherwise it's ready to be used
    var sp500Data =  await getSP500Data();
    localStorage.setItem("sp500Data", JSON.stringify(sp500Data));
    console.log(sp500Data);

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
    console.log(searchInputEl.val());
    var symbol = searchInputEl.val();
    var data = await getStockDataBySymbol(symbol);
    console.log("Symbol");
    showStockData(data);
});

// INITIALIZATION
init();

