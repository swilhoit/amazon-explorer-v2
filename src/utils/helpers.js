export const formatPrice = (price) => {
    return price > 0 ? `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : 'N/A';
};

export const formatNumber = (number) => {
    return number > 0 ? number.toLocaleString() : '0';
};

export const formatPercent = (percent) => {
    return percent > 0 ? `${percent.toFixed(2)}%` : '0.00%';
};