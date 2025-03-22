import React, { useState, useRef, useCallback } from "react";
import "./ImageEditor.css";

const ImageEditor = () => {
  const [image, setImage] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [scale, setScale] = useState(100);
  const [format, setFormat] = useState("png");

  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        setImage(reader.result);
        setOriginalDimensions({ width: img.width, height: img.height });
        setDimensions({ width: img.width, height: img.height });
      };
    };
    reader.readAsDataURL(file);
  };

  // Handle scale change
  const handleScaleChange = (e) => {
    const newScale = parseInt(e.target.value, 10);
    setScale(newScale);
    setDimensions({
      width: Math.round((originalDimensions.width * newScale) / 100),
      height: Math.round((originalDimensions.height * newScale) / 100),
    });
  };

  // Handle width and height change
  const handleDimensionChange = (type, value) => {
    const newValue = parseInt(value, 10) || 0;
    setDimensions((prev) => {
      if (lockAspectRatio) {
        const aspectRatio =
          originalDimensions.width / originalDimensions.height;
        return type === "width"
          ? { width: newValue, height: Math.round(newValue / aspectRatio) }
          : { width: Math.round(newValue * aspectRatio), height: newValue };
      }
      return { ...prev, [type]: newValue };
    });
  };

  // Resize and render image on canvas
  const handleResize = useCallback(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
    };
  }, [image, dimensions]);

  // Handle image download
  const handleDownload = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL(`image/${format}`);
    link.download = `edited-image.${format}`;
    link.click();
  };

  return (
    <div className="container image-editor-container">
      <h3 className="text-center my-3">Image Editor</h3>

      {/* Image Upload Button (Fixed) */}
      <div className="mb-3 text-center">
        <label className="btn btn-primary">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="d-none"
          />
        </label>
      </div>

      {/* Controls */}
      {image && (
        <div className="controls">
          <div className="mb-2">
            <label className="form-label">Scale (%):</label>
            <input
              type="range"
              className="form-range"
              min="10"
              max="200"
              step="10"
              value={scale}
              onChange={handleScaleChange}
            />
            <span>{scale}%</span>
          </div>

          <div className="row mb-2">
            <div className="col">
              <label className="form-label">Width:</label>
              <input
                type="number"
                className="form-control"
                value={dimensions.width}
                onChange={(e) => handleDimensionChange("width", e.target.value)}
              />
            </div>
            <div className="col">
              <label className="form-label">Height:</label>
              <input
                type="number"
                className="form-control"
                value={dimensions.height}
                onChange={(e) =>
                  handleDimensionChange("height", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={lockAspectRatio}
              onChange={() => setLockAspectRatio(!lockAspectRatio)}
            />
            <label className="form-check-label">Lock Aspect Ratio</label>
          </div>

          <div className="mb-2">
            <label className="form-label">Format:</label>
            <select
              className="form-select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>

          <div className="d-flex justify-content-between">
            <button onClick={handleResize} className="btn btn-success">
              Resize
            </button>
            <button onClick={handleDownload} className="btn btn-warning">
              Download
            </button>
          </div>
        </div>
      )}

      {/* Image Preview */}
      <div className="image-preview-container mt-3">
        {image ? (
          <img src={image} alt="Preview" className="img-thumbnail" />
        ) : (
          <div className="blank-preview">No Image Selected</div>
        )}
      </div>

      {/* Canvas for Image Processing */}
      <canvas ref={canvasRef} className="d-none"></canvas>
    </div>
  );
};

export default ImageEditor;
