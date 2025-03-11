const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');

/**
 * Extract text content from a PDF file
 * 
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<String>} Extracted text content
 */
const extractTextFromPDF = async (fileBuffer) => {
  try {
    // Use pdf-parse to extract text
    const result = await pdfParse(fileBuffer);
    return result.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract text content from a DOCX file
 * 
 * @param {Buffer} fileBuffer - DOCX file buffer
 * @returns {Promise<String>} Extracted text content
 */
const extractTextFromDOCX = async (fileBuffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};

/**
 * Extract personal information from CV text
 * 
 * @param {String} text - CV text content
 * @param {Object} userInfo - Basic user information from form
 * @returns {Object} Personal information
 */
const extractPersonalInfo = (text, userInfo) => {
  // Use the form-provided information as a base
  const personalInfo = {
    id: uuidv4(),
    name: userInfo.name,
    email: userInfo.email,
    phone: userInfo.phone
  };

  // Try to extract additional personal information from CV
  // This is a basic implementation - more sophisticated NLP could be used
  
  // Extract LinkedIn profile
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch) {
    personalInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
  }
  
  // Extract GitHub profile
  const githubRegex = /github\.com\/([a-zA-Z0-9-]+)/i;
  const githubMatch = text.match(githubRegex);
  if (githubMatch) {
    personalInfo.github = `github.com/${githubMatch[1]}`;
  }

  return personalInfo;
};

/**
 * Extract education information from CV text
 * 
 * @param {String} lowerText - Lowercase CV text
 * @param {String} originalText - Original CV text
 * @returns {Array} Education information
 */
const extractEducation = (lowerText, originalText) => {
  const education = [];
  
  // Common education keywords
  const educationKeywords = ['education', 'university', 'college', 'degree', 'bachelor', 'master', 'phd', 'diploma'];
  
  // Check if education section exists
  const educationSectionIndex = educationKeywords.findIndex(keyword => 
    lowerText.includes(keyword)
  );
  
  if (educationSectionIndex !== -1) {
    // Find the start of the education section
    const educationKeyword = educationKeywords[educationSectionIndex];
    const sectionStartIndex = lowerText.indexOf(educationKeyword);
    
    // Get a chunk of text after the education keyword
    const educationChunk = originalText.substring(sectionStartIndex, sectionStartIndex + 1000);
    
    // Simple extraction of education entries (could be improved with NLP)
    const lines = educationChunk.split('\n').filter(line => line.trim().length > 0);
    
    let currentEntry = {};
    for (const line of lines) {
      // Look for degree indicators
      if (line.match(/bachelor|master|phd|diploma|degree|bsc|msc|bs|ba|ma|mba/i)) {
        if (Object.keys(currentEntry).length > 0) {
          education.push(currentEntry);
          currentEntry = {};
        }
        
        currentEntry.degree = line.trim();
      } 
      // Look for university/institution
      else if (line.match(/university|college|institute|school/i) && !currentEntry.institution) {
        currentEntry.institution = line.trim();
      }
      // Look for dates
      else if (line.match(/20[0-9]{2}|19[0-9]{2}/)) {
        currentEntry.date = line.trim();
        
        // If we have a complete entry, add it
        if (Object.keys(currentEntry).length >= 2) {
          education.push(currentEntry);
          currentEntry = {};
        }
      }
    }
    
    // Add the last entry if it exists
    if (Object.keys(currentEntry).length > 0) {
      education.push(currentEntry);
    }
  }
  
  // If no structured education found, return a placeholder
  if (education.length === 0) {
    education.push({
      id: uuidv4(),
      detected: false,
      note: "Education details couldn't be automatically extracted. Please review the CV manually."
    });
  } else {
    // Add IDs to each entry
    education.forEach(entry => {
      entry.id = uuidv4();
      entry.detected = true;
    });
  }
  
  return education;
};

/**
 * Extract qualifications from CV text
 * 
 * @param {String} lowerText - Lowercase CV text
 * @param {String} originalText - Original CV text
 * @returns {Array} Qualifications information
 */
const extractQualifications = (lowerText, originalText) => {
  const qualifications = [];
  
  // Common qualification keywords
  const qualificationKeywords = ['skills', 'technologies', 'certifications', 'qualifications', 'expertise'];
  
  // Find qualification sections
  qualificationKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      const keywordIndex = lowerText.indexOf(keyword);
      
      // Extract a chunk of text after the keyword
      const chunk = originalText.substring(keywordIndex, keywordIndex + 500);
      
      // Split into lines and filter empty ones
      const lines = chunk.split('\n').filter(line => line.trim().length > 0);
      
      // Extract skills or certifications (basic implementation)
      lines.slice(1, 10).forEach(line => {
        // Skip lines that are likely headers or too short
        if (line.length > 3 && !qualificationKeywords.some(kw => line.toLowerCase().includes(kw))) {
          qualifications.push({
            id: uuidv4(),
            type: keyword,
            description: line.trim()
          });
        }
      });
    }
  });
  
  // If no qualifications found, add a placeholder
  if (qualifications.length === 0) {
    qualifications.push({
      id: uuidv4(),
      detected: false,
      note: "Qualifications couldn't be automatically extracted. Please review the CV manually."
    });
  } else {
    // Mark as detected
    qualifications.forEach(qual => {
      qual.detected = true;
    });
  }
  
  return qualifications;
};

