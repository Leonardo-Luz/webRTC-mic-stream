let localStream;
let pc;
let ws;
let streaming = false;

const statusEl = document.getElementById("status");
const toggleBtn = document.getElementById("toggle");
const serverInput = document.getElementById("serverInput");

const savedServer = localStorage.getItem("lastServer");
if (savedServer) serverInput.value = savedServer;

async function startStreaming() {
  const serverUrl = serverInput.value || serverInput.placeholder;
  if (!serverUrl) {
    alert("Please enter a signaling server URL!");
    return;
  }

  localStorage.setItem("lastServer", serverUrl);

  serverInput.disabled = true;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    pc = new RTCPeerConnection();
    ws = new WebSocket(serverUrl);

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = e => {
      if (e.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "candidate", candidate: e.candidate }));
      }
    };

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "answer") await pc.setRemoteDescription(data);
      else if (data.type === "candidate") await pc.addIceCandidate(data.candidate);
    };

    ws.onopen = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify(offer));
    };

    streaming = true;
    toggleBtn.textContent = "Stop Streaming";
    statusEl.textContent = `Streaming...`;
  } catch (err) {
    console.error("Error accessing mic:", err);
    alert("Could not access microphone!");
    serverInput.disabled = false;
  }
}

function stopStreaming() {
  if (pc) pc.close();
  if (ws) ws.close();
  if (localStream) localStream.getTracks().forEach(track => track.stop());

  pc = null;
  ws = null;
  localStream = null;

  streaming = false;
  toggleBtn.textContent = "Start Streaming";
  statusEl.textContent = "Not streaming";

  serverInput.disabled = false;
}

toggleBtn.onclick = () => {
  if (streaming) stopStreaming();
  else startStreaming();
};
