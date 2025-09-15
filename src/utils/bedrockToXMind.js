import JSZip from 'jszip';

/**
 * Example Bedrock output for testing
 */
export const exampleBedrockOutput = `NextGenRetailCyberLiabilityPolicy [NGRC]
	Coverage [Cov] {gw_coverage}
		FirstPartyLosses [FPL] {gw_coverage}
			DataLossCoverage [DLC] {gw_coverage}
			SystemInterruptionCoverage [SIC] {gw_coverage}
			RansomwareAttackCoverage [RAC] {gw_coverage}
			BusinessInterruptionCoverage [BIC] {gw_coverage}
		ThirdPartyLiabilities [TPL] {gw_coverage}
			PrivacyBreachCoverage [PBC] {gw_coverage}
			RegulatoryFinesCoverage [RFC] {gw_money}
			LegalDefenseCostsCoverage [LDCC] {gw_money}`;

/**
 * Guidewire marker mapping
 */
const GUIDEWIRE_MARKERS = {
  coverage: 'gw_coverage',
  dropdown: 'gw_dropdown',
  money: 'gw_money',
  text: 'gw_text',
  condition: 'gw_condition',
  exclusion: 'gw_exclusion',
  risk_object: 'gw_risk_object',
  question: 'gw_question',
  date_time: 'gw_date_time',
  exposure: 'gw_exposure',
  integer: 'gw_integer',
  decimal: 'gw_decimal',
  product: 'gw_product',
  line: 'gw_line',
  clause_category: 'gw_clause_category'
};

/**
 * Parse tab-indented text into structured object
 */
function parseTabIndentedToStructure(text) {
  const lines = text.trim().split('\n');
  const stack = [];
  let root = null;

  for (const line of lines) {
    const level = line.match(/^\t*/)[0].length;
    const raw = line.trim();

    // Extract title, label [..], marker {..}
    const regex = /^(.*?)\s*(?:\[(.*?)\])?\s*(?:\{(.*?)\})?$/;
    const match = raw.match(regex);

    const title = match[1].trim();
    const labels = match[2] ? [match[2].trim()] : [];
    const markers = match[3] ? [match[3].trim()] : [];

    const node = { title, labels, markers, children: [] };

    if (level === 0) {
      root = node;
      stack.length = 0;
      stack.push({ level: 0, node: root });
    } else {
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].node.children.push(node);
      }

      stack.push({ level, node });
    }
  }

  return root;
}

/**
 * Generate unique ID
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

/** -------------------------------------------------------------------
 * NEW: Track which marker-ids are actually used so we can declare them
 * in markers.xml (kept internal to this module).
 * ------------------------------------------------------------------- */
const USED_MARKER_IDS = new Set();

/**
 * Build topic XML recursively
 */
function buildTopicXML(node) {
  const id = generateId();
  const title = node.title || 'Untitled';

  let xml = `<topic id="${id}">`;
  xml += `<title>${escapeXml(title)}</title>`;

  // Add labels
  if (node.labels.length > 0) {
    xml += '<labels>';
    node.labels.forEach(label => {
      xml += `<label>${escapeXml(label)}</label>`;
    });
    xml += '</labels>';
  }

  // Add markers
  if (node.markers.length > 0) {
    xml += '<marker-refs>';
    node.markers.forEach(marker => {
      const key = marker.toLowerCase().replace(/-/g, '_');
      const resolved = GUIDEWIRE_MARKERS[key] ? GUIDEWIRE_MARKERS[key] : marker;
      xml += `<marker-ref marker-id="${escapeXml(resolved)}"/>`;
      // NEW: record used marker id so we can declare it in markers.xml
      USED_MARKER_IDS.add(resolved);
    });
    xml += '</marker-refs>';
  }

  // Children
  if (node.children.length > 0) {
    xml += '<children><topics type="attached">';
    node.children.forEach(child => {
      xml += buildTopicXML(child);
    });
    xml += '</topics></children>';
  }

  xml += '</topic>';
  return xml;
}

/**
 * Generate content.xml
 */
function generateContentXml(root) {
  const rootId = generateId();
  const rootTitle = root.title || 'Untitled';

  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`;
  xml += `<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" version="2.0">`;
  xml += `<sheet id="${rootId}" theme="${rootId}">`;
  xml += buildTopicXML(root);
  xml += `</sheet></xmap-content>`;
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

/** -------------------------------------------------------------------
 * NEW: Generate markers.xml so marker-ids resolve to icons in XMind.
 * If no markers were tracked (edge case), declare all known markers.
 * ------------------------------------------------------------------- */
function generateMarkersXml() {
  const ids = Array.from(
    USED_MARKER_IDS.size > 0 ? USED_MARKER_IDS : new Set(Object.values(GUIDEWIRE_MARKERS))
  );

  const items = ids
    .map(
      id =>
        `<marker id="${escapeXml(id)}" name="${escapeXml(
          id.replace(/^gw_/, '').replace(/_/g, ' ')
        )}" type="topic"/>`
    )
    .join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<markers xmlns="urn:xmind:xmap:xmlns:marker:2.0" version="2.0">
  ${items}
</markers>`;
}

/** -------------------------------------------------------------------
 * NEW: Patch manifest to include markers.xml entry (idempotent).
 * ------------------------------------------------------------------- */
function patchManifestWithMarkers(manifestXml) {
  if (manifestXml.includes('markers.xml')) return manifestXml;
  return manifestXml.replace(
    /<\/manifest>\s*$/,
    `  <file-entry full-path="markers.xml" media-type="text/xml"/>\n</manifest>`
  );
}

/**
 * Create XMind file
 */
async function createXMindFile(root) {
  const zip = new JSZip();
  zip.file('content.xml', generateContentXml(root));
  zip.file('styles.xml', generateStylesXml());

  // NEW: include markers.xml and reference it in the manifest
  const originalManifest = generateManifestXml();
  const patchedManifest = patchManifestWithMarkers(originalManifest);
  zip.file('META-INF/manifest.xml', patchedManifest);
  zip.file('markers.xml', generateMarkersXml());

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.xmind' });
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
 * Convert Bedrock text to XMind file and download
 */
export async function generateAndDownloadXMind(text, filename = 'output.xmind') {
  if (!text || !text.trim()) {
    throw new Error('Please enter some text to convert');
  }
  // Reset used markers between runs
  USED_MARKER_IDS.clear();

  const root = parseTabIndentedToStructure(text);
  const xmindFile = await createXMindFile(root);
  await downloadFile(xmindFile, filename);
  console.log(`XMind file "${filename}" generated successfully.`);
}

/**
 * Validate Bedrock input
 */
export function validateBedrockInput(text) {
  if (!text || !text.trim()) return { isValid: false, message: 'Please enter some text to convert' };
  const lines = text.trim().split('\n');
  const hasRootLevel = lines.some(line => line.trim() && !line.startsWith('\t'));
  if (!hasRootLevel) return { isValid: false, message: 'Text must have at least one root-level item' };
  return { isValid: true, message: 'Valid input structure' };
}
