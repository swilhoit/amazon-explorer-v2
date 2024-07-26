import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Button, CircularProgress, Collapse, IconButton } from '@mui/material';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { Parser } from 'json2csv';
import { fetchFeatureSummaryWithBackoff, fetchCombinedFeatureSummaryWithBackoff } from '../utils/api';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const ProductComparison = ({ products = [] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [featureSummaries, setFeatureSummaries] = useState([]);
  const [combinedFeatureSummary, setCombinedFeatureSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSpecifications, setExpandedSpecifications] = useState({});
  const [expandedFeatureBullets, setExpandedFeatureBullets] = useState({});

  useEffect(() => {
    console.log('Products received:', products);
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, JSON.stringify(product, null, 2));
    });
    setLoading(true);
    generateFeatureSummaries(products);
    generateCombinedFeatureSummary(products);
  }, [products]);

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const generateFeatureSummaries = async (products) => {
    try {
      const summaries = [];
      for (const product of products) {
        const featureBullets = product.product?.feature_bullets || product.feature_bullets || [];
        const attributes = product.product?.attributes || product.attributes || [];
        const images = product.product?.images || product.images || [];
        console.log('Feature bullets:', featureBullets); // Log the feature bullets
        console.log('Attributes:', attributes); // Log the attributes
        console.log('Images:', images); // Log the images
        if (featureBullets.length > 0 || attributes.length > 0) {
          const summary = await fetchFeatureSummaryWithBackoff(featureBullets, attributes, images);
          console.log('Feature summary:', summary); // Log the feature summary
          summaries.push(summary);
          await delay(3000); // Delay between each request
        } else {
          summaries.push([]);
        }
      }
      setFeatureSummaries(summaries);
    } catch (error) {
      console.error('Error generating feature summaries:', error);
    }
  };

  const generateCombinedFeatureSummary = async (products) => {
    try {
      const allFeatures = products.map(product => {
        const featureBullets = product.product?.feature_bullets || product.feature_bullets || [];
        const attributes = product.product?.attributes || product.attributes || [];
        const images = product.product?.images || product.images || [];
        return `Product ${product.product?.title || product.title || 'Unnamed Product'}:\nImages:\n${images.map(img => (typeof img === 'string' ? img : img.url || img.link)).join('\n')}\nFeatures:\n${featureBullets.join('\n')}\nAttributes:\n${attributes.map(attr => `${attr.name}: ${attr.value}`).join('\n')}`;
      });
      const summary = await fetchCombinedFeatureSummaryWithBackoff(allFeatures);
      console.log('Combined feature summary:', summary); // Log the combined feature summary
      setCombinedFeatureSummary(Array.isArray(summary) ? summary : []);
      setLoading(false);
    } catch (error) {
      console.error('Error generating combined feature summary:', error);
      setLoading(false);
    }
  };

  const handleThumbnailClick = (images, index) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleExpandSpecifications = (index) => {
    setExpandedSpecifications(prevState => ({ ...prevState, [index]: !prevState[index] }));
  };

  const handleExpandFeatureBullets = (index) => {
    setExpandedFeatureBullets(prevState => ({ ...prevState, [index]: !prevState[index] }));
  };

  const renderSpecifications = (specifications, index) => (
    <Box>
      <Box display="flex" alignItems="center" onClick={() => handleExpandSpecifications(index)} sx={{ cursor: 'pointer' }}>
        <Typography variant="h6" sx={{ marginRight: 1 }}>Specifications</Typography>
        {expandedSpecifications[index] ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={expandedSpecifications[index]} timeout="auto" unmountOnExit>
        <TableContainer component={Paper} sx={{ width: '100%', marginBottom: 2 }}>
          <Table size="small" aria-label="specifications table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Specification</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {specifications && specifications.map((spec, specIndex) => (
                <TableRow key={specIndex}>
                  <TableCell component="th" scope="row">{spec.name}</TableCell>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Box>
  );

  const renderAttributes = (attributes) => (
    <TableContainer component={Paper} sx={{ width: '100%', marginBottom: 2 }}>
      <Table size="small" aria-label="attributes table">
        <TableHead>
          <TableRow>
            <TableCell><strong>Attribute</strong></TableCell>
            <TableCell><strong>Value</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes && attributes.map((attr, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">{attr.name}</TableCell>
              <TableCell>{attr.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFeatureBullets = (featureBullets, index) => (
    <Box>
      <Box display="flex" alignItems="center" onClick={() => handleExpandFeatureBullets(index)} sx={{ cursor: 'pointer' }}>
        <Typography variant="h6" sx={{ marginRight: 1 }}>Feature Bullets</Typography>
        {expandedFeatureBullets[index] ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={expandedFeatureBullets[index]} timeout="auto" unmountOnExit>
        <ul>
          {featureBullets && featureBullets.map((bullet, bulletIndex) => (
            <li key={bulletIndex} style={{ marginBottom: '10px' }}>{bullet}</li>
          ))}
        </ul>
      </Collapse>
    </Box>
  );

  const renderFeatureSummary = (summary) => (
    <Box sx={{ backgroundColor: 'lightgreen', padding: 2, marginTop: 2, borderRadius: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: 1 }}>Features Summary</Typography>
      <ul>
        {Array.isArray(summary) && summary.map((point, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>{point}</li>
        ))}
      </ul>
    </Box>
  );

  const renderCombinedFeatureSummary = (summary) => (
    <Box sx={{ backgroundColor: 'lightblue', padding: 2, marginBottom: 2, borderRadius: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: 1 }}>Combined Features Summary</Typography>
      <ul>
        {Array.isArray(summary) && summary.map((point, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>{point}</li>
        ))}
      </ul>
    </Box>
  );

  const renderImageThumbnails = (images) => {
    console.log('Rendering thumbnails for images:', images);
    return (
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        {images && images.map((image, index) => {
          const imageUrl = typeof image === 'string' ? image : image.link || image.url || '';
          console.log(`Thumbnail ${index + 1} URL:`, imageUrl);
          return (
            <Grid item xs={3} key={index}>
              <CardMedia
                component="img"
                src={imageUrl}
                alt={`Thumbnail ${index + 1}`}
                sx={{ 
                  width: '100%', 
                  height: 'auto', // Ensure the image maintains its aspect ratio
                  cursor: 'pointer',
                  objectFit: 'cover',
                  border: '1px solid #ccc', // Add a border for visibility
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
                  display: 'block', // Ensure the image is a block element
                }}
                onClick={() => handleThumbnailClick(images.map(img => typeof img === 'string' ? img : img.link || img.url || ''), index)}
              />
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const exportToCSV = () => {
    const fields = [
      'title', 'brand', 'weight', 'shipping_weight', 'dimensions', 'link', 'rating', 'ratings_total', 'reviews_total',
      'price', 'sales', 'revenue', 'attributes', 'feature_bullets'
    ];
    const opts = { fields };

    try {
      const parser = new Parser(opts);
      const csv = parser.parse(products.map(productData => {
        const product = productData.product || productData;
        return {
          ...product,
          attributes: product.attributes ? product.attributes.map(attr => `${attr.name}: ${attr.value}`).join('; ') : '',
          feature_bullets: product.feature_bullets ? product.feature_bullets.join('; ') : ''
        };
      }));
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'product_comparison.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting to CSV:', err);
    }
  };

  const renderProductCard = (productData, index) => {
    const product = productData.product || productData; // Handle both structures
    console.log(`Rendering product ${index + 1}:`, JSON.stringify(product, null, 2));
    
    // Log specific data points we're interested in
    console.log('Main Image:', product.main_image);
    console.log('Images:', product.images);
    console.log('Price:', product.price);
    console.log('Sales:', product.sales);
    console.log('Revenue:', product.revenue);

    const mainImage = product.main_image?.link || product.main_image || product.images?.[0]?.link || product.images?.[0] || '';
    const thumbnailImages = product.images || [];
    const price = parseFloat(product.price?.toString().replace(/[,$]/g, '')) || 'N/A';
    const sales = parseInt(product.sales?.toString().replace(/,/g, '')) || 'N/A';
    const revenue = parseFloat(product.revenue?.toString().replace(/[,$]/g, '')) || 'N/A';

    return (
      <Card key={index} sx={{ minWidth: 400, maxWidth: 400, margin: 1, display: 'inline-block', flex: '0 0 auto' }}>
        {mainImage && (
          <CardMedia
            component="img"
            height="300"
            image={mainImage}
            alt={product.title || 'Product Image'}
            onClick={() => handleThumbnailClick([mainImage, ...thumbnailImages.map(img => typeof img === 'string' ? img : img.link || img.url || '')], 0)}
            style={{ cursor: 'pointer' }}
          />
        )}
        <CardContent sx={{ width: '100%' }}>
          <Typography variant="h6" component="div" sx={{ minHeight: 60, maxHeight: 60, overflow: 'hidden', marginBottom: 1 }}>
            {product.title || 'No Title'}
          </Typography>
          <Typography variant="body1"><strong>Price:</strong> ${typeof price === 'number' ? price.toFixed(2) : price}</Typography>
          <Typography variant="body1"><strong>Sales:</strong> {typeof sales === 'number' ? sales.toLocaleString() : sales}</Typography>
          <Typography variant="body1"><strong>Revenue:</strong> ${typeof revenue === 'number' ? revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : revenue}</Typography>
          {renderFeatureSummary(featureSummaries[index])}
          {renderImageThumbnails(thumbnailImages)}
          <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 1 }}>Attributes</Typography>
          {renderAttributes(product.attributes)}
          {renderSpecifications(product.specifications, index)}
          {renderFeatureBullets(product.feature_bullets, index)}
        </CardContent>
      </Card>
    );
  };

  if (!products || products.length === 0) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h6">No products selected for comparison.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Button variant="contained" color="primary" onClick={exportToCSV} sx={{ marginBottom: 2 }}>
        Export to CSV
      </Button>
      {loading ? <CircularProgress /> : renderCombinedFeatureSummary(combinedFeatureSummary)}
      <Box sx={{ display: 'flex', overflowX: 'auto', flexWrap: 'nowrap', marginTop: 2 }}>
        {products.map((product, index) => renderProductCard(product, index))}
      </Box>
      {lightboxOpen && (
        <Lightbox
          mainSrc={lightboxImages[currentImageIndex]}
          nextSrc={lightboxImages[(currentImageIndex + 1) % lightboxImages.length]}
          prevSrc={lightboxImages[(currentImageIndex + lightboxImages.length - 1) % lightboxImages.length]}
          onCloseRequest={() => setLightboxOpen(false)}
          onMovePrevRequest={() =>
            setCurrentImageIndex((currentImageIndex + lightboxImages.length - 1) % lightboxImages.length)
          }
          onMoveNextRequest={() =>
            setCurrentImageIndex((currentImageIndex + 1) % lightboxImages.length)}
        />
      )}
    </Container>
  );
};

export default ProductComparison;
