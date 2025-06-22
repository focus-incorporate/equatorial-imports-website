'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Users, Plus, Search, Edit, Eye, Mail, Phone, MapPin, Award, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  creditLimit: number;
  customerGroup: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customerGroup: 'regular',
    loyaltyPoints: 0,
    creditLimit: 0,
  });

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = !groupFilter || customer.customerGroup === groupFilter;
    
    return matchesSearch && matchesGroup;
  });

  // Customer group badge styling
  const getGroupBadge = (group: string) => {
    const groupStyles = {
      regular: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      vip: 'bg-gold-100 text-gold-800',
    };
    return groupStyles[group as keyof typeof groupStyles] || 'bg-gray-100 text-gray-800';
  };

  // View customer details
  const viewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  // Create new customer
  const createCustomer = async () => {
    if (!newCustomer.name) {
      toast.error('Customer name is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      toast.success('Customer created successfully');
      setShowAddModal(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        customerGroup: 'regular',
        loyaltyPoints: 0,
        creditLimit: 0,
      });
      fetchCustomers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Edit customer
  const editCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  // Update customer
  const updateCustomer = async () => {
    if (!selectedCustomer) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCustomer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      toast.success('Customer updated successfully');
      setShowEditModal(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update customer';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminLayout title="Customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-coffee-900">Customers</h1>
            <p className="text-coffee-600">Manage customer information and loyalty program</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              >
                <option value="">All Groups</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border-b border-cream-100">
                    <div className="w-12 h-12 bg-cream-200 rounded-full"></div>
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
          ) : filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-coffee-50 border-b border-cream-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Contact</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Group</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Orders</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Total Spent</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Loyalty Points</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-coffee-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-coffee-25">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-coffee-600" />
                          </div>
                          <div>
                            <p className="font-medium text-coffee-900">{customer.name}</p>
                            <p className="text-sm text-coffee-600">
                              Member since {new Date(customer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-coffee-900">
                            <Mail className="h-4 w-4 mr-2 text-coffee-500" />
                            {customer.email || 'N/A'}
                          </div>
                          <div className="flex items-center text-sm text-coffee-600">
                            <Phone className="h-4 w-4 mr-2 text-coffee-500" />
                            {customer.phone || 'N/A'}
                          </div>
                          {customer.address && (
                            <div className="flex items-center text-sm text-coffee-600">
                              <MapPin className="h-4 w-4 mr-2 text-coffee-500" />
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getGroupBadge(customer.customerGroup)}`}>
                          {customer.customerGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium text-coffee-900">{customer.totalOrders}</span>
                          {customer.lastOrderDate && (
                            <p className="text-sm text-coffee-600">
                              Last: {new Date(customer.lastOrderDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-coffee-900">₨{customer.totalSpent.toFixed(2)}</span>
                        {customer.creditLimit > 0 && (
                          <p className="text-sm text-coffee-600">
                            Credit: ₨{customer.creditLimit.toFixed(2)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-gold-600 mr-1" />
                          <span className="font-medium text-coffee-900">{customer.loyaltyPoints}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => viewCustomer(customer)}
                            className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => editCustomer(customer)}
                            className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg">
                            <CreditCard className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-coffee-900 mb-2">No customers found</h3>
              <p className="text-coffee-600 mb-4">
                {searchTerm || groupFilter 
                  ? 'Try adjusting your search criteria' 
                  : 'Get started by adding your first customer'}
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </button>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!isLoading && customers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-coffee-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Total Customers</p>
                  <p className="text-xl font-semibold text-coffee-900">{customers.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Premium Members</p>
                  <p className="text-xl font-semibold text-coffee-900">
                    {customers.filter(c => c.customerGroup === 'premium').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-gold-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Total Loyalty Points</p>
                  <p className="text-xl font-semibold text-coffee-900">
                    {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Total Revenue</p>
                  <p className="text-xl font-semibold text-coffee-900">
                    ₨{customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Detail Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-cream-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-900">Customer Details</h2>
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="text-coffee-500 hover:text-coffee-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-coffee-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-coffee-600">Name</label>
                        <p className="text-coffee-900">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-coffee-600">Email</label>
                        <p className="text-coffee-900">{selectedCustomer.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-coffee-600">Phone</label>
                        <p className="text-coffee-900">{selectedCustomer.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-coffee-600">Address</label>
                        <p className="text-coffee-900">{selectedCustomer.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-coffee-900 mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-coffee-600">Customer Group</label>
                        <p className="text-coffee-900 capitalize">{selectedCustomer.customerGroup}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-coffee-600">Member Since</label>
                        <p className="text-coffee-900">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-coffee-600">Loyalty Points</label>
                        <p className="text-coffee-900">{selectedCustomer.loyaltyPoints}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-coffee-600">Credit Limit</label>
                        <p className="text-coffee-900">₨{selectedCustomer.creditLimit.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-coffee-900 mb-4">Order History</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-coffee-50 p-4 rounded-lg">
                      <p className="text-sm text-coffee-600">Total Orders</p>
                      <p className="text-2xl font-semibold text-coffee-900">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div className="bg-coffee-50 p-4 rounded-lg">
                      <p className="text-sm text-coffee-600">Total Spent</p>
                      <p className="text-2xl font-semibold text-coffee-900">₨{selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="bg-coffee-50 p-4 rounded-lg">
                      <p className="text-sm text-coffee-600">Last Order</p>
                      <p className="text-lg font-semibold text-coffee-900">
                        {selectedCustomer.lastOrderDate ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-cream-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-900">Add New Customer</h2>
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
                  <label className="block text-sm font-medium text-coffee-900 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Email</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="+248 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">Address</label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder="Enter customer address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Customer Group</label>
                    <select
                      value={newCustomer.customerGroup}
                      onChange={(e) => setNewCustomer({ ...newCustomer, customerGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    >
                      <option value="regular">Regular</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Credit Limit (SCR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCustomer.creditLimit}
                      onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createCustomer}
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Customer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-cream-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-900">Edit Customer</h2>
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
                  <label className="block text-sm font-medium text-coffee-900 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Email</label>
                    <input
                      type="email"
                      value={selectedCustomer.email || ''}
                      onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={selectedCustomer.phone || ''}
                      onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="+248 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">Address</label>
                  <textarea
                    value={selectedCustomer.address || ''}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder="Enter customer address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Customer Group</label>
                    <select
                      value={selectedCustomer.customerGroup}
                      onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customerGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    >
                      <option value="regular">Regular</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Loyalty Points</label>
                    <input
                      type="number"
                      value={selectedCustomer.loyaltyPoints}
                      onChange={(e) => setSelectedCustomer({ ...selectedCustomer, loyaltyPoints: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">Credit Limit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedCustomer.creditLimit}
                      onChange={(e) => setSelectedCustomer({ ...selectedCustomer, creditLimit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      placeholder="0.00"
                    />
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
                    onClick={updateCustomer}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Update Customer'}
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