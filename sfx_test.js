function sfxBlockExplode(big){
  if(!waCtx||!soundOn)return;
  const t=waCtx.currentTime;
  // sub profondo
  const os=waCtx.createOscillator();os.type='sine';
  const subFreq=big?52:44;
  os.frequency.setValueAtTime(subFreq,t);
  os.frequency.exponentialRampToValueAtTime(28,t+0.3);
  const gs=waCtx.createGain();
  gs.gain.setValueAtTime(0,t);
  gs.gain.linearRampToValueAtTime(big?0.3:0.2,t+0.02);
  gs.gain.exponentialRampToValueAtTime(0.0001,t+0.5);
  os.connect(gs);gs.connect(waSfxBus);
  os.start(t);os.stop(t+0.6);
  setTimeout(()=>{try{os.disconnect();gs.disconnect();}catch(e){}},700);
  // rumore quantizzato (8-bit)
  const on=waCtx.createOscillator();on.type='sawtooth';
  on.frequency.setValueAtTime(880,t);
  const gn=waCtx.createGain();
  const crush=waCrushCurve(16);
  const W=waCtx.createGain();
  const M=waCtx.createGain();
  on.connect(M);M.connect(W);
  // apply bitcrush using the curve
  const d=waCtx.createBufferSource();d.buffer=waCtx.createBuffer(1,1024,waCtx.sampleRate);
  const dd=d.buffer.getChannelData(0);
  for(let i=0;i<1024;i++)dd[i]=crush[i%1024];
  d.start(t);
  W.connect(waSfxBus);
  setTimeout(()=>{try{d.disconnect();W.disconnect();M.disconnect();gn.disconnect();}catch(e){}},600);
  // sweep ascendente
  const o2=waCtx.createOscillator();o2.type='sawtooth';
  o2.frequency.setValueAtTime(200,t);o2.frequency.exponentialRampToValueAtTime(440,t+0.4);
  const g2=waCtx.createGain();g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(big?0.15:0.1,t+0.01);g2.gain.exponentialRampToValueAtTime(0.0001,t+0.5);
  o2.connect(g2);g2.connect(waSfxBus);
  o2.start(t);o2.stop(t+0.6);
  setTimeout(()=>{try{o2.disconnect();g2.disconnect();}catch(e){}},700);
}
console.log('typeof sfxBlockExplode:', typeof sfxBlockExplode);
try { 
  sfxBlockExplode(); 
  console.log('sfxBlockExplode() succeeded'); 
} catch(e) { 
  console.log('sfxBlockExplode() error:', e.message); 
}
