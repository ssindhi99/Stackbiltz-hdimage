import { useState, useRef } from "react";
import "./ImageUpscaler.css";

const ImageUpscaler = () => {
  const [images, setImages] = useState([]);
  const canvasRefs = useRef({});

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const newImages = fileArray.map((file) => {
      const objectURL = URL.createObjectURL(file);
      const img = new Image();
      img.src = objectURL;

      return new Promise((resolve) => {
        img.onload = () => {
          const minWidth = 2048;
          const minHeight = 1536;
          const scaleWidth = minWidth / img.width;
          const scaleHeight = minHeight / img.height;
          const scaleFactor = Math.max(scaleWidth, scaleHeight, 2);

          const newWidth = Math.round(img.width * scaleFactor);
          const newHeight = Math.round(img.height * scaleFactor);

          resolve({
            id: file.name + Date.now(),
            src: objectURL,
            fileType: file.type,
            fileName: file.name,
            originalSize: { width: img.width, height: img.height },
            upscaledSize: { width: newWidth, height: newHeight },
          });
        };
      });
    });

    Promise.all(newImages).then((result) => setImages([...images, ...result]));
  };

  const handleImageUpload = (event) => {
    handleFiles(event.target.files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const renderCanvas = (image, isPreview = false) => {
    if (!canvasRefs.current[image.id]) return;

    const canvas = canvasRefs.current[image.id];
    const ctx = canvas.getContext("2d");

    const width = isPreview ? 200 : image.upscaledSize.width;
    const height = isPreview ? 100 : image.upscaledSize.height;

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.src = image.src;
    img.onload = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
    };
  };

  const downloadAllImages = () => {
    images.forEach((image) => {
      const offscreenCanvas = document.createElement("canvas");
      const offscreenCtx = offscreenCanvas.getContext("2d");

      offscreenCanvas.width = image.upscaledSize.width;
      offscreenCanvas.height = image.upscaledSize.height;

      const img = new Image();
      img.src = image.src;
      img.onload = () => {
        offscreenCtx.imageSmoothingEnabled = true;
        offscreenCtx.imageSmoothingQuality = "high";
        offscreenCtx.drawImage(
          img,
          0,
          0,
          offscreenCanvas.width,
          offscreenCanvas.height
        );

        offscreenCanvas.toBlob((blob) => {
          const link = document.createElement("a");
          const fileName = `${image.fileName.split(".")[0]}_HD.${
            image.fileType.split("/")[1] || "png"
          }`;

          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          link.click();

          URL.revokeObjectURL(link.href);
        }, image.fileType);
      };
    });
  };

  const removeAllImages = () => setImages([]);

  return (
    <div
      className="image-upscaler"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        Drag & Drop or Click to Select Images
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="file-input"
        />
      </div>

      {images.length > 0 && (
        <div className="action-buttons">
          <button className="download-btn" onClick={downloadAllImages}>
            Download All HD Images
          </button>
          <button className="remove-btn" onClick={removeAllImages}>
            New Images
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="image-list">
          {images.map((image) => (
            <div key={image.id} className="image-card">
              <div className="image-info">
                <p>
                  <strong>Original:</strong> {image.originalSize.width} x{" "}
                  {image.originalSize.height}px
                </p>
                <p>
                  <strong>Upscaled:</strong> {image.upscaledSize.width} x{" "}
                  {image.upscaledSize.height}px
                </p>
              </div>

              <canvas
                ref={(el) => {
                  canvasRefs.current[image.id] = el;
                  renderCanvas(image, true);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpscaler;
