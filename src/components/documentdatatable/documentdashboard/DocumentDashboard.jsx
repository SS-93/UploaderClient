// // import React, { useState, useEffect } from 'react';
// // import useDocumentEditor from '../../../hooks/useDocumentEditor';
// // import LoadingBar from '../../loadingbar/LoadingBar';

// // function DocumentDashboard({ claimId, parkId, parkingSessionId, documents, isAddingDocuments, setIsAddingDocuments, onFileChange }) {
// //   const { isEditing, editedDocuments, handleEditClick, handleInputChange, } = useDocumentEditor();
// //   const [fetchedDocuments, setFetchedDocuments] = useState([]);
// //   const [parkedDocuments, setParkedDocuments] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [newDocuments, setNewDocuments] = useState([]);
// //   const [fileNames, setFileNames] = useState({});
// //   const [newCategories, setNewCategories] = useState([]);
// //   const [showLoadingBar, setShowLoadingBar] = useState(false);
// //   const [category, setCategory] = useState('');
// //   const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];
  
// //   useEffect(() => {
// //     if (parkingSessionId) {
// //       fetchParkingSessionDocuments(parkingSessionId); // Pass parkingSessionId here
// //     } else if (parkId) {
// //       fetchParkedDocuments();
// //     }
// //   }, [claimId, parkId, parkingSessionId]);

// // //   const fetchNewlyUploadedDocuments = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`);
// // //       if (!res.ok) {
// // //         throw new Error('Failed to fetch documents');
// // //       }
// // //       const data = await res.json();
// // //       setFetchedDocuments(data);
// // //     } catch (err) {
// // //       console.error('Error fetching documents:', err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// //   const fetchParkedDocuments = async () => {
// //     try {
// //       const res = await fetch(`http://localhost:4000/dms/parked-uploads/`);
// //       if (!res.ok) {
// //         throw new Error('Failed to fetch parked documents');
// //       }
// //       const data = await res.json();
// //       setParkedDocuments(data.files);
// //     } catch (err) {
// //       console.error('Error fetching parked documents:', err);
// //     }
// //   };

// //   const fetchParkingSessionDocuments = async (sessionId) => {
// //     try {
// //       const res = await fetch(`http://localhost:4000/parking-session/${sessionId}/documents`);
// //       if (!res.ok) {
// //         throw new Error('Failed to fetch parking session documents');
// //       }
// //       const data = await res.json();
// //       setFetchedDocuments(data);
// //     } catch (err) {
// //       console.error('Error fetching parking session documents:', err);
// //     }
// //   };

// //   const handleFileChange = (event) => {
// //     const files = Array.from(event.target.files);
// //     setNewDocuments(files);

// //     const initialFileNames = {};
// //     files.forEach(file => {
// //       initialFileNames[file.name] = file.name;
// //     });
// //     setFileNames(initialFileNames);
// //   };

// //   const handleCategoryChange = (index, value) => {
// //     const updatedCategories = [...newCategories];
// //     updatedCategories[index] = value;
// //     setNewCategories(updatedCategories);
// //   };
// //   const onBulkUploadSubmit = async (e) => {
// //     e.preventDefault();
// //     const formData = new FormData();
  
// //     newDocuments.forEach((file, index) => {
// //       formData.append('documents', file, fileNames[file.name]);
// //       formData.append('category', newCategories[index] || 'Uncategorized');
// //     });
  
// //     if (parkingSessionId) formData.append('parkingSessionId', parkingSessionId);
// //     else if (parkId) formData.append('parkId', parkId);
  
// //     // Remaining code is the same
  
  

// //     try {
// //       setShowLoadingBar(true);
// //       const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
// //         method: 'POST',
// //         body: formData,
// //       });

// //       if (res.ok) {
// //         setTimeout(() => {
// //           setShowLoadingBar(false);
// //         //   fetchNewlyUploadedDocuments();
// //           fetchParkedDocuments();
// //         }, 80);
// //       } else {
// //         console.error('Bulk upload failed');
// //         setShowLoadingBar(false);
// //       }
// //     } catch (err) {
// //       console.error('Error during bulk upload:', err);
// //       setShowLoadingBar(false);
// //     }
// //   };

// //   const handleSave = async () => {
// //     try {
// //       setLoading(true);
  
// //       const claimUpdates = [];
// //       const parkedUpdates = [];
// //       const parkingSessionUpdates = [];
  
// //       Object.entries(editedDocuments).forEach(([id, updatedData]) => {
// //         const doc = allDocuments.find((doc) => doc._id === id);
// //         if (doc && doc.claimId) {
// //           claimUpdates.push({ _id: id, ...updatedData });
// //         } else if (doc && doc.parkId) {
// //           parkedUpdates.push({ _id: id, parkId: doc.parkId, ...updatedData });
// //         } else if (doc && doc.parkingSessionId) {
// //           parkingSessionUpdates.push({ _id: id, parkingSessionId: doc.parkingSessionId, ...updatedData });
// //         }
// //       });
  
// //       let updateSuccess = true;
  
// //       if (claimUpdates.length > 0) {
// //         const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
// //           method: 'PUT',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify(claimUpdates),
// //         });
  
// //         if (!res.ok) {
// //           console.error('Failed to update claim documents');
// //           updateSuccess = false;
// //         }
// //       }
  
// //       if (parkedUpdates.length > 0) {
// //         const res = await fetch(`http://localhost:4000/dms/parked-uploads/`, {
// //           method: 'PUT',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify(parkedUpdates),
// //         });
  
// //         if (!res.ok) {
// //           console.error('Failed to update parked documents');
// //           updateSuccess = false;
// //         }
// //       }
  
// //       if (parkingSessionUpdates.length > 0) {
// //         const res = await fetch(`http://localhost:4000/parking-session/${parkingSessionId}/documents`, {
// //           method: 'PUT',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify(parkingSessionUpdates),
// //         });
  
// //         if (!res.ok) {
// //           console.error('Failed to update parking session documents');
// //           updateSuccess = false;
// //         }
// //       }
  
// //       if (updateSuccess) {
// //         await fetchParkingSessionDocuments();
// //       }
// //     } catch (err) {
// //       console.error('Error saving edits:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  


// //   const allDocuments = [...fetchedDocuments, ...documents, ...parkedDocuments];
// // // const allDocuments = [
// // //     ...fetchedDocuments,
// // //     ...documents.filter(
// // //       (doc) => !fetchedDocuments.some((fetchedDoc) => fetchedDoc._id === doc._id)
// // //     ),
// // //     ...parkedDocuments.filter(
// // //       (doc) =>
// // //         !fetchedDocuments.some((fetchedDoc) => fetchedDoc._id === doc._id) &&
// // //         !documents.some((document) => document._id === doc._id)
// // //     ),
// // //   ];
  

// //   return (
// //     <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
// //       {showLoadingBar ? (
// //         <LoadingBar />
// //       ) : (
// //         <>
// //           <div className="p-4">
// //             <button
// //               className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
// //               onClick={() => handleEditClick(allDocuments)}
// //             >
// //               {isEditing ? 'Cancel Edit' : 'Edit'}
// //             </button>
// //             {isEditing && (
// //               <button
// //                 className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
// //                 onClick={handleSave}
// //               >
// //                 Save Changes
// //               </button>
// //             )}
// //             {isAddingDocuments && (
// //               <>
// //                 <label className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2 mt-2 cursor-pointer">
// //                   Add Files
// //                   <input type="file" multiple onChange={handleFileChange} className="hidden" />
// //                 </label>
// //                 <button
// //                   className="flex items-center justify-center text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
// //                   onClick={onBulkUploadSubmit}
// //                 >
// //                   Upload
// //                 </button>
// //               </>
// //             )}
// //           </div>
// //           <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
// //             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
// //               <tr>
// //                 <th className="px-4 py-3">Document Name</th>
// //                 <th className="px-4 py-3">Date Uploaded</th>
// //                 <th className="px-4 py-3">Category</th>
// //                 <th className="px-4 py-3">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {allDocuments.map((doc) => (
// //                 <tr key={doc._id} className="border-b dark:border-gray-700">
// //                   <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                     {isEditing ? (
// //                       <input
// //                         type="text"
// //                         value={editedDocuments[doc._id]?.fileName || doc.fileName || doc.originalName}
// //                         onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
// //                         className="px-2 py-1 border rounded-md"
// //                       />
// //                     ) : (
// //                       doc.fileName || doc.originalName
// //                     )}
// //                   </td>
// //                   <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
// //                   <td className="px-4 py-3">
// //                     {isEditing ? (
// //                       <select
// //                         value={editedDocuments[doc._id]?.category || doc.category}
// //                         onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
// //                         className="px-2 py-1 border rounded-md"
// //                       >
// //                         {categories.map((cat, index) => (
// //                           <option key={index} value={cat}>{cat}</option>
// //                         ))}
// //                       </select>
// //                     ) : (
// //                       doc.category
// //                     )}
// //                   </td>
// //                   <td className="px-4 py-3">
// //                     <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">View</a>
// //                     <button className="text-red-500 ml-2">Delete</button>
// //                   </td>
// //                 </tr>
// //               ))}
// //               {isAddingDocuments && newDocuments.map((file, index) => (
// //                 <tr key={index} className="border-b dark:border-gray-700">
// //                   <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                     {file.name}
// //                   </td>
// //                   <td className="px-4 py-3">Pending Upload</td>
// //                   <td className="px-4 py-3">
// //                     <select
// //                       value={newCategories[index] || ''}
// //                       onChange={(e) => handleCategoryChange(index, e.target.value)}
// //                       className="px-2 py-1 border rounded-md"
// //                     >
// //                       <option value="">Select Category</option>
// //                       {categories.map((cat, i) => (
// //                         <option key={i} value={cat}>{cat}</option>
// //                       ))}
// //                     </select>
// //                   </td>
// //                   <td className="px-4 py-3">Pending</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// // export default DocumentDashboard;

// //? SUPED UP VERSION

