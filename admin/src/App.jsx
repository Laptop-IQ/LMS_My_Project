import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Add from "./pages/Add";
import List from "./pages/List";
import Bookings from "./pages/Bookings";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/addcourse" element={<Add />} />
      <Route path="/listcourse" element={<List />} />
      <Route path="/bookings" element={<Bookings />} />
    </Routes>
  );
};

export default App;
