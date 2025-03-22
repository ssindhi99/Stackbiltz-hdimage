import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageMerger() {
  const [images, setImages] = useState([]);

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setImages([...images, ...newImages]);
  };

  const mergeImages = async () => {
    if (images.length < 2) return alert("Upload at least two images.");
    // Implement image merging logic here (e.g., using canvas)
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen image-merger-container">
      <div
        {...useDropzone({ onDrop, accept: "image/*", multiple: true })}
        className="w-full max-w-xl p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white flex justify-center items-center cursor-pointer hover:border-blue-500 transition"
      >
        <p className="text-gray-600">Drag & drop images or click to upload</p>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <img
            key={index}
            src={img.preview}
            alt="Uploaded"
            className="w-32 h-32 object-cover rounded-lg shadow"
          />
        ))}
      </div>
      <button
        onClick={mergeImages}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg"
      >
        Merge Images
      </button>
    </div>
  );
}