// // import React, { useState, useEffect } from 'react';
// // import LoadingBar from '../../loadingbar/LoadingBar';
// // import useDocumentEditor from '../../../hooks/useDocumentEditor';


// // function DocumentDashboard({ claimId, parkId, documents, isAddingDocuments, parkingSessionId, setIsAddingDocuments, onFileChange, onViewDocument }) {
// //     const { isEditing, editedDocuments, handleEditClick, handleInputChange } = useDocumentEditor();
// //     const [fetchedDocuments, setFetchedDocuments] = useState([]);
// //     const [newDocuments, setNewDocuments] = useState([]);
// //     const [fileNames, setFileNames] = useState({});
// //     const [newCategories, setNewCategories] = useState([]);
// //     const [loading, setLoading] = useState(false);
// //     const [showLoadingBar, setShowLoadingBar] = useState(false);
// //     const [isFileSelected, setIsFileSelected] = useState(false);
// //     const [category, setCategory] = useState('');
// //     const [showBulkUpload, setShowBulkUpload] = useState(false);
// //     const [isEditingMultiple, setIsEditingMultiple] = useState(false);
// //     const [file, setFile] = useState(null);
// //     const [files, setFiles] = useState([]);
// //     const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];
// //     const [parkedDocuments, setParkedDocuments] = useState([]);
// //     // useEffect(() => {
// //     //     if (parkingSessionId) {
// //     //       fetchParkingSessionDocuments(parkingSessionId); // Pass parkingSessionId here
// //     //     } else if (parkId) {
// //     //       fetchParkedDocuments();
// //     //     }
// //     //   }, [claimId, parkId, parkingSessionId]);

// //     // useEffect(() => {
// //     //             if (claimId) {
// //     //                 fetchNewlyUploadedDocuments();
// //     //             }
// //     //             if (parkId) {
// //     //                 fetchParkedDocuments();
// //     //             }
// //     //         }, [claimId, parkId]);

// //     // const fetchNewlyUploadedDocuments = async () => {
// //     //     setLoading(true);
// //     //     try {
// //     //         const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`);
// //     //         if (!res.ok) {
// //     //             throw new Error('Failed to fetch documents');
// //     //         }
// //     //         const data = await res.json();
// //     //         setFetchedDocuments(data);
// //     //     } catch (err) {
// //     //         console.error('Error fetching documents:', err);
// //     //     } finally {
// //     //         setLoading(false);
// //     //     }
// //     // };

// //     useEffect(() => {
// //                 if (claimId) {
// //                     fetchNewlyUploadedDocuments();
// //                 }
// //                 if (parkId) {
// //                     fetchParkedDocuments();
// //                 }
// //             }, [claimId, parkId]);
        
// //             const fetchNewlyUploadedDocuments = async () => {
// //                 setLoading(true);
// //                 try {
// //                     const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`);
// //                     if (!res.ok) {
// //                         throw new Error('Failed to fetch documents');
// //                     }
// //                     const data = await res.json();
// //                     setFetchedDocuments(data);
// //                 } catch (err) {
// //                     console.error('Error fetching documents:', err);
// //                 } finally {
// //                     setLoading(false);
// //                 }
// //             };
        
// //             const fetchParkedDocuments = async () => {
// //                 try {
// //                     const res = await fetch(`http://localhost:4000/dms/parked-uploads/`);
// //                     if (!res.ok) {
// //                         throw new Error('Failed to fetch parked documents');
// //                     }
// //                     const data = await res.json();
// //                     setParkedDocuments(data.files);
// //                 } catch (err) {
// //                     console.error('Error fetching parked documents:', err);
// //                 }
// //             };

   

// //     // Define fetchParkingSessionDocuments with a parameter
// // const fetchParkingSessionDocuments = async (sessionId) => {
// //     try {
// //       const res = await fetch(`http://localhost:4000/parking-session/${sessionId}/documents`);
// //       if (!res.ok) {
// //         throw new Error('Failed to fetch parking session documents');
// //       }
// //       const data = await res.json();
// //       setFetchedDocuments(data);
// //     } catch (err) {
// //       console.error('Error fetching parking session documents:', err);
// //     }
// //   };
    


// //   const onBulkFileChange = (e) => {
// //     const selectedFiles = Array.from(e.target.files);
// //     setFiles(selectedFiles);  // Save the selected files in state
// //     const initialFileNames = {};
// //     selectedFiles.forEach(file => {
// //         initialFileNames[file.name] = file.name;  // Initialize filenames
// //     });
// //     setFileNames(initialFileNames);  // Save filenames in state
// // };

// // const handleDownloadDocument = (fileUrl) => {
// //     try {
// //       console.log(`Initiating download for file: ${fileUrl}`);

// //       // Create a link element
// //       const a = document.createElement('a');
// //       a.href = fileUrl;
// //       a.download = ''; // This attribute will prompt the browser to download the file
// //       document.body.appendChild(a);
// //       a.click();
// //       document.body.removeChild(a);

// //       console.log(`File download triggered for URL: ${fileUrl}`);
// //     } catch (err) {
// //       console.error('Error initiating download:', err);
// //     }
// //   };

// //   const handleSaveMultiple = async () => {
// //     try {
// //       setLoading(true); // Start loading
// //       await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
// //         method: 'PUT',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(Object.values(editedDocuments)),
// //       });

// //       setIsEditingMultiple(false);
// //       fetchNewlyUploadedDocuments(); // Refresh the document list after saving
// //     } catch (err) {
// //       console.error('Error saving edits:', err);
// //     } finally {
// //       setLoading(false); // End loading
// //     }
// //   };


// //     const onSubmit = async (e) => {
// //         e.preventDefault();
// //         const formData = new FormData();
// //         formData.append('document', file);
// //         formData.append('fileName', file.name);
// //         formData.append('category', category);
// //         formData.append('claimId', claimId);

// //         try {
// //             setLoading(true);
// //             const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
// //                 method: 'POST',
// //                 body: formData,
// //             });

// //             if (res.ok) {
// //                 await fetchNewlyUploadedDocuments();
// //                 setIsFileSelected(false);
// //                 setFile(null);
// //                 setFileNames({});
// //                 setCategory('');
// //             } else {
// //                 console.error('Upload failed');
// //             }
// //         } catch (err) {
// //             console.error('Error during file upload:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// // //     const onBulkUploadSubmit = async (e) => {
// // //         e.preventDefault();
// // //         const formData = new FormData();

// // //         newDocuments.forEach((file, index) => {
// // //             formData.append('documents', file, fileNames[file.name]);
// // //             formData.append('category', newCategories[index]);  // Ensure this is a string, not an array
// // //         });

        
// // //   if (parkingSessionId) formData.append('parkingSessionId', parkingSessionId);
// // //   else if (parkId) formData.append('parkId', parkId);

// // //         try {
// // //             setShowLoadingBar(true);

// // //             const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
// // //                 method: 'POST',
// // //                 body: formData,
// // //             });

// // //             if (res.ok) {
// // //                 setTimeout( () => {   //     Hide the loading bar after data is reloaded
// // //                     setShowLoadingBar(false); 
// // //                     fetchNewlyUploadedDocuments(); // Reload the document data
// // //                      fetchParkedDocuments(); // Reload parked documents
// // //                      window.location.reload();
// // //                 }, 80);




// // //             } else {
// // //                 console.error('Bulk upload failed');
// // //                 setShowLoadingBar(false);
// // //             }
// // //         } catch (err) {
// // //             console.error(err);
// // //             setShowLoadingBar(false);
// // //         }
// // //     };

    
// // const onBulkUploadSubmit = async (e) => {
// //     e.preventDefault();
// //     const formData = new FormData();

// //     files.forEach((file, index) => {
// //         formData.append('documents', file, fileNames[file.name]);
// //         formData.append('category', newCategories[index]);  // Add category if applicable
// //     });

// //     // Include appropriate identifiers for the upload
// //     if (parkingSessionId) formData.append('parkingSessionId', parkingSessionId);
// //     else if (parkId) formData.append('parkId', parkId);

// //     try {
// //         setShowLoadingBar(true);
// //         const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
// //             method: 'POST',
// //             body: formData,
// //         });

// //         if (res.ok) {
// //             setTimeout(() => {
// //                 setShowLoadingBar(false);
// //                 fetchNewlyUploadedDocuments();
// //                 fetchParkedDocuments();
// //             }, 80);
// //         } else {
// //             console.error('Bulk upload failed');
// //             setShowLoadingBar(false);
// //         }
// //     } catch (err) {
// //         console.error(err);
// //         setShowLoadingBar(false);
// //     }
// // };


// //     const handleSave = async () => {
// //         try {
// //           setLoading(true);
      
// //           const claimUpdates = [];
// //           const parkedUpdates = [];
// //           const parkingSessionUpdates = [];
      
// //           Object.entries(editedDocuments).forEach(([id, updatedData]) => {
// //             const doc = allDocuments.find((doc) => doc._id === id);
// //             if (doc && doc.claimId) {
// //               claimUpdates.push({ _id: id, ...updatedData });
// //             } else if (doc && doc.parkId) {
// //               parkedUpdates.push({ _id: id, parkId: doc.parkId, ...updatedData });
// //             } else if (doc && doc.parkingSessionId) {
// //               parkingSessionUpdates.push({ _id: id, parkingSessionId: doc.parkingSessionId, ...updatedData });
// //             }
// //           });
      
// //           let updateSuccess = true;
      
// //           if (claimUpdates.length > 0) {
// //             const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
// //               method: 'PUT',
// //               headers: {
// //                 'Content-Type': 'application/json',
// //               },
// //               body: JSON.stringify(claimUpdates),
// //             });
      
// //             if (!res.ok) {
// //               console.error('Failed to update claim documents');
// //               updateSuccess = false;
// //             }
// //           }
      
// //           if (parkedUpdates.length > 0) {
// //             const res = await fetch(`http://localhost:4000/dms/parked-uploads/`, {
// //               method: 'PUT',
// //               headers: {
// //                 'Content-Type': 'application/json',
// //               },
// //               body: JSON.stringify(parkedUpdates),
// //             });
      
