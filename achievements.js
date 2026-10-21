// === ACHIEVEMENTS SYSTEM (minimal) ===
const ACHIEVEMENTS=[];
const ACHIEVEMENT_MAP={};
let achStats={totalPerfects:0,totalMisses:0,totalBlocks:0,totalBombs:0,totalTNT:0,totalFrenzyHits:0,totalBlastHits:0,totalCoinsEarned:0,maxSpeed:0,maxStreakEver:0,maxTowerEver:0,maxScoreEver:0,frenzyMaxStreak:0,blastCount:0,frenzyCount:0,themesOwned:0,shapesOwned:0,trailsOwned:0,cutsOwned:0,aurasOwned:0,framesOwned:0,upgradesMaxed:0,heartsUsed:0,magnetsUsed:0,slowsUsed:0,runPerfects:0,runMisses:0,runBlocks:0,runStreak:0};
let unlockedAch=new Set();
try{const s=localStorage.getItem('stack3d_achievements');if(s)unlockedAch=new Set(JSON.parse(s));}catch(e){}
let achToastQueue=[];let achToastActive=false;
function saveAch(){try{localStorage.setItem('stack3d_achievements',JSON.stringify([...unlockedAch]));}catch(e){}}
function showAchToast(ach){achToastQueue.push(ach);if(!achToastActive)processAchToast();}
function processAchToast(){if(!achToastQueue.length){achToastActive=false;return;}achToastActive=true;const ach=achToastQueue.shift();const el=document.createElement('div');el.className='ach-toast';el.innerHTML='<div class="ach-toast-name">🏆 '+ach.name+'</div><div class="ach-toast-desc">'+ach.desc+'</div>';document.body.appendChild(el);setTimeout(()=>{el.classList.add('ach-toast-out');setTimeout(()=>{el.remove();processAchToast();},400);},3000);}
function unlockAch(id){if(unlockedAch.has(id))return;const ach=ACHIEVEMENT_MAP[id];if(!ach)return;unlockedAch.add(id);saveAch();showAchToast(ach);}
function checkAch(){}
function openAchievements(){const v=document.getElementById('achievements');if(v)v.style.display='flex';renderAchievements();const cc=document.getElementById('ach-count');if(cc)cc.textContent='('+unlockedAch.size+'/'+ACHIEVEMENTS.length+')';const cb=document.getElementById('ach-close');if(cb&&!cb._bound){cb._bound=true;cb.onclick=e=>{e.stopPropagation();closeAchievements();};}}
function closeAchievements(){const v=document.getElementById('achievements');if(v)v.style.display='none';}
function renderAchievements(){const g=document.getElementById('ach-grid');if(!g)return;g.innerHTML=ACHIEVEMENTS.map(a=>{const u=unlockedAch.has(a.id);return '<div class="ach-card '+(u?'unlocked':'locked')+'"><div class="ach-icon">'+(u?'🏆':'🔒')+'</div><div class="ach-name">'+a.name+'</div><div class="ach-desc">'+a.desc+'</div></div>';}).join('');}
const ACHIEVEMENTS=[
{id:'first_tap',name:'First Tap',desc:'Place your first block',tier:1},
{id:'first_perfect',name:'Perfect Starter',desc:'Get your first Perfect',tier:1},
{id:'first_miss',name:'Oops',desc:'Miss a block for the first time',tier:1},
{id:'second_chance',name:'Second Chance',desc:'Use a heart to survive a miss',tier:1},
{id:'first_coin',name:'Coin Collector',desc:'Collect your first coin',tier:1},
{id:'shop_open',name:'Shopper',desc:'Open the shop for the first time',tier:1},
{id:'sound_toggle',name:'Sound Check',desc:'Toggle audio',tier:1},
{id:'restart',name:'Restart Rookie',desc:'Restart a game',tier:1},
{id:'streak_3',name:'Triple Streak',desc:'Reach a 3 Perfect streak',tier:1},
{id:'streak_5',name:'High Five',desc:'Reach a 5 Perfect streak',tier:1},
{id:'speed_030',name:'Speed Demon',desc:'Reach speed 0.30',tier:1},
{id:'tower_10',name:'Tower 10',desc:'Build a tower of 10 blocks',tier:1},
{id:'tower_20',name:'Tower 20',desc:'Build a tower of 20 blocks',tier:1},
{id:'coins_50',name:'Coin Hoarder',desc:'Have 50 coins',tier:1},
{id:'first_bomb',name:'First Bomb',desc:'Use your first bomb',tier:1},
{id:'first_tnt',name:'First TNT',desc:'Trigger your first TNT',tier:1},
{id:'frenzy_unlock',name:'Frenzy Unlock',desc:'Unlock Frenzy mode (high score 50)',tier:1},
{id:'blast_unlock',name:'Blast Unlock',desc:'Unlock Color Blast (high score 75)',tier:1},
{id:'powerup_active',name:'Power-up Active',desc:'Activate a consumable',tier:1},
{id:'theme_switch',name:'Theme Switch',desc:'Change theme',tier:1},
{id:'perfect_10',name:'Perfect 10',desc:'10 Perfects in one run',tier:2},
{id:'perfect_25',name:'Perfect 25',desc:'25 Perfects in one run',tier:2},
{id:'streak_10',name:'Streak 10',desc:'10 Perfect streak',tier:2},
{id:'streak_20',name:'Streak 20',desc:'20 Perfect streak',tier:2},
{id:'no_miss_20',name:'No Miss 20',desc:'Reach 20 blocks without missing',tier:2},
{id:'score_25',name:'Score 25',desc:'Score 25 in a single run',tier:2},
{id:'score_50',name:'Score 50',desc:'Score 50 in a single run',tier:2},
{id:'coins_100',name:'Coins 100',desc:'Have 100 coins',tier:2},
{id:'coins_250',name:'Coins 250',desc:'Have 250 coins',tier:2},
{id:'tower_30',name:'Tower 30',desc:'Build a tower of 30 blocks',tier:2},
{id:'tower_50',name:'Tower 50',desc:'Build a tower of 50 blocks',tier:2},
{id:'bomb_master',name:'Bomb Master',desc:'Use 5 bombs total',tier:2},
{id:'tnt_master',name:'TNT Master',desc:'Trigger 5 TNTs total',tier:2},
{id:'frenzy_first',name:'Frenzy First',desc:'Complete a Frenzy run',tier:2},
{id:'frenzy_10',name:'Frenzy 10',desc:'Score 10 in Frenzy',tier:2},
];
const ACHIEVEMENTS2=[
{id:'score_75',name:'Score 75',desc:'Score 75 in a single run',tier:3},
{id:'score_100',name:'Score 100',desc:'Score 100 in a single run',tier:3},
{id:'score_150',name:'Score 150',desc:'Score 150 in a single run',tier:3},
{id:'score_200',name:'Score 200',desc:'Score 200 in a single run',tier:3},
{id:'streak_30',name:'Streak 30',desc:'30 Perfect streak',tier:3},
{id:'streak_50',name:'Streak 50',desc:'50 Perfect streak',tier:3},
{id:'coins_500',name:'Coins 500',desc:'Have 500 coins',tier:3},
{id:'coins_1000',name:'Coins 1000',desc:'Have 1000 coins',tier:3},
{id:'tower_75',name:'Tower 75',desc:'Build a tower of 75 blocks',tier:3},
{id:'tower_100',name:'Tower 100',desc:'Build a tower of 100 blocks',tier:3},
{id:'frenzy_streak_5',name:'Frenzy Streak 5',desc:'5 Frenzy hits in a row',tier:3},
{id:'frenzy_streak_10',name:'Frenzy Streak 10',desc:'10 Frenzy hits in a row',tier:3},
{id:'blast_streak_5',name:'Blast Streak 5',desc:'5 Color Blasts completed',tier:3},
{id:'perfect_run_25',name:'Perfect Run 25',desc:'25 blocks without a miss',tier:3},
{id:'theme_all',name:'Theme Collector',desc:'Own all themes',tier:3},
{id:'shape_all',name:'Shape Collector',desc:'Own all shapes',tier:3},
{id:'trail_all',name:'Trail Collector',desc:'Own all trails',tier:3},
{id:'cut_all',name:'Cut Collector',desc:'Own all cut effects',tier:3},
{id:'aura_all',name:'Aura Collector',desc:'Own all auras',tier:3},
{id:'frame_all',name:'Frame Collector',desc:'Own all frames',tier:3},
{id:'upgrade_tol_max',name:'Tolerance Max',desc:'Max out Tolerance upgrade',tier:3},
{id:'no_miss_50',name:'No Miss 50',desc:'Reach 50 blocks without missing',tier:3},
{id:'bomb_10',name:'Bomb Expert',desc:'Use 10 bombs total',tier:3},
{id:'tnt_10',name:'TNT Expert',desc:'Trigger 10 TNTs total',tier:3},
{id:'score_250',name:'Score 250',desc:'Score 250 in a single run',tier:4},
{id:'score_300',name:'Score 300',desc:'Score 300 in a single run',tier:4},
{id:'score_400',name:'Score 400',desc:'Score 400 in a single run',tier:4},
{id:'streak_75',name:'Streak 75',desc:'75 Perfect streak',tier:4},
{id:'streak_100',name:'Streak 100',desc:'100 Perfect streak',tier:4},
{id:'tower_150',name:'Tower 150',desc:'Build a tower of 150 blocks',tier:4},
{id:'tower_200',name:'Tower 200',desc:'Build a tower of 200 blocks',tier:4},
{id:'coins_2500',name:'Coins 2500',desc:'Have 2500 coins',tier:4},
{id:'coins_5000',name:'Coins 5000',desc:'Have 5000 coins',tier:4},
{id:'frenzy_25',name:'Frenzy 25',desc:'Score 25 in Frenzy',tier:4},
{id:'frenzy_50',name:'Frenzy 50',desc:'Score 50 in Frenzy',tier:4},
{id:'frenzy_no_miss',name:'Frenzy Flawless',desc:'Complete Frenzy without missing',tier:4},
{id:'blast_25',name:'Blast 25',desc:'Blast 25 blocks in one blast',tier:4},
{id:'blast_50',name:'Blast 50',desc:'Blast 50 blocks in one blast',tier:4},
{id:'perfect_run_50',name:'Perfect Run 50',desc:'50 blocks without a miss',tier:4},
{id:'perfect_run_75',name:'Perfect Run 75',desc:'75 blocks without a miss',tier:4},
{id:'perfect_run_100',name:'Perfect Run 100',desc:'100 blocks without a miss',tier:4},
{id:'speed_050',name:'Speed 0.50',desc:'Reach speed 0.50',tier:4},
{id:'speed_075',name:'Speed 0.75',desc:'Reach speed 0.75',tier:4},
{id:'bomb_25',name:'Bomb Veteran',desc:'Use 25 bombs total',tier:4},
{id:'tnt_25',name:'TNT Veteran',desc:'Trigger 25 TNTs total',tier:4},
{id:'score_500',name:'Score 500',desc:'Score 500 in a single run',tier:5},
{id:'streak_150',name:'Streak 150',desc:'150 Perfect streak',tier:5},
{id:'tower_300',name:'Tower 300',desc:'Build a tower of 300 blocks',tier:5},
{id:'perfect_run_150',name:'Perfect Run 150',desc:'150 blocks without a miss',tier:5},
{id:'all_achievements',name:'Completionist',desc:'Unlock all achievements',tier:5},
{id:'coins_10000',name:'Coins 10000',desc:'Have 10000 coins',tier:5},
{id:'highscore_500',name:'High Score 500',desc:'Reach high score 500',tier:5},
{id:'perfects_1000',name:'1000 Perfects',desc:'Get 1000 Perfects total',tier:5},
{id:'bombs_50',name:'Bomb Legend',desc:'Use 50 bombs total',tier:5},
{id:'tnts_50',name:'TNT Legend',desc:'Trigger 50 TNTs total',tier:5},
{id:'frenzy_100',name:'Frenzy 100',desc:'Score 100 in Frenzy',tier:5},
{id:'blast_100',name:'Blast 100',desc:'Blast 100 blocks in one blast',tier:5}];
ACHIEVEMENTS.push(...ACHIEVEMENTS2);
const ACHIEVEMENT_MAP={};
ACHIEVEMENTS.forEach(a=>ACHIEVEMENT_MAP[a.id]=a);
let achStats={
  totalPerfects:0,totalMisses:0,totalBlocks:0,totalBombs:0,totalTNT:0,
  totalFrenzyHits:0,totalBlastHits:0,totalCoinsEarned:0,
  maxSpeed:0,maxStreakEver:0,maxTowerEver:0,maxScoreEver:0,
  frenzyMaxStreak:0,blastCount:0,frenzyCount:0,
  themesOwned:0,shapesOwned:0,trailsOwned:0,cutsOwned:0,aurasOwned:0,framesOwned:0,
  upgradesMaxed:0,heartsUsed:0,magnetsUsed:0,slowsUsed:0,
  runPerfects:0,runMisses:0,runBlocks:0,runStreak:0
};
let unlockedAch=new Set();
try{const s=localStorage.getItem('stack3d_achievements');if(s)unlockedAch=new Set(JSON.parse(s));}catch(e){}
let achToastQueue=[];
let achToastActive=false;
function saveAch(){try{localStorage.setItem('stack3d_achievements',JSON.stringify([...unlockedAch]));}catch(e){}}
function showAchToast(ach){
  achToastQueue.push(ach);
  if(!achToastActive)processAchToast();
}
function processAchToast(){
  if(!achToastQueue.length){achToastActive=false;return;}
  achToastActive=true;
  const ach=achToastQueue.shift();
  const el=document.createElement('div');
  el.className='ach-toast';
  el.innerHTML='<div class="ach-toast-name">🏆 '+ach.name+'</div><div class="ach-toast-desc">'+ach.desc+'</div>';
  document.body.appendChild(el);
  setTimeout(()=>{el.classList.add('ach-toast-out');setTimeout(()=>{el.remove();processAchToast();},400);},3000);
}
function unlockAch(id){
  if(unlockedAch.has(id))return;
  const ach=ACHIEVEMENT_MAP[id];
  if(!ach)return;
  unlockedAch.add(id);
  saveAch();
  showAchToast(ach);
  if(unlockedAch.size===ACHIEVEMENTS.length)unlockAch('all_achievements');
}
ACHIEVEMENTS.push(...ACHIEVEMENTS2);
const ACHIEVEMENT_MAP={};
ACHIEVEMENTS.forEach(a=>ACHIEVEMENT_MAP[a.id]=a);
{id:'blast_first',name:'Blast First',desc:'Complete a Color Blast',tier:2},
{id:'blast_10',name:'Blast 10',desc:'Blast 10 blocks in one blast',tier:2},
{id:'magnet_master',name:'Magnet Master',desc:'Use magnet 3 times',tier:2},
{id:'slow_motion',name:'Slow Motion',desc:'Use slow-mo 3 times',tier:2},
function checkAch(){
  const s=achStats;
  if(s.runBlocks>=1)unlockAch('first_tap');
  if(s.runPerfects>=1)unlockAch('first_perfect');
  if(s.runMisses>=1)unlockAch('first_miss');
  if(s.heartsUsed>=1)unlockAch('second_chance');
  if(s.totalCoinsEarned>=1)unlockAch('first_coin');
  if(s.runStreak>=3)unlockAch('streak_3');
  if(s.runStreak>=5)unlockAch('streak_5');
  if(s.maxSpeed>=0.30)unlockAch('speed_030');
  if(s.maxTowerEver>=10)unlockAch('tower_10');
  if(s.maxTowerEver>=20)unlockAch('tower_20');
  if(s.totalCoinsEarned>=50)unlockAch('coins_50');
  if(s.totalBombs>=1)unlockAch('first_bomb');
  if(s.totalTNT>=1)unlockAch('first_tnt');
  if(s.runPerfects>=10)unlockAch('perfect_10');
  if(s.runPerfects>=25)unlockAch('perfect_25');
  if(s.runStreak>=10)unlockAch('streak_10');
  if(s.runStreak>=20)unlockAch('streak_20');
  if(s.runBlocks>=20&&s.runMisses===0)unlockAch('no_miss_20');
  if(s.maxScoreEver>=25)unlockAch('score_25');
  if(s.maxScoreEver>=50)unlockAch('score_50');
  if(s.totalCoinsEarned>=100)unlockAch('coins_100');
  if(s.totalCoinsEarned>=250)unlockAch('coins_250');
  if(s.maxTowerEver>=30)unlockAch('tower_30');
  if(s.maxTowerEver>=50)unlockAch('tower_50');
  if(s.totalBombs>=5)unlockAch('bomb_master');
  if(s.totalTNT>=5)unlockAch('tnt_master');
  if(s.frenzyCount>=1)unlockAch('frenzy_first');
  if(s.totalFrenzyHits>=10)unlockAch('frenzy_10');
  if(s.blastCount>=1)unlockAch('blast_first');
  if(s.totalBlastHits>=10)unlockAch('blast_10');
  if(s.magnetsUsed>=3)unlockAch('magnet_master');
  if(s.slowsUsed>=3)unlockAch('slow_motion');
  if(s.heartsUsed>=3)unlockAch('heart_saver');
  if(s.maxScoreEver>=75)unlockAch('score_75');
  if(s.maxScoreEver>=100)unlockAch('score_100');
  if(s.maxScoreEver>=150)unlockAch('score_150');
  if(s.maxScoreEver>=200)unlockAch('score_200');
  if(s.runStreak>=30)unlockAch('streak_30');
  if(s.runStreak>=50)unlockAch('streak_50');
  if(s.totalCoinsEarned>=500)unlockAch('coins_500');
  if(s.totalCoinsEarned>=1000)unlockAch('coins_1000');
  if(s.maxTowerEver>=75)unlockAch('tower_75');
  if(s.maxTowerEver>=100)unlockAch('tower_100');
  if(s.frenzyMaxStreak>=5)unlockAch('frenzy_streak_5');
  if(s.frenzyMaxStreak>=10)unlockAch('frenzy_streak_10');
  if(s.blastCount>=5)unlockAch('blast_streak_5');
  if(s.runBlocks>=25&&s.runMisses===0)unlockAch('perfect_run_25');
  if(s.themesOwned>=4)unlockAch('theme_all');
  if(s.shapesOwned>=4)unlockAch('shape_all');
  if(s.trailsOwned>=6)unlockAch('trail_all');
  if(s.cutsOwned>=4)unlockAch('cut_all');
  if(s.aurasOwned>=4)unlockAch('aura_all');
  if(s.framesOwned>=4)unlockAch('frame_all');
  if(s.upgradesMaxed>=3)unlockAch('upgrade_tol_max');
  if(s.runBlocks>=50&&s.runMisses===0)unlockAch('no_miss_50');
  if(s.totalBombs>=10)unlockAch('bomb_10');
  if(s.totalTNT>=10)unlockAch('tnt_10');
  if(s.maxScoreEver>=250)unlockAch('score_250');
  if(s.maxScoreEver>=300)unlockAch('score_300');
  if(s.maxScoreEver>=400)unlockAch('score_400');
  if(s.runStreak>=75)unlockAch('streak_75');
  if(s.runStreak>=100)unlockAch('streak_100');
  if(s.maxTowerEver>=150)unlockAch('tower_150');
  if(s.maxTowerEver>=200)unlockAch('tower_200');
  if(s.totalCoinsEarned>=2500)unlockAch('coins_2500');
  if(s.totalCoinsEarned>=5000)unlockAch('coins_5000');
  if(s.totalFrenzyHits>=25)unlockAch('frenzy_25');
  if(s.totalFrenzyHits>=50)unlockAch('frenzy_50');
  if(s.totalBlastHits>=25)unlockAch('blast_25');
  if(s.totalBlastHits>=50)unlockAch('blast_50');
  if(s.runBlocks>=50&&s.runMisses===0)unlockAch('perfect_run_50');
  if(s.runBlocks>=75&&s.runMisses===0)unlockAch('perfect_run_75');
  if(s.runBlocks>=100&&s.runMisses===0)unlockAch('perfect_run_100');
  if(s.maxSpeed>=0.50)unlockAch('speed_050');
  if(s.maxSpeed>=0.75)unlockAch('speed_075');
  if(s.totalBombs>=25)unlockAch('bomb_25');
  if(s.totalTNT>=25)unlockAch('tnt_25');
  if(s.maxScoreEver>=500)unlockAch('score_500');
  if(s.runStreak>=150)unlockAch('streak_150');
  if(s.maxTowerEver>=300)unlockAch('tower_300');
  if(s.runBlocks>=150&&s.runMisses===0)unlockAch('perfect_run_150');
  if(s.totalCoinsEarned>=10000)unlockAch('coins_10000');
  if(s.maxScoreEver>=500)unlockAch('highscore_500');
  if(s.totalPerfects>=1000)unlockAch('perfects_1000');
  if(s.totalBombs>=50)unlockAch('bombs_50');
  if(s.totalTNT>=50)unlockAch('tnts_50');
  if(s.totalFrenzyHits>=100)unlockAch('frenzy_100');
  if(s.totalBlastHits>=100)unlockAch('blast_100');
}
function openAchievements(){
  const v=document.getElementById('achievements');
  if(v)v.style.display='flex';
  const cb=document.getElementById('ach-close');
  if(cb&&!cb._bound){cb._bound=true;cb.onclick=e=>{e.stopPropagation();closeAchievements();};}
  renderAchievements();
  const cc=document.getElementById('ach-count');
  if(cc)cc.textContent='('+unlockedAch.size+'/'+ACHIEVEMENTS.length+')';
}
function closeAchievements(){
  const v=document.getElementById('achievements');
  if(v)v.style.display='none';
}
function renderAchievements(){
  const g=document.getElementById('ach-grid');
  if(!g)return;
  g.innerHTML=ACHIEVEMENTS.map(a=>{
    const u=unlockedAch.has(a.id);
    return '<div class="ach-card '+(u?'unlocked':'locked')+'"><div class="ach-icon">'+(u?'🏆':'🔒')+'</div><div class="ach-name">'+a.name+'</div><div class="ach-desc">'+a.desc+'</div></div>';
  }).join('');
}
{id:'heart_saver',name:'Heart Saver',desc:'Survive 3 misses with hearts',tier:2}];