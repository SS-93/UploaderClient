// import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Switch } from 'react-router-dom';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

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
import AgnosticInterface from './components/agnosticinterface/AgnosticInterface';
import DocumentDashboard from './components/documentdatatable/documentdashboard/DocumentDashboard';
import ParkingSession from './components/parkingsession/ParkingSession';
import AiProcessor from './components/aiprocessor/AiProcessor';
import AILab from './components/ailab/AILab';
import SuggestedClaims from './components/allclaims/SuggestedClaims';
import ClaimQueryMatrix from './components/claimquerymatrix/ClaimQueryMatrix';
import ClaimDock from './components/claimprofile/ClaimDock';

function App() {
  return (
    <BrowserRouter>
   
    <Routes>
      
        <Route path='/home' element={<Home />} />
        <Route path='/allclaims' element={<AllClaims />} />
        <Route path='/AILab' element={<AILab/>} />
        <Route path='/claims/:claimId' element={<ClaimProfile />} />
          <Route path='/test' className= '' element={<ClaimQueryMatrix/> } />
          <Route path='/park' className= '' element={<ParkingSession/> } />
        <Route path ='/newclaim' element={ <NewClaim/> }/>
        <Route path='/upload' element = {<FileInput/>} />
        
      </Routes>
      
    </BrowserRouter>
 

  );
}

export default App;