// //             if (!res.ok) {
// //               console.error('Failed to update parked documents');
// //               updateSuccess = false;
// //             }
// //           }
      
// //           if (parkingSessionUpdates.length > 0) {
// //             const res = await fetch(`http://localhost:4000/parking-session/${parkingSessionId}/documents`, {
// //               method: 'PUT',
// //               headers: {
// //                 'Content-Type': 'application/json',
// //               },
// //               body: JSON.stringify(parkingSessionUpdates),
// //             });
      
// //             if (!res.ok) {
// //               console.error('Failed to update parking session documents');
// //               updateSuccess = false;
// //             }
// //           }
      
// //           if (updateSuccess) {
// //             await fetchParkingSessionDocuments();
// //           }
// //         } catch (err) {
// //           console.error('Error saving edits:', err);
// //         } finally {
// //           setLoading(false);
// //         }
// //       };
      

// // //    const handleFileChange = (event) => {
// // //     const files = Array.from(event.target.files);
// // //     setNewDocuments(files);  // Set the files in state

// // //     const initialFileNames = {};
// // //     files.forEach(file => {
// // //         initialFileNames[file.name] = file.name;
// // //     });
// // //     setFileNames(initialFileNames);  // Set filenames in state
// // // };

// // const handleFileChange = (event) => {
// //     const files = Array.from(event.target.files);
// //     setNewDocuments(files);  // Set the files in state

// //     const initialFileNames = {};
// //     files.forEach(file => {
// //         initialFileNames[file.name] = file.name;
// //     });
// //     setFileNames(initialFileNames);  // Set filenames in state
// // };



// //     const handleCategoryChange = (index, value) => {
// //         const updatedCategories = [...newCategories];
// //         updatedCategories[index] = value;
// //         setNewCategories(updatedCategories);
// //     };

// //     const allDocuments = [...fetchedDocuments, ...documents, ...parkedDocuments];

// //     return (
// //         <div>
// //       {showLoadingBar ? (
// //         <LoadingBar /> // Display the loading bar
// //       ) : (
// //         <section className="ml-60 bg-slate-900 dark:bg-gray-900 p-4">
// //           <div className="ml-2 p-2">
// //             <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
// //               <div className="space-y-3 md:space-y-0 md:space-x-4 p-4">
// //                 <div className="md:w-1/2">
// //                   <form className="flex items-center">
// //                     <label htmlFor="simple-search" className="sr-only">Search</label>
// //                     <div className="relative w-full">
// //                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
// //                         <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
// //                           <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
// //                         </svg>
// //                       </div>
// //                       <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required="" />
// //                     </div>
// //                   </form>
// //                 </div>
// //                 <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">

// //                   {/* Bulk Upload Button */}
// //                   <button
// //                     className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
// //                     onClick={() => setShowBulkUpload(!showBulkUpload)}
// //                   >
// //                     + Bulk Upload
// //                   </button>
// //                   <button
// //                     className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
// //                     onClick={handleEditClick}
// //                   >
// //                     Edit
// //                   </button>
// //                   {isEditingMultiple && (
// //                     <button
// //                       className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
// //                       onClick={handleSaveMultiple}
// //                     >
// //                       Save Changes
// //                     </button>
// //                   )}
// //                   {isEditing && (
// //                     <button
// //                       className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
// //                       onClick={handleSave}
// //                     >
// //                       Save Changes
// //                     </button>
// //                   )}
// //                 </div>
// //               </div>

// //               {/* Bulk Upload Form */}
// //               {showBulkUpload && (
// //                 <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mt-4">
// //                   <form onSubmit={onBulkUploadSubmit}>
// //                     <input
// //                       type="file"
// //                       multiple
// //                       onChange={onBulkFileChange}
// //                       required
// //                       className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
// //                     />
// //                     {files.map(file => (
// //                       <div key={file.name} className="flex items-center space-x-3 mt-2">
// //                         <input
// //                           type="text"
// //                           value={fileNames[file.name] || ''}
// //                           onChange={(e) => setFileNames({
// //                             ...fileNames,
// //                             [file.name]: e.target.value
// //                           })}
// //                           placeholder="Edit file name"
// //                           className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
// //                           required
// //                         />
// //                       </div>
// //                     ))}
// //                     <select
// //                       value={category}
// //                       onChange={(e) => setCategory(e.target.value)}
// //                       className="mt-2 bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
// //                       required
// //                     >
// //                       <option value="">Select Category</option>
// //                       {categories.map((cat, index) => (
// //                         <option key={index} value={cat}>{cat}</option>
// //                       ))}
// //                     </select>
// //                     <button
// //                       type="submit"
// //                       className="mt-2 w-full text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
// //                     >
// //                       Upload Files
// //                     </button>
// //                   </form>
// //                 </div>
// //               )}

// //               <div className="overflow-x-auto">
// //                 <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
// //                   <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 w-full">
// //                     <tr>
// //                       <th scope="col" className="px-4 py-3">Document Name</th>
// //                       <th scope="col" className="px-4 py-3">Date Uploaded</th>
// //                       <th scope="col" className="px-4 py-3">Uploader</th>
// //                       <th scope="col" className="px-4 py-3">View File</th>
// //                       <th scope="col" className="px-4 py-3">Save File</th>
// //                       <th scope="col" className="px-4 py-3">Category</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {documents.map((doc) => (
// //                       <tr key={doc._id} className="border-b dark:border-gray-700">
// //                         <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                           {(isEditing || isEditingMultiple) ? (
// //                             <input
// //                               type="text"
// //                               value={editedDocuments[doc._id]?.fileName || doc.fileName}
// //                               onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
// //                               className="px-2 py-1 border rounded-md"
// //                             />
// //                           ) : (
// //                             doc.fileName
// //                           )}
// //                         </th>
// //                         <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
// //                         <td className="px-4 py-3">Uploaded Document</td>
// //                         <td className="px-4 py-3"><a href="#" onClick={() => onViewDocument(doc.fileUrl)}>View</a></td>
// //                         <td className="px-4 py-3"><a href="#" onClick={() => handleDownloadDocument(doc.fileUrl)}>Download</a></td>
// //                         <td className="px-4 py-3">
// //                           {(isEditing || isEditingMultiple) ? (
// //                             <select
// //                               value={editedDocuments[doc._id]?.category || doc.category}
// //                               onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
// //                               className="px-2 py-1 border rounded-md"
// //                             >
// //                               {categories.map((cat, index) => (
// //                                 <option key={index} value={cat}>{cat}</option>
// //                               ))}
// //                             </select>
// //                           ) : (
// //                             doc.category
// //                           )}
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             </div>
// //           </div>
// //         </section>
// //       )}
// //     </div>
// //     );
// // }

// // export default DocumentDashboard;


// // import React, { useState, useEffect } from 'react';
// // import LoadingBar from '../../loadingbar/LoadingBar';

// // function DocumentDashboard({ claimId, parkId, documents, isAddingDocuments, setIsAddingDocuments, onFileChange,  }) {
// //     const [fetchNewlyUploadedDocuments, setfetchNewlyUploadedDocuments] = useState([]);
// //     const [fetchedDocuments, setFetchedDocuments] = useState([]);
// //     const [parkedDocuments, setParkedDocuments] = useState([]);
// //     const [loading, setLoading] = useState(false);

// //     const [isEditing, setIsEditing] = useState(false);
// //     const [editedDocuments, setEditedDocuments] = useState({});
// //     const [newDocuments, setNewDocuments] = useState([]);
// //     const [newCategories, setNewCategories] = useState([]);

// //     const [fileNames, setFileNames] = useState({});
// //     const [showLoadingBar, setShowLoadingBar] = useState(false);

    
// //     const [uploadedDocuments, setUploadedDocuments] = useState([]);
 

    
    
// //     useEffect(() => {
// //         fetchNewlyUploadedDocuments(); // Fetch documents when component mounts
// //       }, []);
    
// //       const fetchNewlyUploadedDocuments = async () => {
// //         try {
// //           const response = await fetch('http://localhost:4000/dms/recent-uploads');
// //           if (response.ok) {
// //             const result = await response.json();
// //             setUploadedDocuments(result.files); // Set state with the newly fetched documents
// //           } else {
// //             console.error('Failed to fetch newly uploaded documents');
// //           }
// //         } catch (error) {
// //           console.error('Error fetching newly uploaded documents:', error);
// //         }
// //       };

// //     const fetchParkedDocuments = async () => {
// //         try {
// //             const res = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
// //             if (!res.ok) {
// //                 throw new Error('Failed to fetch parked documents');
// //             }
// //             const data = await res.json();
// //             setParkedDocuments(data.files);
// //         } catch (err) {
// //             console.error('Error fetching parked documents:', err);
// //         }
// //     };

// //     const handleEditClick = () => {
// //         setIsEditing(!isEditing);
// //         if (!isEditing) {
// //             const clonedDocuments = [...fetchedDocuments, ...documents, ...parkedDocuments].reduce((acc, doc) => {
// //                 acc[doc._id] = { fileName: doc.fileName || doc.originalName, category: doc.category };
// //                 return acc;
// //             }, {});
// //             setEditedDocuments(clonedDocuments);
// //         }
// //     };

// //     const handleInputChange = (id, field, value) => {
// //         setEditedDocuments({
// //             ...editedDocuments,
// //             [id]: { ...editedDocuments[id], [field]: value },
// //         });
// //     };

   

// //     // const onBulkUploadSubmit = async (e) => {
// //     //     e.preventDefault();
// //     //     const formData = new FormData();
    
// //     //     newDocuments.forEach((file, index) => {
// //     //         formData.append('documents', file, fileNames[file.name]);
// //     //         formData.append('category', newCategories[index]);
// //     //     });
    
// //     //     if (parkId) {
// //     //         formData.append('parkId', parkId); // Append parkId if it exists
// //     //     }
    
// //     //     try {
// //     //         setShowLoadingBar(true);
    
