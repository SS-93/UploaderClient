import React, { useState } from 'react';

const FileInputTest = () => {
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('http://localhost:4000/dms/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setImageUrl(data.imageUrl);
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className="fixed bottom-4 right-4 bg-slate-600 p-4 rounded-lg shadow-lg">
            <form onSubmit={onSubmit} className="space-y-2">
                <input
                    type="file"
                    onChange={onFileChange}
                    required
                    className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <button
                    type="submit"
                    className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none dark:focus:ring-blue-800"
                >
                    Upload
                </button>
            </form>
            {imageUrl && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium"> Uploaded Image: </h3>
                    <img src={imageUrl} alt="Uploaded file" className="mt-2 max-w-xs" />
                </div>
            )}
        </div>
    );
};

export default FileInputTest;

// import React, { useState } from 'react';

// const UploadComponent = () => {
//     const [file, setFile] = useState(null);
//     const [imageUrl, setImageUrl] = useState('');

//     const onFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };

//     const onSubmit = async (e) => {
//         e.preventDefault();
//         const formData = new FormData();
//         formData.append('image', file);

//         try {
//             const res = await fetch('http://localhost:4000/dms/images', {
//                 method: 'POST',
//                 body: formData,
//             });

//             const data = await res.json();
//             setImageUrl(data.imageUrl);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     return (
//         <div>
//             <form onSubmit={onSubmit}>
//                 <input type="file" onChange={onFileChange} required />
//                 <button type="submit">Upload</button>
//             </form>
//             {imageUrl && (
//                 <div>
//                     <h3>Uploaded Image:</h3>
//                     <img src={imageUrl} alt="Uploaded file" />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default UploadComponent;



// async function postImage({ image, description }) {
//   const formData = new FormData();
//   formData.append("image", image);
//   formData.append("description", description);

//   try {
//     const response = await fetch('http://localhost:4000/uploads', { // Ensure the URL matches your backend
//       method: 'POST',
//       body: formData
//     });

//     if (!response.ok) {
//       throw new Error(`ALMOST: ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     throw error;
//   }
// }

// function FileInputTest() {
//   const [file, setFile] = useState(null);
//   const [description, setDescription] = useState('');
//   const [images, setImages] = useState([]);

//   const submit = async event => {
//     event.preventDefault();
//     try {
//       const result = await postImage({ image: file, description });
//       setImages([result.image, ...images]);
//     } catch (error) {
//       console.error('Error submitting form:', error);
//     }
//   }

//   const fileSelected = event => {
//     const file = event.target.files[0];
//     setFile(file);
//   }

//   return (
//     <div>
//       <h1>File Input Test</h1>
//       <form onSubmit={submit}>
//         <input onChange={fileSelected} type="file" accept="image/*" />
//         <input value={description} onChange={e => setDescription(e.target.value)} type="text" />
//         <button type="submit">Submit</button>
//       </form>

//       {images.map(image => (
//         <div key={image}>
//           <img src={image} alt="Uploaded" />
//         </div>
//       ))}
//     </div>
//   );
// }
            

