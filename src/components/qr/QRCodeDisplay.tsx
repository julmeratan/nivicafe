import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  tableNumber: number;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ tableNumber, size = 200 }) => {
  const baseUrl = window.location.origin;
  const menuUrl = `${baseUrl}/menu?table=${tableNumber}`;

  const handleDownload = () => {
    const svg = document.getElementById(`qr-table-${tableNumber}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `table-${tableNumber}-qr.png`;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl">
      <div className="text-center">
        <h3 className="text-lg font-bold text-charcoal">Table {tableNumber}</h3>
        <p className="text-sm text-charcoal/70">Scan to view menu</p>
      </div>
      
      <QRCodeSVG
        id={`qr-table-${tableNumber}`}
        value={menuUrl}
        size={size}
        level="H"
        includeMargin
        fgColor="#1a1a1a"
        bgColor="#ffffff"
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="text-charcoal border-charcoal/20"
      >
        <Download className="w-4 h-4 mr-2" />
        Download QR
      </Button>
    </div>
  );
};

export default QRCodeDisplay;
