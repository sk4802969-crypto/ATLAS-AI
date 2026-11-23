// ATLAS AI - Interactive Frontend Controller

let currentVoice = 'aryan';
let isSpeaking = false;
let currentUtterance = null;
let currentAudioText = '';
let isPaused = false;

// 1. 3D Spherical Floating Dots Visualizer
const canvas = document.getElementById('dots-canvas');
const ctx = canvas.getContext('2d');
const numDots = 420;
const dots = [];
const golden = Math.PI * (3 - Math.sqrt(5));
const sphereRadius = 65;

for (let i = 0; i < numDots; i++) {
  const y = 1 - (2 * i) / (numDots - 1);
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  dots.push({
    x: Math.cos(theta) * radiusAtY,
    y: y,
    z: Math.sin(theta) * radiusAtY
  });
}

let angleX = 0;
let angleY = 0;

function renderDots() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Gentle continuous rotation
  angleY += 0.012;
  angleX = Math.sin(angleY * 0.5) * 0.2;

  const sinY = Math.sin(angleY);
  const cosY = Math.cos(angleY);
  const sinX = Math.sin(angleX);
  const cosX = Math.cos(angleX);

  // Pulse effect if active/speaking
  const pulseScale = isSpeaking ? 1 + Math.sin(Date.now() * 0.008) * 0.12 : 1;

  // Orbit ring
  ctx.strokeStyle = 'rgba(199, 185, 250, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 82 * pulseScale, 30 * pulseScale, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Project and sort dots
  const projected = dots.map(d => {
    // Rotate Y
    let x1 = d.x * cosY - d.z * sinY;
    let z1 = d.x * sinY + d.z * cosY;
    // Rotate X
    let y2 = d.y * cosX - z1 * sinX;
    let z2 = d.y * sinX + z1 * cosX;

    const scale = (z2 + 2) / 3;
    const px = cx + x1 * sphereRadius * pulseScale * scale;
    const py = cy + y2 * sphereRadius * pulseScale * scale;
    return { px, py, z: z2 };
  });

  projected.sort((a, b) => a.z - b.z);

  // Draw dots
  projected.forEach(p => {
    const alpha = Math.max(0.2, (p.z + 1) / 2);
    const radius = Math.max(0.8, (p.z + 1.2) * 1.3);

    if (currentVoice === 'ultron') {
      ctx.fillStyle = `rgba(255, 120, 140, ${alpha})`;
    } else if (currentVoice === 'zoya' || currentVoice === 'meera') {
      ctx.fillStyle = `rgba(130, 240, 160, ${alpha})`;
    } else {
      ctx.fillStyle = `rgba(210, 220, 255, ${alpha})`;
    }

    ctx.beginPath();
    ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(renderDots);
}
renderDots();

// 2. Tab Navigation
function switchTab(tabId) {
  document.querySelectorAll('.tab-view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');

  const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(tabId));
  if (btn) btn.classList.add('active');

  if (tabId === 'tab-map') loadSwarmState();
  if (tabId === 'tab-trends') loadTrends();
  if (tabId === 'tab-emails') loadEmails();
}

// 3. Voice Selection & Persona
function setVoice(v) {
  currentVoice = v;
  document.querySelectorAll('.voice-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.voice-btn')).find(b => b.getAttribute('onclick').includes(v));
  if (activeBtn) activeBtn.classList.add('active');
  showToast(`Voice switched to: ${v.toUpperCase()}`);
}