// //     //         const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
// //     //             method: 'POST',
// //     //             body: formData,
// //     //         });
    
// //     //         if (res.ok) {
// //     //             const result = await res.json();
    
// //     //             setTimeout(() => {
// //     //                 setShowLoadingBar(false);
// //     //                 fetchNewlyUploadedDocuments(); // Reload the document data
// //     //                 fetchParkedDocuments(); // Reload parked documents
// //     //             }, 80);
    
// //     //         } else {
// //     //             console.error('Bulk upload failed');
// //     //             setShowLoadingBar(false);
// //     //         }
// //     //     } catch (err) {
// //     //         console.error(err);
// //     //         setShowLoadingBar(false);
// //     //     }
// //     // };

// //     const onBulkUploadSubmit = async (e) => {
// //         e.preventDefault();
// //         const formData = new FormData();
    
// //         newDocuments.forEach((file, index) => {
// //             formData.append('documents', file, fileNames[file.name]);
// //             formData.append('category', newCategories[index]);  // Ensure this is a string, not an array
// //         });
    
// //         if (parkId) {
// //             formData.append('parkId', parkId); // Append parkId if it exists
// //         }
    
// //         try {
// //             setShowLoadingBar(true);
    
// //             const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
// //                 method: 'POST',
// //                 body: formData,
// //             });
    
// //             if (res.ok) {
// //                 const result = await res.json();
    
// //                 setTimeout(() => {
// //                     setShowLoadingBar(false);
// //                     fetchNewlyUploadedDocuments(); // Reload the document data
// //                     fetchParkedDocuments(); // Reload parked documents
// //                 }, 80);
    
// //             } else {
// //                 console.error('Bulk upload failed');
// //                 setShowLoadingBar(false);
// //             }
// //         } catch (err) {
// //             console.error(err);
// //             setShowLoadingBar(false);
// //         }
// //     };
    

// //     const handleSave = async () => {
// //         try {
// //             setLoading(true);
    
// //             const claimUpdates = [];
// //             const parkedUpdates = [];
    
// //             Object.entries(editedDocuments).forEach(([id, updatedData]) => {
// //                 const doc = allDocuments.find((doc) => doc._id === id);
// //                 if (doc && doc.claimId) {
// //                     claimUpdates.push({ _id: id, ...updatedData });
// //                 } else {
// //                     parkedUpdates.push({ _id: id, ...updatedData });
// //                 }
// //             });
    
// //             if (claimUpdates.length > 0) {
// //                 await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
// //                     method: 'PUT',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify(claimUpdates),
// //                 });
// //             }
    
// //             if (parkedUpdates.length > 0) {
// //                 await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`, {
// //                     method: 'PUT',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify(parkedUpdates),
// //                 });
// //             }
    
// //             setIsEditing(false);
// //             fetchNewlyUploadedDocuments();
// //             fetchParkedDocuments();
// //         } catch (err) {
// //             console.error('Error saving edits:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };
    

    
// //     const handleFileChange = (event) => {
// //         const files = Array.from(event.target.files);
// //         setNewDocuments(files);

// //         const initialFileNames = {};
// //         files.forEach(file => {
// //             initialFileNames[file.name] = file.name;
// //         });
// //         setFileNames(initialFileNames);
// //     };

// //     const handleCategoryChange = (index, value) => {
// //         const updatedCategories = [...newCategories];
// //         updatedCategories[index] = value;
// //         setNewCategories(updatedCategories);
// //     };

// //     const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];
// //     const allDocuments = [...fetchedDocuments, ...documents, ...parkedDocuments];

