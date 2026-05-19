import React from 'react';

const EmptyState = ({ title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center transition-colors duration-300">

      <h3 className="text-2xl font-bold text-slate-800 mb-2">
        {title}
      </h3>

      <p className="text-slate-500">
        {message}
      </p>

    </div>
  );
};

export default EmptyState;