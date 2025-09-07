import JSZip from 'jszip';

/**
 * Parse tab-indented text into a structured object.
 * Extracts labels from `[Label1, Label2]` syntax.
 * @param {string} text - Tab-indented text
 * @returns {Object} - Root node with children
 */
function parseTabIndentedToStructure(text) {
  const lines = text.trim().split('\n');
  const stack = [];
  let root = null;

  for (const line of lines) {
    const level = line.match(/^\t*/)[0].length;
    const raw = line.trim();

    // Extract labels if present
    const labelMatch = raw.match(/(.*)\[(.*)\]/);
    let title = raw;
    let labels = [];
    if (labelMatch) {
      title = labelMatch[1].trim();
      labels = labelMatch[2].split(',').map(l => l.trim());
    }

    const node = { title, labels, children: [] };

    if (level === 0) {
      root = node;
      stack.length = 0;
      stack.push({ level: 0, node: root });
    } else {
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length > 0) {
        const parent = stack[stack.length - 1].node;
        parent.children.push(node);
      }

      stack.push({ level, node });
    }
  }

  return root;
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
export const exampleBedrockOutput = `BusinessPropertyInsurance [BPI]
	Coverage [Cov]
		Rule: FireCoverage [Fire]
		Rule: FloodCoverage [Flood]
	Exclusions [Exc]
		Condition: WearAndTearExcluded [W&T]
	Limits [Lim]
		Limit: MaxPayoutPerLocation_50000000 [MaxPay]
	Conditions [Cond]
		Condition: FireSuppressionRequired [FSR]`;

/**
 * Generate unique ID for XMind topics
 */
function generateId() {
  return 'xmind-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Escape XML special characters
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
 * Build topic XML recursively
 */
function buildTopicXML(node) {
  const id = generateId();
  const title = node.title || 'Untitled';

  let xml = `<topic id="${id}">`;
  xml += `<title>${escapeXml(title)}</title>`;

  // Add labels if any
  if (node.labels && node.labels.length > 0) {
    xml += '<labels>';
    for (const label of node.labels) {
      xml += `<label>${escapeXml(label)}</label>`;
    }
    xml += '</labels>';
  }

  // Add children recursively
  if (node.children && node.children.length > 0) {
    xml += '<children>';
    xml += '<topics type="attached">';
    for (const child of node.children) {
      xml += buildTopicXML(child);
    }
    xml += '</topics>';
    xml += '</children>';
  }

  xml += '</topic>';
  return xml;
}

/**
 * Generate content.xml for XMind
 */
function generateContentXml(root) {
  const rootId = generateId();
  const rootTitle = root.title || 'Untitled';

  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`;
  xml += `<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" version="2.0">`;
  xml += `<sheet id="${rootId}" theme="${rootId}">`;
  xml += `<topic id="${rootId}"><title>${escapeXml(rootTitle)}</title>`;

  if (root.labels && root.labels.length > 0) {
    xml += '<labels>';
    for (const label of root.labels) {
      xml += `<label>${escapeXml(label)}</label>`;
    }
    xml += '</labels>';
  }

  if (root.children && root.children.length > 0) {
    xml += '<children>';
    xml += '<topics type="attached">';
    for (const child of root.children) {
      xml += buildTopicXML(child);
    }
    xml += '</topics>';
    xml += '</children>';
  }

  xml += '</topic></sheet></xmap-content>';
  return xml;
}

/**
 * Generate styles.xml
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
 * Generate manifest.xml
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
 * Create XMind ZIP file
 */
async function createXMindFile(root) {
  const zip = new JSZip();

  zip.file('content.xml', generateContentXml(root));
  zip.file('styles.xml', generateStylesXml());
  zip.file('META-INF/manifest.xml', generateManifestXml());

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download file in browser
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
 * Main function: generate and download XMind from tab-indented text
 */
export async function generateAndDownloadXMind(bedrockOutput, filename = 'bedrock-output') {
  try {
    const root = parseTabIndentedToStructure(bedrockOutput);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFilename = `${filename}-${timestamp}.xmind`;

    const xmindFile = await createXMindFile(root);
    await downloadFile(xmindFile, fullFilename);

    console.log(`✅ XMind file generated: ${fullFilename}`);
    return fullFilename;
  } catch (error) {
    console.error('❌ Error generating XMind file:', error);
    throw error;
  }
}
