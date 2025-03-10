const { textract } = require('../config/awsconfig');

// Function to extract text content from a document using AWS Textract
async function extractTextFromDocument(buffer, mimeType) {
  // For PDF files
  if (mimeType === 'application/pdf') {
    const params = {
      Document: {
        Bytes: buffer
      }
    };
    
    const result = await textract.detectDocumentText(params).promise();
    return result.Blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n');
  } 
  // For DOCX files (you might need additional processing)
  else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // This is simplified - in a real implementation, you'd need to extract text from DOCX
    // For now, we'll just use Textract for DOCX as well
    const params = {
      Document: {
        Bytes: buffer
      }
    };
    
    const result = await textract.detectDocumentText(params).promise();
    return result.Blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n');
  }
  
  throw new Error('Unsupported file type');
}

// Function to parse CV content into structured data
function parseTextToSections(text) {
  // This is a simplified implementation - in a real-world scenario, you'd use
  // more sophisticated NLP or pattern matching to identify sections

  const educationKeywords = ['education', 'academic', 'university', 'college', 'school', 'degree'];
  const qualificationKeywords = ['qualification', 'certification', 'skills', 'proficiency', 'expertise'];
  const projectKeywords = ['project', 'portfolio', 'work sample', 'implementation'];
  
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  const education = [];
  const qualifications = [];
  const projects = [];
  
  let currentSection = null;
  let sectionContent = [];
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Detect section headers
    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      if (currentSection && sectionContent.length > 0) {
        addToSection(currentSection, sectionContent);
      }
      currentSection = 'education';
      sectionContent = [];
    } 
    else if (qualificationKeywords.some(keyword => lowerLine.includes(keyword))) {
      if (currentSection && sectionContent.length > 0) {
        addToSection(currentSection, sectionContent);
      }
      currentSection = 'qualifications';
      sectionContent = [];
    } 
    else if (projectKeywords.some(keyword => lowerLine.includes(keyword))) {
      if (currentSection && sectionContent.length > 0) {
        addToSection(currentSection, sectionContent);
      }
      currentSection = 'projects';
      sectionContent = [];
    } 
    else if (currentSection) {
      sectionContent.push(line);
    }
  }
  
  // Add the last section
  if (currentSection && sectionContent.length > 0) {
    addToSection(currentSection, sectionContent);
  }
  
  function addToSection(section, content) {
    if (section === 'education') {
      education.push(content.join(' '));
    } else if (section === 'qualifications') {
      qualifications.push(content.join(' '));
    } else if (section === 'projects') {
      projects.push(content.join(' '));
    }
  }
  
  return {
    education,
    qualifications,
    projects
  };
}

// Main function to extract CV data
exports.extractCvData = async function(buffer, mimeType) {
  // Extract text from document
  const text = await extractTextFromDocument(buffer, mimeType);
  
  // Parse text into sections
  const sections = parseTextToSections(text);
  
  return sections;
};