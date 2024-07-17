import React, { useState } from 'react';

function DownloadFile() {
  const [fileKey, setFileKey] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleDownload = async () => {
    try {
      const res = await fetch(`http://localhost:4000/upload/documents/${fileKey}/signed-url`);
      if (!res.ok) {
        throw new Error('Failed to fetch signed URL');
      }
      const data = await res.json();
      console.log(`Signed URL: ${data.url}`);

      const documentResponse = await fetch(data.url);
      if (!documentResponse.ok) {
        throw new Error('Failed to fetch document');
      }

      const blob = await documentResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileKey;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloadUrl(url);
      console.log(`File downloaded and URL created: ${url}`);
    } catch (err) {
      console.error('Error fetching document:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('document', file);
    formData.append('fileName', fileName);

    try {
      const res = await fetch(`http://localhost:4000/dms/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFileKey(data.fileKey); // Assuming the backend returns the file key
        console.log(`File uploaded successfully. File key: ${data.fileKey}`);
      } else {
        console.error('Upload failed');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  return (
    <div className="download-file">
      <h2>Upload and Download File</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={onFileChange} required />
        <button type="submit" className="button">Upload</button>
      </form>
      <input
        type="text"
        value={fileKey}
        onChange={(e) => setFileKey(e.target.value)}
        placeholder="Enter file key"
        className="input"
      />
      <button onClick={handleDownload} className="button">
        Download
      </button>
      {downloadUrl && (
        <p>File downloaded successfully. Check your downloads folder.</p>
      )}
    </div>
  );
}

export default DownloadFile;
