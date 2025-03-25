import React, { useState, useRef, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { fabric } from "fabric";

const PdfEditor = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);

  useEffect(() => {
    if (image) {
      const canvas = new fabric.Canvas(canvasRef.current);
      fabricCanvas.current = canvas;
      fabric.Image.fromURL(image, (img) => {
        img.scaleToWidth(300);
        canvas.add(img);
      });
      const text = new fabric.IText(extractedText, {
        left: 50,
        top: 50,
        fontSize: 20,
        fill: "red",
        editable: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  }, [image, extractedText]);

  // Handle Image Upload and OCR
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(imageUrl);
      setExtractedText(data.text);
    }
  };

  // Handle PDF Upload and Text Extraction
  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const pdfDoc = await PDFDocument.load(reader.result);
        const text = await pdfDoc.getPages()[0].getTextContent();
        setPdfText(text.items.map((item) => item.str).join(" "));
      };
    }
  };

  // Save Edited Image with Text Overlay
  const handleDownloadEditedImage = () => {
    if (!fabricCanvas.current) return;
    const dataURL = fabricCanvas.current.toDataURL({ format: "png" });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "edited_image.png";
    link.click();
  };

  // Save Edited PDF Text
  const handleDownloadPDF = async () => {
    if (!pdfFile) return;
    const reader = new FileReader();
    reader.readAsArrayBuffer(pdfFile);
    reader.onload = async () => {
      const pdfDoc = await PDFDocument.load(reader.result);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      firstPage.drawText(pdfText, {
        x: 50,
        y: firstPage.getHeight() - 100,
        size: 12,
        color: rgb(0, 0, 0),
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "edited.pdf");
    };
  };

  return (
    <div>
      <h1>React Image & PDF Editor</h1>

      {/* Image OCR Section */}
      <h2>Upload Image for Text Extraction</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <canvas ref={canvasRef} width={300} height={300} style={{ border: "1px solid black" }} />}
      <button onClick={handleDownloadEditedImage}>Download Edited Image</button>

      {/* PDF Editing Section */}
      <h2>Upload PDF for Text Extraction</h2>
      <input type="file" accept="application/pdf" onChange={handlePDFUpload} />
      <textarea value={pdfText} onChange={(e) => setPdfText(e.target.value)} />
      <button onClick={handleDownloadPDF}>Download Edited PDF</button>
    </div>
  );
};

export default PdfEditor;
