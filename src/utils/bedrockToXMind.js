import JSZip from 'jszip';

/**
 * Convert tab-indented text from Bedrock to XMind structure
 * @param {string} text - Tab-indented text from Bedrock
 * @returns {Object} - Object with root title and children structure
 */
function parseTabIndentedToStructure(text) {
  const lines = text.trim().split('\n');
  const stack = [];
  let rootTitle = '';
  let rootChildren = [];

  for (const line of lines) {
    const level = line.match(/^\t*/)[0].length; // count tabs
    const title = line.trim();
    
    if (level === 0) {
      // Root level
      rootTitle = title;
      stack.length = 0;
      stack.push({ level: 0, children: rootChildren });
    } else {
      // Child level
      const child = { title, children: [] };
      
      // Find the correct parent level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      
      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        parent.children.push(child);
      }
      
      stack.push({ level: level, children: child.children });
    }
  }

  return { title: rootTitle, children: rootChildren };
}

/**
 * Generate a unique ID for XMind elements
 * @returns {string} - Unique ID
 */
function generateId() {
  return 'xmind-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Build XMind XML content recursively
 * @param {Object} node - Node with title and children
 * @param {boolean} isRoot - Whether this is the root node
 * @returns {string} - XML content for the topic
 */
function buildTopicXML(node, isRoot = false) {
  const id = generateId();
  const title = node.title || 'Untitled';
  
  let xml = `<topic id="${id}">`;
  xml += `<title>${escapeXml(title)}</title>`;
  
  if (node.children && node.children.length > 0) {
    xml += '<children>';
    xml += '<topics type="attached">';
    for (const child of node.children) {
      xml += buildTopicXML(child, false);
    }
    xml += '</topics>';
    xml += '</children>';
  }
  
  xml += '</topic>';
  return xml;
}

/**
 * Escape XML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate XMind file from Bedrock output and trigger download
 * @param {string} bedrockOutput - Tab-indented text from Bedrock
 * @param {string} filename - Name for the downloaded file (without extension)
 * @returns {Promise<string>} - The generated filename
 */
export async function generateAndDownloadXMind(bedrockOutput, filename = 'bedrock-output') {
  try {
    // Parse the Bedrock output to structure
    const structure = parseTabIndentedToStructure(bedrockOutput);
    
    // Generate timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFilename = `${filename}-${timestamp}.xmind`;
    
    // Create XMind file structure
    const xmindContent = await createXMindFile(structure);
    
    // Create and download the file
    await downloadFile(xmindContent, fullFilename);
    
    console.log(`✅ XMind file generated: ${fullFilename}`);
    return fullFilename;
  } catch (error) {
    console.error('❌ Error generating XMind file:', error);
    throw error;
  }
}

/**
 * Create XMind file content as a ZIP archive
 * @param {Object} structure - Parsed structure with title and children
 * @returns {Promise<Blob>} - XMind file as Blob
 */
async function createXMindFile(structure) {
  const zip = new JSZip();
  
  // Create the main content.xml file
  const contentXml = generateContentXml(structure);
  zip.file('content.xml', contentXml);
  
  // Create the META-INF/manifest.xml file
  const manifestXml = generateManifestXml();
  zip.file('META-INF/manifest.xml', manifestXml);
  
  // Create the styles.xml file
  const stylesXml = generateStylesXml();
  zip.file('styles.xml', stylesXml);
  
  // Generate the ZIP file
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generate the main content.xml file for XMind
 * @param {Object} structure - Parsed structure
 * @returns {string} - XML content
 */
function generateContentXml(structure) {
  const rootId = generateId();
  const rootTitle = structure.title || 'Untitled';
  
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
  xml += '<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" version="2.0">';
  xml += '<sheet id="' + rootId + '" theme="' + rootId + '">';
  xml += '<topic id="' + rootId + '">';
  xml += '<title>' + escapeXml(rootTitle) + '</title>';
  
  if (structure.children && structure.children.length > 0) {
    xml += '<children>';
    xml += '<topics type="attached">';
    for (const child of structure.children) {
      xml += buildTopicXML(child, false);
    }
    xml += '</topics>';
    xml += '</children>';
  }
  
  xml += '</topic>';
  xml += '</sheet>';
  xml += '</xmap-content>';
  
  return xml;
}

/**
 * Generate the manifest.xml file for XMind
 * @returns {string} - XML content
 */
function generateManifestXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.xml" media-type="text/xml"/>
  <file-entry full-path="styles.xml" media-type="text/xml"/>
  <file-entry full-path="META-INF/" media-type=""/>
</manifest>`;
}

/**
 * Generate the styles.xml file for XMind
 * @returns {string} - XML content
 */
function generateStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-styles xmlns="urn:xmind:xmap:xmlns:style:2.0" version="2.0">
  <styles>
    <style id="default" type="topic">
      <topic-properties background-color="#FFFFFF" border-line-color="#000000" border-line-width="1pt" line-color="#000000" shape-class="org.xmind.topicShape.roundedRect"/>
      <text-properties color="#000000" font-family="Arial" font-size="12pt"/>
    </style>
  </styles>
</xmap-styles>`;
}

/**
 * Download a file in the browser
 * @param {Blob} content - File content as Blob
 * @param {string} filename - Filename for download
 */
async function downloadFile(content, filename) {
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate if the input text has proper tab-indented structure
 * @param {string} text - Text to validate
 * @returns {Object} - Validation result with isValid and message
 */
export function validateBedrockInput(text) {
  if (!text || !text.trim()) {
    return { isValid: false, message: 'Please enter some text to convert' };
  }

  const lines = text.trim().split('\n');
  const hasRootLevel = lines.some(line => line.trim() && !line.startsWith('\t'));
  
  if (!hasRootLevel) {
    return { isValid: false, message: 'Text must have at least one root-level item (no tabs)' };
  }

  // Check for proper tab structure
  let hasValidStructure = false;
  for (const line of lines) {
    if (line.trim()) {
      const level = line.match(/^\t*/)[0].length;
      if (level > 0) {
        hasValidStructure = true;
        break;
      }
    }
  }

  if (!hasValidStructure) {
    return { isValid: false, message: 'Text should have tab-indented structure for best results' };
  }

  return { isValid: true, message: 'Valid input structure' };
}

/**
 * Example Bedrock output for testing
 */
export const exampleBedrockOutput = `BusinessPropertyInsurance
	Coverage
		Rule: FireCoverage
		Rule: FloodCoverage
	Exclusions
		Condition: WearAndTearExcluded
	Limits
		Limit: MaxPayoutPerLocation_50000000
	Conditions
		Condition: FireSuppressionRequired`;