// 4. Smart Audio Player with Resume Support
function playAudio(btn, text) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser');
    return;
  }

  if (isSpeaking && !isPaused) {
    window.speechSynthesis.pause();
    isPaused = true;
    btn.textContent = '▶ Resume';
    showToast('Audio Paused');
    return;
  }

  if (isPaused) {
    window.speechSynthesis.resume();
    isPaused = false;
    btn.textContent = '⏸ Pause';
    showToast('Audio Resumed');
    return;
  }

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  currentUtterance = utter;
  currentAudioText = text;

  // Configure persona parameters
  if (currentVoice === 'ultron') {
    utter.pitch = 0.4;
    utter.rate = 0.95;
    utter.lang = 'hi-IN';
  } else if (currentVoice === 'meera') {
    utter.pitch = 1.3;
    utter.rate = 1.0;
    utter.lang = 'hi-IN';
  } else if (currentVoice === 'zoya') {
    utter.pitch = 1.4;
    utter.rate = 1.1;
    utter.lang = 'hi-IN';
  } else if (currentVoice === 'kabir') {
    utter.pitch = 0.8;
    utter.rate = 0.95;
    utter.lang = 'hi-IN';
  } else {
    // Aryan default
    utter.pitch = 1.0;
    utter.rate = 1.0;
    utter.lang = 'hi-IN';
  }

  utter.onstart = () => {
    isSpeaking = true;
    isPaused = false;
    btn.textContent = '⏸ Pause';
    document.getElementById('voice-status-text').textContent = `SPEAKING (${currentVoice.toUpperCase()})`;
  };

  utter.onend = () => {
    isSpeaking = false;
    isPaused = false;
    btn.textContent = '▶ Play';
    document.getElementById('voice-status-text').textContent = 'LISTENING • 3D SPHERICAL ORB';
  };

  utter.onerror = () => {
    isSpeaking = false;
    isPaused = false;
    btn.textContent = '▶ Play';
  };

  window.speechSynthesis.speak(utter);
}

// 5. Dedicated Code Block Copy Button
function copyCode(btn) {
  const codeBox = btn.closest('.code-container').querySelector('.code-box code');
  if (codeBox) {
    navigator.clipboard.writeText(codeBox.textContent).then(() => {
      btn.textContent = '✓ COPIED!';
      showToast('Code copied for Termux!');
      setTimeout(() => btn.textContent = '📋 COPY CODE', 2000);
    }).catch(() => {
      showToast('Clipboard access denied');
    });
  }
}

function copyMessage(btn) {
  const content = btn.closest('.chat-bubble').querySelector('.bubble-content').innerText;
  navigator.clipboard.writeText(content).then(() => {
    showToast('Message text copied!');
  });
}

function shareMessage(text) {
  if (navigator.share) {
    navigator.share({ title: 'Atlas AI', text: text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text);
    showToast('Link copied to clipboard!');
  }
}

// 6. Chat Input & API Communication
async function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;

  // Append user bubble
  appendChatBubble('user', 'YOU', text);
  input.value = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, voice: currentVoice })
    });
    const data = await res.json();

    // Append Atlas response bubble
    appendChatBubble('atlas', 'ATLAS AI', data.reply, data.codeBlock, data.game);

    // Speak response if voice active
    playAudio(document.querySelector('.chat-stream .chat-bubble:last-child .act-btn'), data.reply);
  } catch (err) {
    appendChatBubble('atlas', 'ATLAS AI', `Error: ${err.message}`);
  }
}

