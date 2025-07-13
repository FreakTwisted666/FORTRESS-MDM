
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  size?: number;
}

export function QRCodeGenerator({ data, title = "Enrollment QR Code", size = 256 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    }
  }, [data, size]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const printQR = () => {
    if (canvasRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print QR Code</title></head>
            <body style="text-align: center; padding: 20px;">
              <h2>${title}</h2>
              <img src="${canvasRef.current.toDataURL()}" />
              <p style="margin-top: 20px; font-size: 12px;">
                Scan this QR code with the Fortress MDM mobile app to enroll your device
              </p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Card className="w-fit mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <canvas ref={canvasRef} className="border rounded-lg" />
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={downloadQR}>
            <Download className="mr-2" size={16} />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={printQR}>
            <Printer className="mr-2" size={16} />
            Print
          </Button>
        </div>
        <p className="text-xs text-gray-500 max-w-xs">
          Scan with Fortress MDM mobile app to automatically configure device enrollment
        </p>
      </CardContent>
    </Card>
  );
}
