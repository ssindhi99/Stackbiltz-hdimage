import { useState, useRef, useEffect } from "react";
// Assuming ImageUpscaler.css exists and provides basic styling for the layout
// and elements like .drop-zone, .upload-icon, .action-buttons, .download-btn, etc.
import "./ImageUpscaler.css";
// Importing a Feather icon for the upload cloud
import { FiUploadCloud } from "react-icons/fi";

const ImageFixer = () => {
  // State to store the list of images, each with its properties
  const [images, setImages] = useState([]);
  // Ref to hold references to canvas elements for dynamic drawing
  const canvasRefs = useRef({});

  /**
   * Handles files from input or drag-and-drop.
   * Processes each file to create an image object with original and initial upscaled sizes.
   * @param {FileList} files - The FileList object containing selected files.
   */
  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    // Map each file to a Promise that resolves with the image data
    const newImages = fileArray.map((file) => {
      return new Promise((resolve) => {
        // Create a URL for the image file
        const objectURL = URL.createObjectURL(file);
        const img = new Image();
        img.src = objectURL;

        // Once the image is loaded, calculate its sizes
        img.onload = () => {
          // Define a target resolution for initial upscaling (e.g., Full HD for width, and proportional height)
          // This is a base for the *preview* and general upscaling, not the final 4:3 download size.
          const targetWidth = 1920; // Example target width for upscaling
          const targetHeight = 1440; // Example target height for upscaling (1920 / 4 * 3 = 1440)

          // Calculate scale factor to fit within target dimensions, ensuring at least 1x scaling
          const scaleFactor = Math.max(
            targetWidth / img.width,
            targetHeight / img.height,
            1
          );

          resolve({
            id: file.name + Date.now(), // Unique ID for the image
            src: objectURL, // Object URL for image display
            fileType: file.type, // MIME type of the file
            fileName: file.name, // Original file name
            originalSize: { width: img.width, height: img.height }, // Original dimensions
            upscaledSize: {
              width: Math.round(img.width * scaleFactor), // Initial upscaled width
              height: Math.round(img.height * scaleFactor), // Initial upscaled height
            },
          });
        };
      });
    });

    // After all images are processed, update the state
    Promise.all(newImages).then((result) =>
      setImages((prev) => [...prev, ...result])
    );
  };

  /**
   * Handles image file selection via the input element.
   * @param {Event} event - The change event from the file input.
   */
  const handleImageUpload = (event) => handleFiles(event.target.files);

  /**
   * Handles image file drop onto the drop zone.
   * Prevents default behavior to allow drop.
   * @param {Event} event - The drag event.
   */
  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  /**
   * Renders a small preview of the image on a canvas.
   * This canvas is for display purposes within the app, not for the final download.
   * @param {Object} image - The image object to render.
   */
  const renderCanvas = (image) => {
    const canvas = canvasRefs.current[image.id];
    if (!canvas) return; // Exit if canvas element is not yet available
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions for a fixed-size preview
    canvas.width = 200;
    canvas.height = 150; // Use a 4:3 ratio for the preview canvas itself (200 / 4 * 3 = 150)

    const img = new Image();
    img.src = image.src;

    img.onload = () => {
      // Enable high-quality image smoothing for better visual scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Calculate how to draw the image to fit the 4:3 preview canvas,
      // potentially cropping to maintain aspect ratio.
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = img.width / img.height;

      let sx = 0,
        sy = 0,
        sWidth = img.width,
        sHeight = img.height;
      let dx = 0,
        dy = 0,
        dWidth = canvas.width,
        dHeight = canvas.height;

      if (imageRatio > canvasRatio) {
        // Image is wider than canvas, crop horizontally
        sWidth = img.height * canvasRatio;
        sx = (img.width - sWidth) / 2;
      } else if (imageRatio < canvasRatio) {
        // Image is taller than canvas, crop vertically
        sHeight = img.width / canvasRatio;
        sy = (img.height - sHeight) / 2;
      }
      // Draw the image, applying the calculated cropping
      ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    };
  };

  // Effect hook to render canvases whenever the 'images' state changes
  useEffect(() => {
    images.forEach(renderCanvas);
  }, [images]); // Dependency array: re-run when 'images' changes

  /**
   * Initiates download for all processed images.
   * Each image will be resized/cropped to a 4:3 aspect ratio and upscaled.
   */
  const downloadAllImages = () => {
    images.forEach((image) => {
      // Create an offscreen canvas for processing the image before download
      const offscreenCanvas = document.createElement("canvas");
      const ctx = offscreenCanvas.getContext("2d");
      const img = new Image();
      img.src = image.src;

      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Define the desired target aspect ratio (4:3)
        const targetRatio = 4 / 3;

        // Determine initial width and height based on the original image,
        // maintaining the 4:3 ratio. This will be the largest 4:3 rectangle
        // that can be fitted *within* the original image's dimensions.
        let calculatedWidth;
        let calculatedHeight;
        const originalRatio = originalWidth / originalHeight;

        if (originalRatio > targetRatio) {
          // Original image is wider than 4:3, so its height limits the 4:3 box.
          calculatedHeight = originalHeight;
          calculatedWidth = Math.round(calculatedHeight * targetRatio);
        } else {
          // Original image is taller or equal to 4:3, so its width limits the 4:3 box.
          calculatedWidth = originalWidth;
          calculatedHeight = Math.round(calculatedWidth / targetRatio);
        }

        // Define a minimum target resolution for the downloaded image to ensure high quality.
        // We'll use the previously calculated upscaledSize, but ensure a minimum of 1920x1440 for 4:3.
        const minDownloadWidth = Math.max(image.upscaledSize.width, 1920);
        const minDownloadHeight = Math.max(image.upscaledSize.height, 1440);

        // Calculate a final scaling factor to upscale the 'calculated' 4:3 dimensions
        // to at least the 'minDownload' dimensions, while maintaining the 4:3 ratio.
        const finalScaleFactor = Math.max(
          minDownloadWidth / calculatedWidth,
          minDownloadHeight / calculatedHeight,
          1 // Ensure we always scale up if the calculated 4:3 is smaller than current
        );

        // Determine the final dimensions for the download canvas
        const finalWidth = Math.round(calculatedWidth * finalScaleFactor);
        const finalHeight = Math.round(calculatedHeight * finalScaleFactor);

        // Set the offscreen canvas dimensions to the final calculated 4:3 dimensions
        offscreenCanvas.width = finalWidth;
        offscreenCanvas.height = finalHeight;

        // Enable high-quality image smoothing for scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Calculate source (sx, sy, sWidth, sHeight) and destination (dx, dy, dWidth, dHeight)
        // parameters for drawImage to crop the original image to fit the 4:3 canvas.
        let sx = 0,
          sy = 0,
          sWidth = originalWidth,
          sHeight = originalHeight;
        let dx = 0,
          dy = 0,
          dWidth = finalWidth,
          dHeight = finalHeight;

        // Adjust source dimensions if the original image aspect ratio doesn't match the target 4:3
        const outputCanvasRatio = finalWidth / finalHeight;
        if (originalRatio > outputCanvasRatio) {
          // Original image is wider than the target 4:3, so crop original horizontally
          sWidth = originalHeight * outputCanvasRatio;
          sx = (originalWidth - sWidth) / 2; // Center the crop
        } else if (originalRatio < outputCanvasRatio) {
          // Original image is taller than the target 4:3, so crop original vertically
          sHeight = originalWidth / outputCanvasRatio;
          sy = (originalHeight - sHeight) / 2; // Center the crop
        }

        // Draw the cropped portion of the original image onto the final-sized canvas
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

        // Convert the canvas content to a Blob and trigger download
        offscreenCanvas.toBlob(
          (blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            // Construct download file name with "_4x3" suffix
            link.download = `${image.fileName.split(".")[0]}_4x3.${
              image.fileType.split("/")[1] || "png" // Default to png if type is unknown
            }`;
            link.click(); // Programmatically click the link to start download
            URL.revokeObjectURL(link.href); // Clean up the object URL
          },
          image.fileType // Specify the output image type (e.g., 'image/jpeg', 'image/png')
        );
      };
    });
  };

  return (
    // Main container for the image upscaler, handling drag-and-drop
    <div
      className="image-upscaler"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
    >
      {/* Drop zone area for uploading images */}
      <div className="drop-zone">
        <FiUploadCloud className="upload-icon" /> {/* Upload icon */}
        <p>Drag & Drop or Click to Select Images</p>
        <input
          type="file"
          accept="image/*" // Accept all image types
          multiple // Allow multiple file selection
          onChange={handleImageUpload} // Handle file selection
          className="file-input"
        />
      </div>

      {/* Action buttons (Download, New Images) only shown if images are present */}
      {images.length > 0 && (
        <div className="action-buttons">
          <button className="download-btn" onClick={downloadAllImages}>
            Download All 4:3 Images
          </button>
          <button className="remove-btn" onClick={() => setImages([])}>
            New Images
          </button>
        </div>
      )}

      {/* List of uploaded image previews and information */}
      <div className="image-list">
        {images.map((image) => (
          <div key={image.id} className="image-card">
            <div className="image-info">
              <p>
                <strong>Original:</strong> {image.originalSize.width} x{" "}
                {image.originalSize.height}px
              </p>
              <p>
                {/* Displaying the initially upscaled size for general reference */}
                <strong>Preview Upscaled:</strong> {image.upscaledSize.width} x{" "}
                {image.upscaledSize.height}px
              </p>
            </div>
            {/* Canvas for displaying image preview */}
            <canvas ref={(el) => (canvasRefs.current[image.id] = el)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageFixer;
