// import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Switch } from 'react-router-dom';

import Home from './components/home/Home';
import AllClaims from './components/allclaims/AllClaims';
import ClaimProfile from './components/claimprofile/ClaimProfile';
import Sidebar from './components/claimprofile/Sidebar';
import NewClaim from './components/newclaim/NewClaim';
import FileInput from './components/fileInput/FileInput';
import FileInputTest from './components/fileInput/FileInputTest';
import DocumentViewer from './components/documentviewer/DocumentViewer';
import DocumentDataTable from './components/documentdatatable/DocumentDataTable';
import DownloadFileTest from './components/fileInput/DownloadFileTest';
import TextModule from './components/textmodule/TextModule';


function App() {
  return (
    <BrowserRouter>
   
    <Routes>
      
        <Route path='/home' element={<Home />} />
        <Route path='/allclaims' element={<AllClaims />} />
        <Route path='/claims/:claimId' element={<ClaimProfile />} />
        <Route path='/test' className= '' element={<TextModule /> } />
        <Route path ='/newclaim' element={ <NewClaim/> }/>
        <Route path='/upload' element = {<FileInput/>} />
        
      </Routes>
      
    </BrowserRouter>
 

  );
}

export default App;
