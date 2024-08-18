import React, { useState, useEffect } from 'react';
import LoadingBar from '../../loadingbar/LoadingBar';

function DocumentDashboard({ claimId, parkId, documents, isAddingDocuments, setIsAddingDocuments, onFileChange,  }) {
    const [fetchedDocuments, setFetchedDocuments] = useState([]);
    const [parkedDocuments, setParkedDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editedDocuments, setEditedDocuments] = useState({});
    const [newDocuments, setNewDocuments] = useState([]);
    const [newCategories, setNewCategories] = useState([]);

    const [fileNames, setFileNames] = useState({});
    const [showLoadingBar, setShowLoadingBar] = useState(false);

    useEffect(() => {
        if (claimId) {
            fetchDocuments();
        }
        if (parkId) {
            fetchParkedDocuments();
        }
    }, [claimId, parkId]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`);
            if (!res.ok) {
                throw new Error('Failed to fetch documents');
            }
            const data = await res.json();
            setFetchedDocuments(data);
        } catch (err) {
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchParkedDocuments = async () => {
        try {
            const res = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
            if (!res.ok) {
                throw new Error('Failed to fetch parked documents');
            }
            const data = await res.json();
            setParkedDocuments(data.files);
        } catch (err) {
            console.error('Error fetching parked documents:', err);
        }
    };

    const handleEditClick = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            const clonedDocuments = [...fetchedDocuments, ...documents, ...parkedDocuments].reduce((acc, doc) => {
                acc[doc._id] = { fileName: doc.fileName || doc.originalName, category: doc.category };
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

   

    // const onBulkUploadSubmit = async (e) => {
    //     e.preventDefault();
    //     const formData = new FormData();
    
    //     newDocuments.forEach((file, index) => {
    //         formData.append('documents', file, fileNames[file.name]);
    //         formData.append('category', newCategories[index]);
    //     });
    
    //     if (parkId) {
    //         formData.append('parkId', parkId); // Append parkId if it exists
    //     }
    
    //     try {
    //         setShowLoadingBar(true);
    
    //         const res = await fetch(`http://localhost:4000/dms/bulk-uploads`, {
    //             method: 'POST',
    //             body: formData,
    //         });
    
    //         if (res.ok) {
    //             const result = await res.json();
    
    //             setTimeout(() => {
    //                 setShowLoadingBar(false);
    //                 fetchDocuments(); // Reload the document data
    //                 fetchParkedDocuments(); // Reload parked documents
    //             }, 80);
    
    //         } else {
    //             console.error('Bulk upload failed');
    //             setShowLoadingBar(false);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         setShowLoadingBar(false);
    //     }
    // };

    const onBulkUploadSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
    
        newDocuments.forEach((file, index) => {
            formData.append('documents', file, fileNames[file.name]);
            formData.append('category', newCategories[index]);  // Ensure this is a string, not an array
        });
    
        if (parkId) {
            formData.append('parkId', parkId); // Append parkId if it exists
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
                    fetchDocuments(); // Reload the document data
                    fetchParkedDocuments(); // Reload parked documents
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
    

    const handleSave = async () => {
        try {
            setLoading(true);
    
            const claimUpdates = [];
            const parkedUpdates = [];
    
            Object.entries(editedDocuments).forEach(([id, updatedData]) => {
                const doc = allDocuments.find((doc) => doc._id === id);
                if (doc && doc.claimId) {
                    claimUpdates.push({ _id: id, ...updatedData });
                } else {
                    parkedUpdates.push({ _id: id, ...updatedData });
                }
            });
    
            if (claimUpdates.length > 0) {
                await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(claimUpdates),
                });
            }
    
            if (parkedUpdates.length > 0) {
                await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(parkedUpdates),
                });
            }
    
            setIsEditing(false);
            fetchDocuments();
            fetchParkedDocuments();
        } catch (err) {
            console.error('Error saving edits:', err);
        } finally {
            setLoading(false);
        }
    };
    

    
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setNewDocuments(files);

        const initialFileNames = {};
        files.forEach(file => {
            initialFileNames[file.name] = file.name;
        });
        setFileNames(initialFileNames);
    };

    const handleCategoryChange = (index, value) => {
        const updatedCategories = [...newCategories];
        updatedCategories[index] = value;
        setNewCategories(updatedCategories);
    };

    const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];
    const allDocuments = [...fetchedDocuments, ...documents, ...parkedDocuments];

    return (
        <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
            {showLoadingBar ? (
                <LoadingBar />
            ) : (
                <>
                    <div className="p-4">
                        <button
                            className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                            onClick={handleEditClick}
                        >
                            Edit
                        </button>
                        {isEditing && (
                            <button
                                className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
                                onClick={handleSave}
                            >
                                Save Changes
                            </button>
                        )}
                        {isAddingDocuments && (
                            <>
                                <label className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2 mt-2 cursor-pointer">
                                    Add Files
                                    <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                                <button
                                    className="flex items-center justify-center text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2"
                                    onClick={onBulkUploadSubmit}
                                >
                                    Upload
                                </button>
                            </>
                        )}
                    </div>
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Document Name</th>
                                <th className="px-4 py-3">Date Uploaded</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allDocuments.map((doc) => (
                                <tr key={doc._id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedDocuments[doc._id]?.fileName || doc.fileName || doc.originalName}
                                                onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
                                                className="px-2 py-1 border rounded-md"
                                            />
                                        ) : (
                                            doc.fileName || doc.originalName
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        {isEditing ? (
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
                                            doc.category
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">View</a>
                                        <button className="text-red-500 ml-2">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {isAddingDocuments && newDocuments.map((file, index) => (
                                <tr key={index} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {file.name}
                                    </td>
                                    <td className="px-4 py-3">Pending Upload</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={newCategories[index] || ''}
                                            onChange={(e) => handleCategoryChange(index, e.target.value)}
                                            className="px-2 py-1 border rounded-md"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat, i) => (
                                                <option key={i} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">Pending</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

export default DocumentDashboard;
