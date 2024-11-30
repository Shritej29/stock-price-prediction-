import React from 'react';
import useAxios from 'axios-hooks';
import { 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

function StockDetails({ symbol }) {
  const [{ data: overview, loading, error }] = useAxios(
    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=YOUR_API_KEY`
  );

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 p-4 text-center">
      Failed to load stock details. Please try again later.
    </div>
  );

  const stats = [
    { name: 'Market Cap', value: overview?.MarketCapitalization, icon: CurrencyDollarIcon },
    { name: '52 Week High', value: overview?.['52WeekHigh'], icon: ArrowTrendingUpIcon },
    { name: '52 Week Low', value: overview?.['52WeekLow'], icon: ChartBarIcon },
    { name: 'PE Ratio', value: overview?.PERatio, icon: ClockIcon },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900">{overview?.Name}</h2>
        <p className="mt-2 text-gray-600">{overview?.Description}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {item.name.includes('Market Cap') 
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(item.value)
                    : item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="border-t border-gray-200 pt-4">
          <dt className="text-sm font-medium text-gray-500">Industry</dt>
          <dd className="mt-1 text-lg text-gray-900">{overview?.Industry}</dd>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <dt className="text-sm font-medium text-gray-500">Sector</dt>
          <dd className="mt-1 text-lg text-gray-900">{overview?.Sector}</dd>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <dt className="text-sm font-medium text-gray-500">Exchange</dt>
          <dd className="mt-1 text-lg text-gray-900">{overview?.Exchange}</dd>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <dt className="text-sm font-medium text-gray-500">Dividend Yield</dt>
          <dd className="mt-1 text-lg text-gray-900">
            {overview?.DividendYield ? `${(Number(overview.DividendYield) * 100).toFixed(2)}%` : 'N/A'}
          </dd>
        </div>
      </div>
    </div>
  );
}

export default StockDetails;
