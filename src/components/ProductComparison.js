import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Button } from '@mui/material';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { Parser } from 'json2csv';

const ProductComparison = ({ products = [] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    console.log('Products received:', products);
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, JSON.stringify(product, null, 2));
    });
  }, [products]);

  const handleThumbnailClick = (images, index) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const renderSpecifications = (specifications) => (
    <TableContainer component={Paper} sx={{ width: '100%', marginBottom: 2 }}>
      <Table size="small" aria-label="specifications table">
        <TableHead>
          <TableRow>
            <TableCell><strong>Specification</strong></TableCell>
            <TableCell><strong>Value</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {specifications && specifications.map((spec, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">{spec.name}</TableCell>
              <TableCell>{spec.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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

  const renderFeatureBullets = (featureBullets) => (
    <ul>
      {featureBullets && featureBullets.map((bullet, index) => (
        <li key={index}>{bullet}</li>
      ))}
    </ul>
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
                image={imageUrl}
                alt={`Thumbnail ${index + 1}`}
                sx={{ 
                  width: '100%', 
                  height: 0,
                  paddingTop: '100%', // This makes the image a square
                  cursor: 'pointer',
                  objectFit: 'cover'
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
      <Box sx={{ display: 'flex', overflowX: 'auto', flexWrap: 'nowrap', marginTop: 2 }}>
        {products.map((productData, index) => {
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
          const price = product.price?.value || product.price || 'N/A';
          const sales = product.sales || 'N/A';
          const revenue = product.revenue || 'N/A';

          return (
            <Card key={index} sx={{ minWidth: 300, maxWidth: 300, margin: 1, display: 'inline-block', flex: '0 0 auto' }}>
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
                <Typography variant="body1"><strong>Sales:</strong> {sales}</Typography>
                <Typography variant="body1"><strong>Revenue:</strong> ${typeof revenue === 'number' ? revenue.toFixed(2) : revenue}</Typography>
                {renderImageThumbnails(thumbnailImages)}
                <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 1 }}>Specifications</Typography>
                {renderSpecifications(product.specifications)}
                <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 1 }}>Attributes</Typography>
                {renderAttributes(product.attributes)}
                <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 1 }}>Feature Bullets</Typography>
                {renderFeatureBullets(product.feature_bullets)}
              </CardContent>
            </Card>
          );
        })}
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