// //     return (
// //         <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
// //             {showLoadingBar ? (
// //                 <LoadingBar />
// //             ) : (
// //                 <>
// //                     <div className="p-4">
// //                         <button
// //                             className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
// //                             onClick={handleEditClick}
// //                         >
// //                             Edit
// //                         </button>
// //                         {isEditing && (
// //                             <button
// //                                 className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
// //                                 onClick={handleSave}
// //                             >
// //                                 Save Changes
// //                             </button>
// //                         )}
// //                         {isAddingDocuments && (
// //                             <>
// //                                 <label className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2 mt-2 cursor-pointer">
// //                                     Add Files
// //                                     <input type="file" multiple onChange={handleFileChange} className="hidden" />
// //                                 </label>
// //                                 <button
// //                                     className="flex items-center justify-center text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
// //                                     onClick={onBulkUploadSubmit}
// //                                 >
// //                                     Upload
// //                                 </button>
// //                             </>
// //                         )}
// //                     </div>
// //                     <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
// //                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
// //                             <tr>
// //                                 <th className="px-4 py-3">Document Name</th>
// //                                 <th className="px-4 py-3">Date Uploaded</th>
// //                                 <th className="px-4 py-3">Category</th>
// //                                 <th className="px-4 py-3">Actions</th>
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {allDocuments.map((doc) => (
// //                                 <tr key={doc._id} className="border-b dark:border-gray-700">
// //                                     <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                                         {isEditing ? (
// //                                             <input
// //                                                 type="text"
// //                                                 value={editedDocuments[doc._id]?.fileName || doc.fileName || doc.originalName}
// //                                                 onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
// //                                                 className="px-2 py-1 border rounded-md"
// //                                             />
// //                                         ) : (
// //                                             doc.fileName || doc.originalName
// //                                         )}
// //                                     </td>
// //                                     <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
// //                                     <td className="px-4 py-3">
// //                                         {isEditing ? (
// //                                             <select
// //                                                 value={editedDocuments[doc._id]?.category || doc.category}
// //                                                 onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
// //                                                 className="px-2 py-1 border rounded-md"
// //                                             >
// //                                                 {categories.map((cat, index) => (
// //                                                     <option key={index} value={cat}>{cat}</option>
// //                                                 ))}
// //                                             </select>
// //                                         ) : (
// //                                             doc.category
// //                                         )}
// //                                     </td>
// //                                     <td className="px-4 py-3">
// //                                         <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">View</a>
// //                                         <button className="text-red-500 ml-2">Delete</button>
// //                                     </td>
// //                                 </tr>
// //                             ))}
// //                             {isAddingDocuments && newDocuments.map((file, index) => (
// //                                 <tr key={index} className="border-b dark:border-gray-700">
// //                                     <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                                         {file.name}
// //                                     </td>
// //                                     <td className="px-4 py-3">Pending Upload</td>
// //                                     <td className="px-4 py-3">
// //                                         <select
// //                                             value={newCategories[index] || ''}
// //                                             onChange={(e) => handleCategoryChange(index, e.target.value)}
// //                                             className="px-2 py-1 border rounded-md"
// //                                         >
// //                                             <option value="">Select Category</option>
// //                                             {categories.map((cat, i) => (
// //                                                 <option key={i} value={cat}>{cat}</option>
// //                                             ))}
// //                                         </select>
// //                                     </td>
// //                                     <td className="px-4 py-3">Pending</td>
// //                                 </tr>
// //                             ))}
// //                         </tbody>
// //                     </table>
// //                 </>
// //             )}
// //         </div>
// //     );
// // }

// // export default DocumentDashboard;

// //! THE MAP
// // import React, { useState, useEffect } from 'react';
// // import LoadingBar from '../../loadingbar/LoadingBar';

// // function DocumentDashboard({ claimId, parkId, isAddingDocuments, setIsAddingDocuments }) {
// //   const [fetchedDocuments, setFetchedDocuments] = useState([]); // Documents fetched from recent uploads
// //   const [parkedDocuments, setParkedDocuments] = useState([]); // Documents fetched based on parkId
// //   const [loading, setLoading] = useState(false);
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [editedDocuments, setEditedDocuments] = useState({});
// //   const [newDocuments, setNewDocuments] = useState([]); // New documents selected for upload
// //   const [newCategories, setNewCategories] = useState([]); // Categories for the new documents
// //   const [fileNames, setFileNames] = useState({}); // File names of the new documents
// //   const [showLoadingBar, setShowLoadingBar] = useState(false);

  

// //   const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];

// //   // Effect to fetch documents on mount or when parkId changes
// //   useEffect(() => {
// //     fetchNewlyUploadedDocuments();  // Fetch recently uploaded documents
// //     if (parkId) {
// //       fetchParkedDocuments();  // Fetch parked documents if parkId is provided
// //     }
// //   }, [parkId]);

// //   // Function to fetch recently uploaded documents
// //   const fetchNewlyUploadedDocuments = async () => {
// //     try {
// //       const response = await fetch('http://localhost:4000/dms/recent-uploads');
// //       if (response.ok) {
// //         const result = await response.json();
// //         setFetchedDocuments(result.files); // Set state with the newly fetched documents
// //       } else {
// //         console.error('Failed to fetch newly uploaded documents');
// //       }
// //     } catch (error) {
// //       console.error('Error fetching newly uploaded documents:', error);
// //     }
// //   };

// //   // Function to fetch parked documents based on parkId
// //   const fetchParkedDocuments = async () => {
// //     try {
// //       const res = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
// //       if (!res.ok) {
// //         throw new Error('Failed to fetch parked documents');
// //       }
// //       const data = await res.json();
// //       setParkedDocuments(data.files);
// //     } catch (err) {
// //       console.error('Error fetching parked documents:', err);
// //     }
// //   };

// //   // Function to handle entering and exiting edit mode
// //   const handleEditClick = () => {
// //     setIsEditing(!isEditing);
// //     if (!isEditing) {
// //       const clonedDocuments = [...fetchedDocuments, ...parkedDocuments].reduce((acc, doc) => {
// //         acc[doc._id] = { fileName: doc.fileName || doc.originalName, category: doc.category };
// //         return acc;
// //       }, {});
// //       setEditedDocuments(clonedDocuments);
// //     }
// //   };

// //   // Function to handle input changes when editing documents
// //   const handleInputChange = (id, field, value) => {
// //     setEditedDocuments({
// //       ...editedDocuments,
// //       [id]: { ...editedDocuments[id], [field]: value },
// //     });
// //   };

// //   // Function to handle changes in file selection for upload
// //   const handleFileChange = (event) => {
// //     const files = Array.from(event.target.files);
// //     setNewDocuments(files);

// //     const initialFileNames = {};
// //     files.forEach(file => {
// //       initialFileNames[file.name] = file.name;
// //     });
// //     setFileNames(initialFileNames);
// //   };

// //   // Function to handle changes in categories for new documents
// //   const handleCategoryChange = (index, value) => {
// //     const updatedCategories = [...newCategories];
// //     updatedCategories[index] = value;
// //     setNewCategories(updatedCategories);
// //   };

// //   // Function to handle bulk upload of documents
// //   const onBulkUploadSubmit = async (e) => {
// //     e.preventDefault();
// //     const formData = new FormData();

// //     newDocuments.forEach((file, index) => {
// //       formData.append('documents', file, fileNames[file.name]);
// //       formData.append('category', newCategories[index]);  // Ensure this is a string, not an array
// //     });

// //     if (parkId) {
// //       formData.append('parkId', parkId); // Append parkId if it exists
// //     }

// //     try {
// //       setShowLoadingBar(true);

// //       const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
// //         method: 'POST',
// //         body: formData,
// //       });

// //       if (res.ok) {
// //         const result = await res.json();

// //         setTimeout(() => {
// //           setShowLoadingBar(false);
// //           fetchNewlyUploadedDocuments(); // Reload the recent uploads
// //           fetchParkedDocuments(); // Reload parked documents
// //         }, 80);

// //       } else {
// //         console.error('Bulk upload failed');
// //         setShowLoadingBar(false);
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       setShowLoadingBar(false);
// //     }
// //   };

// //   // Function to handle saving changes after editing documents
// //   const handleSave = async () => {
// //     try {
// //       setLoading(true);

// //       const claimUpdates = [];
// //       const parkedUpdates = [];

// //       Object.entries(editedDocuments).forEach(([id, updatedData]) => {
// //         const doc = fetchedDocuments.concat(parkedDocuments).find((doc) => doc._id === id);
// //         if (doc && doc.claimId) {
// //           claimUpdates.push({ _id: id, ...updatedData });
// //         } else {
// //           parkedUpdates.push({ _id: id, ...updatedData });
// //         }
// //       });

// //       if (claimUpdates.length > 0) {
// //         await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
// //           method: 'PUT',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify(claimUpdates),
// //         });
// //       }

// //       if (parkedUpdates.length > 0) {
// //         await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`, {
// //           method: 'PUT',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify(parkedUpdates),
// //         });
// //       }

// //       setIsEditing(false);
// //       fetchNewlyUploadedDocuments();
// //       fetchParkedDocuments();
// //     } catch (err) {
// //       console.error('Error saving edits:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const allDocuments = [...fetchedDocuments, ...parkedDocuments]; // Combine fetched and parked documents

// //   return (
// //     <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
// //       {showLoadingBar ? (
// //         <LoadingBar />
// //       ) : (
// //         <>
// //           <div className="p-4">
// //             <button
// //               className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
// //               onClick={handleEditClick}
// //             >
// //               {isEditing ? 'Cancel Edit' : 'Edit'}
// //             </button>
// //             {isEditing && (
// //               <button
// //                 className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
// //                 onClick={handleSave}
// //               >
// //                 Save Changes
// //               </button>
// //             )}
// //             {isAddingDocuments && (
// //               <>
// //                 <label className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2 mt-2 cursor-pointer">
// //                   Add Files
// //                   <input type="file" multiple onChange={handleFileChange} className="hidden" />
// //                 </label>
// //                 <button
// //                   className="flex items-center justify-center text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
// //                   onClick={onBulkUploadSubmit}
// //                 >
// //                   Upload
// //                 </button>
// //               </>
// //             )}
// //           </div>
// //           <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
// //             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
// //               <tr>
// //                 <th className="px-4 py-3">Document Name</th>
// //                 <th className="px-4 py-3">Date Uploaded</th>
// //                 <th className="px-4 py-3">Category</th>
// //                 <th className="px-4 py-3">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {allDocuments.map((doc) => (
// //                 <tr key={doc._id} className="border-b dark:border-gray-700">
// //                   <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                     {isEditing ? (
// //                       <input
// //                         type="text"
// //                         value={editedDocuments[doc._id]?.fileName || doc.fileName || doc.originalName}
// //                         onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
// //                         className="px-2 py-1 border rounded-md"
// //                       />
// //                     ) : (
// //                       doc.fileName || doc.originalName
// //                     )}
// //                   </td>
// //                   <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
// //                   <td className="px-4 py-3">
// //                     {isEditing ? (
// //                       <select
// //                         value={editedDocuments[doc._id]?.category || doc.category}
// //                         onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
// //                         className="px-2 py-1 border rounded-md"
// //                       >
// //                         {categories.map((cat, index) => (
// //                           <option key={index} value={cat}>{cat}</option>
// //                         ))}
// //                       </select>
// //                     ) : (
// //                       doc.category
// //                     )}
// //                   </td>
// //                   <td className="px-4 py-3">
// //                     <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">View</a>
// //                     <button className="text-red-500 ml-2">Delete</button>
// //                   </td>
// //                 </tr>
// //               ))}
// //               {isAddingDocuments && newDocuments.map((file, index) => (
// //                 <tr key={index} className="border-b dark:border-gray-700">
// //                   <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                     {file.name}
// //                   </td>
// //                   <td className="px-4 py-3">Pending Upload</td>
// //                   <td className="px-4 py-3">
// //                     <select
// //                       value={newCategories[index] || ''}
// //                       onChange={(e) => handleCategoryChange(index, e.target.value)}
// //                       className="px-2 py-1 border rounded-md"
// //                     >
// //                       <option value="">Select Category</option>
// //                       {categories.map((cat, i) => (
// //                         <option key={i} value={cat}>{cat}</option>
// //                       ))}
// //                     </select>
// //                   </td>
// //                   <td className="px-4 py-3">Pending</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// // export default DocumentDashboard;

// //! THE MAP



// // import React, { useState, useEffect } from 'react';
// // import LoadingBar from '../../loadingbar/LoadingBar

// // function DocumentDashboard({ claimId, parkId, documents, isAddingDocuments, setIsAddingDocuments, onFileChange,  }) {
// //     const [fetchedDocuments, setFetchedDocuments] = useState([]);
// //     const [parkedDocuments, setParkedDocuments] = useState([]);
// //     const [loading, setLoading] = useState(false);

// //     const [isEditing, setIsEditing] = useState(false);
// //     const [editedDocuments, setEditedDocuments] = useState({});
// //     const [newDocuments, setNewDocuments] = useState([]);
// //     const [newCategories, setNewCategories] = useState([]);

// //     const [fileNames, setFileNames] = useState({});
// //     const [showLoadingBar, setShowLoadingBar] = useState(false);

// //     useEffect(() => {
// //         if (claimId) {
// //             fetchNewlyUploadedDocuments();
// //         }
// //         if (parkId) {
// //             fetchParkedDocuments();
// //         }
// //     }, [claimId, parkId]);

// //     const fetchNewlyUploadedDocuments = async () => {
// //         setLoading(true);
// //         try {
// //             const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`);
// //             if (!res.ok) {
// //                 throw new Error('Failed to fetch documents');
// //             }
// //             const data = await res.json();
// //             setFetchedDocuments(data);
// //         } catch (err) {
// //             console.error('Error fetching documents:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const fetchParkedDocuments = async () => {
// //         try {
// //             const res = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
// //             if (!res.ok) {
// //                 throw new Error('Failed to fetch parked documents');
// //             }
// //             const data = await res.json();
// //             setParkedDocuments(data.files);
// //         } catch (err) {
// //             console.error('Error fetching parked documents:', err);
// //         }
// //     };

// //     const handleEditClick = () => {
// //         setIsEditing(!isEditing);
// //         if (!isEditing) {
// //             const clonedDocuments = [...fetchedDocuments, ...documents, ...parkedDocuments].reduce((acc, doc) => {
// //                 acc[doc._id] = { fileName: doc.fileName || doc.originalName, category: doc.category };
// //                 return acc;
// //             }, {});
// //             setEditedDocuments(clonedDocuments);
// //         }
// //     };

// //     const handleInputChange = (id, field, value) => {
// //         setEditedDocuments({
// //             ...editedDocuments,
// //             [id]: { ...editedDocuments[id], [field]: value },
// //         });
// //     };

   

// //     // const onBulkUploadSubmit = async (e) => {
// //     //     e.preventDefault();
// //     //     const formData = new FormData();
    
// //     //     newDocuments.forEach((file, index) => {
// //     //         formData.append('documents', file, fileNames[file.name]);
// //     //         formData.append('category', newCategories[index]);
// //     //     });
    
// //     //     if (parkId) {
// //     //         formData.append('parkId', parkId); // Append parkId if it exists
// //     //     }
    
// //     //     try {
// //     //         setShowLoadingBar(true);
    
// //     //         const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
// //     //             method: 'POST',
// //     //             body: formData,
// //     //         });
    
// //     //         if (res.ok) {
// //     //             const result = await res.json();
    
// //     //             setTimeout(() => {
// //     //                 setShowLoadingBar(false);
// //     //                 fetchNewlyUploadedDocuments(); // Reload the document data
// //     //                 fetchParkedDocuments(); // Reload parked documents
// //     //             }, 80);
    
// //     //         } else {
// //     //             console.error('Bulk upload failed');
// //     //             setShowLoadingBar(false);
// //     //         }
// //     //     } catch (err) {
// //     //         console.error(err);
// //     //         setShowLoadingBar(false);
// //     //     }
// //     // };

// //     const onBulkUploadSubmit = async (e) => {
// //         e.preventDefault();
// //         const formData = new FormData();
    
// //         newDocuments.forEach((file, index) => {
// //             formData.append('documents', file, fileNames[file.name]);
// //             formData.append('category', newCategories[index]);  // Ensure this is a string, not an array
// //         });
    
// //         if (parkId) {
// //             formData.append('parkId', parkId); // Append parkId if it exists
// //         }
    
// //         try {
// //             setShowLoadingBar(true);
    
// //             const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
// //                 method: 'POST',
// //                 body: formData,
// //             });
    
// //             if (res.ok) {
// //                 const result = await res.json();
    
// //                 setTimeout(() => {
// //                     setShowLoadingBar(false);
// //                     fetchNewlyUploadedDocuments(); // Reload the document data
// //                     fetchParkedDocuments(); // Reload parked documents
// //                 }, 80);
    
// //             } else {
// //                 console.error('Bulk upload failed');
// //                 setShowLoadingBar(false);
// //             }
// //         } catch (err) {
// //             console.error(err);
// //             setShowLoadingBar(false);
// //         }
// //     };
    

// //     const handleSave = async () => {
// //         try {
// //             setLoading(true);
    
// //             const claimUpdates = [];
// //             const parkedUpdates = [];
    
// //             Object.entries(editedDocuments).forEach(([id, updatedData]) => {
// //                 const doc = allDocuments.find((doc) => doc._id === id);
// //                 if (doc && doc.claimId) {
// //                     claimUpdates.push({ _id: id, ...updatedData });
// //                 } else {
// //                     parkedUpdates.push({ _id: id, ...updatedData });
// //                 }
// //             });
    
// //             if (claimUpdates.length > 0) {
// //                 await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
// //                     method: 'PUT',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify(claimUpdates),
// //                 });
// //             }
    
// //             if (parkedUpdates.length > 0) {
// //                 await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`, {
// //                     method: 'PUT',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify(parkedUpdates),
// //                 });
// //             }
    
// //             setIsEditing(false);
// //             fetchNewlyUploadedDocuments();
// //             fetchParkedDocuments();
// //         } catch (err) {
// //             console.error('Error saving edits:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };
    

    
// //     const handleFileChange = (event) => {
// //         const files = Array.from(event.target.files);
// //         setNewDocuments(files);

// //         const initialFileNames = {};
// //         files.forEach(file => {
// //             initialFileNames[file.name] = file.name;
// //         });
// //         setFileNames(initialFileNames);
// //     };

// //     const handleCategoryChange = (index, value) => {
// //         const updatedCategories = [...newCategories];
// //         updatedCategories[index] = value;
// //         setNewCategories(updatedCategories);
// //     };

// //     const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];
// //     const allDocuments = [...fetchedDocuments, ...documents, ...parkedDocuments];

// //     return (
// //         <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
// //             {showLoadingBar ? (
// //                 <LoadingBar />
// //             ) : (
// //                 <>
// //                     <div className="p-4">
// //                         <button
// //                             className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
// //                             onClick={handleEditClick}
// //                         >
// //                             Edit
// //                         </button>
// //                         {isEditing && (
// //                             <button
// //                                 className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
// //                                 onClick={handleSave}
// //                             >
// //                                 Save Changes
// //                             </button>
// //                         )}
// //                         {isAddingDocuments && (
// //                             <>
// //                                 <label className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2 mt-2 cursor-pointer">
// //                                     Add Files
// //                                     <input type="file" multiple onChange={handleFileChange} className="hidden" />
// //                                 </label>
// //                                 <button
// //                                     className="flex items-center justify-center text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
// //                                     onClick={onBulkUploadSubmit}
// //                                 >
// //                                     Upload
// //                                 </button>
// //                             </>
// //                         )}
// //                     </div>
// //                     <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
// //                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
// //                             <tr>
// //                                 <th className="px-4 py-3">Document Name</th>
// //                                 <th className="px-4 py-3">Date Uploaded</th>
// //                                 <th className="px-4 py-3">Category</th>
// //                                 <th className="px-4 py-3">Actions</th>
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {allDocuments.map((doc) => (
// //                                 <tr key={doc._id} className="border-b dark:border-gray-700">
// //                                     <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                                         {isEditing ? (
// //                                             <input
// //                                                 type="text"
// //                                                 value={editedDocuments[doc._id]?.fileName || doc.fileName || doc.originalName}
// //                                                 onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
// //                                                 className="px-2 py-1 border rounded-md"
// //                                             />
// //                                         ) : (
// //                                             doc.fileName || doc.originalName
// //                                         )}
// //                                     </td>
// //                                     <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
// //                                     <td className="px-4 py-3">
// //                                         {isEditing ? (
// //                                             <select
// //                                                 value={editedDocuments[doc._id]?.category || doc.category}
// //                                                 onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
// //                                                 className="px-2 py-1 border rounded-md"
// //                                             >
// //                                                 {categories.map((cat, index) => (
// //                                                     <option key={index} value={cat}>{cat}</option>
// //                                                 ))}
// //                                             </select>
// //                                         ) : (
// //                                             doc.category
// //                                         )}
// //                                     </td>
// //                                     <td className="px-4 py-3">
// //                                         <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">View</a>
// //                                         <button className="text-red-500 ml-2">Delete</button>
// //                                     </td>
// //                                 </tr>
// //                             ))}
// //                             {isAddingDocuments && newDocuments.map((file, index) => (
// //                                 <tr key={index} className="border-b dark:border-gray-700">
// //                                     <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
// //                                         {file.name}
// //                                     </td>
// //                                     <td className="px-4 py-3">Pending Upload</td>
// //                                     <td className="px-4 py-3">
// //                                         <select
// //                                             value={newCategories[index] || ''}
// //                                             onChange={(e) => handleCategoryChange(index, e.target.value)}
// //                                             className="px-2 py-1 border rounded-md"
// //                                         >
// //                                             <option value="">Select Category</option>
// //                                             {categories.map((cat, i) => (
// //                                                 <option key={i} value={cat}>{cat}</option>
// //                                             ))}
// //                                         </select>
// //                                     </td>
// //                                     <td className="px-4 py-3">Pending</td>
// //                                 </tr>
// //                             ))}
// //                         </tbody>
// //                     </table>
// //                 </>
// //             )}
// //         </div>
// //     );
// // }

// // export default DocumentDashboard;



// import React, { useState, useEffect } from 'react';
// import LoadingBar from '../../loadingbar/LoadingBar';

// function DocumentDashboard({ claimId, parkId, onViewDocument, onReadDocument }) {
//   const [fetchedDocuments, setFetchedDocuments] = useState([]); // Documents fetched from recent uploads
//   const [parkedDocuments, setParkedDocuments] = useState([]); // Documents fetched based on parkId
//   const [loading, setLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isAddingDocuments, setIsAddingDocuments] = useState(false);
//   const [editedDocuments, setEditedDocuments] = useState({});
//   const [newDocuments, setNewDocuments] = useState([]); // New documents selected for upload
//   const [newCategories, setNewCategories] = useState([]); // Categories for the new documents
//   const [fileNames, setFileNames] = useState({}); // File names of the new documents
//   const [showLoadingBar, setShowLoadingBar] = useState(false);

//   const [documents, setDocuments] = useState([]);
//   const [file, setFile] = useState(null);
//   const [files, setFiles] = useState([]);
//   const [fileName, setFileName] = useState('');
//   const [isFileSelected, setIsFileSelected] = useState(false);
//   const [categoryFilter, setCategoryFilter] = useState('');
//   const [category, setCategory] = useState('');
//   const [showBulkUpload, setShowBulkUpload] = useState(false);
  
//   const [isEditingMultiple, setIsEditingMultiple] = useState(false);
  

//   const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];

//   // Effect to fetch documents on mount or when parkId changes
//   useEffect(() => {
//     fetchNewlyUploadedDocuments();  // Fetch recently uploaded documents
//     if (parkId) {
//       fetchParkedDocuments();  // Fetch parked documents if parkId is provided
//     }
//   }, [parkId]);

//   // Function to fetch recently uploaded documents
//   const fetchNewlyUploadedDocuments = async () => {
//     try {
//       const response = await fetch('http://localhost:4000/dms/recent-uploads');
//       if (response.ok) {
//         const result = await response.json();
//         setFetchedDocuments(result.files); // Set state with the newly fetched documents
//         setDocuments(prevDocuments => [...prevDocuments, ...result.files]); // Combine with existing documents
//       } else {
//         console.error('Failed to fetch newly uploaded documents');
//       }
//     } catch (error) {
//       console.error('Error fetching newly uploaded documents:', error);
//     }
//   };

//   // Function to fetch parked documents based on parkId
//   const fetchParkedDocuments = async () => {
//     try {
//       const res = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
//       if (!res.ok) {
//         throw new Error('Failed to fetch parked documents');
//       }
//       const data = await res.json();
//       setParkedDocuments(data.files);
//       setDocuments(prevDocuments => [...prevDocuments, ...data.files]); // Combine with existing documents
//     } catch (err) {
//       console.error('Error fetching parked documents:', err);
//     }
//   };

//   // Function to handle entering and exiting edit mode
//   const handleEditClick = () => {
//     setIsEditing(!isEditing);
//     if (!isEditing) {
//       // Clone the current documents' state when entering edit mode
//       const clonedDocuments = documents.reduce((acc, doc) => {
//         acc[doc._id] = { fileName: doc.fileName, category: doc.category };
//         return acc;
//       }, {});
//       setEditedDocuments(clonedDocuments);
//     }
//   };

//   const handleInputChange = (id, field, value) => {
//     setEditedDocuments({
//       ...editedDocuments,
//       [id]: { ...editedDocuments[id], [field]: value },
//     });
//   };

//   // Function to handle changes in file selection for upload
//   const handleFileChange = (event) => {
//     const files = Array.from(event.target.files);
//     setNewDocuments(files);

//     const initialFileNames = {};
//     files.forEach(file => {
//       initialFileNames[file.name] = file.name;
//     });
//     setFileNames(initialFileNames);
//   };

//   // Function to handle changes in categories for new documents
//   const handleCategoryChange = (index, value) => {
//     const updatedCategories = [...newCategories];
//     updatedCategories[index] = value;
//     setNewCategories(updatedCategories);
//   };

//   // Function to handle bulk upload of documents
//   const onBulkUploadSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();

//     newDocuments.forEach((file, index) => {
//       formData.append('documents', file, fileNames[file.name]);
//       formData.append('category', newCategories[index] || 'Uncategorized');  // Ensure this is a string, not an array
//     });

//     if (parkId) {
//       formData.append('parkId', parkId); // Append parkId if it exists
//     }

//     try {
//       setShowLoadingBar(true);

//       const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
//         method: 'POST',
//         body: formData,
//       });

//       if (res.ok) {
//         const result = await res.json();

//         setTimeout(() => {
//           setShowLoadingBar(false);
//           fetchNewlyUploadedDocuments(); // Reload the recent uploads
//           fetchParkedDocuments(); // Reload parked documents
//         }, 80);

//       } else {
//         console.error('Bulk upload failed');
//         setShowLoadingBar(false);
//       }
//     } catch (err) {
//       console.error(err);
//       setShowLoadingBar(false);
//     }
//   };

//   // Function to handle saving changes after editing documents
//   const handleSave = async () => {
//     try {
//       setLoading(true);

//       const claimUpdates = [];
//       const parkedUpdates = [];

//       Object.entries(editedDocuments).forEach(([id, updatedData]) => {
//         const doc = documents.find((doc) => doc._id === id);
//         if (doc && doc.claimId) {
//           claimUpdates.push({ _id: id, ...updatedData });
//         } else {
//           parkedUpdates.push({ _id: id, ...updatedData });
//         }
//       });

//       if (claimUpdates.length > 0) {
//         await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(claimUpdates),
//         });
//       }

//       if (parkedUpdates.length > 0) {
//         await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(parkedUpdates),
//         });
//       }

//       setIsEditing(false);
//       fetchNewlyUploadedDocuments();
//       fetchParkedDocuments();
//     } catch (err) {
//       console.error('Error saving edits:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//     setFileName(selectedFile.name);
//     setIsFileSelected(true);
//   };

//   const onFileNameChange = (e) => {
//     setFileName(e.target.value);
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('document', file);
//     formData.append('fileName', fileName);
//     formData.append('category', category);
//     formData.append('claimId', claimId);

//     try {
//       setLoading(true); // Start loading
//       const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
//         method: 'POST',
//         body: formData,
//       });

//       if (res.ok) {
//         await fetchNewlyUploadedDocuments(); // Refresh the document list after upload
//         setIsFileSelected(false); // Reset file selection
//         setFile(null);
//         setFileName(''); // Reset file name input
//         setCategory('');
//       } else {
//         console.error('Upload failed');
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false); // End loading
//     }
//   };

//   const onBulkFileChange = (e) => {
//     const selectedFiles = Array.from(e.target.files);
//     setFiles(selectedFiles);

//     const initialFileNames = {};
//     selectedFiles.forEach(file => {
//       initialFileNames[file.name] = file.name; // Initialize with original filenames
//     });
//     setFileNames(initialFileNames);
//   };

//   const handleDownloadDocument = (fileUrl) => {
//     try {
//       console.log(`Initiating download for file: ${fileUrl}`);

//       // Create a link element
//       const a = document.createElement('a');
//       a.href = fileUrl;
//       a.download = ''; // This attribute will prompt the browser to download the file
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);

//       console.log(`File download triggered for URL: ${fileUrl}`);
//     } catch (err) {
//       console.error('Error initiating download:', err);
//     }
//   };

//   const handleViewDocument = async (fileKey) => {
//     try {
//       console.log(`Fetching document for fileKey: ${fileKey}`); // Log the file key

//       // Construct the correct URL
//       const url = `${fileKey}`;

//       onViewDocument(url); // Pass the object URL to the viewer
//     } catch (err) {
//       console.error('Error fetching document:', err);
//     }
//   };

//   const handleSaveMultiple = async () => {
//     try {
//       setLoading(true); // Start loading
//       await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(Object.values(editedDocuments)),
//       });

//       setIsEditingMultiple(false);
//       fetchNewlyUploadedDocuments(); // Refresh the document list after saving
//     } catch (err) {
//       console.error('Error saving edits:', err);
//     } finally {
//       setLoading(false); // End loading
//     }
//   };

//   const allDocuments = [...fetchedDocuments, ...parkedDocuments]; // Combine fetched and parked documents

//   return (
//     <div>
//       {showLoadingBar ? (
//         <LoadingBar /> // Display the loading bar
//       ) : (
//         <section className="ml-60 bg-slate-900 dark:bg-gray-900 p-4">
//           <div className="ml-2 p-2">
//             <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
//               <div className="space-y-3 md:space-y-0 md:space-x-4 p-4">
//                 <div className="md:w-1/2">
//                   <form className="flex items-center">
//                     <label htmlFor="simple-search" className="sr-only">Search</label>
//                     <div className="relative w-full">
//                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                         <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                           <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                         </svg>
//                       </div>
//                       <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required="" />
//                     </div>
//                   </form>
//                 </div>
//                 <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">

//                   {/* Bulk Upload Button */}
//                   <button
//                     className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
//                     onClick={() => setShowBulkUpload(!showBulkUpload)}
//                   >
//                     + Bulk Upload
//                   </button>
//                   <button
//                     className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
//                     onClick={handleEditClick}
//                   >
//                     Edit
//                   </button>
//                   {isEditingMultiple && (
//                     <button
//                       className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
//                       onClick={handleSaveMultiple}
//                     >
//                       Save Changes
//                     </button>
//                   )}
//                   {isEditing && (
//                     <button
//                       className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
//                       onClick={handleSave}
//                     >
//                       Save Changes
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Bulk Upload Form */}
//               {showBulkUpload && (
//                 <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mt-4">
//                   <form onSubmit={onBulkUploadSubmit}>
//                     <input
//                       type="file"
//                       multiple
//                       onChange={onBulkFileChange}
//                       required
//                       className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
//                     />
//                     {files.map(file => (
//                       <div key={file.name} className="flex items-center space-x-3 mt-2">
//                         <input
//                           type="text"
//                           value={fileNames[file.name] || ''}
//                           onChange={(e) => setFileNames({
//                             ...fileNames,
//                             [file.name]: e.target.value
//                           })}
//                           placeholder="Edit file name"
//                           className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
//                           required
//                         />
//                       </div>
//                     ))}
//                     <select
//                       value={category}
//                       onChange={(e) => setCategory(e.target.value)}
//                       className="mt-2 bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//                       required
//                     >
//                       <option value="">Select Category</option>
//                       {categories.map((cat, index) => (
//                         <option key={index} value={cat}>{cat}</option>
//                       ))}
//                     </select>
//                     <button
//                       type="submit"
//                       className="mt-2 w-full text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
//                     >
//                       Upload Files
//                     </button>
//                   </form>
//                 </div>
//               )}

//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
//                   <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 w-full">
//                     <tr>
//                       <th scope="col" className="px-4 py-3">Document Name</th>
//                       <th scope="col" className="px-4 py-3">Date Uploaded</th>
//                       <th scope="col" className="px-4 py-3">Uploader</th>
//                       <th scope="col" className="px-4 py-3">View File</th>
//                       <th scope="col" className="px-4 py-3">Save File</th>
//                       <th scope="col" className="px-4 py-3">Category</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {allDocuments.map((doc) => (
//                       <tr key={doc._id} className="border-b dark:border-gray-700">
//                         <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                           {(isEditing || isEditingMultiple) ? (
//                             <input
//                               type="text"
//                               value={editedDocuments[doc._id]?.fileName || doc.fileName}
//                               onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
//                               className="px-2 py-1 border rounded-md"
//                             />
//                           ) : (
//                             doc.fileName
//                           )}
//                         </th>
//                         <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
//                         <td className="px-4 py-3">Uploaded Document</td>
//                         <td className="px-4 py-3"><a href="#" onClick={() => onViewDocument(doc.fileUrl)}>View</a></td>
//                         <td className="px-4 py-3"><a href="#" onClick={() => handleDownloadDocument(doc.fileUrl)}>Download</a></td>
//                         <td className="px-4 py-3">
//                           {(isEditing || isEditingMultiple) ? (
//                             <select
//                               value={editedDocuments[doc._id]?.category || doc.category}
//                               onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
//                               className="px-2 py-1 border rounded-md"
//                             >
//                               {categories.map((cat, index) => (
//                                 <option key={index} value={cat}>{cat}</option>
//                               ))}
//                             </select>
//                           ) : (
//                             doc.category
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

// export default DocumentDashboard;

import React, { useState, useEffect } from 'react';
import LoadingBar from '../../loadingbar/LoadingBar';

function DocumentDashboard({ claimId, parkId, onViewDocument, onReadDocument, parkSessionId }) {
  const [documents, setDocuments] = useState([]);
  const [fetchedDocuments, setFetchedDocuments] = useState([]);
  const [parkedDocuments, setParkedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDocuments, setEditedDocuments] = useState({});
  const [newDocuments, setNewDocuments] = useState([]);
  const [documentDetails, setDocumentDetails] = useState([]);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isEditingMultiple, setIsEditingMultiple] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null); // Track the document to delete
  const [showModal, setShowModal] = useState(false); // Control the modal visibility

  const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];

  useEffect(() => {
    fetchNewlyUploadedDocuments();
    if (parkId) {
      fetchNewlyUploadedDocuments();
    }
  }, [parkId]);

  const fetchNewlyUploadedDocuments = async () => {
    try {
      const response = await fetch('http://localhost:4000/dms/recent-uploads');
      if (response.ok) {
        const result = await response.json();
        setFetchedDocuments(result.files);
        setDocuments(prevDocuments => [...prevDocuments, ...result.files]);
      } else {
        console.error('Failed to fetch newly uploaded documents');
      }
    } catch (error) {
      console.error('Error fetching newly uploaded documents:', error);
    }
  };

  const fetchParkedDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
      if (!res.ok) throw new Error('Failed to fetch parked documents');
      const data = await res.json();
      setParkedDocuments(data.files);
      setDocuments(prevDocuments => [...prevDocuments, ...data.files]);
    } catch (err) {
      console.error('Error fetching parked documents:', err);
    }
  };

  const fetchParkingSessionDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:4000/dms/park-sessions/${parkSessionId}/documents`);
      if (!res.ok) throw new Error('Failed to fetch parking session documents');
      const data = await res.json();
      setParkedDocuments(data.files);
      setDocuments(prevDocuments => [...prevDocuments, ...data.files]);
    } catch (err) {
      console.error('Error fetching parking session documents:', err);
    }
  };


//   const handleEditClick = () => {
//     setIsEditing(!isEditing);
//     if (!isEditing) {
//       const clonedDocuments = documents.reduce((acc, doc) => {
//         acc[doc._id] = { fileName: doc.fileName || doc.originalName, category: doc.category || 'Uncategorized' };
//         return acc;
//       }, {});
//       setEditedDocuments(clonedDocuments);
//     }
//   };

const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      const clonedDocuments = documents.reduce((acc, doc) => {
        acc[doc._id] = { fileName: doc.filename, category: doc.category || 'Uncategorized' }; // Use only filename
        return acc;
      }, {});
      setEditedDocuments(clonedDocuments);
    }
  };
  

  const handleInputChange = (id, field, value) => {
    setEditedDocuments({
      ...editedDocuments,
      [id]: { ...editedDocuments[id], [field]: value },
    });
  };
  

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setNewDocuments(files);
    const initialDetails = files.map(file => ({
      fileName: file.name,
      category: 'Uncategorized',
    }));
    setDocumentDetails(initialDetails);
  };

  const handleCategoryChange = (index, value) => {
    const updatedDetails = [...documentDetails];
    updatedDetails[index].category = value;
    setDocumentDetails(updatedDetails);
  };

  const onBulkUploadSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    newDocuments.forEach((file, index) => {
      formData.append('documents', file, documentDetails[index].fileName);
      formData.append('category', documentDetails[index].category);
    });
    if (parkId) {
      formData.append('parkId', parkId);
    }
    try {
      setShowLoadingBar(true);
      const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setTimeout(() => {
          setShowLoadingBar(false);
          fetchNewlyUploadedDocuments();
          fetchParkedDocuments();
        }, 80);
      } else {
        console.error('Bulk upload failed');
        setShowLoadingBar(false);
      }
    } catch (err) {
      console.error(err);
      setShowLoadingBar(false);
    }
  };

//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       const updates = Object.entries(editedDocuments).map(([id, updatedData]) => ({
//         _id: id,
//         ...updatedData,
//       }));
//       await fetch(`http://localhost:4000/dms/park-sessions/${parkId}/documents`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(updates),
//       });
//       setIsEditing(false);
//       fetchNewlyUploadedDocuments();
//       fetchParkedDocuments();
//     } catch (err) {
//       console.error('Error saving edits:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

