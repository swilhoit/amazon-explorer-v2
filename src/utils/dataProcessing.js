export const processData = (csvData) => {
    console.log('ProcessData - Input:', csvData);

    if (!Array.isArray(csvData) || csvData.length === 0) {
        console.error('ProcessData - Invalid input: csvData is not an array or is empty');
        return [];
    }

    const processedData = csvData.map((row, index) => {
        if (typeof row !== 'object' || row === null) {
            console.error(`ProcessData - Invalid row at index ${index}:`, row);
            return null;
        }

        let sales = 0;
        if (row['Sales'] && typeof row['Sales'] === 'string') {
            sales = parseInt(row['Sales'].replace(/,/g, ''), 10);
        } else if (typeof row['Sales'] === 'number') {
            sales = row['Sales'];
        }

        let revenue = 0;
        if (row['Revenue'] && typeof row['Revenue'] === 'string') {
            revenue = Math.round(parseFloat(row['Revenue'].replace(/[,$]/g, '')));
        } else if (typeof row['Revenue'] === 'number') {
            revenue = Math.round(row['Revenue']);
        }

        if (revenue > 0 && sales === 0) {
            const price = parseFloat(row['Price  $']) || 0;
            if (price > 0) {
                sales = Math.round(revenue / price);
            }
        }

        return {
            asin: row['ASIN'] || '',
            title: row['Product Details'] || '',
            brand: row['Brand'] || '',
            price: parseFloat(row['Price  $']) || 0,
            reviews: parseInt(row['Review Count']) || 0,
            rating: parseFloat(row['Ratings']) || 0,
            sales: isNaN(sales) ? 0 : sales,
            revenue: isNaN(revenue) ? 0 : revenue,
            sellerCountry: row['Seller Country/Region'] || '',
            fulfillment: row['Fulfillment'] || '',
            dateFirstAvailable: row['Creation Date'] || '',
            category: row['Category'] || '',
            imageUrl: row['Image URL'] || '',
            amazonUrl: row['URL'] || '',
            attributes: row['Attributes'] || [],
            featureBullets: row['Feature Bullets'] || []
        };
    }).filter(item => item !== null);

    if (processedData.length === 0) {
        console.error('ProcessData - All rows were invalid');
        return [];
    }

    const totalSales = processedData.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = processedData.reduce((sum, item) => sum + item.revenue, 0);

    const finalData = processedData.map(item => ({
        ...item,
        percentOfTotalSales: totalSales ? ((item.sales / totalSales) * 100).toFixed(2) : '0.00',
        percentOfTotalRevenue: totalRevenue ? ((item.revenue / totalRevenue) * 100).toFixed(2) : '0.00',
    }));

    console.log('ProcessData - Output:', finalData);
    return finalData;
};

export const updateSummary = (data) => {
    console.log('UpdateSummary - Input:', data);

    if (!Array.isArray(data) || data.length === 0) {
        console.error('UpdateSummary - Invalid input: data is not an array or is empty');
        return null;
    }

    const totalSales = data.reduce((sum, item) => sum + (parseFloat(item.sales) || 0), 0);
    const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
    const totalPrice = data.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const totalReviews = data.reduce((sum, item) => sum + (parseInt(item.reviews) || 0), 0);

    const averagePrice = data.length > 0 ? (totalPrice / data.length).toFixed(2) : '0.00';
    const averageReviews = data.length > 0 ? Math.round(totalReviews / data.length) : 0;

    const summary = {
        asin: "Summary",
        title: "",
        brand: "",
        price: `$${averagePrice}`,
        reviews: averageReviews.toString(),
        rating: "",
        sales: Math.round(totalSales),
        percentOfTotalSales: "100.00",
        revenue: Math.round(totalRevenue),
        percentOfTotalRevenue: "100.00",
        category: "",
        imageUrl: "",
        sellerCountry: "",
        fulfillment: "",
        dateFirstAvailable: "",
    };

    console.log('UpdateSummary - Output:', summary);
    return summary;
};

export const getPriceSegments = (data, increment, summaryData) => {
    console.log('GetPriceSegments - Input:', { data, increment, summaryData });

    if (!Array.isArray(data) || data.length === 0) {
        console.error('GetPriceSegments - Invalid input: data is not an array or is empty');
        return [];
    }

    const maxPrice = Math.max(...data.map(item => parseFloat(item.price) || 0));
    const segments = [];

    const totalSalesValue = summaryData?.sales || 0;
    const totalRevenueValue = summaryData?.revenue || 0;

    for (let i = 0; i <= maxPrice; i += increment) {
        const segmentItems = data.filter(item => {
            const price = parseFloat(item.price) || 0;
            return price > i && price <= i + increment;
        });

        if (segmentItems.length === 0) continue;

        const totalSales = segmentItems.reduce((sum, item) => sum + (parseFloat(item.sales) || 0), 0);
        const totalRevenue = segmentItems.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);

        const avgPrice = (segmentItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0) / segmentItems.length).toFixed(2);

        segments.push({
            title: `$${i} - $${i + increment}`,
            items: segmentItems,
            price: `$${avgPrice}`,
            reviews: segmentItems.reduce((sum, item) => sum + (parseInt(item.reviews) || 0), 0),
            sales: Math.round(totalSales),
            revenue: Math.round(totalRevenue),
            percentOfTotalSales: totalSalesValue ? ((totalSales / totalSalesValue) * 100).toFixed(2) + '%' : '0%',
            percentOfTotalRevenue: totalRevenueValue ? ((totalRevenue / totalRevenueValue) * 100).toFixed(2) + '%' : '0%',
            productCount: segmentItems.length
        });
    }

    console.log('GetPriceSegments - Output:', segments);
    return segments;
};

export const formatNumberWithCommas = (number) => {
    if (typeof number === 'number') {
        return Math.round(number).toLocaleString('en-US');
    }
    return number;
};
