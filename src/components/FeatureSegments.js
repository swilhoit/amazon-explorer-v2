import React, { useEffect, useState } from 'react';
import { fetchSegmentedFeatures } from '../utils/api';
import { Box, Typography, CircularProgress, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Alert, List, ListItem, ListItemText, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const segmentWorker = new Worker(new URL('./segmentWorker.js', import.meta.url));

const FeatureSegments = ({ data }) => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    const fetchAndProcessSegments = async () => {
      try {
        const titles = data.filter(item => item && item.title).map(item => item.title);
        if (titles.length === 0) {
          throw new Error('No valid titles to fetch');
        }

        const response = await fetchSegmentedFeatures(titles);
        if (!response || !response.products || response.products.length === 0) {
          throw new Error('No products returned from fetchSegmentedFeatures');
        }

        const allProducts = response.products;
        
        const processPromise = new Promise((resolve, reject) => {
          segmentWorker.postMessage({ data, products: allProducts });
          segmentWorker.onmessage = (event) => {
            if (event.data.error) {
              reject(new Error(event.data.error));
            } else if (event.data.warning) {
              setWarning(event.data.warning);
              resolve([]);
            } else {
              resolve(event.data);
            }
          };
          segmentWorker.onerror = (error) => {
            console.error('Error in worker:', error);
            reject(error);
          };
        });

        const processedSegments = await processPromise;
        setSegments(processedSegments);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchAndProcessSegments:', error);
        setError(`Failed to fetch or process segmented features: ${error.message}`);
        setLoading(false);
      }
    };

    fetchAndProcessSegments();

    return () => segmentWorker.terminate();
  }, [data]);

  const renderFeatures = (features) => (
    <Box component="div">
      <Typography variant="body2" component="div">Features:</Typography>
      <List dense>
        {features.map((feature, index) => (
          <ListItem key={index}>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderAttributes = (attributes) => (
    <Box component="div">
      <Typography variant="body2" component="div">Attributes:</Typography>
      <List dense>
        {attributes.map((attr, index) => (
          <ListItem key={index}>
            <ListItemText primary={`${attr.name}: ${attr.value}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : warning ? (
        <Alert severity="warning">{warning}</Alert>
      ) : segments.length === 0 ? (
        <Typography>No segments available</Typography>
      ) : (
        <>
          {segments.map((segment, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Typography variant="h6" style={{ flexGrow: 1 }}>{segment.segment_name}</Typography>
                  <Typography variant="body2" style={{ marginRight: '10px' }}>
                    Total Revenue: ${segment.totalRevenue.toFixed(2)} | 
                    Avg Price: ${segment.averagePrice.toFixed(2)} | 
                    % of Total: {segment.percentOfTotalRevenue.toFixed(2)}%
                  </Typography>
                  <Chip label={`${segment.products.length} products`} />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Card>
                  <CardContent>
                    <List>
                      {segment.products.map((product, productIndex) => (
                        <ListItem key={productIndex}>
                          <Box>
                            <Typography variant="subtitle1">{`Product ${productIndex + 1}`}</Typography>
                            {product.features.length > 0 && renderFeatures(product.features)}
                            {product.attributes.length > 0 && renderAttributes(product.attributes)}
                            <Typography variant="body2" component="div">
                              Sales: {product.sales !== undefined ? product.sales : 'N/A'}, 
                              Revenue: {product.revenue !== undefined ? `$${product.revenue}` : 'N/A'}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </Box>
  );
};

export default FeatureSegments;