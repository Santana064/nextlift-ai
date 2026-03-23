import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface FoodSearchProps {
  onSelect: (food: any) => void;
  onClose: () => void;
}

interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  countryCode: string;
}

// Global cache for search results
const searchCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const detectUserCountry = async (): Promise<CountryInfo> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code || 'ZA';
    
    const countryMap: Record<string, { name: string; flag: string }> = {
      'ZA': { name: 'South Africa', flag: '🇿🇦' },
      'US': { name: 'United States', flag: '🇺🇸' },
      'GB': { name: 'United Kingdom', flag: '🇬🇧' },
      'AU': { name: 'Australia', flag: '🇦🇺' },
      'CA': { name: 'Canada', flag: '🇨🇦' }
    };
    
    const countryInfo = countryMap[countryCode] || { 
      name: data.country_name || 'South Africa', 
      flag: '🌍' 
    };
    
    return {
      code: countryCode,
      name: countryInfo.name,
      flag: countryInfo.flag,
      countryCode: countryCode
    };
  } catch (error) {
    return { code: 'ZA', name: 'South Africa', flag: '🇿🇦', countryCode: 'ZA' };
  }
};

const searchProducts = async (query: string, countryCode: string): Promise<any[]> => {
  if (!query || query.length < 2) return [];
  
  const cacheKey = `${countryCode}_${query.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Cache hit for: ${query}`);
    return cached.data;
  }
  
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page_size=50&countries_tags=en:${countryCode.toLowerCase()}`;
    console.log('🔍 Fetching from API:', query);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      const results = data.products
        .filter((p: any) => p.product_name)
        .map((p: any) => {
          let calories = Math.round(p.nutriments?.['energy-kcal'] || 0);
          let protein = Math.round(p.nutriments?.proteins || 0);
          let carbs = Math.round(p.nutriments?.carbohydrates || 0);
          let fats = Math.round(p.nutriments?.fat || 0);
          
          if (calories === 0 && p.nutriments?.energy) {
            calories = Math.round(p.nutriments.energy / 4.184);
          }
          
          return {
            name: p.product_name,
            brand: p.brands || '',
            calories: calories,
            protein: protein,
            carbs: carbs,
            fats: fats,
            servingSize: p.serving_size || '100g',
            image: p.image_front_url || null,
            barcode: p.code,
            stores: p.stores || '',
            isLocal: true
          };
        });
      
      searchCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });
      
      return results;
    }
    return [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

const searchWorldwide = async (query: string): Promise<any[]> => {
  if (!query || query.length < 2) return [];
  
  const cacheKey = `worldwide_${query.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Cache hit for worldwide: ${query}`);
    return cached.data;
  }
  
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page_size=50`
    );
    
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      const results = data.products
        .filter((p: any) => p.product_name)
        .map((p: any) => {
          let calories = Math.round(p.nutriments?.['energy-kcal'] || 0);
          let protein = Math.round(p.nutriments?.proteins || 0);
          let carbs = Math.round(p.nutriments?.carbohydrates || 0);
          let fats = Math.round(p.nutriments?.fat || 0);
          
          if (calories === 0 && p.nutriments?.energy) {
            calories = Math.round(p.nutriments.energy / 4.184);
          }
          
          return {
            name: p.product_name,
            brand: p.brands || '',
            calories: calories,
            protein: protein,
            carbs: carbs,
            fats: fats,
            servingSize: p.serving_size || '100g',
            image: p.image_front_url || null,
            barcode: p.code,
            stores: p.stores || '',
            isLocal: false
          };
        });
      
      searchCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });
      
      return results;
    }
    return [];
  } catch (error) {
    console.error('Worldwide search error:', error);
    return [];
  }
};

