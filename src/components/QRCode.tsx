import { useEffect, useRef } from "react";

interface QRCodeProps {
  upiId: string;
  amount: number;
  name: string;
}

const QRCode = ({ upiId, amount, name }: QRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Create UPI payment URL
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

      // Use a simple QR code generation approach
      // For production, you'd use a proper library like qrcode
      const QRCode = await import("qrcode");
      
      await QRCode.toCanvas(canvas, upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#d4a574",
          light: "#0a0a0a"
        }
      });
    };

    generateQR();
  }, [upiId, amount, name]);

  return (
    <div className="bg-card p-4 rounded-lg border border-border inline-block">
      <canvas ref={canvasRef} className="rounded" />
    </div>
  );
};

export default QRCode;
