'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Settings as SettingsIcon, Save, ArrowLeftRight, Building, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface StoreSetting {
  key: string;
  value: string;
  description: string;
}

interface CurrencyRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Currency converter state
  const [convertAmount, setConvertAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('SCR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [conversionResult, setConversionResult] = useState<number | null>(null);

  // Fetch settings and currency rates
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [settingsRes, ratesRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/currency-rates'),
      ]);

      if (!settingsRes.ok || !ratesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [settingsData, ratesData] = await Promise.all([
        settingsRes.json(),
        ratesRes.json(),
      ]);

      // Convert settings array to object for easier handling
      const settingsObj = settingsData.settings.reduce((acc: Record<string, string>, setting: StoreSetting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSettings(settingsObj);
      setCurrencyRates(ratesData.rates || []);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save settings
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Update setting value
  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Convert currency
  const convertCurrency = () => {
    const amount = parseFloat(convertAmount);
    if (isNaN(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Find the exchange rate
    const rate = currencyRates.find(r => 
      r.baseCurrency === fromCurrency && r.targetCurrency === toCurrency
    );

    if (rate) {
      setConversionResult(amount * rate.rate);
    } else {
      // Try reverse rate
      const reverseRate = currencyRates.find(r => 
        r.baseCurrency === toCurrency && r.targetCurrency === fromCurrency
      );
      if (reverseRate) {
        setConversionResult(amount / reverseRate.rate);
      } else {
        toast.error('Exchange rate not available');
      }
    }
  };

  // Get available currencies
  const availableCurrencies = Array.from(new Set([
    ...currencyRates.map(r => r.baseCurrency),
    ...currencyRates.map(r => r.targetCurrency),
  ])).sort();

  const companyFields = [
    { key: 'company_name', label: 'Company Name', type: 'text' },
    { key: 'company_email', label: 'Company Email', type: 'email' },
    { key: 'company_phone', label: 'Company Phone', type: 'tel' },
    { key: 'company_address', label: 'Company Address', type: 'textarea' },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'vat_number', label: 'VAT Number', type: 'text' },
  ];

  const businessFields = [
    { key: 'business_hours', label: 'Business Hours', type: 'textarea' },
    { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number' },
    { key: 'currency', label: 'Primary Currency', type: 'select', options: ['SCR', 'USD', 'EUR', 'GBP'] },
    { key: 'currency_symbol', label: 'Currency Symbol', type: 'text' },
    { key: 'invoice_prefix', label: 'Invoice Prefix', type: 'text' },
    { key: 'receipt_footer', label: 'Receipt Footer Message', type: 'textarea' },
  ];

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-coffee-900">Settings</h1>
            <p className="text-coffee-600">Manage your company information and system preferences</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50"
          >
            <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center mb-6">
              <Building className="h-6 w-6 text-coffee-600 mr-3" />
              <h2 className="text-xl font-semibold text-coffee-900">Company Information</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-cream-200 rounded w-1/3 mb-2"></div>
                    <div className="h-10 bg-cream-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4" data-testid="company-settings-form">
                {companyFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={settings[field.key] || ''}
                        onChange={(e) => updateSetting(field.key, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={settings[field.key] || ''}
                        onChange={(e) => updateSetting(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Business Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center mb-6">
              <SettingsIcon className="h-6 w-6 text-coffee-600 mr-3" />
              <h2 className="text-xl font-semibold text-coffee-900">Business Settings</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-cream-200 rounded w-1/3 mb-2"></div>
                    <div className="h-10 bg-cream-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {businessFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={settings[field.key] || ''}
                        onChange={(e) => updateSetting(field.key, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={settings[field.key] || ''}
                        onChange={(e) => updateSetting(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={settings[field.key] || ''}
                        onChange={(e) => updateSetting(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Currency Converter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
          <div className="flex items-center mb-6">
            <ArrowLeftRight className="h-6 w-6 text-coffee-600 mr-3" />
            <h2 className="text-xl font-semibold text-coffee-900">Currency Converter</h2>
            <div className="ml-auto flex items-center text-sm text-coffee-600">
              <span className="mr-2">Default: Seychelles Rupees (SCR)</span>
              <span className="font-bold text-coffee-900">₨</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="currency-converter">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                  placeholder="Enter amount"
                  data-testid="amount-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    From
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    data-testid="from-currency"
                  >
                    {availableCurrencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    To
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    data-testid="to-currency"
                  >
                    {availableCurrencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={convertCurrency}
                className="w-full flex items-center justify-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
                data-testid="convert-button"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Convert
              </button>
            </div>

            <div className="flex items-center justify-center">
              {conversionResult !== null ? (
                <div className="text-center p-6 bg-coffee-50 rounded-lg" data-testid="conversion-result">
                  <p className="text-sm text-coffee-600 mb-2">Conversion Result</p>
                  <p className="text-3xl font-bold text-coffee-900">
                    {conversionResult.toFixed(2)} {toCurrency}
                  </p>
                  <p className="text-sm text-coffee-600 mt-2">
                    {convertAmount} {fromCurrency} = {conversionResult.toFixed(2)} {toCurrency}
                  </p>
                </div>
              ) : (
                <div className="text-center p-6 bg-cream-50 rounded-lg">
                  <ArrowLeftRight className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
                  <p className="text-coffee-600">Enter amount and click convert</p>
                </div>
              )}
            </div>
          </div>

          {/* Exchange Rates Table */}
          {currencyRates.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-coffee-900 mb-4">Current Exchange Rates</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-coffee-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-coffee-900">From</th>
                      <th className="text-left px-4 py-2 font-medium text-coffee-900">To</th>
                      <th className="text-left px-4 py-2 font-medium text-coffee-900">Rate</th>
                      <th className="text-left px-4 py-2 font-medium text-coffee-900">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {currencyRates.map((rate, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 font-medium">{rate.baseCurrency}</td>
                        <td className="px-4 py-2">{rate.targetCurrency}</td>
                        <td className="px-4 py-2">{rate.rate.toFixed(4)}</td>
                        <td className="px-4 py-2 text-coffee-600">
                          {new Date(rate.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}