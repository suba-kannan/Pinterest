import React from 'react';

const CATEGORIES = [
  'All',
  'Travel',
  'Food',
  'Art',
  'Home Decor',
  'Fashion',
  'DIY',
  'Quotes',
  'Photography',
  'Tech',
  'Nature',
  'Others'
];

export default function CategoryChips({ activeCategory, onSelectCategory }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap active:scale-95 cursor-pointer border ${
              isActive
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-transparent'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
