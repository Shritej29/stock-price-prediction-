import React from 'react';
import useAxios from 'axios-hooks';
import { NewspaperIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

function StockNews({ symbol }) {
  const [{ data: news, loading, error }] = useAxios(
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=YOUR_API_KEY`
  );

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 p-4 text-center">
      Failed to load news. Please try again later.
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <NewspaperIcon className="h-6 w-6 mr-2 text-indigo-600" />
        Latest Stock News
      </h2>
      <div className="space-y-6">
        {news?.feed?.slice(0, 5).map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-600 mb-2">{item.summary}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span>{new Date(item.time_published).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{item.source}</span>
              {item.overall_sentiment_label && (
                <>
                  <span className="mx-2">•</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.overall_sentiment_label === 'Bullish' 
                      ? 'bg-green-100 text-green-800'
                      : item.overall_sentiment_label === 'Bearish'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.overall_sentiment_label}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockNews;
