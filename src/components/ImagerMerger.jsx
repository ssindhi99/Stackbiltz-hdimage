import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import "./ImageMerger.css";

const ImageMerger = () => {
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState("horizontal");
  const [borderSize, setBorderSize] = useState(5);
  const [borderColor, setBorderColor] = useState("#000000");
  const [fileType, setFileType] = useState("png");
  const canvasRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImages((prev) => [...prev, img]);
      };
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  const mergeImages = () => {
    if (images.length < 2) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width =
      layout === "horizontal"
        ? images.reduce((sum, img) => sum + img.width, 0)
        : Math.max(...images.map((img) => img.width));
    const height =
      layout === "vertical"
        ? images.reduce((sum, img) => sum + img.height, 0)
        : Math.max(...images.map((img) => img.height));
    canvas.width = width + borderSize * (images.length - 1);
    canvas.height = height + borderSize * (images.length - 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let offsetX = 0,
      offsetY = 0;
    images.forEach((img) => {
      ctx.drawImage(img, offsetX, offsetY, img.width, img.height);
      if (layout === "horizontal") {
        offsetX += img.width + borderSize;
      } else {
        offsetY += img.height + borderSize;
      }
    });
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `merged-image.${fileType}`;
    link.href = canvas.toDataURL(`image/${fileType}`);
    link.click();
  };

  return (
    <div className="container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & Drop images here or click to upload</p>
      </div>
      <div className="image-preview">
        {images.map((img, index) => (
          <img
            key={index}
            src={img.src}
            alt={`Uploaded ${index + 1}`}
            className="preview-img"
          />
        ))}
      </div>
      <div className="options">
        <button
          onClick={() => setLayout("horizontal")}
          className={`button ${layout === "horizontal" ? "active" : ""}`}
        >
          Horizontal
        </button>
        <button
          onClick={() => setLayout("vertical")}
          className={`button ${layout === "vertical" ? "active" : ""}`}
        >
          Vertical
        </button>
      </div>
      <div className="options">
        <input
          type="range"
          min="0"
          max="20"
          value={borderSize}
          onChange={(e) => setBorderSize(e.target.value)}
        />
        <input
          type="color"
          value={borderColor}
          onChange={(e) => setBorderColor(e.target.value)}
          className="color-picker"
        />
      </div>
      <button onClick={mergeImages} className="merge-button">
        Merge Images
      </button>
      <canvas ref={canvasRef} className="canvas" />
      <div className="save-options">
        <select
          onChange={(e) => setFileType(e.target.value)}
          value={fileType}
          className="dropdown"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
        </select>
        <button onClick={saveImage} className="save-button">
          Save Image
        </button>
      </div>
    </div>
  );
};

export default ImageMerger;
