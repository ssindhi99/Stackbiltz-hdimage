import "./App.css";
import NavigationBar from "./pages/NavigationBar";
import HomePage from "./pages/HomePage";
import ImageUpscaler from "./components/ImageUpscaler";
import ImageEditor from "./components/ImageEditor";
import ImageMerger from "./components/ImageMerger";

import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";

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
          element: <ImageEditor />,
        },

        {
          path: "image-merge",
          element: <ImageMerger />,
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