/**
 * Extract projects from CV text
 * 
 * @param {String} lowerText - Lowercase CV text
 * @param {String} originalText - Original CV text
 * @returns {Array} Projects information
 */
const extractProjects = (lowerText, originalText) => {
  const projects = [];
  
  // Common project section keywords
  const projectKeywords = ['projects', 'portfolio', 'work samples'];
  
  // Find project sections
  const projectKeywordIndex = projectKeywords.findIndex(keyword => 
    lowerText.includes(keyword)
  );
  
  if (projectKeywordIndex !== -1) {
    const keyword = projectKeywords[projectKeywordIndex];
    const sectionIndex = lowerText.indexOf(keyword);
    
    // Get a chunk of text after the keyword
    const projectSection = originalText.substring(sectionIndex, sectionIndex + 1500);
    
    // Split into paragraphs
    const paragraphs = projectSection.split('\n\n').filter(p => p.trim().length > 0);
    
    // Process each paragraph as a potential project
    paragraphs.slice(1, 6).forEach(paragraph => {
      // Skip if too short
      if (paragraph.length > 20) {
        projects.push({
          id: uuidv4(),
          description: paragraph.trim()
        });
      }
    });
  }
  
  // If no projects found, add a placeholder
  if (projects.length === 0) {
    projects.push({
      id: uuidv4(),
      detected: false,
      note: "Projects couldn't be automatically extracted. Please review the CV manually."
    });
  } else {
    // Mark as detected
    projects.forEach(project => {
      project.detected = true;
    });
  }
  
  return projects;
};

/**
 * Parse CV content and extract structured information
 * 
 * @param {Buffer} fileBuffer - CV file buffer
 * @param {String} mimeType - File MIME type
 * @param {Object} userInfo - Basic user information from form
 * @returns {Promise<Object>} Structured CV data
 */
const parseCV = async (fileBuffer, mimeType, userInfo) => {
  try {
    // Extract text based on file type
    let textContent = '';
    if (mimeType === 'application/pdf') {
      textContent = await extractTextFromPDF(fileBuffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      textContent = await extractTextFromDOCX(fileBuffer);
    } else {
      throw new Error('Unsupported file type');
    }
    
    // Convert text to lowercase for case-insensitive matching
    const lowerTextContent = textContent.toLowerCase();
    
    // Extract personal information
    const personalInfo = extractPersonalInfo(textContent, userInfo);
    
    // Extract education details
    const education = extractEducation(lowerTextContent, textContent);
    
    // Extract qualifications
    const qualifications = extractQualifications(lowerTextContent, textContent);
    
    // Extract projects
    const projects = extractProjects(lowerTextContent, textContent);
    
    return {
      personalInfo,
      education,
      qualifications,
      projects
    };
  } catch (error) {
    console.error('Error parsing CV:', error);
    
    // Return basic structure even if parsing fails
    return {
      personalInfo: {
        id: uuidv4(),
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        parsingError: true
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