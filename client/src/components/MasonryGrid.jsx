import React, { useState, useEffect } from 'react';
import PinCard from './PinCard';

export default function MasonryGrid({ pins, onSaveToggle, onPinClick }) {
  const [columnsCount, setColumnsCount] = useState(6);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      let count = 6;
      if (w < 640) count = 2;
      else if (w < 768) count = 3;
      else if (w < 1024) count = 4;
      else if (w < 1280) count = 5;
      
      // Limit columns count to pin count if we have fewer pins
      if (pins && pins.length > 0) {
        count = Math.min(count, pins.length);
      }
      setColumnsCount(count);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pins]);

  if (!pins || pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700">No ideas found</h3>
        <p className="text-gray-500 mt-1 text-sm max-w-sm">
          We couldn't find any pins matching your query. Try searching for something else or create your own!
        </p>
      </div>
    );
  }

  // Distribute pins evenly to each column
  const columns = Array.from({ length: columnsCount }, () => []);
  pins.forEach((pin, index) => {
    columns[index % columnsCount].push(pin);
  });

  return (
    <div className="flex gap-4 justify-center w-full mx-auto animate-fadeIn">
      {columns.map((columnPins, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4 flex-1 min-w-[150px] max-w-[280px]">
          {columnPins.map((pin) => (
            <PinCard key={pin._id} pin={pin} onSaveToggle={onSaveToggle} onClick={onPinClick} />
          ))}
        </div>
      ))}
    </div>
  );
}
