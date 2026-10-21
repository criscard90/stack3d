// Test E2E unico per la colonna sonora MP3 + integrita' degli SFX.
// Uso:  node test_bgm.js            (richiede Chrome installato)
// Avvia un server statico temporaneo sulla porta 8099 e guida Chrome headless via CDP.
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 8099;
const URL = `http://localhost:${PORT}/index.html`;
const PROFILE = path.join(os.tmpdir(), 'bgm_test_' + Date.now());
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---- server statico temporaneo (serve l'MP3 come audio/mpeg, con byte range) ----
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};
function startServer() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const file = path.join(__dirname, p);
    if (!file.startsWith(__dirname) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': fs.statSync(file).size,
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

(async () => {
  const server = await startServer();
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + PROFILE,
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=user-gesture-required',
    '--disable-gpu',
    '--mute-audio',
    'about:blank',
  ], { stdio: 'ignore' });

  let ws = null;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      const list = await (await fetch('http://localhost:9222/json/list')).json();
      const page = list.find(t => t.type === 'page');
      if (page) { ws = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* riprova */ }
  }
  if (!ws) { console.log('FAIL: Chrome non raggiungibile'); chrome.kill(); server.close(); process.exit(1); }

  const socket = new WebSocket(ws);
  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  const failedRequests = [];
  const responses = new Map();

  socket.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push('EXCEPTION: ' + JSON.stringify(msg.params.exceptionDetails.text || ''));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
      consoleErrors.push(msg.params.type.toUpperCase() + ': ' +
        msg.params.args.map(a => a.value || a.description || a.type).join(' '));
    }
    if (msg.method === 'Network.loadingFailed') {
      failedRequests.push(msg.params.errorText + ' ' + (msg.params.type || ''));
    }
    if (msg.method === 'Network.responseReceived') {
      const p = msg.params || {};
      responses.set(p.request ? p.request.url : '?', { status: p.response.status, mime: p.response.mimeType });
    }
  });

  const send = (method, params = {}) => new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    socket.send(JSON.stringify({ id: mid, method, params }));
  });
  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) return { error: r.result.exceptionDetails.text };
    return r.result && r.result.result ? r.result.result.value : undefined;
  };
  const click = async (x, y) => {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  };

  await new Promise(r => socket.addEventListener('open', r));
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.enable');

  const results = {};
  // ---------- 1. struttura dell'elemento <audio> ----------
  await send('Page.navigate', { url: URL });
  await sleep(3500);
  results.audioElementExists = await evalJs(`!!document.getElementById('bgm')`);
  results.srcAttr = await evalJs(`document.getElementById('bgm').getAttribute('src')`);
  results.loopAttr = await evalJs(`document.getElementById('bgm').loop`);
  results.beforeGesture = await evalJs(`(()=>{const e=document.getElementById('bgm');return {paused:e.paused,ct:e.currentTime,dur:e.duration,vol:e.volume,ready:e.readyState};})()`);

  // ---------- 2. sblocco al primo gesto ----------
  await click(400, 300);
  await sleep(2500);
  results.afterGesture = await evalJs(`(()=>{const e=document.getElementById('bgm');return {paused:e.paused,ct:e.currentTime,dur:e.duration,vol:e.volume,ready:e.readyState,err:e.error?e.error.code:null};})()`);

  const t1 = await evalJs(`document.getElementById('bgm').currentTime`);
  await sleep(1500);
  const t2 = await evalJs(`document.getElementById('bgm').currentTime`);
  results.advances = { t1, t2, delta: (t2 - t1).toFixed(2) };

  // ---------- 3. toggle musica OFF / ON ----------
  await evalJs(`document.getElementById('music-toggle').click()`);
  await sleep(600);
  results.afterMusicOff = await evalJs(`(()=>{const e=document.getElementById('bgm');return {paused:e.paused,ct:e.currentTime,musicOn:musicOn};})()`);

  await evalJs(`document.getElementById('music-toggle').click()`);
  await sleep(1200);
  results.afterMusicOn = await evalJs(`(()=>{const e=document.getElementById('bgm');return {paused:e.paused,ct:e.currentTime,musicOn:musicOn};})()`);

  // ---------- 4. volume master applicato all'MP3 ----------
  results.volBefore = await evalJs(`document.getElementById('bgm').volume`);
  await evalJs(`setVol(0.5)`);
  await sleep(400);
  results.volAfter = await evalJs(`(()=>{const e=document.getElementById('bgm');return {mp3:e.volume,waVol:waVol,stored:localStorage.getItem('stack3d_vol')};})()`);

  // ---------- 5. SFX ancora funzionanti ----------
  results.sfx = await evalJs(`(()=>{return {ctx:!!(typeof waCtx!=='undefined'&&waCtx),sfxBus:!!(typeof waSfxBus!=='undefined'&&waSfxBus),sfxFns:['sfxUI','sfxCoin','sfxBoom','sfxPerfect','sfxOver'].filter(n=>typeof window[n]==='function').length,audioCtxState:(typeof waCtx!=='undefined'&&waCtx)?waCtx.state:'n/a'};})()`);
  results.sfxPlay = await evalJs(`(()=>{try{sfxUI();return 'ok';}catch(e){return 'err:'+e.message;}})()`);
  await sleep(300);

  // ---------- 6. loop: wrap a fine brano ----------
  results.loopWrap = await evalJs(`(()=>{const e=document.getElementById('bgm');e.currentTime=Math.max(0,e.duration-1.2);return {dur:e.duration,ct:e.currentTime};})()`);
  await sleep(3000);
  results.afterWrap = await evalJs(`(()=>{const e=document.getElementById('bgm');return {paused:e.paused,ct:e.currentTime,looped:e.currentTime<e.duration-1.0};})()`);

  // ---------- 7. musicOn=0 persistito -> la musica NON deve partire ----------
  await evalJs(`localStorage.setItem('stack3d_music','0')`);
  await send('Page.reload', { ignoreCache: true });
  await sleep(3000);
  await click(400, 300);
  await sleep(2000);
  results.musicOffPersisted = await evalJs(`(()=>{const e=document.getElementById('bgm');return {paused:e.paused,ct:e.currentTime,musicOn:musicOn};})()`);

  // ---------- 8. riattivo la musica -> deve partire ----------
  await evalJs(`document.getElementById('music-toggle').click()`);
  await sleep(1500);
  results.reEnabled = await evalJs(`(()=>{const e=document.getElementById('bgm');return {paused:e.paused,ct:e.currentTime,musicOn:musicOn};})()`);

  // ---------- 9. reload con musica ON -> riparte col gesto ----------
  await evalJs(`localStorage.setItem('stack3d_music','1')`);
  await send('Page.reload', { ignoreCache: true });
  await sleep(3000);
  await click(400, 300);
  await sleep(2000);
  results.afterReload = await evalJs(`(()=>{const e=document.getElementById('bgm');return {paused:e.paused,ct:e.currentTime,ready:e.readyState,vol:e.volume};})()`);

  // ---------- 10. nessun residuo di codice procedurale ----------
  results.residualGlobals = await evalJs(`(()=>{const names=['waMusicBus','waMusicStart','waMusicStop','waWatchStart','AUDIO_MODES','musicMode','waSeqId','waIntensity','waTargetInt','waMelodyIdx','waPadVoices','MAX_PAD_VOICES','WA_LOOKAHEAD','WA_TICK_MS'];return names.filter(n=>n in window);})()`);
  results.sfxStillPresent = await evalJs(`Object.keys(window).filter(k=>/^sfx[A-Z]/.test(k)).sort()`);
  // ---------- rete ----------
  const mp3 = [...responses.entries()].filter(([u]) => u.includes('Stack') && u.includes('mp3'));
  results.mp3Response = mp3;
  results.consoleErrors = consoleErrors;
  results.failedRequests = failedRequests;

  console.log(JSON.stringify(results, null, 2));
  socket.close();
  chrome.kill();
  server.close();
  await sleep(500);
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* ignora */ }
  process.exit(0);
})().catch(e => { console.log('FAIL: ' + e.stack); process.exit(1); });
