import { Request, Response } from 'express';
import axios from 'axios';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const searchFoods = async (req: Request, res: Response) => {
  try {
    const { query, countryCode = 'za' } = req.query;
    
    if (!query || (query as string).length < 2) {
      return res.json({ products: [] });
    }
    
    const cacheKey = `search_${query}_${countryCode}`;
    
    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📦 Cache hit for: ${query}`);
        return res.json(cached.data);
      }
    }
    
    console.log(`🔍 Searching API for: ${query}`);
    
    // Try with shorter timeout
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query as string)}&search_simple=1&json=1&page_size=30&countries_tags=en:${countryCode}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'NEXTLIFT AI - Fitness App (contact@nextlift.ai)',
        'Accept': 'application/json'
      },
      timeout: 15000 // 15 seconds
    });
    
    // Cache the result
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Food search error:', error);
    // Return cached data if available, even if expired
    const cacheKey = `search_${req.query.query}_${req.query.countryCode}`;
    if (cache.has(cacheKey)) {
      console.log(`⚠️ Using expired cache for: ${req.query.query}`);
      return res.json(cache.get(cacheKey).data);
    }
    // Return empty array as last resort
    res.json({ products: [] });
  }
};

export const searchWorldwide = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || (query as string).length < 2) {
      return res.json({ products: [] });
    }
    
    const cacheKey = `worldwide_${query}`;
    
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📦 Cache hit for worldwide: ${query}`);
        return res.json(cached.data);
      }
    }
    
    console.log(`🌍 Searching worldwide API for: ${query}`);
    
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query as string)}&search_simple=1&json=1&page_size=30`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'NEXTLIFT AI - Fitness App (contact@nextlift.ai)',
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Worldwide search error:', error);
    const cacheKey = `worldwide_${req.query.query}`;
    if (cache.has(cacheKey)) {
      console.log(`⚠️ Using expired cache for worldwide: ${req.query.query}`);
      return res.json(cache.get(cacheKey).data);
    }
    res.json({ products: [] });
  }
};