const FoodSearch: React.FC<FoodSearchProps> = ({ onSelect, onClose }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [worldwideResults, setWorldwideResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('snack');
  const [showLocalOnly, setShowLocalOnly] = useState(true);
  const [userCountry, setUserCountry] = useState<CountryInfo | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      const savedSearch = localStorage.getItem(`foodSearch_${user.id}`);
      if (savedSearch) {
        setQuery(savedSearch);
      }
    }
    detectUserCountry().then(country => {
      setUserCountry(country);
    });
  }, [user]);

  useEffect(() => {
    if (query && user) {
      localStorage.setItem(`foodSearch_${user.id}`, query);
    }
  }, [query, user]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2 || !userCountry) {
      setLocalResults([]);
      setWorldwideResults([]);
      setLoading(false);
      setIsCached(false);
      setCurrentSearchTerm('');
      return;
    }
    
    // Set the current search term to prevent showing stale results
    setCurrentSearchTerm(searchQuery);
    setLoading(true);
    
    try {
      // Get both local and worldwide results
      const [local, worldwide] = await Promise.all([
        searchProducts(searchQuery, userCountry.countryCode),
        searchWorldwide(searchQuery)
      ]);
      
      // Only update if this is still the current search
      if (currentSearchTerm === searchQuery) {
        const localBarcodes = new Set(local.map(p => p.barcode));
        const filteredWorldwide = worldwide.filter(p => !localBarcodes.has(p.barcode));
        
        setLocalResults(local);
        setWorldwideResults(filteredWorldwide);
        
        // Check if results came from cache
        const cacheKey = `${userCountry.countryCode}_${searchQuery.toLowerCase()}`;
        const isFromCache = searchCache.has(cacheKey);
        setIsCached(isFromCache);
      }
    } catch (err) {
      console.error('Search failed:', err);
      if (currentSearchTerm === searchQuery) {
        setLocalResults([]);
        setWorldwideResults([]);
        setIsCached(false);
      }
    } finally {
      if (currentSearchTerm === searchQuery) {
        setLoading(false);
      }
    }
  }, [userCountry, currentSearchTerm]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length >= 2 && userCountry) {
      // Clear results immediately while typing new search
      if (currentSearchTerm !== query) {
        setLocalResults([]);
        setWorldwideResults([]);
        setIsCached(false);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setLocalResults([]);
      setWorldwideResults([]);
      setLoading(false);
      setIsCached(false);
      setCurrentSearchTerm('');
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch, userCountry, currentSearchTerm]);

  const handleSelectFood = (food: any) => {
    onSelect({
      ...food,
      mealType: selectedMealType
    });
    onClose();
  };

  const clearSearch = () => {
    setQuery('');
    setLocalResults([]);
    setWorldwideResults([]);
    setIsCached(false);
    setCurrentSearchTerm('');
    if (user) {
      localStorage.removeItem(`foodSearch_${user.id}`);
    }
  };

  const getMealTypeIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍱';
      case 'dinner': return '🍽️';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const displayResults = showLocalOnly ? localResults : worldwideResults;
  const localCount = localResults.length;
  const worldwideCount = worldwideResults.length;

  if (!userCountry) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Detecting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Search Food</h3>
            <div className="text-xs text-gray-400 mt-1">
              {userCountry.flag} {userCountry.name} products shown first
              {isCached && <span className="ml-2 text-green-400">(⚡ Cached)</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food (e.g., 'tuna', 'chicken', 'oats')..."
            className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowLocalOnly(true)}
            className={`flex-1 py-2 rounded-lg transition-all ${
              showLocalOnly 
                ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {userCountry.flag} {userCountry.name} ({localCount})
          </button>
          <button
            onClick={() => setShowLocalOnly(false)}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !showLocalOnly 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🌍 Worldwide ({worldwideCount})
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Add to:</label>
          <div className="flex gap-2 flex-wrap">
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type.toLowerCase())}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedMealType === type.toLowerCase()
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {getMealTypeIcon(type)} {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400">Searching...</p>
            </div>
          )}

          {!loading && displayResults.length > 0 && (
            <div className="space-y-3">
              {displayResults.map((food, index) => (
                <div
                  key={food.barcode || index}
                  onClick={() => handleSelectFood(food)}
                  className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/60 cursor-pointer transition-all group"
                >
                  <div className="flex gap-4">
                    {food.image ? (
                      <img 
                        src={food.image} 
                        alt={food.name}
                        className="w-20 h-20 object-cover rounded-lg bg-gray-800"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-3xl">🍽️</div>
                    )}
                    
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg group-hover:text-teal-400">
                        {food.name}
                      </div>
                      {food.brand && <div className="text-sm text-gray-400">{food.brand}</div>}
                      {showLocalOnly && (
                        <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full inline-block mt-1">
                          {userCountry.flag} {userCountry.name}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-orange-400 text-sm">🔥 {food.calories} kcal</span>
                        <span className="text-green-400 text-sm">💪 {food.protein}g</span>
                        <span className="text-yellow-400 text-sm">🍚 {food.carbs}g</span>
                        <span className="text-blue-400 text-sm">🥑 {food.fats}g</span>
                      </div>
                    </div>
                    
                    <button className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                      Add →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && displayResults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400">
                {showLocalOnly 
                  ? `No ${userCountry.name} foods found for "${query}"`
                  : `No foods found for "${query}"`}
              </p>
              {showLocalOnly && worldwideCount > 0 && (
                <button onClick={() => setShowLocalOnly(false)} className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                  Try worldwide results ({worldwideCount} available)
                </button>
              )}
            </div>
          )}

          {!loading && query.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-400">Search for any food</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['tuna', 'chicken', 'beef', 'oats', 'bread', 'milk'].map(suggestion => (
                  <button key={suggestion} onClick={() => setQuery(suggestion)} className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-gray-600">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            💡 Data from Open Food Facts • {displayResults.length} foods found
            {isCached && <span className="ml-2 text-green-400">(⚡ Cached - instant)</span>}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FoodSearch;
