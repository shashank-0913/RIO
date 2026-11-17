import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  Smartphone,
  Car,
  Armchair,
  Tv,
  BookOpen,
  Building2,
} from 'lucide-react';
import { CategoryType, SortType } from '../types';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  selectedSort: SortType;
  onSelectSort: (sort: SortType) => void;
  totalResults: number;
}

const CATEGORIES: { label: CategoryType; icon: React.FC<{ className?: string }> }[] = [
  { label: 'All', icon: LayoutGrid },
  { label: 'Mobiles & Electronics', icon: Smartphone },
  { label: 'Bikes & Cars', icon: Car },
  { label: 'Furniture', icon: Armchair },
  { label: 'Appliances', icon: Tv },
  { label: 'Books & Hobbies', icon: BookOpen },
  { label: 'Property', icon: Building2 },
];

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  totalResults,
}) => {
  return (
    <div className="w-full bg-dark-bg/60 border-b border-dark-border py-4 space-y-3.5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        {/* Search Bar + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          {/* Instant Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search iPhone, Royal Enfield, Sofa, Flat in Visakhapatnam..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-muted text-sm focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-muted hover:text-dark-text"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Results Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            <span className="text-xs text-dark-muted hidden lg:inline">
              <strong className="text-dark-text">{totalResults}</strong> verified items
            </span>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
              <label htmlFor="sort-select" className="text-dark-muted hidden sm:inline">Sort:</label>
              <select
                id="sort-select"
                value={selectedSort}
                onChange={(e) => onSelectSort(e.target.value as SortType)}
                className="bg-transparent text-dark-text font-medium text-xs focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-dark-card text-dark-text">Newest First</option>
                <option value="nearest" className="bg-dark-card text-dark-text">Nearest to Me</option>
                <option value="price-low-high" className="bg-dark-card text-dark-text">Price: Low to High</option>
                <option value="price-high-low" className="bg-dark-card text-dark-text">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(({ label, icon: Icon }) => {
            const isSelected = selectedCategory === label;
            return (
              <button
                key={label}
                onClick={() => onSelectCategory(label)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'border-brand-emerald bg-brand-emerald text-white shadow-md shadow-brand-emerald/20'
                    : 'border-dark-border bg-dark-card/80 text-dark-muted hover:text-dark-text hover:border-dark-border/80 hover:bg-dark-cardElevated'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-brand-emerald'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

