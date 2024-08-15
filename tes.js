const Tesseract = require('tesseract.js');
const path = require('path');

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
        });
    } else {
        console.log('No URLs found in the text.');
    }
}

// Construct the path to the image
const imagePath = path.join(__dirname, 'public/images', 'image-10.png');

// Use the constructed path in Tesseract
Tesseract.recognize(imagePath)
  .then(function(result) {
    const recognizedText = result.data.text;
    console.log('Recognized Text:', recognizedText);

    // Call the URL extraction function with the recognized text
    extractAndLogURLs(recognizedText);
  })
  .catch(function(error) {
    console.error('Error:', error);
  });
