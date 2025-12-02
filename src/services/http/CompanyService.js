/**
 * Service to handle company data fetching.
 */
export const CompanyService = {
    searchCompanies: async (query) => {
        if (!query) return [];

        try {
            // corsproxy.io should be good enough for now.
            // Maybe I can have a back-end service to handle the fetch in the future.
            const response = await fetch(`https://corsproxy.io/?https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.quotes) {
                return data.quotes
                    .filter(quote => quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF')
                    .map(quote => ({
                        symbol: quote.symbol,
                        name: quote.shortname || quote.longname || quote.symbol
                    }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching companies:", error);
            return [];
        }
    }
};
