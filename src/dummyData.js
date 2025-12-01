// Will remove this after I add new trade functionality and persist to at least local storage
export const positions = [
    {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'Covered Call',
        sellDate: '2025-11-05',
        expirationDate: '2025-12-17',
        priceSold: 1.45,
        strikePrice: 180
    },
    {
        id: 2,
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        type: 'Short Put',
        sellDate: '2023-10-20',
        expirationDate: '2023-11-03',
        priceSold: 3.20,
        strikePrice: 210
    },
    {
        id: 3,
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        type: 'Covered Call',
        sellDate: '2023-10-27',
        expirationDate: '2023-11-10',
        priceSold: 0.85,
        strikePrice: 105
    },
    {
        id: 4,
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        type: 'Covered Call',
        sellDate: '2023-10-27',
        expirationDate: '2023-11-10',
        priceSold: 0.85,
        strikePrice: 105
    },
    {
        id: 5,
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        type: 'Covered Call',
        sellDate: '2023-10-27',
        expirationDate: '2023-11-10',
        priceSold: 0.85,
        strikePrice: 105
    }
];

export const companies = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'META', name: 'Meta Platforms, Inc.' },
    { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.' },
    { symbol: 'NFLX', name: 'Netflix, Inc.' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'PYPL', name: 'PayPal Holdings, Inc.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'CRM', name: 'Salesforce, Inc.' },
    { symbol: 'CSCO', name: 'Cisco Systems, Inc.' },
    { symbol: 'PEP', name: 'PepsiCo, Inc.' },
    { symbol: 'KO', name: 'The Coca-Cola Company' },
    { symbol: 'DIS', name: 'The Walt Disney Company' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' }
];