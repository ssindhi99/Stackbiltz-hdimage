import React, { useRef, useState, useCallback } from "react";

const QUALITY_LABELS = {
  good: "WhatsApp HD / Original · Good Quality Photo",
  medium: "WhatsApp SD · Medium Quality Photo",
  low: "WhatsApp · Low Quality Photo",
  other: "Other · Unknown/Blank",
};
const MIN_GOOD_WIDTH = 1920;
const MIN_GOOD_HEIGHT = 1080;
const MIN_GOOD_MP = 2; // 2 Megapixels
const MIN_IMAGE_PX = 1203; // Enforced minimum on both sides for converted image

function getPhotoQuality(width, height) {
  if (!width || !height) return "other";
  const mp = (width * height) / 1_000_000;
  const longest = Math.max(width, height);

  if (
    longest >= 3000 &&
    mp >= MIN_GOOD_MP &&
    width >= MIN_IMAGE_PX &&
    height >= MIN_IMAGE_PX
  )
    return "good";
  if (
    longest >= 1600 &&
    mp >= 1 &&
    width >= MIN_IMAGE_PX &&
    height >= MIN_IMAGE_PX
  )
    return "medium";
  if (longest >= MIN_IMAGE_PX || Math.max(width, height) >= MIN_IMAGE_PX)
    return "low";
  return "other";
}

