import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper, Grid, Slider, Switch, FormControlLabel, Tooltip } from '@mui/material';

class AmazonPPCCalculator {
  constructor(initialData = {}) {
    this.data = {
      clickShare: 50,
      organicShare: 50,
      sourcePrice: 50,
      listPrice: 100,
      fees: 10,
      totalSearchVolume: 1492850,
      averageSearchConversionRate: 0.51,
      averageCPC: 0.52,
      clickThroughRate: 25.99,
      moq: 100,
      ...initialData
    };
  }

  calculateMetrics(isMonthly = false, useClickCount = false) {
    const {
      clickShare,
      organicShare,
      sourcePrice,
      listPrice,
      fees,
      totalSearchVolume,
      averageSearchConversionRate,
      averageCPC,
      clickThroughRate,
      moq
    } = this.data;

    let clickShareDecimal;
    if (useClickCount) {
      const totalClicks = totalSearchVolume * (clickThroughRate / 100);
      clickShareDecimal = clickShare / totalClicks;
    } else {
      clickShareDecimal = clickShare / 100;
    }

    const organicShareDecimal = organicShare / 100;
    const conversionRateDecimal = averageSearchConversionRate / 100;
    const clickThroughRateDecimal = clickThroughRate / 100;

    const totalClicks = totalSearchVolume * clickThroughRateDecimal;
    const totalOrders = totalSearchVolume * conversionRateDecimal;
    
    const paidOrders = totalOrders * clickShareDecimal;
    const organicOrders = totalOrders * organicShareDecimal;

    const paidRevenue = listPrice * paidOrders;
    const organicRevenue = listPrice * organicOrders;
    const totalRevenue = paidRevenue + organicRevenue;

    const totalAdSpend = totalClicks * clickShareDecimal * averageCPC;
    const totalLandingCost = (sourcePrice + fees) * (paidOrders + organicOrders);
    
    const totalProfit = totalRevenue - (totalLandingCost + totalAdSpend);
    const roi = (totalRevenue > 0) ? (totalProfit / (totalLandingCost + totalAdSpend)) * 100 : 0;
    const costPerPPCConversion = paidOrders > 0 ? totalAdSpend / paidOrders : 0;
    const profitPerOrganicSale = listPrice - (sourcePrice + fees);
    const tacos = totalRevenue > 0 ? (totalAdSpend / totalRevenue) * 100 : 0;
    const startupCost = moq * sourcePrice;

    const divisor = isMonthly ? 12 : 1;

    return {
      revenue: totalRevenue / divisor,
      paidRevenue: paidRevenue / divisor,
      organicRevenue: organicRevenue / divisor,
      totalAdSpend: totalAdSpend / divisor,
      totalLandingCost: totalLandingCost / divisor,
      profit: totalProfit / divisor,
      roi,
      costPerPPCConversion,
      profitPerOrganicSale,
      tacos,
      totalSearchVolume: totalSearchVolume / divisor,
      totalClicks: totalClicks / divisor,
      averageCPC,
      averageSearchConversionRate,
      clickThroughRate,
      totalOrders: (paidOrders + organicOrders) / divisor,
      paidOrders: paidOrders / divisor,
      organicOrders: organicOrders / divisor,
      startupCost,
      clickShare: clickShareDecimal * 100
    };
  }
}

const MetricGroup = ({ title, metrics, getMetricType, getMetricFormula, formatNumber }) => (
  <Box mb={2}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    {metrics.map(([key, value]) => (
      <Tooltip key={key} title={getMetricFormula(key)} arrow>
        <Typography>
          <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>{' '}
          <span style={{
            color: (key === 'roi' || key === 'profit') && value < 0 ? 'red' : 'inherit'
          }}>
            {formatNumber(value, getMetricType(key))}
          </span>
        </Typography>
      </Tooltip>
    ))}
  </Box>
);

