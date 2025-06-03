import React from 'react';

const SuggestionChip = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
    >
      {text}
    </button>
  );
};

export default SuggestionChip;
