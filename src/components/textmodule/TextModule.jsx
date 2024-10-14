import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function TextModule({ documentUrl, OcrId, textContent = '', onSaveOcrText, onTextExtracted = () => {} }) {
  const [isLoading, setIsLoading] = useState(false);
  const [ocrText, setOcrText] = useState(textContent);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    setOcrText(textContent);
  }, [textContent]);

  useEffect(() => {
    if (documentUrl) {
      if (documentUrl.endsWith('.pdf')) {
        handlePdf(documentUrl);
      } else {
        handleOcr(documentUrl);
      }
    }
  }, [documentUrl]);

  const handleTextChange = (event) => {
    setOcrText(event.target.value);
  };

  const handleOcr = (url) => {
    setIsLoading(true);
    Tesseract.recognize(url, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      },
    })
      .then((result) => {
        const extractedText = result.data.text;
        setOcrText(extractedText);
        setIsLoading(false);
        onTextExtracted(extractedText);
      })
      .catch((err) => {
        console.error('OCR error:', err);
        setIsLoading(false);
      });
  };

  const handlePdf = async (url) => {
    try {
      setIsLoading(true);
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let combinedText = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const imageUrl = canvas.toDataURL();

        await Tesseract.recognize(imageUrl, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round((pageNum / numPages) * 100));
            }
          },
        })
          .then((result) => {
            combinedText += result.data.text + '\n';
          })
          .catch((err) => {
            console.error('PDF OCR error on page', pageNum, ':', err);
          });
      }

      setOcrText(combinedText);
      setIsLoading(false);
      onTextExtracted(combinedText);
    } catch (error) {
      console.error('Error handling PDF:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('TextModule - Submitting with OcrId:', OcrId);
    if (!OcrId) {
      setMessage('OcrId is required to update text content.');
      return;
    }
    try {
      await onSaveOcrText(OcrId, ocrText);
      setSaveSuccess(true);
      setMessage('OCR text saved successfully');
      setTimeout(() => {
        setSaveSuccess(false);
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Failed to save OCR text');
      console.error('Error saving OCR text:', error);
    }
  };

  return (
    <div className="ml-60 pl-8 mr-2 pr-2">
      <div className="mx-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              OCR Text Output
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setOcrText('')}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Clear text</span>
            </button>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            <form onSubmit={handleSubmit}>
              <textarea
                id="ocr-output"
                value={ocrText}
                onChange={handleTextChange}
                rows="8"
                cols="50"
                className="w-full h-32 text-base leading-relaxed text-gray-500 dark:text-gray-400 border rounded-md p-2"
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </form>
            {isLoading && (
              <div>
                <progress className="form-control" value={progress} max="100">
                  {progress}%
                </progress>
                <p className="text-center py-0 my-0">Converting: {progress}%</p>
              </div>
            )}
            {message && (
              <div className={`text-center py-2 my-2 ${saveSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextModule;
