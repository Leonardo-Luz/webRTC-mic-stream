# WebRTC Microphone Streaming

This project provides a simple WebRTC server and client for streaming audio from a microphone via a web browser. It allows real-time audio transmission using WebRTC technology.

## Features

*   Real-time microphone audio streaming.
*   WebRTC based communication.
*   Simple server and client setup.
*   Cross-browser compatibility (with WebRTC support).

## Prerequisites

*   [Node.js](https://nodejs.org/) and npm (Node Package Manager) for the server.

## Project Structure

```

webRTC-mic-stream/
├── client
│   ├── index.html
│   ├── script.js
│   ├── server.js
│   └── style.css
└── server
    ├── package.json
    ├── package-lock.json
    └── server.js

```

## Virtual Microphone Setup

  ```sh

    # 1. Create a null sink (acts as a hidden output)
    pactl load-module module-null-sink sink_name=VirtualSink sink_properties=device.description=VirtualSink

    # 2. Create a monitor source from that sink (this will be the virtual mic)
    pactl load-module module-remap-source master=VirtualSink.monitor source_name=VirtualMic source_properties=device.description=VirtualMic

  ```

## Certificates Setup

1. Navigate to the project `root` directory.

    ```sh

      cd webRTC-mic-stream

    ```

2. Create the `certs` directory and enter in it.

    ```sh

      mkdir certs
      cd certs

    ```

3. Generate the key and certificate

    ```sh

      # 1. Generate private key
      openssl genrsa -out key.pem 2048

      # 2. Generate certificate
      openssl req -new -x509 -key key.pem -out cert.pem -days 365

    ```

    > If planning to use TLS certificates, remember to access both hosts (e.g., the client and the server) and accept the certificate you created.

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

    > This will start the WebRTC signaling server.  By default, the server listens on port 3000. You can modify the port in `server/index.js`.

## Client Setup and Usage

1.  Navigate to the `client` directory.

    ```sh

      cd client

    ```

2.  Serve the client files using a simple HTTPS server.:

    ```sh

      node server.js

    ```

    > This will serve the client files on `https://localhost:8080`.

3.  Open the client in your web browser by navigating to the address where you served the files (e.g., `https://localhost:8080`).

4.  Grant microphone access when prompted.
