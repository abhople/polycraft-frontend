# XMind Converter Feature

## Overview
The React frontend now includes a powerful XMind converter that takes tab-indented Bedrock output and converts it into downloadable XMind mind map files.

## Features

### 🧠 XMind Converter Tab
- **Input**: Paste tab-indented text from Bedrock
- **Copy Input**: Copy input text to clipboard
- **Validation**: Real-time validation of input structure
- **Custom Filename**: Set custom filename for downloaded files
- **Download**: One-click generation and download of XMind files
- **Example**: Load example Bedrock output for testing

### 🏢 Insurance Assistant Tab
- **AI Response**: Get AI-powered insurance assistance
- **Copy Response**: Copy AI response to clipboard
- **Bedrock Integration**: Connects to backend Bedrock agent

## How to Use XMind Converter

1. **Switch to XMind Tab**: Click the "🧠 XMind Converter" tab
2. **Input Text**: Paste your tab-indented Bedrock output
3. **Copy Input** (Optional): Click "📋 Copy Input" to copy the text to clipboard
4. **Set Filename**: Optionally customize the filename
5. **Generate**: Click "📥 Generate & Download XMind"
6. **Download**: The XMind file will be automatically downloaded

## How to Use Insurance Assistant

1. **Switch to Insurance Tab**: Click the "🏢 Insurance Assistant" tab
2. **Enter Specifications**: Describe your insurance needs
3. **Get Response**: Click "Get AI Response" to get AI assistance
4. **Copy Response** (Optional): Click "📋 Copy" to copy the AI response to clipboard

## Input Format

The converter expects tab-indented text with the following structure:

```
RootLevelItem
	FirstLevelChild
		SecondLevelChild
		AnotherSecondLevelChild
	AnotherFirstLevelChild
		SecondLevelChild
```

## Example Input

```
BusinessPropertyInsurance
	Coverage
		Rule: FireCoverage
		Rule: FloodCoverage
	Exclusions
		Condition: WearAndTearExcluded
	Limits
		Limit: MaxPayoutPerLocation_50000000
	Conditions
		Condition: FireSuppressionRequired
```

## Technical Details

### Dependencies
- `jszip`: For creating ZIP archives (XMind files are ZIP-based)
- React hooks for state management
- CSS modules for styling

### File Structure
```
src/
├── components/
│   ├── XMindConverter.js      # Main converter component
│   └── XMindConverter.css     # Component styles
├── utils/
│   └── bedrockToXMind.js      # Conversion logic
└── App.js                     # Updated with tab navigation
```

### Key Functions
- `generateAndDownloadXMind()`: Main conversion function
- `validateBedrockInput()`: Input validation
- `parseTabIndentedToStructure()`: Parse text to hierarchical structure
- `createXMindFile()`: Create XMind ZIP archive
- `generateContentXml()`: Generate XMind content XML
- `downloadFile()`: Browser file download functionality

## Browser Compatibility
- Modern browsers with ES6+ support
- File download functionality works in all modern browsers
- Responsive design for mobile and desktop
- No Node.js dependencies - fully browser-compatible

## Error Handling
- Input validation with helpful error messages
- Graceful error handling for file generation
- User-friendly success/error notifications

## Styling
- Modern, clean UI with gradient backgrounds
- Responsive design for all screen sizes
- Consistent with existing app design
- Accessible color schemes and typography
