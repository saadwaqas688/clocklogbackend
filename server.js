// const express = require('express');
// const multer = require('multer');
// const { createWorker } = require('tesseract.js');
// const path = require('path');

// const app = express();
// const port = 3000;

// // Set up Multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     },
// });

// const upload = multer({ storage: storage });

// // Serve static files from the "public" directory
// app.use(express.static('public'));

// // Handle image upload and text extraction
// app.post('/upload', upload.single('image'), async (req, res) => {
//     console.log("waqas",req.file)
//     if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//     }

//     // Create a new worker instance
//     const worker = createWorker();

//     try {
//         // Load and initialize the worker 
//         await worker.load();
//         await worker.loadLanguage('eng');
//         await worker.initialize('eng');

//         // Recognize the text from the image
//         const { data: { text } } = await worker.recognize(req.file.path);

//         // Send the extracted text as the response
//         res.send({ text });
//     } catch (error) {
//         console.error('Error processing image:', error);
//         res.status(500).send('Error processing image.');
//     } finally {
//         // Terminate the worker
//         await worker.terminate();
//     }
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`); 
// });
// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const port = 3000;

// app.use(bodyParser.json({ limit: '50mb' })); // Increase limit if needed

// app.post('/upload', (req, res) => {
//     console.log('called')

//     const base64Image = req.body.image;
//     const imageBuffer = Buffer.from(base64Image, 'base64');
    
//     const filePath = path.join(__dirname, 'screenshot.png');
//     fs.writeFile(filePath, imageBuffer, (err) => {
//         if (err) {
//             console.error('Error saving image:', err);
//             res.status(500).send('Error saving image');
//         } else {
//             console.log('Image saved successfully');
//             res.status(200).send('Image uploaded successfully');
//         }
//     });
// });

// app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
// });
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' })); // Increase limit if needed

app.post('/upload', (req, res) => {
    console.log('Upload route called');

    const base64Image = req.body.image;
    const imageBuffer = Buffer.from(base64Image, 'base64');

    const filePath = path.join(__dirname, 'screenshot.png');
    fs.writeFile(filePath, imageBuffer, (err) => {
        if (err) {
            console.error('Error saving image:', err);
            res.status(500).send('Error saving image');
        } else {

            // Process the image using Tesseract to extract text and find URLs
            Tesseract.recognize(filePath)
                .then(function(result) {
                    const recognizedText = result.data.text;

                    // Extract and log URLs from the recognized text
                    extractAndLogURLs(recognizedText);

                    res.status(200).send('Image uploaded and processed successfully');
                })
                .catch(function(error) {
                    console.error('Error during OCR processing:', error);
                    res.status(500).send('Error processing image');
                });
        }
    });
});

// Function to extract and log URLs from the given text
function extractAndLogURLs(text) {
    // Regular expression to match domain names, including those without dots
    const domainRegex = /(\b(?!\d)[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,})(?:\/[^\s]*)?/g;
    const partialDomainRegex = /(\b(?!\d)[a-zA-Z0-9-]+)(com|org|net|edu|gov)\b/g;

    const domains = text.match(domainRegex) || [];
    const partialDomains = text.match(partialDomainRegex) || [];

    // Combine and remove duplicates
    const allDomains = [...new Set([...domains, ...partialDomains])];

    if (allDomains.length > 0) {
        allDomains.forEach((domain) => {
            let url = domain;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            console.log('Found URL:', url);
            // Log URL to a file
            logURLToFile(url);
        });
    } else {
        console.log('No URLs found in the text.');
    }
}

// Function to log URLs to a file
function logURLToFile(url) {
    const logFilePath = path.join(__dirname, 'urls.log');
    fs.appendFile(logFilePath, url + '\n', (err) => {
        if (err) {
            console.error('Error logging URL:', err);
        }
    });
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
