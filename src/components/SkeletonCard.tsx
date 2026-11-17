import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden animate-pulse flex flex-col justify-between">
      <div className="aspect-[4/3] w-full bg-dark-cardElevated relative">
        <div className="absolute top-2.5 left-2.5 w-16 h-4 bg-dark-border rounded-md" />
        <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-dark-border rounded-full" />
      </div>
      <div className="p-3.5 space-y-3">
        <div className="flex items-baseline gap-2">
          <div className="w-24 h-5 bg-dark-border rounded-md" />
          <div className="w-12 h-3 bg-dark-border rounded-md" />
        </div>
        <div className="w-full h-3.5 bg-dark-border rounded-md" />
        <div className="w-3/4 h-3.5 bg-dark-border rounded-md" />
        <div className="pt-2 border-t border-dark-border/60 flex items-center justify-between">
          <div className="w-20 h-3 bg-dark-border rounded-md" />
          <div className="w-12 h-3 bg-dark-border rounded-md" />
        </div>
      </div>
    </div>
  );
};

