# WebRTC Microphone Streaming

This project provides a simple WebRTC server and client for streaming audio from a microphone via a web browser. It allows real-time audio transmission using WebRTC technology.

## Features

*   Real-time microphone audio streaming.
*   WebRTC based communication.
*   Simple server and client setup.
*   Cross-browser compatibility (with WebRTC support).

## Prerequisites

*   [Node.js](https://nodejs.org/) and npm (Node Package Manager) for the server.
*   Python (for running a simple HTTP server for the client).

## Project Structure

```

webRTC-mic-stream/
├── client/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── server/
    ├── package.json
    ├── package-lock.json
    └── server.js

```

## Server Setup and Usage

1.  Navigate to the `server` directory:

    ```sh

      cd server

    ```

2.  Install the required dependencies:

    ```sh

      npm install

    ```

3.  Start the server:

    ```sh

      npm run start

    ```

    This will start the WebRTC signaling server.  By default, the server listens on port 3000. You can modify the port in `server/index.js`.

## Client Setup and Usage

1.  Navigate to the `client` directory.

    ```sh

      cd client

    ```

2.  Serve the client files using a simple HTTP server.  Python is a convenient option:

    ```sh

      python -m http.server 8080

    ```

    > This will serve the client files on `http://localhost:8080`. You can use any other web server if you prefer (e.g., `npx http-server`).

3.  Open the client in your web browser by navigating to the address where you served the files (e.g., `http://localhost:8080`).

4.  Grant microphone access when prompted.
