import React, { useState } from 'react';
import { Pagination } from '@/components/ui/pagination';

const PaginationTest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log('Page changed to:', page);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pagination Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Page: {currentPage}</h2>
          <h3 className="text-lg mb-4">Total Pages: {totalPages}</h3>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mb-4"
          />
          
          <div className="mt-4 text-sm text-gray-600">
            <p>This is a test page to verify the pagination component works correctly.</p>
            <p>Click the page numbers or next/previous buttons to test navigation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginationTest;
