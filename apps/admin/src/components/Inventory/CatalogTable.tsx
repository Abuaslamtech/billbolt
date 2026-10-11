import { Barcode } from 'lucide-react';
import inventoryImage from '../../assets/images/inventory.png';
import { formatCurrency } from '../../lib/formatters';
import { StatusPill } from '../Elements/StatusPill';
import type { ProductStockItem } from '../../hooks/useInventoryScreen';

export interface CatalogTableProps {
  products: ProductStockItem[];
  isLoading?: boolean;
}

export const CatalogTable: React.FC<CatalogTableProps> = ({
  products,
  isLoading = false,
}) => {
  return (
    <div className="rounded-2xl bg-white border border-bolt-border overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-bolt-surface/80 border-b border-bolt-border text-bolt-slate font-semibold uppercase tracking-wider text-2xs">
            <tr>
              <th className="py-3.5 px-5">Product Name</th>
              <th className="py-3.5 px-5">Category</th>
              <th className="py-3.5 px-5">Selling Price</th>
              <th className="py-3.5 px-5">Cost Price</th>
              <th className="py-3.5 px-5">Current Stock</th>
              <th className="py-3.5 px-5">Reorder Level</th>
              <th className="py-3.5 px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bolt-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-bolt-slate">
                  <div className="w-6 h-6 border-2 border-bolt-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="font-medium text-xs">Loading products...</p>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-bolt-slate">
                  <img
                    src={inventoryImage}
                    alt="Inventory"
                    className="w-16 h-16 mx-auto object-contain mb-3 opacity-80"
                  />
                  <p className="font-semibold text-xs text-bolt-graphite">No products in inventory</p>
                  <p className="text-2xs text-bolt-slate">Items added from the mobile app will be indexed here.</p>
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id} className="hover:bg-bolt-surface/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-bolt-graphite">{item.name}</div>
                    {item.qrCode && (
                      <div className="text-2xs text-bolt-slate font-mono flex items-center gap-1 mt-0.5">
                        <Barcode className="w-3 h-3" /> {item.qrCode}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-bolt-surface border border-bolt-border text-bolt-slate">
                      {item.category || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-poppins font-bold text-bolt-graphite text-sm">
                    {formatCurrency(item.sellingPrice)}
                  </td>
                  <td className="py-4 px-5 text-bolt-slate">
                    {formatCurrency(item.costPrice)}
                  </td>
                  <td className="py-4 px-5 font-semibold text-bolt-graphite">
                    {item.currentStock} units
                  </td>
                  <td className="py-4 px-5 text-bolt-slate">
                    {item.reorderLevel} units
                  </td>
                  <td className="py-4 px-5">
                    {item.status === 'In Stock' && (
                      <StatusPill status="healthy" label="In Stock" />
                    )}
                    {item.status === 'Low Stock' && (
                      <StatusPill status="warning" label={`Low (${item.currentStock})`} />
                    )}
                    {item.status === 'Out of Stock' && (
                      <StatusPill status="danger" label="Depleted" />
                    )}
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
