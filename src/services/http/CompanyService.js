/**
 * Service to handle company data fetching.
 */
export const CompanyService = {
    searchCompanies: async (query) => {
        if (!query) return [];

        try {
            // Reverting to corsproxy.io and query1 as requested
            const response = await fetch(`https://corsproxy.io/?https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error(`Search failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Company search response:", data);

            if (data.quotes) {
                const results = data.quotes
                    .filter(quote => quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF')
                    .map(quote => ({
                        symbol: quote.symbol,
                        name: quote.shortname || quote.longname || quote.symbol
                    }));
                console.log("Filtered results:", results);
                return results;
            }
            return [];
        } catch (error) {
            console.error("Error fetching companies:", error);
            return [];
        }
    },

    getQuote: async (symbol) => {
        if (!symbol) return null;

        try {
            const response = await fetch(`https://corsproxy.io/?https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`);
            const data = await response.json();

            if (data.chart && data.chart.result && data.chart.result.length > 0) {
                const meta = data.chart.result[0].meta;
                return {
                    regularMarketPrice: meta.regularMarketPrice
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching quote:", error);
            return null;
        }
    }
};
