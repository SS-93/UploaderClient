import { useState } from 'react';

function useDocumentEditor() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDocuments, setEditedDocuments] = useState({});

  const handleEditClick = (documents) => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      const clonedDocuments = documents.reduce((acc, doc) => {
        acc[doc._id] = { fileName: doc.fileName || doc.originalName, category: doc.category };
        return acc;
      }, {});
      setEditedDocuments(clonedDocuments);
    } else {
      // If we are toggling off edit mode, clear the edited documents
      setEditedDocuments({});
    }
  };

  const handleInputChange = (id, field, value) => {
    setEditedDocuments(prevState => ({
      ...prevState,
      [id]: { ...prevState[id], [field]: value },
    }));
  };

  return {
    isEditing,
    editedDocuments,
    handleEditClick,
    handleInputChange,
    setIsEditing,
  };
}

export default useDocumentEditor;
