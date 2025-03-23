import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toPng } from "html-to-image";
import GridLayout from "react-grid-layout";
import "./ImageMerger.css"; // Updated CSS filename

export default function ImageMerger() {
  const [images, setImages] = useState([]);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [border, setBorder] = useState({
    width: 2,
    color: "#000000",
    radius: 5,
  });
  const [quality, setQuality] = useState(1);

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setImages((prev) => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  const downloadCollage = () => {
    const collage = document.getElementById("collage");
    toPng(collage, { quality })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "collage.png";
        link.click();
      })
      .catch((error) => console.error("Error generating image:", error));
  };

  return (
    <div className="image-collage__container">
      {/* Dropzone */}
      <div {...getRootProps()} className="image-collage__dropzone">
        <input {...getInputProps()} />
        <p>Drag & Drop images here, or click to select</p>
      </div>

      {/* Layout Controls */}
      <div className="image-collage__controls">
        <label>
          Rows:
          <input
            type="number"
            min="1"
            max="5"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="image-collage__input"
          />
        </label>
        <label>
          Columns:
          <input
            type="number"
            min="1"
            max="5"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="image-collage__input"
          />
        </label>
        <label>
          Border Width:
          <input
            type="number"
            min="0"
            max="10"
            value={border.width}
            onChange={(e) =>
              setBorder({ ...border, width: Number(e.target.value) })
            }
            className="image-collage__input"
          />
        </label>
        <label>
          Border Radius:
          <input
            type="number"
            min="0"
            max="50"
            value={border.radius}
            onChange={(e) =>
              setBorder({ ...border, radius: Number(e.target.value) })
            }
            className="image-collage__input"
          />
        </label>
      </div>
      <div className="imagecollage_borderflex">
        <div className="imagecollage_bordercolor">
          <label className="imagecollage_bordertext">
            Border Color:
            <input
              type="color"
              value={border.color}
              onChange={(e) => setBorder({ ...border, color: e.target.value })}
              className="image-collage__color-picker"
            />
          </label>
        </div>

        <div className="imagecollage_borderflex">
          <label>
            Image Quality:
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="image-collage__slider"
            />
          </label>
        </div>
      </div>

      {/* Image Collage Preview */}
      <div
        id="collage"
        className="image-collage__preview"
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {images.slice(0, rows * cols).map((image, index) => (
          <img
            key={index}
            src={image.preview}
            className="image-collage__image"
            style={{
              border: `${border.width}px solid ${border.color}`,
              borderRadius: `${border.radius}px`,
            }}
            alt="collage"
          />
        ))}
      </div>

      {/* Download Button */}
      {images.length > 0 && (
        <button onClick={downloadCollage} className="image-collage__download">
          Download Collage
        </button>
      )}
    </div>
  );
}
