import React, { useState } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Table, TableBody, TableCell, TableContainer, TableRow, Paper, TextField, Button, Box } from '@mui/material';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const fetchProductData = async (asins) => {
  const apiKey = '38C2FA69E4A248DBACBFA9C6E7D92899';
  const amazonDomain = 'amazon.com';

  const promises = asins.map(asin =>
    axios.get('https://api.rainforestapi.com/request', {
      params: {
        api_key: apiKey,
        amazon_domain: amazonDomain,
        asin: asin,
        type: 'product'
      }
    }).then(response => {
      return response.data.product;
    }).catch(error => {
      console.error(`Error fetching data for ASIN ${asin}:`, error);
      return null;
    })
  );

  const products = await Promise.all(promises);
  return products.filter(product => product !== null); // Filter out any failed requests
};

const ProductComparison = () => {
  const [asins, setAsins] = useState(['', '', '', '', '']);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Local cache for fetched products
  const [cachedProducts, setCachedProducts] = useState({});

  const handleInputChange = (index, event) => {
    const newAsins = [...asins];
    newAsins[index] = event.target.value;
    setAsins(newAsins);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const productData = await fetchProductData(asins.filter(asin => asin.trim() !== ''));
    setProducts(productData);
    setIsLoading(false);

    // Update cache with fetched data
    const updatedCache = { ...cachedProducts };
    productData.forEach(product => {
      if (product) {
        updatedCache[product.asin] = product;
      }
    });
    setCachedProducts(updatedCache);
  };

  const handleThumbnailClick = (images, index) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const renderSpecifications = (specifications) => (
    <TableContainer component={Paper} sx={{ width: '100%', marginBottom: 2 }}>
      <Table size="small" aria-label="specifications table">
        <TableBody>
          {specifications.map((spec, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row" sx={{ width: '50%' }}>
                {spec.name}
              </TableCell>
              <TableCell sx={{ width: '50%' }}>{spec.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFeatureBullets = (featureBullets) => (
    <Box sx={{ width: '100%', marginBottom: 2 }}>
      <ul>
        {featureBullets.map((bullet, index) => (
          <li key={index}>{bullet}</li>
        ))}
      </ul>
    </Box>
  );

  const renderImportantInformation = (importantInformation) => (
    <Box sx={{ width: '100%', height: 200, overflowY: 'auto', marginBottom: 2 }}>
      {importantInformation?.sections?.map((section, index) => (
        <div key={index}>
          <Typography variant="subtitle1">{section.title}</Typography>
          <Typography variant="body2">{section.body}</Typography>
        </div>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <form onSubmit={handleFormSubmit}>
        <Grid container spacing={2} alignItems="center">
          {asins.map((asin, index) => (
            <Grid item key={index}>
              <TextField
                label={`ASIN ${index + 1}`}
                variant="outlined"
                size="small"
                value={asin}
                onChange={(event) => handleInputChange(index, event)}
                margin="normal"
                style={{ width: 120 }}
              />
            </Grid>
          ))}
          <Grid item>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Compare Products'}
            </Button>
          </Grid>
        </Grid>
      </form>
      <Box sx={{ display: 'flex', overflowX: 'auto', flexWrap: 'nowrap', marginTop: 2 }}>
        {products.map((product, index) => (
          <Card key={index} sx={{ minWidth: 300, maxWidth: 300, margin: 1, display: 'inline-block', flex: '0 0 auto' }}>
            <CardMedia
              component="img"
              height="300"
              image={product?.main_image?.link || '/path/to/default-image.jpg'}
              alt={product.title}
              onClick={() => handleThumbnailClick([product.main_image.link, ...product.images.map(img => img.link)], 0)}
              style={{ cursor: 'pointer' }}
            />
            <CardContent sx={{ width: '100%', minHeight: 100 }}>
              <Typography variant="h5" component="div" sx={{ minHeight: 60, maxHeight: 60, overflow: 'hidden', width: '100%', marginBottom: 1 }}>
                <Box sx={{ overflowWrap: 'break-word' }}>
                  {product?.title || 'No title available'}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'break-word', width: '100%', marginBottom: 1 }}>
                Price: {product?.buybox_winner?.price?.raw || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ width: '100%', marginBottom: 1 }}>
                Rating: {product?.rating || 'N/A'} ({product?.ratings_total || 'N/A'} reviews)
              </Typography>
              <Grid container spacing={1} sx={{ width: '100%', marginBottom: 1 }}>
                {product?.images?.map((image, imgIndex) => (
                  <Grid item key={imgIndex} sx={{ height: 60, width: 60 }}>
                    <CardMedia
                      component="img"
                      height="100%"
                      width="100%"
                      image={image.link}
                      alt={`Thumbnail ${imgIndex}`}
                      onClick={() => handleThumbnailClick([product.main_image.link, ...product.images.map(img => img.link)], imgIndex + 1)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Grid>
                ))}
              </Grid>
              {product?.specifications && renderSpecifications(product.specifications)}
              {product?.feature_bullets && renderFeatureBullets(product.feature_bullets)}
              {product?.important_information && renderImportantInformation(product.important_information)}
            </CardContent>
          </Card>
        ))}
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
            setCurrentImageIndex((currentImageIndex + 1) % lightboxImages.length)
          }
        />
      )}
    </Container>
  );
};

export default ProductComparison;
