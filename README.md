# Interactive Content Web App

A web application that generates interactive tools based on blog content or URLs. The app analyzes the content using GPT-4 and creates embeddable JavaScript tools that enhance user engagement.

## Features

- Input blog content directly or via URL
- Content analysis using GPT-4
- Automatic tool generation based on content
- Embeddable JavaScript tools
- Modern, responsive UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd interactive-content-web-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
REACT_APP_OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Usage

1. Enter your blog content or URL in the input form
2. Click "Generate Tool"
3. Preview the generated tool
4. Copy the embed code to use in your blog

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- OpenAI GPT-4 API
- Mercury Parser

## License

MIT 