import React, { useState, useEffect } from 'react'
import AiProcessor from '../aiprocessor/AiProcessor'
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard'
import ParkingSession from '../parkingsession/ParkingSession';


function AILab() {
  const [selectedOcrId, setSelectedOcrId] = useState(null);
  const [ocrText, setOcrText] = useState('');

  const handleSelectDocument = async (ocrId) => {
    setSelectedOcrId(ocrId);
    if (ocrId) {
      try {
        const response = await fetch(`http://localhost:4000/dms/ocr-text/${ocrId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch OCR text');
        }
        const data = await response.json();
        setOcrText(data.textContent);  // Note: changed from data.ocrText to data.textContent
      } catch (error) {
        console.error('Error fetching OCR text:', error);
        setOcrText('Failed to load OCR text');
      }
    } else {
      setOcrText('');
    }
  };

  return (
    <div>
      <h1>AI Lab</h1>
      <AiProcessor 
        selectedOcrId={selectedOcrId}
        ocrText={ocrText}
        // ... other props
      />
      <DocumentDashboard
        onSelectDocument={handleSelectDocument}
        // ... other props
      />
       {/* <ParkingSession
        onSelectDocument={handleSelectDocument}
        selectedOcrId={selectedOcrId}
        // ... other props
      />
       */}
    </div>
  )
}

export default AILab