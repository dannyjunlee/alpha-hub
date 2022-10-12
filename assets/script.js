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

// FORMULA
// Fetch stock/sector data from Datahub.io JSON
// If it is single stock name/ticker, use Polygon.io API to retrieve stock data
// Use SerpAPI to get investor sentiment on the stock/sector
// Save search to local storage and append as re-searchable list item underneath search

// USER INTERACTIONS
// User inputs stock or sector name and presses “Search”

// INITIALIZATION

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
    var polygonURL = "https://api.polygon.io/v1/open-close/" + symbol + "/2022-10-11?adjusted=true&apiKey=2MYBRhMYEstgP3SY5prEcQsMFsRc40TO"


    var response = await fetch(polygonURL);
    var data = await response.json();
    return data;
}

async function init () {

    var sp500Data =  await getSP500Data();
    // console.log(sp500Data);

    var searchResults = getSymbolsMatchingSector('Industrials', sp500Data);
    var stockData = {
        exp: Date.now() + (300 * 1000),
        data: sp500Data
    }

    for (let symbol of searchResults) {

        var stockData = await getStockDataBySymbol(symbol);
        // rate limited 5 requests / min
        console.log(stockData); 
    }
}

init();