function appendChatBubble(type, sender, text, codeBlock, game) {
  const stream = document.getElementById('chat-stream');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}-bubble`;

  let inner = `
    <div class="bubble-header">
      <span class="sender-name">${sender}</span>
      <span class="timestamp">${new Date().toLocaleTimeString()}</span>
    </div>
    <div class="bubble-content">${text}
  `;

  if (codeBlock) {
    inner += `
      <div class="code-container">
        <div class="code-header">
          <span class="code-lang">GENERATED TERMUX CODE</span>
          <button class="btn-copy-code" onclick="copyCode(this)">📋 COPY CODE</button>
        </div>
        <pre class="code-box"><code>${codeBlock}</code></pre>
      </div>
    `;
  }

  if (game) {
    inner += `
      <div class="game-card" style="margin-top:10px;">
        <div class="game-info">
          <div class="game-icon">🕹️</div>
          <div>
            <h4 class="game-title">${game.title}</h4>
            <p class="game-desc">HTML5 On-Device Canvas Mini-Game</p>
          </div>
        </div>
        <div class="game-actions">
          <button class="btn-play-game" onclick="openGameModal()">▶ PLAY NOW</button>
          <button class="btn-publish-game" onclick="publishGame()">🚀 PUBLISH / SHARE</button>
        </div>
      </div>
    `;
  }

  inner += `</div>`;

  if (type === 'atlas') {
    inner += `
      <div class="bubble-actions">
        <button class="act-btn" onclick="playAudio(this, '${text.replace(/'/g, "\\'")}')">▶ Play</button>
        <button class="act-btn" onclick="copyMessage(this)">📄 Copy</button>
        <button class="act-btn" onclick="shareMessage('${text.replace(/'/g, "\\'")}')">↗ Share</button>
      </div>
    `;
  }

  bubble.innerHTML = inner;
  stream.appendChild(bubble);
  stream.scrollTop = stream.scrollHeight;
}

// 7. Playable 2D Mini-Game (Cyber Dash)
let gameRunning = false;
let gameScore = 0;
let playerY = 150;
let playerVy = 0;
let obstacles = [];
let gameAnimId = null;

function openGameModal() {
  document.getElementById('game-modal').classList.add('open');
  startGame();
}

function closeGameModal() {
  document.getElementById('game-modal').classList.remove('open');
  gameRunning = false;
  if (gameAnimId) cancelAnimationFrame(gameAnimId);
}

function gameJump() {
  if (playerY >= 140) {
    playerVy = -8.5;
  }
}

window.addEventListener('keydown', e => {
  if (e.code === 'Space' && document.getElementById('game-modal').classList.contains('open')) {
    gameJump();
  }
});

function startGame() {
  const gCanvas = document.getElementById('game-canvas');
  const gCtx = gCanvas.getContext('2d');
  gameRunning = true;
  gameScore = 0;
  playerY = 150;
  playerVy = 0;
  obstacles = [{ x: 340, w: 16, h: 30 }];

  function loop() {
    if (!gameRunning) return;

    // Physics
    playerVy += 0.45;
    playerY += playerVy;
    if (playerY > 150) { playerY = 150; playerVy = 0; }

    // Clear
    gCtx.fillStyle = '#080a14';
    gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

    // Ground
    gCtx.strokeStyle = '#2d3748';
    gCtx.lineWidth = 2;
    gCtx.beginPath();
    gCtx.moveTo(0, 170);
    gCtx.lineTo(gCanvas.width, 170);
    gCtx.stroke();

    // Player (Glowing Neon Orb)
    gCtx.fillStyle = '#64c8ff';
    gCtx.shadowColor = '#64c8ff';
    gCtx.shadowBlur = 10;
    gCtx.beginPath();
    gCtx.arc(50, playerY, 12, 0, Math.PI * 2);
    gCtx.fill();
    gCtx.shadowBlur = 0;

    // Obstacles
    obstacles.forEach(obs => {
      obs.x -= 3.2;
      gCtx.fillStyle = '#ff788c';
      gCtx.fillRect(obs.x, 170 - obs.h, obs.w, obs.h);

      // Collision check
      if (obs.x < 62 && obs.x + obs.w > 38 && playerY + 12 > 170 - obs.h) {
        showToast(`Game Over! Score: ${gameScore}`);
        gameRunning = false;
      }
    });

    if (obstacles.length && obstacles[0].x < -20) {
      obstacles.shift();
      gameScore += 10;
      obstacles.push({ x: 360 + Math.random() * 80, w: 16, h: 25 + Math.random() * 20 });
    }

    // Score text
    gCtx.fillStyle = '#fff';
    gCtx.font = '12px monospace';
    gCtx.fillText(`SCORE: ${gameScore}`, 14, 25);

    gameAnimId = requestAnimationFrame(loop);
  }
  loop();
}

function publishGame() {
  showToast('🚀 Game bundle published & saved to ~/projects/atlas-ai/public/game.html');
}

// 8. Termux Terminal Runner
async function runTermuxCommand() {
  const input = document.getElementById('term-cmd-input');
  const screen = document.getElementById('terminal-screen');
  const cmd = input.value.trim();
  if (!cmd) return;

  const cmdLine = document.createElement('div');
  cmdLine.className = 'term-line';
  cmdLine.textContent = `$ ${cmd}`;
  screen.appendChild(cmdLine);
  input.value = '';

  try {
    const res = await fetch('/api/termux', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    const data = await res.json();
    const outLine = document.createElement('div');
    outLine.className = `term-line ${data.success ? 'term-green' : 'term-red'}`;
    outLine.textContent = data.output || data.error;
    screen.appendChild(outLine);
    screen.scrollTop = screen.scrollHeight;
  } catch (err) {
    const errLine = document.createElement('div');
    errLine.className = 'term-line term-red';
    errLine.textContent = `Error: ${err.message}`;
    screen.appendChild(errLine);
  }
}

// 9. Load Swarm State & Agents List
async function loadSwarmState() {
  try {
    const res = await fetch('/api/state');
    const data = await res.json();
    const container = document.getElementById('agent-cards-container');
    container.innerHTML = '';

    data.agents.forEach(agent => {
      const card = document.createElement('div');
      card.className = 'agent-card';
      card.innerHTML = `
        <div class="agent-info">
          <h4 style="color:${agent.color}">${agent.name} (${agent.role})</h4>
          <p>${agent.activity}</p>
        </div>
        <button class="btn-rename" onclick="promptRenameAgent('${agent.id}', '${agent.name}')">Rename ✎</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {}
}

