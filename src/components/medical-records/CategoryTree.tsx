import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { CategoryTreeProps } from '@/types/health-records';

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  selectedCategories,
  onCategorySelect
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: any, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onCategorySelect(category.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(category.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-6" />}
          
          <div className={`w-10 h-10 ${category.color || 'bg-blue-600'} rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-sm ring-4 ring-white`}>
            {isExpanded && hasChildren ? (
              <FolderOpen className="w-5 h-5" />
            ) : (
              <Folder className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{category.name}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {category.recordCount || 0}
              </span>
            </div>
            {category.description && (
              <p className="text-xs text-gray-600 mt-1">{category.description}</p>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children!.map((child: any) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Folder className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Categories</h3>
      </div>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {categories.map(category => renderCategory(category))}
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Selected Categories:</div>
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map(categoryId => {
              const category = categories.find(c => c.id === categoryId) || 
                              categories.flatMap(c => c.children || []).find(c => c.id === categoryId);
              return category ? (
                <span
                  key={categoryId}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                >
                  <span>{category.icon || '📁'}</span>
                  <span>{category.name}</span>
                  <button
                    onClick={() => onCategorySelect(categoryId)}
                    className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
