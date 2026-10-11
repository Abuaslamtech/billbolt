import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../Elements/Button';

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canPrevPage: boolean;
  canNextPage: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPrevPage,
  onNextPage,
  canPrevPage,
  canNextPage,
}) => {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-4 border-t border-bolt-border bg-bolt-surface/40 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-bolt-slate font-medium">
        Showing{' '}
        <span className="font-bold text-bolt-graphite">
          {from}–{to}
        </span>{' '}
        of <span className="font-bold text-bolt-graphite">{totalItems}</span> entries
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onPrevPage}
          disabled={!canPrevPage}
          icon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>
        <span className="text-xs font-semibold px-2 py-1 text-bolt-slate">
          Page {currentPage}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={onNextPage}
          disabled={!canNextPage}
        >
          Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
