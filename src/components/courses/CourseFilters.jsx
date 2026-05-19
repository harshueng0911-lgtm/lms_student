import React from 'react';
import { Search } from 'lucide-react';

const CourseFilters = ({ 
  categories, 
  levels, 
  selectedCategory, 
  setSelectedCategory, 
  selectedLevel, 
  setSelectedLevel,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          placeholder="Search for courses, topics, or instructors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between pt-2">
        {/* Categories */}
        <div className="flex-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Levels */}
        <div className="flex space-x-2 border-l-0 md:border-l border-slate-200 pl-0 md:pl-4">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedLevel === level
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
