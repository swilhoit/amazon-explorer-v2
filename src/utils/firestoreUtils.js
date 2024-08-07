// src/utils/firestoreUtils.js
import { db } from '../firebase';
import { collection, setDoc, doc } from 'firebase/firestore';

export const addProductToFirestore = async (product) => {
  try {
    const productRef = doc(db, 'products', product.asin); 
    await setDoc(productRef, {
      title: product.title,
      brand: product.brand,
      price: product.price,
      reviews: product.reviews,
      rating: product.rating,
      sales: product.sales,
      revenue: product.revenue,
      sellerCountry: product.sellerCountry,
      fulfillment: product.fulfillment,
      dateFirstAvailable: product.dateFirstAvailable,
      category: product.category,
      imageUrl: product.imageUrl,
      amazonUrl: product.amazonUrl,
      attributes: product.attributes,
      featureBullets: product.featureBullets,
    });
    console.log('Product added with ASIN: ', product.asin);
  } catch (e) {
    console.error('Error adding product: ', e);
  }
};
