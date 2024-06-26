import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const ProductComparison = ({ products = [] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
          {specifications.map((spec, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">{spec.name}</TableCell>
              <TableCell>{spec.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', overflowX: 'auto', flexWrap: 'nowrap', marginTop: 2 }}>
        {products.map((productData, index) => {
          const product = productData.product;
          return (
            <Card key={index} sx={{ minWidth: 300, maxWidth: 300, margin: 1, display: 'inline-block', flex: '0 0 auto' }}>
              <CardMedia
                component="img"
                height="300"
                image={product.main_image.link}
                alt={product.title}
                onClick={() => handleThumbnailClick([product.main_image.link, ...product.images.map(img => img.link)], 0)}
                style={{ cursor: 'pointer' }}
              />
              <CardContent sx={{ width: '100%' }}>
                <Typography variant="h6" component="div" sx={{ minHeight: 60, maxHeight: 60, overflow: 'hidden', marginBottom: 1 }}>
                  {product.title}
                </Typography>
                
                <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 1 }}>Specifications</Typography>
                {renderSpecifications(product.specifications)}
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
            setCurrentImageIndex((currentImageIndex + 1) % lightboxImages.length)
          }
        />
      )}
    </Container>
  );
};

export default ProductComparison;