const CalculatorComponent = () => {
    const [inputs, setInputs] = useState({
        clickShare: 50,
        organicShare: 50,
        sourcePrice: 50,
        listPrice: 100,
        fees: 10,
        totalSearchVolume: 1492850,
        averageSearchConversionRate: 0.51,
        averageCPC: 0.52,
        clickThroughRate: 25.99,
        moq: 100
    });
    const [metrics, setMetrics] = useState(null);
    const [isMonthly, setIsMonthly] = useState(false);
    const [useClickCount, setUseClickCount] = useState(false);

    useEffect(() => {
        calculateMetrics();
    }, [inputs, isMonthly, useClickCount]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSliderChange = (name) => (event, newValue) => {
        setInputs(prev => ({ ...prev, [name]: newValue }));
    };

    const calculateMetrics = () => {
        try {
            const calculator = new AmazonPPCCalculator(inputs);
            const calculatedMetrics = calculator.calculateMetrics(isMonthly, useClickCount);
            setMetrics(calculatedMetrics);
        } catch (error) {
            console.error("Error calculating metrics:", error);
            setMetrics({ error: "An error occurred while calculating metrics." });
        }
    };

    const formatNumber = (num, type) => {
        if (type === 'currency') {
            return new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
            }).format(num);
        } else if (type === 'percent') {
            return num.toFixed(2) + '%';
        } else if (type === 'integer') {
            return Math.round(num).toLocaleString('en-US');
        } else {
            return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
        }
    };

    const getMetricType = (key) => {
        const percentMetrics = ['roi', 'tacos', 'averageSearchConversionRate', 'clickThroughRate', 'clickShare'];
        const integerMetrics = ['totalSearchVolume', 'totalClicks', 'totalOrders', 'paidOrders', 'organicOrders'];
        const currencyMetrics = ['revenue', 'paidRevenue', 'organicRevenue', 'totalAdSpend', 'totalLandingCost', 'profit', 'costPerPPCConversion', 'profitPerOrganicSale', 'averageCPC', 'startupCost'];

        if (percentMetrics.includes(key)) return 'percent';
        if (integerMetrics.includes(key)) return 'integer';
        if (currencyMetrics.includes(key)) return 'currency';
        return 'number';
    };

    const getMetricFormula = (key) => {
        const formulas = {
            revenue: "Paid Revenue + Organic Revenue",
            paidRevenue: "List Price * Paid Orders",
            organicRevenue: "List Price * Organic Orders",
            totalAdSpend: "Total Clicks * Click Share * Average CPC",
            totalLandingCost: "(Source Price + Fees) * Total Orders",
            profit: "Revenue - (Total Landing Cost + Total Ad Spend)",
            roi: "(Profit / (Total Landing Cost + Total Ad Spend)) * 100",
            costPerPPCConversion: "Total Ad Spend / Paid Orders",
            profitPerOrganicSale: "List Price - (Source Price + Fees)",
            tacos: "(Total Ad Spend / Revenue) * 100",
            totalSearchVolume: "Input value",
            totalClicks: "Total Search Volume * Click-Through Rate",
            averageCPC: "Input value",
            averageSearchConversionRate: "Input value",
            clickThroughRate: "Input value",
            totalOrders: "Total Search Volume * Average Search Conversion Rate",
            paidOrders: "Total Orders * Click Share",
            organicOrders: "Total Orders * Organic Share",
            startupCost: "MOQ * Source Price",
            clickShare: useClickCount ? "Number of Clicks / Total Clicks" : "Input value"
        };
        return formulas[key] || "Formula not available";
    };

    const groupMetrics = (metrics) => {
      if (!metrics) return {};
      
      return {
        revenue: [
          ['revenue', metrics.revenue],
          ['paidRevenue', metrics.paidRevenue],
          ['organicRevenue', metrics.organicRevenue],
        ],
        expenses: [
          ['totalAdSpend', metrics.totalAdSpend],
          ['totalLandingCost', metrics.totalLandingCost],
          ['startupCost', metrics.startupCost],
        ],
        profitability: [
          ['profit', metrics.profit],
          ['roi', metrics.roi],
          ['profitPerOrganicSale', metrics.profitPerOrganicSale],
          ['costPerPPCConversion', metrics.costPerPPCConversion],
          ['tacos', metrics.tacos],
        ],
        performance: [
          ['totalSearchVolume', metrics.totalSearchVolume],
          ['totalClicks', metrics.totalClicks],
          ['totalOrders', metrics.totalOrders],
          ['paidOrders', metrics.paidOrders],
          ['organicOrders', metrics.organicOrders],
          ['averageCPC', metrics.averageCPC],
          ['averageSearchConversionRate', metrics.averageSearchConversionRate],
          ['clickThroughRate', metrics.clickThroughRate],
          ['clickShare', metrics.clickShare],
        ],
      };
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Amazon PPC Calculator
            </Typography>
            <FormControlLabel
                control={<Switch checked={isMonthly} onChange={() => setIsMonthly(!isMonthly)} />}
                label={isMonthly ? "Monthly View" : "Annual View"}
            />
            <FormControlLabel
                control={<Switch checked={useClickCount} onChange={() => setUseClickCount(!useClickCount)} />}
                label={useClickCount ? "Use Click Count" : "Use Click Share %"}
            />
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Inputs</Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography gutterBottom>{useClickCount ? "Number of Clicks" : "Click Share (%)"}</Typography>
                            {useClickCount ? (
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Number of Clicks"
                                    name="clickShare"
                                    type="number"
                                    value={inputs.clickShare}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <Slider
                                    value={inputs.clickShare}
                                    onChange={handleSliderChange('clickShare')}
                                    aria-labelledby="click-share-slider"
                                    valueLabelDisplay="auto"
                                    step={0.1}
                                    marks
                                    min={0}
                                    max={100}
                                />
                            )}
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography gutterBottom>Organic Share: {inputs.organicShare.toFixed(1)}%</Typography>
                            <Slider
                                value={inputs.organicShare}
                                onChange={handleSliderChange('organicShare')}
                                aria-labelledby="organic-share-slider"
                                valueLabelDisplay="auto"
                                step={0.1}
                                marks
                                min={0}
                                max={100}
                            />
                        </Box>
                        <Grid container spacing={2}>
                            {Object.entries(inputs).map(([key, value]) => {
                                if (key !== 'clickShare' && key !== 'organicShare') {
                                    return (
                                        <Grid item xs={6} key={key}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label={`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}${key === 'averageSearchConversionRate' || key === 'clickThroughRate' ? ' (%)' : ''}`}
                                                name={key}
                                                type="number"
                                                value={value}
                                                onChange={handleInputChange}
                                                InputProps={{
                                                    inputProps: { 
                                                        step: key === 'averageSearchConversionRate' || key === 'clickThroughRate' ? 0.01 : 1 
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    );
                                }
                                return null;
                            })}
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Results ({isMonthly ? 'Monthly' : 'Annual'})</Typography>
                        {metrics && !metrics.error ? (
                            <Box>
                                {Object.entries(groupMetrics(metrics)).map(([group, groupMetrics]) => (
                                    <MetricGroup
                                        key={group}
                                        title={group.charAt(0).toUpperCase() + group.slice(1)}
                                        metrics={groupMetrics}
                                        getMetricType={getMetricType}
                                        getMetricFormula={getMetricFormula}
                                        formatNumber={formatNumber}
                                    />
                                ))}
                            </Box>
                        ) : metrics && metrics.error ? (
                            <Typography color="error">{metrics.error}</Typography>
                        ) : (
                            <Typography>Calculating...</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CalculatorComponent;