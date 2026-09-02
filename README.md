# Image PDF Editor

A browser-based image and PDF editing tool that lets you prepare images for printing by adjusting margins, grids, and page layouts.

**Live Demo:** [Vercel deployment URL]

## ✨ Features

* 🖼️ **Image Upload**

  * Upload images using drag & drop
  * Support multiple images
  * Preserve the original image aspect ratio

* 🔍 **Canvas Preview**

  * Zoom and pan the image
  * Interactive canvas-based preview
  * Real-time preview of editing settings

* 📐 **Grid**

  * Add a customizable grid to the image
  * Adjust grid size, line color, and line width
  * Align image dimensions with the selected grid size

* 📄 **Page Splitting**

  * Split large images across multiple pages
  * A4 paper size support
  * Configure individual margins
  * Preview page boundaries before exporting

* 📑 **PDF Export**

  * Generate multi-page PDFs from images
  * Preserve the configured page layout and margins
  * Export PDFs directly from the browser

* ⚡ **Web Worker**

  * Move PDF generation work off the main thread
  * Reduce UI blocking during heavy PDF processing

* 💬 **Feedback**

  * Submit feedback and bug reports through GitHub Issues

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Chakra UI

### Image & PDF Processing

* HTML Canvas API
* jsPDF
* PDF processing libraries
* Web Workers

### Deployment

* Vercel

## 🏗️ Project Structure

```text
src/
├── components/
├── hooks/
│   └── useCanvas.ts
├── context/
├── utils/
│   ├── canvas/
│   │   ├── crop.ts
│   │   ├── drawGrid.ts
│   │   ├── drawImage.ts
│   │   └── margin.ts
│   └── pdf/
│       ├── exportPdf.ts
│       └── splitPages.ts
└── ...
```

## 🎯 Why I Built This

I wanted to create a simple tool for preparing images for printing without having to use a full-featured image editor.

The project focuses on handling image scaling, coordinate conversion, page splitting, grid alignment, and PDF generation entirely in the browser.

## 💡 Technical Highlights

### Canvas-based Image Editing

The editor uses multiple canvas layers to separate responsibilities such as image rendering, grids, and page boundaries.

This allows each layer to be updated independently while keeping the preview responsive.

### Image Scaling & Coordinate Conversion

The preview size and the original image size can differ significantly.

Instead of modifying the original image resolution for display, the editor converts coordinates between the displayed image and the original image when performing operations such as cropping and page splitting.

This helps maintain the original image quality when exporting the final PDF.

### Grid-aligned Page Splitting

Images are split according to the printable area of the selected paper size and configured margins.

The image dimensions are adjusted so that the resulting pages align with the selected grid size.

### Background PDF Processing

PDF generation can involve processing large images and multiple pages.

Web Workers are used to move expensive processing away from the main UI thread and keep the interface responsive during PDF generation.

## 🚀 Getting Started

### Requirements

* Node.js
* npm

### Installation

```bash
git clone https://github.com/USERNAME/REPOSITORY.git

cd REPOSITORY

npm install
```

### Development

```bash
npm run dev
```

The development server will start at:

```text
http://localhost:5173
```

### Build

```bash
npm run build
```

## 📦 Deployment

This project is deployed using Vercel.

Every push to the main branch can trigger a new deployment through the connected GitHub repository.

## 🔒 Privacy

Images are processed locally in the browser.

The application does not require users to upload their images to a backend server for image editing or PDF generation.

## 📬 Feedback

Found a bug or have an idea for improvement?

Please leave feedback through the project's GitHub Issues page.

## ☕ Support

If you find this project useful and would like to support my work, you can buy me a coffee.

Your support helps me continue learning, building, and sharing new projects.

## 📄 License

This project is currently for personal and educational purposes.