// React Component (DocumentDashboard.js)

const handleSave = async () => {
    try {
      setLoading(true);
      const updates = Object.entries(editedDocuments).map(([id, updatedData]) => ({
        _id: id,
        ...updatedData,
      }));
  
      // Loop through updates and send a separate request for each document
      for (let update of updates) {
        await fetch(`http://localhost:4000/dms/documents/${update._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update),
        });
      }
  
      setIsEditing(false);
      window.location.reload(); // Reload page to fetch updated data
      fetchNewlyUploadedDocuments();
      fetchParkedDocuments();
      if (parkSessionId) fetchParkingSessionDocuments(); // Fetch session documents if parkSessionId is present
    } catch (err) {
      console.error('Error saving edits:', err);
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleDownloadDocument = (fileUrl) => {
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = ''; // Prompt the browser to download the file
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error initiating download:', err);
    }
  };

  const handleSaveMultiple = async () => {
    try {
      setLoading(true);
      await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.values(editedDocuments)),
      });

      setIsEditingMultiple(false);
      fetchNewlyUploadedDocuments();
    } catch (err) {
      console.error('Error saving edits:', err);
    } finally {
      setLoading(false);
    }
  };


  

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:4000/dms/recent-uploads');
      if (response.ok) {
        const result = await response.json();
        setDocuments(result.files);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleDeleteClick = (id) => {
    setDocumentToDelete(id); // Set the document ID to delete
    setShowModal(true); // Show the confirmation modal
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/dms/documents/${documentToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDocuments(); // Refresh document list
        setShowModal(false); // Hide modal
        setDocumentToDelete(null); // Clear document to delete
        window.location.reload();
      } else {
        console.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setDocumentToDelete(null);
  };

  const allDocuments = [...fetchedDocuments, ...parkedDocuments];

  return (
    <div>
      {showLoadingBar ? (
        <LoadingBar />
      ) : (
        <section className="ml-60 bg-slate-900 dark:bg-gray-900 p-4">
          <div className="ml-2 p-2">
            <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
              <div className="space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div className="md:w-1/2">
                  <form className="flex items-center">
                    <label htmlFor="simple-search" className="sr-only">Search</label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required="" />
                    </div>
                  </form>
                </div>
                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                  <button
                    className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
                    onClick={() => setShowBulkUpload(!showBulkUpload)}
                  >
                    + Bulk Upload
                  </button>
                  <button
          className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
          onClick={handleEditClick}
        >
          Edit
        </button>
        {isEditing && (
          <button
            className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
            onClick={handleSave}
          >
            Save Changes
          </button>
                  )}
                  {/* {isEditing && (
                    <button
                      className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                  )} */}
                </div>
              </div>

              {showBulkUpload && (
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mt-4">
                  <form onSubmit={onBulkUploadSubmit}>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      required
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
                    />
                    {newDocuments.map((file, index) => (
                      <div key={file.name} className="flex items-center space-x-3 mt-2">
                        <input
                          type="text"
                          value={documentDetails[index]?.fileName || ''}
                          onChange={(e) => {
                            const updatedDetails = [...documentDetails];
                            updatedDetails[index].fileName = e.target.value;
                            setDocumentDetails(updatedDetails);
                          }}
                          placeholder="Edit file name"
                          className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                          required
                        />
                        <select
                          value={documentDetails[index]?.category || ''}
                          onChange={(e) => handleCategoryChange(index, e.target.value)}
                          className="mt-2 bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="mt-2 w-full text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
                    >
                      Upload Files
                    </button>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 w-full">
                    <tr>
                      <th scope="col" className="px-4 py-3">Document Name</th>
                      <th scope="col" className="px-4 py-3">Date Uploaded</th>
                      <th scope="col" className="px-4 py-3">Uploader</th>
                      <th scope="col" className="px-4 py-3">View File</th>
                      <th scope="col" className="px-4 py-3">Save File</th>
                      <th scope="col" className="px-4 py-3">Category</th>
                      <th scope="col" className="px-4 py-3">Remove File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDocuments.map((doc) => (
                    //   <tr key={doc._id} className="border-b dark:border-gray-700">
                    //     <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    //       {(isEditing || isEditingMultiple) ? (
                    //         <input
                    //           type="text"
                    //           value={editedDocuments[doc._id]?.fileName || doc.fileName || doc.originalName}
                    //           onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
                    //           className="px-2 py-1 border rounded-md"
                    //         />
                    //       ) : (
                    //         doc.fileName || doc.originalName
                    //       )}
                    //     </th>
                    //     <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    //     <td className="px-4 py-3">Uploaded Document</td>
                    //     <td className="px-4 py-3"><a href="#" onClick={() => onViewDocument(doc.fileUrl)}>View</a></td>
                    //     <td className="px-4 py-3"><a href="#" onClick={() => handleDownloadDocument(doc.fileUrl)}>Download</a></td>
                    //     <td className="px-4 py-3">
                    //       {(isEditing || isEditingMultiple) ? (
                    //         <select
                    //           value={editedDocuments[doc._id]?.category || doc.category}
                    //           onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
                    //           className="px-2 py-1 border rounded-md"
                    //         >
                    //           {categories.map((cat, index) => (
                    //             <option key={index} value={cat}>{cat}</option>
                    //           ))}
                    //         </select>
                    //       ) : (
                    //         doc.category
                    //       )}
                    //     </td>
                    //   </tr>
                    <tr key={doc._id} className="border-b dark:border-gray-700">
    {/* <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
      {(isEditing || isEditingMultiple) ? (
        <input
          type="text"
          value={editedDocuments[doc._id]?.fileName || doc.fileName || doc.originalName}
          onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
          className="px-2 py-1 border rounded-md"
        />
      ) : (
        doc.fileName 
      )}
    </th> */}

<th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        {(isEditing || isEditingMultiple) ? (
          <input
            type="text"
            value={editedDocuments[doc._id]?.fileName || doc.filename} // Use filename directly
            onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
            className="px-2 py-1 border rounded-md"
          />
        ) : (
          doc.filename || 'Unnamed Document' // Fallback to filename or a default
        )}
      </th>
      <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
      <td className="px-4 py-3">Uploaded Document</td>
      <td className="px-4 py-3"><a href="#" onClick={() => onViewDocument(doc.fileUrl)}>View</a></td>
      <td className="px-4 py-3"><a href="#" onClick={() => handleDownloadDocument(doc.fileUrl)}>Download</a></td>
      <td className="px-4 py-3">
        {(isEditing || isEditingMultiple) ? (
          <select
            value={editedDocuments[doc._id]?.category || doc.category}
            onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
            className="px-2 py-1 border rounded-md"
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        ) : (
          doc.category || 'Uncategorized'
        )}
      </td>
      
      <a href="#" onClick={() => handleDeleteClick(doc._id)}>Delete</a> {/* Trigger delete modal */}
    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

     

        
      )}

{showModal && (
        <div id="popup-modal" tabIndex="-1" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button type="button" className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={handleCancelDelete}>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this document?</h3>
                <button onClick={handleConfirmDelete} type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                  Yes, I'm sure
                </button>
                <button onClick={handleCancelDelete} type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentDashboard;
