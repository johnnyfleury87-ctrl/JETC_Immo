import { useRef, useEffect, useState } from "react";

export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (blob && onSave) {
        onSave(blob);
      }
    });
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Signature</h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{ border: "1px solid #ddd", cursor: "crosshair" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div style={{ marginTop: "0.5rem" }}>
        <button 
          type="button" 
          className="btn hover-glow" 
          onClick={saveSignature}
          style={{ marginRight: "0.5rem" }}
        >
          Enregistrer la signature
        </button>
        <button 
          type="button" 
          className="btn" 
          onClick={clearCanvas}
        >
          Effacer
        </button>
      </div>
    </div>
  );
}
