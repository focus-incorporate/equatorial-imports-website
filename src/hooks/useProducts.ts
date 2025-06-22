'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';

interface UseProductsReturn {
  products: Product[];
  danielsBlendProducts: Product[];
  viaggioEspressoProducts: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ProductsApiResponse {
  success: boolean;
  products: Product[];
  danielsBlendProducts: Product[];
  viaggioEspressoProducts: Product[];
  totalCount: number;
  error?: string;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [danielsBlendProducts, setDanielsBlendProducts] = useState<Product[]>([]);
  const [viaggioEspressoProducts, setViaggioEspressoProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache control for fresh data
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data: ProductsApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      // Update state with fetched data
      setProducts(data.products);
      setDanielsBlendProducts(data.danielsBlendProducts);
      setViaggioEspressoProducts(data.viaggioEspressoProducts);

      console.log(`✅ Loaded ${data.totalCount} products from database`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Error fetching products:', errorMessage);
      
      // Set empty arrays on error to prevent undefined issues
      setProducts([]);
      setDanielsBlendProducts([]);
      setViaggioEspressoProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    danielsBlendProducts,
    viaggioEspressoProducts,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

// Utility hook for getting a single product by ID
export function useProduct(productId: string) {
  const { products, isLoading, error } = useProducts();
  const product = products.find(p => p.id === productId);

  return {
    product,
    isLoading,
    error,
    notFound: !isLoading && !error && !product,
  };
}