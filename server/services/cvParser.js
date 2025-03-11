// services/cvParser.js
const { v4: uuidv4 } = require('uuid');
let pdfParse, mammoth;

// Dynamically import required libraries
try {
  pdfParse = require('pdf-parse');
} catch (err) {
  console.warn('pdf-parse module not available. PDF parsing will be limited.');
  pdfParse = null;
}

try {
  mammoth = require('mammoth');
} catch (err) {
  console.warn('mammoth module not available. DOCX parsing will be limited.');
  mammoth = null;
}

/**
 * Extract text from PDF file
 * 
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<String>} Extracted text
 */
const extractTextFromPDF = async (fileBuffer) => {
  try {
    if (!pdfParse) {
      return `[PDF content not extracted - pdf-parse module not available]`;
    }
    
    const result = await pdfParse(fileBuffer);
    return result.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return `[Error extracting PDF content: ${error.message}]`;
  }
};

/**
 * Extract text from DOCX file
 * 
 * @param {Buffer} fileBuffer - DOCX file buffer
 * @returns {Promise<String>} Extracted text
 */
const extractTextFromDOCX = async (fileBuffer) => {
  try {
    if (!mammoth) {
      return `[DOCX content not extracted - mammoth module not available]`;
    }
    
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    return `[Error extracting DOCX content: ${error.message}]`;
  }
};

/**
 * Extract personal information from CV text
 * 
 * @param {String} text - CV text
 * @param {Object} userInfo - User information from form
 * @returns {Object} Personal information
 */
const extractPersonalInfo = (text, userInfo) => {
  // Basic information from form input
  const personalInfo = {
    id: uuidv4(),
    name: userInfo.name,
    email: userInfo.email,
    phone: userInfo.phone
  };
  
  try {
    // Extract additional info if possible
    const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) {
      personalInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
    }
    
    const githubRegex = /github\.com\/([a-zA-Z0-9-]+)/i;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
      personalInfo.github = `github.com/${githubMatch[1]}`;
    }
    
    return personalInfo;
  } catch (error) {
    console.error('Error extracting personal info:', error);
    return personalInfo;
  }
};

/**
 * Extract education information from CV text
 * 
 * @param {String} text - CV text
 * @returns {Array} Education information
 */
const extractEducation = (text) => {
  try {
    const lowerText = text.toLowerCase();
    
    // Common education keywords
    const educationKeywords = ['education', 'university', 'college', 'degree', 'bachelor', 'master', 'phd'];
    
    // Look for education section
    const educationSectionIndex = educationKeywords.findIndex(keyword => 
      lowerText.includes(keyword)
    );
    
    if (educationSectionIndex === -1) {
      // No education section found
      return [{
        id: uuidv4(),
        detected: false,
        note: "Education section not found in the CV."
      }];
    }
    
    // Extract education information
    // This is a very basic implementation - would need NLP for better results
    const education = [];
    
    // Split text into paragraphs
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    
    // Look for paragraphs that might contain education info
    for (const paragraph of paragraphs) {
      if (educationKeywords.some(keyword => paragraph.toLowerCase().includes(keyword))) {
        education.push({
          id: uuidv4(),
          detected: true,
          text: paragraph.trim()
        });
      }
    }
    
    // If no specific entries found, provide a generic one
    if (education.length === 0) {
      education.push({
        id: uuidv4(),
        detected: true,
        text: "Education section found but specific details could not be extracted."
      });
    }
    
    return education;
  } catch (error) {
    console.error('Error extracting education:', error);
    return [{
      id: uuidv4(),
      detected: false,
      error: true,
      note: `Failed to extract education details: ${error.message}`
    }];
  }
};

/**
 * Extract qualifications from CV text
 * 
 * @param {String} text - CV text
 * @returns {Array} Qualifications
 */
const extractQualifications = (text) => {
  try {
    const lowerText = text.toLowerCase();
    
    // Common qualification keywords
    const qualificationKeywords = ['skills', 'technologies', 'certifications', 'qualifications', 'expertise'];
    
    // Extract qualifications
    const qualifications = [];
    
    // Look for each keyword
    qualificationKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        const index = lowerText.indexOf(keyword);
        
        // Extract a chunk of text after the keyword
        const chunk = text.substring(index, index + 500);
        
        // Split into lines
        const lines = chunk.split('\n').filter(line => line.trim().length > 0);
        
        // Add first few lines as qualifications
        lines.slice(1, 10).forEach(line => {
          if (line.length > 3) {
            qualifications.push({
              id: uuidv4(),
              detected: true,
              type: keyword,
              text: line.trim()
            });
          }
        });
      }
    });
    
    // If no qualifications found
    if (qualifications.length === 0) {
      qualifications.push({
        id: uuidv4(),
        detected: false,
        note: "Qualifications section not found in the CV."
      });
    }
    
    return qualifications;
  } catch (error) {
    console.error('Error extracting qualifications:', error);
    return [{
      id: uuidv4(),
      detected: false,
      error: true,
      note: `Failed to extract qualification details: ${error.message}`
    }];
  }
};

