import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import Quagga from 'quagga';  // This should work after npm install

interface BarcodeScannerProps {
  onScan: (barcode: string, productData?: any) => void;
  onClose: () => void;
}

// REAL API call to Open Food Facts
const fetchRealProductByBarcode = async (barcode: string) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1) {
      const p = data.product;
      return {
        name: p.product_name || `Product ${barcode}`,
        brand: p.brands || 'Unknown brand',
        calories: Math.round(p.nutriments['energy-kcal'] || 0),
        protein: Math.round(p.nutriments.proteins || 0),
        carbs: Math.round(p.nutriments.carbohydrates || 0),
        fats: Math.round(p.nutriments.fat || 0),
        servingSize: p.serving_size || '100g',
        image: p.image_url,
        source: 'Open Food Facts'
      };
    }
    return null;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
};

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<string>('Initializing...');
  const [foundProduct, setFoundProduct] = useState<any>(null);
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastDetected, setLastDetected] = useState<string>('');
  
  const scannerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const testBarcodes = [
    { code: '3017620422003', name: 'Nutella' },
    { code: '5000112546415', name: 'Coca-Cola' },
    { code: '7622210449283', name: 'KitKat' },
    { code: '40084015', name: 'Mars Bar' },
    { code: '5053990136999', name: 'Ben & Jerry\'s' },
    { code: '9300675038740', name: 'Weet-Bix' },
    { code: '9310072001636', name: 'Vegemite' }
  ];

  useEffect(() => {
    if (mode === 'camera') {
      startScanner();
    }
    
    return () => {
      if (Quagga) {
        try {
          Quagga.stop();
        } catch (e) {
          console.log('Quagga stop error:', e);
        }
      }
    };
  }, [mode]);

  const startScanner = () => {
    if (!scannerRef.current) return;

    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: {
          facingMode: 'environment',
          width: 640,
          height: 480,
        },
      },
      decoder: {
        readers: [
          'ean_reader',
          'ean_8_reader',
          'upc_reader',
          'upc_e_reader',
          'code_128_reader',
          'code_39_reader'
        ],
      },
      locate: true,
    }, (err: any) => {
      if (err) {
        console.error('Quagga init error:', err);
        setCameraError('Failed to initialize barcode scanner');
        return;
      }
      
      Quagga.start();
      setScanning(true);
      setDetectionStatus('Scanner ready - point at barcode');
      
      Quagga.onDetected((data: any) => {
        const barcode = data.codeResult.code;
        console.log('Barcode detected:', barcode);
        
        if (barcode && !isSearching && !foundProduct) {
          setLastDetected(barcode);
          Quagga.pause();
          handleBarcodeDetected(barcode);
        }
      });

      Quagga.onProcessed((result: any) => {
        if (result && result.codeResult) {
          setDetectionStatus('Barcode detected!');
        } else {
          setDetectionStatus('Scanning...');
        }
      });
    });
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setIsSearching(true);
    setDetectionStatus(`Found: ${barcode} - searching...`);

    try {
      const product = await fetchRealProductByBarcode(barcode);
      
      if (product) {
        setFoundProduct(product);
        showToast('success', `Found: ${product.name}`);
        Quagga.stop();
      } else {
        setDetectionStatus(`❌ Product not found`);
        showToast('warning', `Product not found in database`);
        
        setTimeout(() => {
          setIsSearching(false);
          Quagga.start();
          setDetectionStatus('Scanning...');
        }, 2000);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch product');
      setIsSearching(false);
      Quagga.start();
    }
  };

  const handleManualSearch = async () => {
    if (!manualBarcode.trim()) {
      showToast('error', 'Enter a barcode');
      return;
    }
    
    setIsSearching(true);
    const product = await fetchRealProductByBarcode(manualBarcode.trim());
    
    if (product) {
      setFoundProduct(product);
    } else {
      showToast('warning', `No product found for barcode ${manualBarcode}`);
    }
    setIsSearching(false);
  };

  const handleAddProduct = () => {
    if (foundProduct) {
      onScan(foundProduct.barcode, foundProduct);
    }
    onClose();
  };

  // Product found view
  if (foundProduct) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✅</span>
            <h3 className="text-xl font-bold text-white">Product Found</h3>
          </div>
          
          <div className="bg-gray-700/30 rounded-xl p-6 mb-4">
            {foundProduct.image && (
              <img src={foundProduct.image} alt={foundProduct.name} className="w-24 h-24 object-contain mx-auto mb-4" />
            )}
            <h4 className="text-2xl font-bold text-white mb-1">{foundProduct.name}</h4>
            {foundProduct.brand && <p className="text-teal-400 mb-2">{foundProduct.brand}</p>}
            <p className="text-gray-400 mb-4">Serving: {foundProduct.servingSize}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Calories</div>
                <div className="text-xl font-bold text-orange-400">{foundProduct.calories}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Protein</div>
                <div className="text-xl font-bold text-green-400">{foundProduct.protein}g</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Carbs</div>
                <div className="text-xl font-bold text-yellow-400">{foundProduct.carbs}g</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Fats</div>
                <div className="text-xl font-bold text-blue-400">{foundProduct.fats}g</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleAddProduct} className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600">
              Add to Meals
            </button>
            <button onClick={() => { setFoundProduct(null); setMode('camera'); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
              Scan Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Manual mode
  if (mode === 'manual') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">Manual Entry</h3>
          
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter barcode number"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white mb-4"
          />
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleManualSearch}
              disabled={isSearching}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600"
            >
              {isSearching ? 'Searching...' : 'Find Product'}
            </button>
            <button
              onClick={() => setMode('camera')}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Back
            </button>
          </div>

          <div className="p-3 bg-gray-700/30 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Test barcodes:</p>
            <div className="grid grid-cols-2 gap-2">
              {testBarcodes.map(item => (
                <button
                  key={item.code}
                  onClick={() => setManualBarcode(item.code)}
                  className="p-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500"
                >
                  {item.code}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Camera mode
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Scan Food Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {cameraError ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{cameraError}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setMode('manual')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Manual Entry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={scannerRef}
              className="w-full h-64 bg-black rounded-xl overflow-hidden mb-4 relative"
            />
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 border-2 border-teal-400 rounded-lg">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-teal-400 animate-scan"></div>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full">
                {scanning ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white">{detectionStatus}</span>
                  </>
                ) : (
                  <span className="text-white">Initializing...</span>
                )}
              </div>
            </div>

            {lastDetected && (
              <div className="text-center mb-4 text-sm text-purple-400">
                Last detected: {lastDetected}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setMode('manual')}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Manual Entry
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Or try these test barcodes:</p>
              <div className="grid grid-cols-2 gap-2">
                {testBarcodes.slice(0, 4).map(item => (
                  <button
                    key={item.code}
                    onClick={() => handleBarcodeDetected(item.code)}
                    className="p-2 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500/30"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
