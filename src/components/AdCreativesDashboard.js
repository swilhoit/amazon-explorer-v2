import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Typography, TextField, Button, Card, CardContent, CardMedia, Grid, Box } from '@mui/material';

// Action types
const FETCH_AD_DATA_REQUEST = 'FETCH_AD_DATA_REQUEST';
const FETCH_AD_DATA_SUCCESS = 'FETCH_AD_DATA_SUCCESS';
const FETCH_AD_DATA_FAILURE = 'FETCH_AD_DATA_FAILURE';

// Action creators
const fetchAdDataRequest = () => ({ type: FETCH_AD_DATA_REQUEST });
const fetchAdDataSuccess = (data) => ({ type: FETCH_AD_DATA_SUCCESS, payload: data });
const fetchAdDataFailure = (error) => ({ type: FETCH_AD_DATA_FAILURE, payload: error });

// Thunk action creator
export const fetchAdData = (keywords, requestCount) => {
  return async (dispatch) => {
    dispatch(fetchAdDataRequest());
    try {
      const keywordArray = keywords.split(',').map(k => k.trim());
      let allData = [];
      for (let i = 0; i < requestCount; i++) {
        const promises = keywordArray.map(keyword => 
          axios.get('https://api.rainforestapi.com/request', {
            params: {
              api_key: "38C2FA69E4A248DBACBFA9C6E7D92899",
              type: "search",
              amazon_domain: "amazon.com",
              search_term: keyword,
              page: (i + 1).toString()  // Use the current iteration as the page number
            }
          })
        );
        const responses = await Promise.all(promises);
        const data = responses.map(response => response.data);
        allData = [...allData, ...data];
      }
      dispatch(fetchAdDataSuccess(allData));
    } catch (error) {
      dispatch(fetchAdDataFailure('Error fetching data'));
    }
  };
};

// Reducer
const initialState = {
  adData: [],
  loading: false,
  error: null,
};

export const adDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_AD_DATA_REQUEST:
      return { ...state, loading: true };
    case FETCH_AD_DATA_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        adData: [...state.adData, ...action.payload],
        error: null 
      };
    case FETCH_AD_DATA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Helper function to remove duplicates
const removeDuplicates = (items, getIdentifier) => {
  const seen = new Set();
  return items.filter(item => {
    const identifier = getIdentifier(item);
    if (seen.has(identifier)) {
      return false;
    }
    seen.add(identifier);
    return true;
  });
};

// Component
const AdCreativesDashboard = () => {
  const dispatch = useDispatch();
  const { adData, loading, error } = useSelector(state => state.adData);
  const [keywords, setKeywords] = useState('');
  const [requestCount, setRequestCount] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keywords) {
      dispatch(fetchAdData(keywords, requestCount));
    }
  };

  // Combine and deduplicate ad blocks and video blocks
  const allCreatives = (adData || []).flatMap(keywordData => [
    ...(keywordData.ad_blocks || []).map(ad => ({ type: 'ad', ...ad })),
    ...(keywordData.video_blocks || []).map(video => ({ type: 'video', ...video }))
  ]);

  const uniqueCreatives = removeDuplicates(allCreatives, item => 
    item.type === 'ad' ? item.background_image : item.video_link
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ad Creatives Comparison Dashboard
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Enter keywords (comma-separated)"
            variant="outlined"
            fullWidth
          />
          <TextField
            type="number"
            value={requestCount}
            onChange={(e) => setRequestCount(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
            label="Page Count"
            variant="outlined"
            sx={{ width: '150px' }}
          />
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
        </Box>
      </form>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2}>
        {uniqueCreatives.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card>
              {item.type === 'ad' ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.background_image}
                  alt={item.title}
                />
              ) : (
                <CardMedia
                  component="video"
                  height="200"
                  image={item.video_link}
                  controls
                />
              )}
              <CardContent>
                <Typography variant="body2">{item.title || (item.products && item.products[0] && item.products[0].title)}</Typography>
                {item.type === 'ad' ? (
                  <Button href={item.link} target="_blank" rel="noopener noreferrer" color="primary" size="small">
                    View Ad
                  </Button>
                ) : (
                  item.products && item.products[0] && (
                    <>
                      <Typography variant="body2">Price: {item.products[0].price.raw}</Typography>
                      <Button href={item.products[0].link} target="_blank" rel="noopener noreferrer" color="primary" size="small">
                        View Product
                      </Button>
                    </>
                  )
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdCreativesDashboard;