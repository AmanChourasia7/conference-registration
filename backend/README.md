# Simple Form Submission with SurrealDB

## Overview

This project demonstrates a simple form submission flow:
- **Frontend:** Static HTML form (no CSS, only HTML)
- **Backend:** Rust (using Actix-web)
- **Database:** SurrealDB (in-memory)

---

## Project Structure

```
backend/
├── src/
│   └── main.rs          # Rust backend server
├── Cargo.toml           # Rust dependencies
├── index.html           # Simple HTML form
└── README.md            # This file
```

---

## Prerequisites

Before running this project, make sure you have the following installed:

1. **Rust** (version 1.70 or later)
   - Install from: https://rustup.rs/
   - Verify installation: `rustc --version`

2. **Cargo** (comes with Rust)
   - Verify installation: `cargo --version`

---

## Setup Instructions

### 1. Build the Backend

Navigate to the backend directory and build the project:

```bash
cd backend
cargo build
```

### 2. Run the Backend Server

Start the Actix-web server:

```bash
cargo run
```

The server will start on `http://localhost:8080`

You should see output like:
```
Starting server...
Server running at http://localhost:8080
Open index.html in your browser to use the form
```

### 3. Open the Frontend

Open `index.html` in your web browser by either:
- Double-clicking the file, or
- Using a local file server

---

## Usage

1. **Start the backend server** (as described above)
2. **Open index.html** in your browser
3. **Fill out the form** with:
   - Name
   - Email
   - Message
4. **Click Submit**
5. You'll see a success message with the submission ID

---

## API Endpoints

### POST /submit
Submit form data

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, World!"
}
```

**Response:**
```json
{
  "id": "submissions:1a2b3c4d",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, World!"
}
```

### GET /health
Check server health

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## Technology Stack

- **Actix-web 4.5**: High-performance web framework for Rust
- **SurrealDB 1.5**: Modern database with in-memory storage
- **Actix-CORS**: CORS middleware for cross-origin requests
- **Serde**: Serialization/deserialization framework

---

## Features

✓ Simple HTML form without CSS  
✓ RESTful API with Actix-web  
✓ In-memory SurrealDB database  
✓ CORS enabled for local development  
✓ JSON request/response handling  
✓ Async/await architecture  

---

## Development

### Running in Development Mode

```bash
cargo run
```

### Building for Release

```bash
cargo build --release
```

The optimized binary will be in `target/release/`

---

## Troubleshooting

**Port already in use:**
- Make sure no other application is using port 8080
- Or modify the port in `main.rs`

**CORS errors:**
- The server is configured to allow all origins for development
- For production, configure specific allowed origins

**Form submission fails:**
- Ensure the backend server is running
- Check browser console for error messages
- Verify the server URL in index.html matches your backend

---

## Notes

- This project uses an **in-memory** SurrealDB instance, meaning data is lost when the server stops
- For persistent storage, you can switch to file-based or remote SurrealDB instances
- The HTML form has no CSS styling as per requirements
