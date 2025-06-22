'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Package, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  brand: string;
  type: string;
  price: number;
  currentStock: number;
  minStockLevel: number;
  inStock: boolean;
  category: string;
  image: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: 'daniels-blend',
    type: 'capsules',
    price: '',
    currentStock: '',
    description: '',
    intensity: 5,
    roast: 'medium',
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stock status indicator
  const getStockStatus = (product: Product) => {
    if (!product.inStock || product.currentStock === 0) {
      return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    } else if (product.currentStock <= product.minStockLevel) {
      return { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
    }
  };

  // Create new product
  const createProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.currentStock) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          currentStock: parseInt(newProduct.currentStock),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      toast.success('Product created successfully');
      setShowAddModal(false);
      setNewProduct({
        name: '',
        brand: 'daniels-blend',
        type: 'capsules',
        price: '',
        currentStock: '',
        description: '',
        intensity: 5,
        roast: 'medium',
      });
      fetchProducts(); // Refresh the list
    } catch {
      toast.error('Failed to create product');
    } finally {
      setIsCreating(false);
    }
  };

  // Edit product
  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // Update product
  const updateProduct = async () => {
    if (!selectedProduct) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      toast.success('Product updated successfully');
      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete product
  const deleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-coffee-900">Products</h1>
            <p className="text-coffee-600">Manage your coffee product inventory</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent">
                <option value="">All Categories</option>
                <option value="capsules">Capsules</option>
                <option value="beans">Beans</option>
              </select>
              <select className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent">
                <option value="">All Brands</option>
                <option value="daniels-blend">Daniel&apos;s Blend</option>
                <option value="viaggio-espresso">Viaggio Espresso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border-b border-cream-100">
                    <div className="w-16 h-16 bg-cream-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-cream-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-cream-200 rounded w-1/4"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-cream-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-cream-200 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto" data-testid="products-list">
              <table className="w-full">
                <thead className="bg-coffee-50 border-b border-cream-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Product</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Category</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Price</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Stock</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-coffee-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product.id} className="hover:bg-coffee-25">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.jpg';
                              }}
                            />
                            <div>
                              <p className="font-medium text-coffee-900">{product.name}</p>
                              <p className="text-sm text-coffee-600 capitalize">{product.brand.replace('-', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-coffee-100 text-coffee-800 rounded-full capitalize">
                            {product.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-coffee-900">₨{product.price.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-medium text-coffee-900">{product.currentStock}</span>
                            <span className="text-sm text-coffee-600 ml-1">/ {product.minStockLevel} min</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.className}`}>
                            {stockStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => editProduct(product)}
                              className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-coffee-900 mb-2">No products found</h3>
              <p className="text-coffee-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first product'}
              </p>
              <button className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 mx-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-coffee-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Total Products</p>
                  <p className="text-xl font-semibold text-coffee-900">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Low Stock</p>
                  <p className="text-xl font-semibold text-coffee-900">
                    {products.filter(p => p.currentStock <= p.minStockLevel && p.inStock).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Out of Stock</p>
                  <p className="text-xl font-semibold text-coffee-900">
                    {products.filter(p => !p.inStock || p.currentStock === 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-cream-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-900">Add New Product</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-coffee-500 hover:text-coffee-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Brand</label>
                    <select
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    >
                      <option value="daniels-blend">Daniel&apos;s Blend</option>
                      <option value="viaggio-espresso">Viaggio Espresso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Type</label>
                    <select
                      value={newProduct.type}
                      onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    >
                      <option value="capsules">Capsules</option>
                      <option value="beans">Beans</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Price (SCR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Initial Stock *</label>
                    <input
                      type="number"
                      value={newProduct.currentStock}
                      onChange={(e) => setNewProduct({ ...newProduct, currentStock: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Intensity (1-12)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={newProduct.intensity}
                      onChange={(e) => setNewProduct({ ...newProduct, intensity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Roast</label>
                    <select
                      value={newProduct.roast}
                      onChange={(e) => setNewProduct({ ...newProduct, roast: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createProduct}
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-cream-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-900">Edit Product</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-coffee-500 hover:text-coffee-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Brand</label>
                    <select
                      value={selectedProduct.brand}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    >
                      <option value="daniels-blend">Daniel&apos;s Blend</option>
                      <option value="viaggio-espresso">Viaggio Espresso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Type</label>
                    <select
                      value={selectedProduct.type}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, type: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    >
                      <option value="capsules">Capsules</option>
                      <option value="beans">Beans</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Price (SCR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedProduct.price}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Current Stock *</label>
                    <input
                      type="number"
                      value={selectedProduct.currentStock}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, currentStock: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">In Stock</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProduct.inStock}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, inStock: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-coffee-700">Product is available for sale</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateProduct}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Product Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-cream-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-900">Delete Product</h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-coffee-500 hover:text-coffee-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-coffee-700 mb-4">
                  Are you sure you want to delete <strong>{selectedProduct.name}</strong>? This action cannot be undone.
                </p>
                <p className="text-sm text-coffee-600 mb-6">
                  Note: Products with existing orders cannot be deleted. They will be marked as inactive instead.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}