/**
 * Extract projects from CV text
 * 
 * @param {String} text - CV text
 * @returns {Array} Projects
 */
const extractProjects = (text) => {
  try {
    const lowerText = text.toLowerCase();
    
    // Project keywords
    const projectKeywords = ['projects', 'portfolio', 'work samples', 'experience'];
    
    // Find project section
    const projectKeywordIndex = projectKeywords.findIndex(keyword => 
      lowerText.includes(keyword)
    );
    
    if (projectKeywordIndex === -1) {
      // No projects section found
      return [{
        id: uuidv4(),
        detected: false,
        note: "Projects section not found in the CV."
      }];
    }
    
    // Extract project information
    const projects = [];
    const keyword = projectKeywords[projectKeywordIndex];
    const index = lowerText.indexOf(keyword);
    
    // Get text after the keyword
    const section = text.substring(index, index + 1000);
    
    // Split into paragraphs
    const paragraphs = section.split('\n\n').filter(p => p.trim().length > 0);
    
    // Process paragraphs as projects
    paragraphs.slice(1, 5).forEach(paragraph => {
      if (paragraph.length > 20) {
        projects.push({
          id: uuidv4(),
          detected: true,
          text: paragraph.trim()
        });
      }
    });
    
    // If no specific projects found
    if (projects.length === 0) {
      projects.push({
        id: uuidv4(),
        detected: true,
        text: "Projects section found but specific details could not be extracted."
      });
    }
    
    return projects;
  } catch (error) {
    console.error('Error extracting projects:', error);
    return [{
      id: uuidv4(),
      detected: false,
      error: true,
      note: `Failed to extract project details: ${error.message}`
    }];
  }
};

/**
 * Parse CV file and extract structured information
 * 
 * @param {Buffer} fileBuffer - CV file buffer
 * @param {String} mimeType - File MIME type
 * @param {Object} userInfo - Basic user information from form
 * @returns {Promise<Object>} Parsed CV data
 */
const parseCV = async (fileBuffer, mimeType, userInfo) => {
  try {
    console.log(`Parsing CV file (${mimeType}, ${fileBuffer.length} bytes)`);
    
    // Extract text from file
    let textContent = '';
    if (mimeType === 'application/pdf') {
      textContent = await extractTextFromPDF(fileBuffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      textContent = await extractTextFromDOCX(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
    
    // If text extraction failed
    if (!textContent || textContent.length < 10) {
      console.warn('Failed to extract meaningful text from CV file');
      return {
        personalInfo: {
          id: uuidv4(),
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          note: "Failed to extract text from CV file."
        },
        education: [{
          id: uuidv4(),
          detected: false,
          note: "Failed to extract text from CV file."
        }],
        qualifications: [{
          id: uuidv4(),
          detected: false,
          note: "Failed to extract text from CV file."
        }],
        projects: [{
          id: uuidv4(),
          detected: false,
          note: "Failed to extract text from CV file."
        }]
      };
    }
    
    // Extract structured data
    const personalInfo = extractPersonalInfo(textContent, userInfo);
    const education = extractEducation(textContent);
    const qualifications = extractQualifications(textContent);
    const projects = extractProjects(textContent);
    
    return {
      personalInfo,
      education,
      qualifications,
      projects
    };
  } catch (error) {
    console.error('Error parsing CV:', error);
    
    // Return basic structure with error information
    return {
      personalInfo: {
        id: uuidv4(),
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        parsingError: true,
        errorMessage: error.message
      },
      education: [{
        id: uuidv4(),
        detected: false,
        parsingError: true,
        note: "Failed to parse education details due to an error."
      }],
      qualifications: [{
        id: uuidv4(),
        detected: false,
        parsingError: true,
        note: "Failed to parse qualification details due to an error."
      }],
      projects: [{
        id: uuidv4(),
        detected: false,
        parsingError: true,
        note: "Failed to parse project details due to an error."
      }]
    };
  }
};

module.exports = {
  parseCV
};