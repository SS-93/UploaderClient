import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Switch } from 'react-router-dom';

import Home from './components/home/Home';
import AllClaims from './components/allclaims/AllClaims';
import ClaimProfile from './components/claimprofile/ClaimProfile';
import Sidebar from './components/claimprofile/Sidebar';


function App() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path='/home' element={<Home />} />
        <Route path='/allclaims' element={<AllClaims />} />
        <Route path='/claims/:claimId' element={<ClaimProfile />} />
        <Route path='/test' element={<Sidebar />} />
      </Routes>
    </BrowserRouter>


  );
}

export default App;