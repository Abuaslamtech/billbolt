import * as Print from "expo-print";
import { Product, ProductWithStock } from "@/types/models";
import { createQrMatrix } from "./qrGenerator";

export async function generateProductLabelPdf(
  product: ProductWithStock | Product
): Promise<string> {
  const sku = product.qrCode || '';

  // Generate QR BitMatrix
  const { matrix, size } = createQrMatrix(sku);

  // Build SVG path/rects
  let rects = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) {
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000000" />`;
      }
    }
  }

  const svgString = `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; shape-rendering: crispEdges;">
      ${rects}
    </svg>
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${product.name} - QR</title>
      <style>
        @page {
          size: 40mm 40mm;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
        }
        body {
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          width: 40mm;
          height: 40mm;
        }
        .qr-frame {
          width: 35mm;
          height: 35mm;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
    </head>
    <body>
      <div class="qr-frame">
        ${svgString}
      </div>
    </body>
    </html>
  `.trim();

  const { uri } = await Print.printToFileAsync({
    html,
    width: 113, // ~40mm in pt (72pt/in)
    height: 113, // ~40mm in pt
  });

  return uri;
}
