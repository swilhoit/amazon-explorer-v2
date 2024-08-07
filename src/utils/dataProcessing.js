// Utility function for formatting numbers with commas
export const formatNumberWithCommas = (number) => {
    if (typeof number === 'number') {
        return Math.round(number).toLocaleString('en-US');
    }
    return number;
};

export const processData = (inputData) => {
    console.log('ProcessData - Input:', inputData);

    if (!Array.isArray(inputData) || inputData.length === 0) {
        console.error('ProcessData - Invalid input: inputData is not an array or is empty');
        return [];
    }

    const isJungleScoutData = inputData[0] && 'attributes' in inputData[0];

    const processedData = inputData.map((item, index) => {
        if (typeof item !== 'object' || item === null) {
            console.error(`ProcessData - Invalid item at index ${index}:`, item);
            return null;
        }

        if (isJungleScoutData) {
            return processJungleScoutItem(item);
        } else {
            return processCSVItem(item);
        }
    }).filter(item => item !== null);

    if (processedData.length === 0) {
        console.error('ProcessData - All items were invalid');
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

const processJungleScoutItem = (item) => {
    const attributes = item.attributes;
    return {
        asin: item.id.replace('us/', ''),
        title: attributes.title || '',
        brand: attributes.brand || '',
        price: parseFloat(attributes.price || 0),
        reviews: parseInt(attributes.reviews || 0),
        rating: parseFloat(attributes.rating || 0),
        sales: parseInt(attributes.approximate_30_day_units_sold || 0),
        revenue: Math.round(parseFloat(attributes.approximate_30_day_revenue || 0)),
        sellerCountry: attributes.seller_country || '',
        fulfillment: attributes.fulfillment || '',
        dateFirstAvailable: attributes.date_first_available || '',
        category: attributes.category || '',
        imageUrl: attributes.image_url || '',
        amazonUrl: `https://www.amazon.com/dp/${item.id.replace('us/', '')}`,
        attributes: attributes.attributes || [],
        featureBullets: attributes.feature_bullets || []
    };
};

const processCSVItem = (row) => {
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

    const totalSalesValue = parseFloat(summaryData?.sales) || 0;
    const totalRevenueValue = parseFloat(summaryData?.revenue) || 0;

    for (let i = 0; i <= maxPrice; i += increment) {
        const segmentItems = data.filter(item => {
            const price = parseFloat(item.price) || 0;
            return price > i && price <= i + increment;
        });

        if (segmentItems.length === 0) continue;

        const totalSales = segmentItems.reduce((sum, item) => sum + (parseFloat(item.sales) || 0), 0);
        const totalRevenue = segmentItems.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
        const totalReviews = segmentItems.reduce((sum, item) => sum + (parseInt(item.reviews) || 0), 0);

        const avgPrice = (segmentItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0) / segmentItems.length).toFixed(2);

        segments.push({
            title: `$${i} - $${i + increment}`,
            items: segmentItems,
            averagePrice: parseFloat(avgPrice),
            reviews: totalReviews,
            sales: Math.round(totalSales),
            revenue: Math.round(totalRevenue),
            percentOfTotalSales: totalSalesValue ? ((totalSales / totalSalesValue) * 100) : 0,
            percentOfTotalRevenue: totalRevenueValue ? ((totalRevenue / totalRevenueValue) * 100) : 0,
            productCount: segmentItems.length
        });
    }

    console.log('GetPriceSegments - Output:', segments);
    return segments;
};
