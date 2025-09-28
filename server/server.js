const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const wrtc = require("wrtc");
const { spawn } = require("child_process");

const serverOptions = {
  key: fs.readFileSync("../certs/key.pem"),
  cert: fs.readFileSync("../certs/cert.pem"),
};

// HTTPS server just for WSS
const httpsServer = https.createServer(serverOptions);
httpsServer.listen(3000, () => console.log("📡 WSS signaling server running on wss://localhost:3000"));

// WebSocket server
const wss = new WebSocket.Server({ server: httpsServer });

let clients = [];

wss.on("connection", ws => {
  console.log("🌐 Client connected to signaling server");

  // Add client to global array
  const client = { ws, pc: null, ffmpeg: null };
  clients.push(client);

  const pc = new wrtc.RTCPeerConnection();
  client.pc = pc;

  const { RTCAudioSink } = wrtc.nonstandard;

  pc.ontrack = event => {
    console.log("🎙️ Incoming audio track from client");

    const sink = new RTCAudioSink(event.track);

    // Start ffmpeg for this client
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-f", "s16le",      // PCM 16-bit little endian
      "-ar", "48000",     // sample rate 48kHz
      "-ac", "1",         // mono
      "-i", "-",          // input from WebRTC
      "-f", "pulse",      // PulseAudio output
      "VirtualMic"       // output sink (hidden)
    ]);
    client.ffmpeg = ffmpeg;

    ffmpeg.stderr.on("data", data => {
      console.error("ffmpeg:", data.toString());
    });

    ffmpeg.on("exit", code => {
      console.log("ffmpeg exited with code", code);
    });

    let lastLogTime = 0;

    sink.ondata = ({ samples }) => {
      // Write audio to ffmpeg as usual
      ffmpeg.stdin.write(Buffer.from(samples.buffer));

      // Log at most once every 5 seconds
      const now = Date.now();
      if (now - lastLogTime >= 5000) {
        console.log(`🔊 Writing audio to VirtualMic...`);
        lastLogTime = now;
      }
    };

    event.track.onended = () => {
      console.log("❌ Remote track ended");
      sink.stop();
      if (ffmpeg) {
        ffmpeg.kill("SIGKILL");
      }
    };
  };

  pc.onicecandidate = ({ candidate }) => {
    if (candidate && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "candidate", candidate }));
    }
  };

  ws.on("message", async msg => {
    const data = JSON.parse(msg);

    if (data.type === "offer") {
      console.log("📡 Received offer from client");
      await pc.setRemoteDescription({ type: "offer", sdp: data.sdp });

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      ws.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
      console.log("📡 Sent answer back to client");
    } else if (data.type === "candidate" && data.candidate?.candidate) {
      try {
        await pc.addIceCandidate(new wrtc.RTCIceCandidate(data.candidate));
        console.log("✅ Added remote ICE candidate");
      } catch (err) {
        console.error("❌ Error adding ICE candidate:", err);
      }
    }
  });

  ws.on("close", () => {
    console.log("🚪 Client disconnected");

    // Remove from global clients array
    clients = clients.filter(c => c.ws !== ws);

    // Stop ffmpeg if running
    if (client.ffmpeg) {
      client.ffmpeg.kill("SIGKILL");
      client.ffmpeg = null;
    }

    // Close peer connection
    if (pc) pc.close();
  });
});