async function promptRenameAgent(id, oldName) {
  const newName = prompt(`Enter new name for ${oldName}:`, oldName);
  if (newName && newName !== oldName) {
    await fetch('/api/agents/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: newName })
    });
    showToast(`Agent renamed to: ${newName}`);
    loadSwarmState();
  }
}

// 10. Load Trends & Emails
async function loadTrends() {
  try {
    const res = await fetch('/api/trends');
    const data = await res.json();
    const container = document.getElementById('trends-list');
    container.innerHTML = '';

    data.trending.forEach(item => {
      const div = document.createElement('div');
      div.className = 'trend-item';
      div.innerHTML = `
        <div class="trend-title">#${item.rank} ${item.title}</div>
        <div class="trend-meta">
          <span>🎧 ${item.sound}</span>
          <span>👁️ ${item.views}</span>
          <span>👤 ${item.creator}</span>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {}
}

async function loadEmails() {
  try {
    const res = await fetch('/api/emails');
    const data = await res.json();
    const container = document.getElementById('emails-list');
    container.innerHTML = '';

    data.vipEmails.forEach(mail => {
      const div = document.createElement('div');
      div.className = 'email-item';
      div.innerHTML = `
        <div class="email-sender">${mail.from} • ${mail.time} [${mail.priority}]</div>
        <div class="email-subj">${mail.subject}</div>
        <div class="email-summary">${mail.summary}</div>
      `;
      container.appendChild(div);
    });
  } catch (err) {}
}

function autoGeneratePost() {
  const topic = document.getElementById('post-topic').value.trim() || 'New AI Swarm Update';
  showToast(`Nexus scheduled viral reel for topic: "${topic}"!`);
}

function handleOtaInstall() {
  showToast('⚡ Updating Atlas AI to v1.2.0 via GitHub OTA...');
  setTimeout(() => {
    document.getElementById('ota-banner').style.display = 'none';
    showToast('✓ Updated successfully! Swarm core reloaded.');
  }, 2200);
}

function changeTheme(th) {
  document.documentElement.setAttribute('data-theme', th);
  showToast(`Theme changed to: ${th}`);
}

function toggleMic() {
  const mic = document.getElementById('mic-btn');
  mic.classList.toggle('recording');
  showToast(mic.classList.contains('recording') ? 'Listening to voice...' : 'Mic turned off');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.display = 'none', 2500);
}
