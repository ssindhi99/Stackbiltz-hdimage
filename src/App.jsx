import "./App.css";
import NavigationBar from "./pages/NavigationBar";
import HomePage from "./pages/HomePage";
import ImageUpscaler from "./components/ImageUpscaler";
import ImageResize from "./components/ImageEditor";
import ImageMerger from "./components/ImageMerger";

import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import ImageResizer from "./components/ImageResizer";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <NavigationBar />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },

        {
          path: "Upscaler",
          element: <ImageUpscaler />,
        },
        {
          path: "resize",
          element: <ImageResize />,
        },

        {
          path: "image-merge",
          element: <ImageMerger />,
        },
        {
          path: "image-Resize",
          element: <ImageResizer />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
