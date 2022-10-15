// DEPENDENCIES
var searchInputEl = $("#stock-name");
var searchButtonEl = $(".pure-button");
var recentSearchListEl = $("#recent-stock-list");
var relatedTitleEl = $("#related-title");
var relatedStockListEl = $("#related-button");
var clearSearchesButtonEl = $("#clear-recent-searches");
var sectorStocks = $("#sectorStocks");

// DATA
var sp500Data;
var autoCompleteOptions;
var apiKey = "t33n_NZY1eavOu1OUlaDcqDNrKdKQLS2";
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
    var matches = [];
    for (var i = 0; i < sp500Data.length; i++) {
        if (sp500Data[i].Sector === searchSector) {
            matches.push(sp500Data[i].Symbol);
        }
    }
    return matches;
};

    // Function that takes in a stock symbol, makes a fetch call to polygon API, and returns data on that stock
async function getStockDataBySymbol(symbol) {
    var polygonURL = "https://api.polygon.io/v1/open-close/" + symbol.toUpperCase() + "/" + lastWeekDay + "?adjusted=true&apiKey=" + apiKey;

    var response = await fetch(polygonURL);
    var data = await response.json();
    return data;
};

    // Displays stock data on page
function showStockData(data) {
    // if (data.status === "OK") {
        var dataSet = JSON.parse(localStorage.getItem("sp500Data"));
        var sectorName;
        for (let i = 0; i < dataSet.length; i++) {
            if (data.symbol == dataSet[i].Symbol) {
                $("#current").append($("<div>").text(dataSet[i].Name).attr("id", "current-name"));
                sectorName = dataSet[i].Sector;
                $("#related-title").append($("<div>").text(sectorName).attr("id", "sector"));
            };
        };
        var date = $("<div>").text(data.from).attr("id", "current-date");
        var ticker = $("<div>").text("Symbol: " + data.symbol).attr("id", "current-symbol");
        var open = $("<div>").text("Open: $" + data.open).attr("id", "current-open");
        var high = $("<div>").text("High: $" + data.high).attr("id", "current-high");
        var low = $("<div>").text("Low: $" + data.low).attr("id", "current-low");
        var close = $("<div>").text("Close: $" + data.close).attr("id", "current-close");
        var volume = $("<div>").text(data.volume.toLocaleString()).attr("id", "current-volume");

        console.log(data.from);
        console.log(sectorName);

        $("#current").append(date);
        $("#current").append(ticker);
        $("#current").append(open);
        $("#current").append(high);
        $("#current").append(low);
        $("#current").append(close);
        $("#current").append(volume);

        var index = 0;

        for (let i = 0; i < recentSearchListEl.children().length; i++) {
            if (recentSearchListEl.children().eq(i).text() == data.symbol) {
                index++;
            };
        };

        if (index === 0) {
            var tickerBtn = $("<button>").text(data.symbol);
            recentSearchListEl.append(tickerBtn);
            savedSearches.push(data.symbol);
            localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
        };
    
        for (let i = 0; i < dataSet.length; i++) {
            if (dataSet[i].Sector == sectorName) {
                var sectorStockBtn = $("<button>").text(dataSet[i].Name + " - " + dataSet[i].Symbol).attr("id", "related-button");
                sectorStocks.append(sectorStockBtn);
            };
        };

    // } else {
    //     clearPage();
    //     $("#current").append("<div>Invalid Stock - Please Choose From the Autocomplete List</div>").attr("id", "invalid-stock");
    //     };
};

    // Render saved searches from localStorage to recent searches section
function renderSearches() {
    recentSearchListEl.children().text("");
    for (let i = 0; i < savedSearches.length; i++) {
        var savedStock = $("<button>").text(savedSearches[i]);
        recentSearchListEl.append(savedStock);
    };
};

    // Function to clear page and reset to default values upon update of page information
function clearPage() {
    searchInputEl.text("Search");
    $("#current").text("");
    $("#invalid-stock").text("");
    if (relatedTitleEl.children().length > 0) {
        relatedTitleEl.children().empty();
    };
    sectorStocks.empty();
};

    // Init to run on page load
async function init () {
    if (!localStorage.getItem("sp500Data")) {
        sp500Data =  await getSP500Data();
        localStorage.setItem("sp500Data", JSON.stringify(sp500Data));
    }
    renderSearches();
    autoCompleteOptions = getAutoCompleteOptions()
};

// USER INTERACTION
    // User inputs stock or sector name and presses “Search”
searchButtonEl.on("click", async function(event) {
    event.preventDefault();
    clearPage();
    var symbol = searchInputEl.val().split(" - ")[0];
    var data = await getStockDataBySymbol(symbol);
    // Changes
    if (data.status == "OK") {
        console.log(data.status);
        showStockData(data);
    } else {
        console.log(data.status);
        var invalidMsg = $("<div>").text("Invalid Stock - Please Choose From the Autocomplete List").attr("id", "invalid-stock");
        $("#current").append($(invalidMsg));
    };
});

    // Autocomplete dropdown menu
$( function() {
    $( "#stock-name" ).autocomplete({
      source: autoCompleteOptions
    });
});

    // User clicks on a button on recent search list
recentSearchListEl.on("click", "button", async function(event) {
    event.preventDefault();
    clearPage();
    var symbol = $(event.target).text();
    var data = await getStockDataBySymbol(symbol);
    showStockData(data);
});

    // User clicks on related stocks to show info on page
sectorStocks.on("click", "button", async function(event) {
    event.preventDefault();
    clearPage();
    var symbolIndex = $(event.target).text().split(" - ");
    var symbol = symbolIndex[1].trim();
    var data = await getStockDataBySymbol(symbol);
    showStockData(data);
});

clearSearchesButtonEl.on("click", async function(event) {
    event.preventDefault();
    localStorage.removeItem("savedSearches");
    savedSearches = [];
    recentSearchListEl.empty();
})


// INITIALIZATION
init();