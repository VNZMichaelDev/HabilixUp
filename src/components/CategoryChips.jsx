import React from 'react';

const CategoryChips = ({ categories, selected, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto px-4 pb-2 mt-2">
    {['Todo', ...categories].map(cat => {
      const active = selected === cat || (!selected && cat === 'Todo');
      return (
        <button
          type="button"
          key={cat}
          onClick={() => onSelect(cat === 'Todo' ? null : cat)}
          className={`whitespace-nowrap px-4 py-1 rounded-full border text-sm shadow-sm ${
            active ? 'bg-primary text-white' : 'bg-white text-gray-600'
          }`}
        >
          {cat}
        </button>
      );
    })}
  </div>
);

export default CategoryChips;
