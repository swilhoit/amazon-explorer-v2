export const processData = (csvData) => {
    return csvData.map(row => {
        const salesString = row['Sales'] && typeof row['Sales'] === 'string' ? row['Sales'] : '0';
        const sales = parseInt(salesString.replace(/,/g, ''));

        const revenueString = row['Revenue'] && typeof row['Revenue'] === 'string' ? row['Revenue'] : '0';
        const revenue = parseFloat(revenueString.replace(/,/g, ''));

        return {
            asin: row['ASIN'] || '',
            title: row['Product Details'] || '',
            brand: row['Brand'] || '',
            price: parseFloat(row['Price  $']) || 0,
            reviews: parseInt(row['Review Count']) || 0,
            rating: parseFloat(row['Ratings']) || 0,
            sales: isNaN(sales) ? 0 : sales,
            percentOfTotalSales: '', // Calculate if needed
            revenue: isNaN(revenue) ? 0 : revenue,
            percentOfTotalRevenue: '', // Calculate if needed
            sellerType: row['Seller Country/Region'] || '', // Adjust if needed
            dateFirstAvailable: row['Creation Date'] || '',
            category: row['Category'] || '',
            imageUrl: row['Image URL'] || '',
            amazonUrl: row['URL'] || ''
        };
    });
};





export const updateSummary = (data) => {
    const totalSales = data.reduce((sum, item) => sum + (parseFloat(item.sales) || 0), 0);
    const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
    const totalPrice = data.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const totalReviews = data.reduce((sum, item) => sum + (parseInt(item.reviews) || 0), 0);

    const averagePrice = data.length > 0 ? (totalPrice / data.length).toFixed(2) : '0.00';
    const averageReviews = data.length > 0 ? Math.round(totalReviews / data.length) : 0;

    return {
        asin: "Summary",
        title: "",
        brand: "",
        price: `$${averagePrice}`,
        reviews: averageReviews.toString(),
        rating: "",
        category: "",
        sales: totalSales.toLocaleString(),
        percentOfTotalSales: "100%",
        revenue: `$${totalRevenue.toFixed(2)}`,
        percentOfTotalRevenue: "100%",
        imageUrl: "",
        sellerType: "",
        dateFirstAvailable: "",
    };
};

export const getPriceSegments = (data, increment, summaryData) => {
    const maxPrice = Math.max(...data.map(item => parseFloat(item.price) || 0));
    const segments = [];

    const totalSalesValue = typeof summaryData?.sales === 'string' 
        ? parseFloat(summaryData.sales.replace(/,/g, '')) 
        : (typeof summaryData?.sales === 'number' ? summaryData.sales : 0);

    const totalRevenueValue = typeof summaryData?.revenue === 'string' 
        ? parseFloat(summaryData.revenue.replace(/[,$]/g, ''))
        : (typeof summaryData?.revenue === 'number' ? summaryData.revenue : 0);

    for (let i = 0; i <= maxPrice; i += increment) {
        const segmentItems = data.filter(item => {
            const price = parseFloat(item.price) || 0;
            return price > i && price <= i + increment;
        });

        // Skip segments with 0 products
        if (segmentItems.length === 0) continue;

        const totalSales = segmentItems.reduce((sum, item) => sum + (parseFloat(item.sales) || 0), 0);
        const totalRevenue = segmentItems.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);

        const avgPrice = (segmentItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0) / segmentItems.length).toFixed(2);

        segments.push({
            title: `$${i} - $${i + increment}`,
            items: segmentItems,
            price: `$${avgPrice}`,
            reviews: segmentItems.reduce((sum, item) => sum + (parseInt(item.reviews) || 0), 0),
            sales: totalSales.toLocaleString(),
            revenue: `$${totalRevenue.toFixed(2)}`,
            percentOfTotalSales: totalSalesValue ? ((totalSales / totalSalesValue) * 100).toFixed(2) + '%' : '0%',
            percentOfTotalRevenue: totalRevenueValue ? ((totalRevenue / totalRevenueValue) * 100).toFixed(2) + '%' : '0%',
            productCount: segmentItems.length // Add product count
        });
    }

    return segments;
};