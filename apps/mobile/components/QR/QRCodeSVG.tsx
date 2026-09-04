import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { createQrMatrix } from '@/lib/qr/qrGenerator';
import { Colors } from '@/lib/colors';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  quietZone?: number;
}

/**
 * Crisp, pure-vector SVG QR Code Renderer
 * Computes modules locally with zero server requests and renders razor-sharp at any size.
 */
export default function QRCodeSVG({
  value,
  size = 180,
  color = Colors.graphite,
  backgroundColor = Colors.card,
  quietZone = 2,
}: QRCodeSVGProps) {
  const { pathData, viewBoxSize } = useMemo(() => {
    if (!value) {
      return { pathData: '', viewBoxSize: 21 + quietZone * 2 };
    }

    try {
      const { matrix, size: matrixSize } = createQrMatrix(value);
      const totalSize = matrixSize + quietZone * 2;
      let d = '';

      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (matrix[r][c]) {
            const x = c + quietZone;
            const y = r + quietZone;
            // Draw a 1x1 module square in path syntax
            d += `M${x},${y}h1v1h-1z `;
          }
        }
      }

      return { pathData: d.trim(), viewBoxSize: totalSize };
    } catch (err) {
      console.error('[QRCodeSVG] Matrix generation error:', err);
      return { pathData: '', viewBoxSize: 25 };
    }
  }, [value, quietZone]);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
        <Rect width={viewBoxSize} height={viewBoxSize} fill={backgroundColor} />
        {pathData ? <Path d={pathData} fill={color} /> : null}
      </Svg>
    </View>
  );
}
