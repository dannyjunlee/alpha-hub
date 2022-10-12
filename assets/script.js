// DEPENDENCIES
	// APIs: Polygon.io (for stock data) and SerpAPI (for Google Trends)

// DATA
	// Datahub.io JSON - list of all stocks in S&P 500 with stock name, ticker, and sector

// FORMULA
	// Fetch stock/sector data from Datahub.io JSON
	// If it is single stock name/ticker, use Polygon.io API to retrieve stock data
	// Use SerpAPI to get investor sentiment on the stock/sector
	// Save search to local storage and append as re-searchable list item underneath search

    // USER INTERACTIONS
        // User inputs stock or sector name and presses “Search”
    
    // INITIALIZATION
    