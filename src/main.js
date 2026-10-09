import './style.css';
import { PortfolioScene } from './scene.js';
import { applyLanguage, detectLanguage, readPreference, translations, writePreference } from './i18n.js';

const storedLanguage=readPreference('zd-language','');
let language=storedLanguage in translations?storedLanguage:detectLanguage(navigator.languages || [navigator.language]);
let copy=translations[language];
let theme=readPreference('zd-theme','system');
if(!['system','light','dark'].includes(theme)) theme='system';
const systemTheme=matchMedia('(prefers-color-scheme: dark)');
const themeIcons={
  system:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>',
  light:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>',
  dark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.5 14a9 9 0 0 1-10.5-10.5A9 9 0 1 0 20.5 14Z"/></svg>',
};

function updateSceneLabel(view) {
  document.querySelectorAll('.navigation [data-view]').forEach(button=>{
    button.classList.toggle('active',button.dataset.view===view);
    if(button.dataset.view===view) button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });
  document.getElementById('scene-label').textContent=copy[`${view}Label`] || copy.homeLabel;
  document.querySelector('.mobile-project-controls')?.classList.toggle('visible',view==='work'||view==='about'||(view==='home'&&matchMedia('(max-width: 600px)').matches));
}

const scene=new PortfolioScene(updateSceneLabel);

const mobileControls=document.createElement('div');
mobileControls.className='mobile-project-controls';
mobileControls.innerHTML='<button id="prev-project" data-i18n-title="previousObject" aria-label="Previous object">←</button><span id="object-page" class="mono">01 / 06</span><button id="next-project" data-i18n-title="nextObject" aria-label="Next object">→</button>';
document.body.appendChild(mobileControls);
document.getElementById('prev-project').addEventListener('click',()=>scene.nextProject(-1));
document.getElementById('next-project').addEventListener('click',()=>scene.nextProject(1));

function updateLanguage() {
  copy=applyLanguage(language);
  for(const panel of scene.panels) applyLanguage(language,panel.el);
  scene.setLanguage(language);
  document.getElementById('language').value=language;
  document.querySelector('.interaction-hint [data-i18n]').textContent=copy[matchMedia('(pointer: coarse)').matches?'touchHint':'hint'];
  updateTheme();updateSceneLabel(scene.activeView);
}

function updateTheme() {
  const effective=theme==='system'?(systemTheme.matches?'dark':'light'):theme;
  document.documentElement.dataset.theme=effective;
  const button=document.getElementById('theme');
  button.innerHTML=themeIcons[theme];
  button.title=copy[`theme${theme[0].toUpperCase()+theme.slice(1)}`];
  button.setAttribute('aria-label',button.title);
  document.querySelector('meta[name="theme-color"]').content=effective==='dark'?'#171d19':'#f2f1eb';
  scene.updateTheme();
}

updateLanguage();
document.getElementById('language').addEventListener('change',e=>{
  language=e.target.value;writePreference('zd-language',language);updateLanguage();
});
document.getElementById('theme').addEventListener('click',()=>{
  theme={system:'light',light:'dark',dark:'system'}[theme];
  writePreference('zd-theme',theme);updateTheme();
});
systemTheme.addEventListener('change',()=>{if(theme==='system')updateTheme();});

document.addEventListener('click',e=>{
  const button=e.target.closest('[data-view]');
  if(button) scene.focusView(button.dataset.view);
});
document.getElementById('home-view').addEventListener('click',()=>scene.focusView('home'));
document.getElementById('zoom-in').addEventListener('click',()=>scene.zoom(.85));
document.getElementById('zoom-out').addEventListener('click',()=>scene.zoom(1.18));
document.getElementById('overview').addEventListener('click',()=>scene.focusView('overview'));
document.getElementById('reset-layout').addEventListener('click',()=>scene.resetLayout());
document.getElementById('deselect-object').addEventListener('click',()=>scene.select(null));
document.getElementById('object-depth').addEventListener('input',e=>scene.adjustDepth(e.target.value));
document.getElementById('rotate-left').addEventListener('click',()=>scene.rotateSelected(-1));
document.getElementById('rotate-right').addEventListener('click',()=>scene.rotateSelected(1));
document.getElementById('reset-object').addEventListener('click',()=>scene.resetSelected());

const guide=document.getElementById('guide'),guideButton=document.getElementById('help-toggle');
function showGuide(show) {
  guide.hidden=!show;guideButton.setAttribute('aria-expanded',String(show));
  if(show)document.getElementById('guide-close').focus();
  else guideButton.focus();
}
guideButton.addEventListener('click',()=>showGuide(guide.hidden));
document.getElementById('guide-close').addEventListener('click',()=>showGuide(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!guide.hidden)showGuide(false);});

const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false});
function updateClock(){document.getElementById('beijing-time').textContent=clock.format(new Date());}
updateClock();
const clockInterval=setInterval(updateClock,30000);
window.addEventListener('pagehide',()=>{clearInterval(clockInterval);scene.dispose();},{once:true});
