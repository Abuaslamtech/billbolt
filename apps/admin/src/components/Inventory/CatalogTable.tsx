import React from 'react';
import { Package, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import type { ProductStockItem } from '../../hooks/useInventoryScreen';

export interface CatalogTableProps {
  products: ProductStockItem[];
  isLoading?: boolean;
}

export const CatalogTable: React.FC<CatalogTableProps> = ({
  products,
  isLoading = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Depleted
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-bolt-slate border border-bolt-border">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-bolt-border shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bolt-surface/60 border-b border-bolt-border text-[11px] font-bold text-bolt-slate uppercase tracking-wider">
              <th className="py-4 px-6">Product &amp; SKU</th>
              <th className="py-4 px-6">Merchant Store</th>
              <th className="py-4 px-6 text-right">Selling Price</th>
              <th className="py-4 px-6 text-right">Cost Price</th>
              <th className="py-4 px-6 text-center">Current Stock</th>
              <th className="py-4 px-6 text-center">Reorder Level</th>
              <th className="py-4 px-6 text-center">Stock Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bolt-border text-xs font-medium">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 w-36 bg-bolt-slate/15 rounded mb-1" /><div className="h-3 w-20 bg-bolt-slate/10 rounded" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-28 bg-bolt-slate/15 rounded" /></td>
                  <td className="py-4 px-6 text-right"><div className="h-4 w-20 bg-bolt-slate/15 rounded ml-auto" /></td>
                  <td className="py-4 px-6 text-right"><div className="h-4 w-20 bg-bolt-slate/15 rounded ml-auto" /></td>
                  <td className="py-4 px-6 text-center"><div className="h-4 w-12 bg-bolt-slate/15 rounded mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><div className="h-4 w-12 bg-bolt-slate/15 rounded mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><div className="h-5 w-20 bg-bolt-slate/15 rounded-full mx-auto" /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-bolt-surface flex items-center justify-center text-bolt-slate mx-auto mb-3 border border-bolt-border">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-bolt-graphite">No products in inventory</p>
                  <p className="text-xs text-bolt-slate mt-1 max-w-sm mx-auto">
                    Products created across merchant terminals will sync here.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id} className="hover:bg-bolt-surface/60 transition-colors">
                  {/* Product Details */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-bolt-light text-bolt-blue flex items-center justify-center font-bold text-xs shrink-0 border border-bolt-blue/20">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-bolt-graphite truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-bolt-slate truncate font-normal">
                          {item.category || 'General Product'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Merchant Store */}
                  <td className="py-4 px-6 text-bolt-slate">
                    <span className="font-semibold text-bolt-graphite">
                      {item.businessName || 'Main Merchant'}
                    </span>
                  </td>

                  {/* Selling Price */}
                  <td className="py-4 px-6 text-right font-black text-bolt-graphite text-sm tracking-tight">
                    {formatCurrency(item.sellingPrice)}
                  </td>

                  {/* Cost Price */}
                  <td className="py-4 px-6 text-right font-mono text-bolt-slate">
                    {formatCurrency(item.costPrice)}
                  </td>

                  {/* Current Stock */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`font-black text-sm ${
                        item.currentStock <= 0
                          ? 'text-rose-600'
                          : item.currentStock <= item.reorderLevel
                          ? 'text-amber-600'
                          : 'text-bolt-graphite'
                      }`}
                    >
                      {item.currentStock}
                    </span>{' '}
                    <span className="text-[11px] text-bolt-slate">units</span>
                  </td>

                  {/* Reorder Level */}
                  <td className="py-4 px-6 text-center font-mono text-bolt-slate">
                    {item.reorderLevel}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
