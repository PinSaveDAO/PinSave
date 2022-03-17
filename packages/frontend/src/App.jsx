import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { Navigation, Home, Upload,Post } from "./components";
import { useStore } from "./store";


const App = ({ contract, currentUser, nearConfig, wallet, didcontract }) => {

  const initNear = useStore((state) => state.setUpStore);
  
  useEffect(() => {
    initNear(contract, currentUser, nearConfig, wallet, didcontract);
  }, []);

  return (
    <Router>
      <Navigation />
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/post/:token_id" element={<Post/>} />
      </Routes>
    </Router>
  );
};

export default App;
