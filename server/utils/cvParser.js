// utils/cvParser.js
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

// Function to extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

// Function to extract text from DOCX
async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
}

// Function to extract sections from CV text
function extractSections(text) {
  // Initialize sections to extract
  const sections = {
    education: [],
    qualifications: [],
    projects: []
  };

  // Common section headers in CVs
  const educationHeaders = ['education', 'academic background', 'academic history', 'educational qualification'];
  const qualificationHeaders = ['qualifications', 'skills', 'certifications', 'technical skills', 'professional skills'];
  const projectHeaders = ['projects', 'project experience', 'portfolio', 'work experience', 'professional experience'];

  // Convert text to lowercase for easier matching
  const lowercaseText = text.toLowerCase();
  
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Track current section
  let currentSection = null;
  let currentItem = '';
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowercaseLine = line.toLowerCase();
    
    // Check if line is a section header
    if (educationHeaders.some(header => lowercaseLine.includes(header))) {
      currentSection = 'education';
      currentItem = '';
      continue;
    } else if (qualificationHeaders.some(header => lowercaseLine.includes(header))) {
      currentSection = 'qualifications';
      currentItem = '';
      continue;
    } else if (projectHeaders.some(header => lowercaseLine.includes(header))) {
      currentSection = 'projects';
      currentItem = '';
      continue;
    } else if (lowercaseLine.includes('personal') || lowercaseLine.includes('contact') || lowercaseLine.includes('profile')) {
      // Skip personal information section as we already have it from the form
      currentSection = null;
      continue;
    }
    
    // Add line to current section if we're in a section
    if (currentSection) {
      // Check if this might be a new item in the section (bullet point, year, etc.)
      const isPossibleNewItem = line.startsWith('•') || 
                               line.startsWith('-') || 
                               line.startsWith('*') ||
                               /^\d{4}/.test(line) || // Starts with year
                               /^[A-Z]/.test(line); // Starts with capital letter
      
      if (isPossibleNewItem && currentItem) {
        // Save previous item if not empty
        sections[currentSection].push(currentItem.trim());
        currentItem = line;
      } else {
        // Append to current item
        currentItem += currentItem ? ' ' + line : line;
      }
      
      // If this is the last line, add the current item
      if (i === lines.length - 1 && currentItem) {
        sections[currentSection].push(currentItem.trim());
      }
    }
  }
  
  // Clean and limit the results
  return {
    education: sections.education.slice(0, 5).filter(item => item.length > 5),
    qualifications: sections.qualifications.slice(0, 10).filter(item => item.length > 3),
    projects: sections.projects.slice(0, 5).filter(item => item.length > 5)
  };
}

// Main function to extract CV data
async function extractCvData(buffer, mimetype) {
  try {
    let text = '';
    
    // Extract text based on file type
    if (mimetype === 'application/pdf') {
      text = await extractTextFromPDF(buffer);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(buffer);
    } else {
      throw new Error('Unsupported file type');
    }
    
    // Extract sections from the text
    const sections = extractSections(text);
    
    return sections;
  } catch (error) {
    console.error('Error extracting CV data:', error);
    // Return empty sections if extraction fails
    return {
      education: [],
      qualifications: [],
      projects: []
    };
  }
}

module.exports = {
  extractCvData
};