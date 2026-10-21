// === ACHIEVEMENTS SYSTEM (minimal, no crash) ===
const ACHIEVEMENTS=[];
const ACHIEVEMENT_MAP={};
let achStats={totalPerfects:0};
let unlockedAch=new Set();
function saveAch(){}
function showAchToast(a){}
function unlockAch(id){}
function checkAch(){}
function openAchievements(){var v=document.getElementById('achievements');if(v)v.style.display='flex';var cb=document.getElementById('ach-close');if(cb&&!cb._bound){cb._bound=true;cb.onclick=function(e){e.stopPropagation();closeAchievements();};}}
function closeAchievements(){var v=document.getElementById('achievements');if(v)v.style.display='none';}
function renderAchievements(){}