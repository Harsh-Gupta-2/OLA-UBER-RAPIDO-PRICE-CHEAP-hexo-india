import { HashRouter, Route, Routes } from "react-router-dom";
import ExplorerPage from "./pages/ExplorerPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<ExplorerPage />} />
      </Routes>
    </HashRouter>
  );
}
