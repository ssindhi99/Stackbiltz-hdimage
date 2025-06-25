import React, { useState, useEffect } from "react";
import Resizer from "react-image-file-resizer";
import { useDropzone } from "react-dropzone";
import "./ImageResizer.css";

const ImageResizer = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 300,
    height: 300,
  });
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [resizePercentage, setResizePercentage] = useState(100);
  const [format, setFormat] = useState("png");

  useEffect(() => {
    setImage(null);
    setPreview(null);
  }, []);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setOriginalDimensions({ width: img.width, height: img.height });
    };
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    let newDimensions = { ...dimensions, [name]: parseInt(value) };

    if (aspectRatioLocked) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      if (name === "width") {
        newDimensions.height = Math.round(value / aspectRatio);
      } else {
        newDimensions.width = Math.round(value * aspectRatio);
      }
    }
    setDimensions(newDimensions);
  };

  const resizeImage = () => {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      dimensions.width,
      dimensions.height,
      format.toUpperCase(),
      100,
      0,
      (uri) => {
        const link = document.createElement("a");
        link.href = uri;
        link.download = `resized-image.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      "base64"
    );
  };

  return (
    <div className="image-resizer-container">
      {!image ? (
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p>Drag & Drop an Image or Click to Upload</p>
        </div>
      ) : (
        <div className="editor-container">
          <img src={preview} alt="Uploaded" className="preview-image" />
          <div className="tabs">
            <button onClick={() => setTabIndex(0)}>By Dimensions</button>
            <button onClick={() => setTabIndex(1)}>By Percentage</button>
          </div>

          {tabIndex === 0 && (
            <div className="tab-content">
              <label>Width:</label>
              <input
                type="number"
                name="width"
                value={dimensions.width}
                onChange={handleDimensionChange}
              />
              <label>Height:</label>
              <input
                type="number"
                name="height"
                value={dimensions.height}
                onChange={handleDimensionChange}
              />
              <label>
                <input
                  type="checkbox"
                  checked={aspectRatioLocked}
                  onChange={() => setAspectRatioLocked(!aspectRatioLocked)}
                />
                Lock Aspect Ratio
              </label>
            </div>
          )}

          {tabIndex === 1 && (
            <div className="tab-content">
              <label>Resize by Percentage</label>
              <input
                type="range"
                value={resizePercentage}
                onChange={(e) => setResizePercentage(e.target.value)}
                min={10}
                max={200}
                step={10}
              />
              <p>{resizePercentage}%</p>
            </div>
          )}

          <div className="format-selection">
            <label>Select Format:</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          <button onClick={resizeImage} className="download-button">
            Download Resized Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageResizer;
