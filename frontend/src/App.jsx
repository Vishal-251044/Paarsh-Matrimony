import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Matrimony from "./pages/Matrimony";
import Watchlist from "./pages/Watchlist";
import Connected from "./pages/Connected";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matrimony" element={<Matrimony />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/connected" element={<Connected />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
