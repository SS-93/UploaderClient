import React, { useState } from 'react';

const UploadComponent = () => {
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
            const res = await fetch('http://localhost:4000/dms/images', {
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
        <div>
            <form onSubmit={onSubmit}>
                <input type="file" onChange={onFileChange} required />
                <button type="submit">Upload</button>
            </form>
            {imageUrl && (
                <div>
                    <h3>Uploaded Image:</h3>
                    <img src={imageUrl} alt="Uploaded file" />
                </div>
            )}
        </div>
    );
};

export default UploadComponent;



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
            