function getTargetSize(width, height) {
  let scaleW = MIN_GOOD_WIDTH / width;
  let scaleH = MIN_GOOD_HEIGHT / height;
  let scaleMinW = MIN_IMAGE_PX / width;
  let scaleMinH = MIN_IMAGE_PX / height;
  let scaleMP = Math.sqrt((MIN_GOOD_MP * 1_000_000) / (width * height));
  const scale = Math.max(scaleW, scaleH, scaleMinW, scaleMinH, scaleMP, 1);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function getHdFileName(originalName) {
  const lastDot = originalName.lastIndexOf(".");
  if (lastDot > 0) {
    return (
      originalName.substring(0, lastDot) +
      "-hd" +
      originalName.substring(lastDot)
    );
  } else {
    return originalName + "-hd.jpg";
  }
}

function resizeImageToGoodQuality(img, cb, fileName) {
  const { width: targetW, height: targetH } = getTargetSize(
    img.width,
    img.height
  );
  if (!img.width || !img.height) {
    cb(null, 0, 0);
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, targetW, targetH);
  canvas.toBlob(
    (blob) => {
      cb(blob, targetW, targetH, getHdFileName(fileName));
    },
    "image/jpeg",
    0.95
  );
}

export default function ImageFixer() {
  const [images, setImages] = useState([]);
  const [converted, setConverted] = useState({});
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef();

  // Load user images and auto-convert to good quality
  const handleFiles = useCallback((fileList) => {
    setImages([]);
    setConverted({});
    setProcessing(true);
    const files = Array.from(fileList);
    let loaded = 0;
    let imageInfos = [];
    files.forEach((file, idx) => {
      const img = new window.Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const quality = getPhotoQuality(width, height);
        const label = QUALITY_LABELS[quality];
        const id = `${file.name}_${file.size}_${file.lastModified}`;
        const src = URL.createObjectURL(file);
        const { width: newWidth, height: newHeight } = getTargetSize(
          width,
          height
        );

        imageInfos[idx] = {
          file,
          src,
          width,
          height,
          quality,
          label,
          id,
          newWidth,
          newHeight,
          fileName: file.name,
        };

        const autoImg = new window.Image();
        autoImg.onload = () => {
          resizeImageToGoodQuality(
            autoImg,
            (blob, w, h, hdName) => {
              setConverted((prev) => ({
                ...prev,
                [id]: {
                  src: URL.createObjectURL(blob),
                  width: w,
                  height: h,
                  blob,
                  name: hdName,
                },
              }));
            },
            file.name
          );
        };
        autoImg.src = src;

        loaded += 1;
        if (loaded === files.length) {
          setImages(imageInfos);
          setProcessing(false);
        }
      };
      img.onerror = () => {
        imageInfos[idx] = {
          error: "Failed to load image.",
          file,
          id: `${file.name}_${file.size}_${file.lastModified}`,
        };
        loaded += 1;
        if (loaded === files.length) {
          setImages(imageInfos);
          setProcessing(false);
        }
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // "Download All Images" downloads all converted HD images
  const handleDownloadAllConverted = () => {
    images.forEach((img) => {
      const conv = converted[img.id];
      if (!conv || !conv.src) return;
      const a = document.createElement("a");
      a.href = conv.src;
      a.download = conv.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const handleNewImageClick = () => {
    setImages([]);
    setConverted({});
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      style={{
        margin: "40px auto",
        fontFamily: "Inter,Segoe UI,Arial,sans-serif",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px #0001, 0 1.5px 7px #1976d211",
        padding: "32px 22px 40px 22px",
      }}
    >
      <h2
        style={{
          fontWeight: 700,
          color: "#1976d2",
          marginBottom: 8,
          fontSize: 28,
          letterSpacing: "-1px",
        }}
      >
        ImageFixer{" "}
        <span style={{ color: "#333", fontWeight: 600, fontSize: 19 }}>
          — Uploaded Images Only
        </span>
      </h2>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        style={{
          padding: "40px 0 28px 0",
          background: dragActive ? "#e3f2fd" : "#f5f8fa",
          border: dragActive ? "2.5px dashed #1976d2" : "2.5px dashed #b0bec5",
          borderRadius: 11,
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 18,
          outline: dragActive ? "2px solid #1976d2" : "none",
          transition: "all 0.15s",
        }}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          style={{
            color: "#1976d2",
            fontWeight: 600,
            fontSize: 20,
            marginBottom: 5,
          }}
        >
          Drag and drop images here
          <br />
          or{" "}
          <span
            style={{
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            browse files
          </span>
        </div>
        <div style={{ color: "#555", fontSize: 14, fontWeight: 400 }}>
          JPG, PNG or GIF. Images will be auto-converted to{" "}
          <b>good quality resolution</b> (min 1203px per side).
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          marginBottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          style={{
            padding: "10px 22px",
            background: "#388e3c",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: 17,
            boxShadow: "0 1.5px 8px #388e3c22",
            cursor: images.length === 0 ? "not-allowed" : "pointer",
            opacity: images.length === 0 ? 0.7 : 1,
          }}
          onClick={handleDownloadAllConverted}
          disabled={images.length === 0}
        >
          Download All Images
        </button>
        <button
          style={{
            padding: "10px 22px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: 17,
            boxShadow: "0 1.5px 8px #1976d222",
            cursor: "pointer",
          }}
          onClick={handleNewImageClick}
        >
          New Image
        </button>
      </div>
      {processing && (
        <div
          style={{
            color: "#1976d2",
            fontWeight: 600,
            fontSize: 18,
            margin: "36px 0 10px 0",
          }}
        >
          Processing images...
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {images.map((img, idx) => (
          <div
            key={img.id}
            style={{
              width: 270,
              border: "1.5px solid #e3e6ea",
              borderRadius: 10,
              boxShadow: "0 3px 8px #1976d211",
              padding: 18,
              marginBottom: 28,
              background: "#f9fbfc",
              transition: "box-shadow 0.12s",
              position: "relative",
            }}
          >
            {img.error ? (
              <div style={{ color: "red" }}>{img.error}</div>
            ) : (
              <>
                <img
                  src={img.src}
                  alt="preview"
                  style={{
                    maxWidth: 220,
                    maxHeight: 170,
                    display: "block",
                    margin: "0 auto 12px auto",
                    border: "1.5px solid #cfd8dc",
                    background: "#f8f8f8",
                    borderRadius: 5,
                    boxShadow: "0 1px 4px #1976d211",
                  }}
                />
                <div
                  style={{ marginBottom: 4, fontSize: 14, color: "#37474f" }}
                >
                  <b>Current Resolution:</b> {img.width} × {img.height}
                </div>
                <div
                  style={{ marginBottom: 4, fontSize: 14, color: "#37474f" }}
                >
                  <b>New Resolution:</b> {img.newWidth} × {img.newHeight}
                </div>
                {/* Download button per photo removed */}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
