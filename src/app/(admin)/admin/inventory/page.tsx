'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Package, Search, AlertTriangle, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  costPrice: number;
  sellPrice: number;
  stockValue: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestocked: string | null;
  barcode: string | null;
}

interface StockAdjustment {
  productId: string;
  type: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState<StockAdjustment>({
    productId: '',
    type: 'increase',
    quantity: 0,
    reason: '',
  });

  // Fetch inventory from API
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || item.stockStatus === statusFilter;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Stock status styling
  const getStockStatusBadge = (status: string) => {
    const statusStyles = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
    };
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatusText = (status: string) => {
    const statusText = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
    };
    return statusText[status as keyof typeof statusText] || status;
  };

  // Open stock adjustment modal
  const openAdjustmentModal = (product: InventoryItem) => {
    setSelectedProduct(product);
    setAdjustment({
      productId: product.id,
      type: 'increase',
      quantity: 0,
      reason: '',
    });
    setShowAdjustmentModal(true);
  };

  // Submit stock adjustment
  const submitAdjustment = async () => {
    if (!adjustment.quantity || !adjustment.reason) {
      toast.error('Please enter quantity and reason');
      return;
    }

    try {
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustment),
      });

      if (!response.ok) {
        throw new Error('Failed to adjust stock');
      }

      toast.success('Stock adjusted successfully');
      setShowAdjustmentModal(false);
      fetchInventory(); // Refresh data
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      toast.error('Failed to adjust stock');
    }
  };

  // Calculate summary statistics
  const totalProducts = inventory.length;
  const lowStockItems = inventory.filter(item => item.stockStatus === 'low_stock').length;
  const outOfStockItems = inventory.filter(item => item.stockStatus === 'out_of_stock').length;
  const totalStockValue = inventory.reduce((sum, item) => sum + item.stockValue, 0);

  return (
    <AdminLayout title="Inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-coffee-900">Inventory Management</h1>
            <p className="text-coffee-600">Track stock levels and manage inventory</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700">
              <RotateCcw className="h-4 w-4 mr-2" />
              Bulk Restock
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-coffee-600 mr-3" />
              <div>
                <p className="text-sm text-coffee-600">Total Products</p>
                <p className="text-xl font-semibold text-coffee-900">{totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-coffee-600">Low Stock Alert</p>
                <p className="text-xl font-semibold text-coffee-900">{lowStockItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-coffee-600">Out of Stock</p>
                <p className="text-xl font-semibold text-coffee-900">{outOfStockItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-coffee-600">Total Stock Value</p>
                <p className="text-xl font-semibold text-coffee-900">₨{totalStockValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
              <input
                type="text"
                placeholder="Search by product name, brand, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="capsules">Capsules</option>
                <option value="beans">Beans</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border-b border-cream-100">
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
          ) : filteredInventory.length > 0 ? (
            <div className="overflow-x-auto" data-testid="inventory-table">
              <table className="w-full">
                <thead className="bg-coffee-50 border-b border-cream-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Product</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Category</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Current Stock</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Min/Max</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Value</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-coffee-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-coffee-25" data-testid="stock-level">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-coffee-900">{item.name}</p>
                          <p className="text-sm text-coffee-600 capitalize">{item.brand.replace('-', ' ')}</p>
                          {item.barcode && (
                            <p className="text-xs text-coffee-500">Barcode: {item.barcode}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-coffee-100 text-coffee-800 rounded-full capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-coffee-900 mr-2">{item.currentStock}</span>
                          <div className="flex flex-col">
                            {item.currentStock <= item.minStockLevel && (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            {item.currentStock >= item.maxStockLevel * 0.8 && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        {item.lastRestocked && (
                          <p className="text-xs text-coffee-500">
                            Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-coffee-900">Min: {item.minStockLevel}</p>
                          <p className="text-coffee-600">Max: {item.maxStockLevel}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockStatusBadge(item.stockStatus)}`}>
                          {getStockStatusText(item.stockStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-coffee-900">₨{item.stockValue.toFixed(2)}</p>
                          <p className="text-sm text-coffee-600">
                            ₨{item.costPrice.toFixed(2)} cost / ₨{item.sellPrice.toFixed(2)} sell
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openAdjustmentModal(item)}
                          className="inline-flex items-center px-3 py-1 bg-coffee-600 text-white text-sm rounded-lg hover:bg-coffee-700"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-coffee-900 mb-2">No inventory items found</h3>
              <p className="text-coffee-600">
                {searchTerm || statusFilter || categoryFilter 
                  ? 'Try adjusting your search criteria' 
                  : 'Inventory will be populated from your products'}
              </p>
            </div>
          )}
        </div>

        {/* Stock Adjustment Modal */}
        {showAdjustmentModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-cream-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-900">Adjust Stock</h2>
                  <button
                    onClick={() => setShowAdjustmentModal(false)}
                    className="text-coffee-500 hover:text-coffee-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-coffee-600 mt-1">{selectedProduct.name}</p>
                <p className="text-sm text-coffee-500">Current Stock: {selectedProduct.currentStock}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustment.type}
                    onChange={(e) => setAdjustment(prev => ({ ...prev, type: e.target.value as 'increase' | 'decrease' | 'set' }))}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                  >
                    <option value="increase">Increase Stock</option>
                    <option value="decrease">Decrease Stock</option>
                    <option value="set">Set Stock Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adjustment.quantity}
                    onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Reason
                  </label>
                  <select
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                  >
                    <option value="">Select reason</option>
                    <option value="restocking">Restocking</option>
                    <option value="sale">Sale</option>
                    <option value="damage">Damage/Loss</option>
                    <option value="return">Return</option>
                    <option value="correction">Stock Correction</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAdjustmentModal(false)}
                    className="flex-1 px-4 py-2 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAdjustment}
                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
                  >
                    Adjust Stock
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