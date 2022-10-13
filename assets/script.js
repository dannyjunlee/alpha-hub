// DEPENDENCIES
// API - Polygon.io (for stock data)
// var polygonURL = "https://api.polygon.io/v1/open-close/AAPL/2022-10-11?adjusted=true&apiKey=2MYBRhMYEstgP3SY5prEcQsMFsRc40TO"
// API - SerpAPI (for Google Trends)

var searchInputEl = $("#stock-name");
var searchButtonEl = $(".pure-button");
var recentSearchListEl = $("#recent-stock-list");
var relatedTitleEl = $("#related-title");

// DATA
var sp500Data;
var autoCompleteOptions;
var apiKey = "AQ18hJwsyCswiT1OwSOmu0_nFzBv6NuQ";
var savedSearches = JSON.parse(localStorage.getItem("savedSearches")) || [];

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

console.log(("0" + (lastWeekDay.getMonth()+1)).slice(-2));

lastWeekDay = 
    lastWeekDay.getFullYear() + "-" + 
    ("0" + (lastWeekDay.getMonth()+1)).slice(-2) + "-" +
    ("0" + lastWeekDay.getDate()).slice(-2);

// FUNCTION

    // Get the S&P500 Data from Datahub.io
async function getSP500Data() {
    var datahubURL = "https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/297344d8dc0a9d86b8d107449c851cc8/constituents_json.json"

    var response = await fetch(datahubURL);
    return await response.json();
    
};

    // Dropdown shows possible options to select from
function getAutoCompleteOptions() {
    var sp500Data = JSON.parse(localStorage.getItem("sp500Data"));
    var options = [];
    for (var i = 0; i < sp500Data.length; i++) {
        options.push(sp500Data[i].Symbol + " - " + sp500Data[i].Name);
    }
    return options;
};


    // Taking sector searched and returning other data with same sector
function getSymbolsMatchingSector(searchSector, sp500Data) {
    console.log(searchSector, sp500Data);
    var matches = [];
    for (var i = 0; i < sp500Data.length; i++) {
        if (sp500Data[i].Sector === searchSector) {
            matches.push(sp500Data[i].Symbol);
        }
    }
    return matches;
};

    // function that takes in a stock symbol, makes a fetch call to polygon API, and returns data on that stock
async function getStockDataBySymbol(symbol) {
    // Make sure date will update dynamically too
    var polygonURL = "https://api.polygon.io/v1/open-close/" + symbol.toUpperCase() + "/" + lastWeekDay + "?adjusted=true&apiKey=" + apiKey;


    var response = await fetch(polygonURL);
    var data = await response.json();
    console.log(data);
    return data;
};

    // Displays stock data on page
function showStockData(data) {
    console.log(data.status)
    if (data.status === "OK") {
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
        var liVolume = $("<div>").text(data.volume);
        $("#current").append(liTicker);
        $("#current").append(liDate);
        $("#current").append(liOpen);
        $("#current").append(liHigh);
        $("#current").append(liLow);
        $("#current").append(liClose);
        $("#current").append(liVolume);

        var index = 0;

        for (let i = 0; i < $("#recent-stock-list").children().length; i++) {
            if ($("#recent-stock-list").children().eq(i).text() == data.symbol) {
                index++;
            };
        };

        if (index === 0) {
            var liTickerBtn = $("<button>").text(data.symbol);
            $("#recent-stock-list").append(liTickerBtn);
            savedSearches.push(data.symbol);
            localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
        };

        var sectorName = $("#related-title").children().eq(0).text();
        var sectorStocks = $("#sectorStocks");
    
        for (let i = 0; i < dataSet.length; i++) {
            if (dataSet[i].Sector == sectorName) {
                console.log(dataSet[i].Name);
                var sectorStockBtn = $("<button>").text(dataSet[i].Name + " - " + dataSet[i].Symbol);
                sectorStocks.append(sectorStockBtn);
            }
        };
    } else{
            $("#current").append("<h2>Invalid Stock</h2>").attr("id", "invalid-stock");
        }
};

    // Render saved searches from localStorage to recent searches section
function renderSearches() {
    recentSearchListEl.children().text("");
    for (let i = 0; i < savedSearches.length; i++) {
        var savedStock = $("<button>").text(savedSearches[i]);
        recentSearchListEl.append(savedStock);

        // var liTickerBtn = $("<button>").text(data.symbol);
        // $("#recent-stock-list").append(liTickerBtn);
    };
};

    // Function to clear page and reset to default values upon update of page information
function clearPage() {
    searchInputEl.text("Search");
    $("#current").text("");
    if (relatedTitleEl.children().length > 0) {
        relatedTitleEl.children().empty();
    };
};

    // Init to run on page load
async function init () {
    if (!localStorage.getItem("sp500Data")) {
        sp500Data =  await getSP500Data();
        localStorage.setItem("sp500Data", JSON.stringify(sp500Data));
        console.log("Stored S&P Data in Local Storage");
    }
    renderSearches();
    autoCompleteOptions = getAutoCompleteOptions()
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

    // Autocomplete dropdown menu
$( function() {
    $( "#stock-name" ).autocomplete({
      source: autoCompleteOptions
    });
  } );

    // User clicks on a button on recent search list
recentSearchListEl.on("click", "button", async function(event) {
    event.preventDefault();
    clearPage();
    var symbol = $(event.target).text();
    var data = await getStockDataBySymbol(symbol);
    console.log("Symbol");
    showStockData(data);
});

    // User clicks on related stocks to show info on page
// $("#sectorStocks").on("click", "button", async function(event) {
//     event.preventDefault();
//     clearPage();
//     var symbolIndex = $(event.target).val().split(" - ");
//     var symbol = symbolIndex[1];
//     var data = await getStockDataBySymbol(symbol);
//     console.log("Symbol");
//     showStockData(data);
// });

// INITIALIZATION
init();