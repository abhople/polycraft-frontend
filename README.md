# Insurance Specification Frontend

A React-based frontend application that allows users to input insurance specifications and receive AI-powered responses from AWS Bedrock agents.

## Features

- **Text Input Area**: Large textarea for entering detailed insurance specifications
- **AI Integration**: Connects to backend Bedrock agent endpoint for intelligent responses
- **Modern UI**: Clean, responsive design with gradient backgrounds and smooth animations
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Visual feedback during API calls

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 3000 (polycraft-backend)

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_AGENT_ID=your-actual-bedrock-agent-id
   REACT_APP_API_URL=http://localhost:3000
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```
   
   The app will run on `http://localhost:3001` (to avoid conflicts with backend on port 3000)

## Configuration

### Environment Variables

- `REACT_APP_AGENT_ID`: Your AWS Bedrock agent ID
- `REACT_APP_API_URL`: Backend API URL (defaults to http://localhost:3000)

### Backend Endpoint

The frontend expects the backend to have an `/invoke-agent` endpoint that accepts:
```json
{
  "agentId": "string",
  "inputText": "string",
  "sessionId": "string"
}
```

## Usage

1. **Enter Insurance Specifications**: Type or paste your insurance requirements in the text area
2. **Submit Request**: Click "Get AI Response" button
3. **View Response**: The AI response will appear below the form
4. **Error Handling**: Any errors will be displayed in red error boxes

## API Integration

The frontend makes POST requests to the backend with:
- **Method**: POST
- **Endpoint**: `/invoke-agent`
- **Headers**: Content-Type: application/json
- **Body**: JSON with agentId, inputText, and sessionId

## Development

- **Hot Reloading**: Enabled for development
- **Responsive Design**: Mobile-friendly layout
- **Modern CSS**: Uses CSS Grid and Flexbox with smooth transitions

## Troubleshooting

- **Port Conflicts**: If port 3001 is busy, the app will automatically suggest an alternative port
- **Backend Connection**: Ensure the backend server is running on port 3000
- **Agent ID**: Verify your Bedrock agent ID is correctly set in the .env file

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.
