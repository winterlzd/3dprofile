export const GITHUB = 'https://github.com/winterlzd';
export const YOUTUBE = 'https://www.youtube.com/@%E5%88%98%E6%8C%AF%E5%86%AC-x7w';

// Verified against the public GitHub API on 2026-10-09. Only fork:false repositories.
export const projects = [
  { slug: 'openSolid', name: 'openSolid', description: 'openSolidDesc', category: 'cadCategory', tags: ['Swift', 'OCCT', 'macOS'], visual: 'cad', color: 'sage' },
  { slug: 'animatrix', name: 'AniMatrix', description: 'aniDesc', category: 'aniCategory', tags: ['SwiftUI', 'Pixel art', 'macOS'], visual: 'matrix', color: 'charcoal' },
  { slug: 'RemoteCar_wifi', name: 'RemoteCar Wi-Fi', description: 'carDesc', category: 'carCategory', tags: ['C / C++', 'STM32', 'RP2350'], visual: 'car', color: 'sand' },
  { slug: 'STM32LearningProjects', name: 'STM32 Lab', description: 'stmDesc', category: 'stmCategory', tags: ['C', 'STM32', 'OLED'], visual: 'chip', color: 'sage' },
  { slug: 'Docker-ROS2Lyrical_arm64-desktop-full-for-macOS', name: 'ROS 2 on Mac', description: 'rosDesc', category: 'rosCategory', tags: ['Docker', 'ROS 2', 'ARM64'], visual: 'ros', color: 'sand' },
  { slug: 'dongdong', name: 'dongdong', description: 'dongDesc', category: 'dongCategory', tags: ['Python', 'API', '2022'], visual: 'chat', color: 'charcoal' },
];

export const icons = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17 17 7M7 7h10v10"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.82.09-.64.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.58 9.58 0 0 1 5 0c1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7.5a3 3 0 0 0-2.1-2.1C18 5 12 5 12 5s-6 0-7.9.4A3 3 0 0 0 2 7.5a31 31 0 0 0 0 9A3 3 0 0 0 4.1 18.6C6 19 12 19 12 19s6 0 7.9-.4a3 3 0 0 0 2.1-2.1 31 31 0 0 0 0-9ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/></svg>',
  chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5m-9 5L3 7m9 5v10"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></svg>',
};

const text = (key, tag = 'span', extra = '') => `<${tag} data-i18n="${key}" ${extra}></${tag}>`;
const link = (url, html, className = '') => `<a class="${className}" href="${url}" target="_blank" rel="noopener noreferrer">${html}</a>`;

function projectVisual(type) {
  if (type === 'cad') return `<svg class="cad-art" viewBox="0 0 400 190" fill="none"><g stroke="currentColor" stroke-width="1.2"><path d="m114 92 87-48 88 48-88 51-87-51Z"/><path d="m114 92 0 40 87 51 88-51V92M201 143v40"/><path d="m156 69 0-23 45-26 45 26v23m-90-23 45 26 45-26m-45 26v47"/><ellipse cx="201" cy="112" rx="23" ry="13"/><path stroke-dasharray="4 5" opacity=".5" d="M201 4v181M88 136l227-130M89 6l227 129"/><path d="m310 94 0 51m-7-43 7-8 7 0m-7 51-7-1 7-7M112 153l85 48m-85-55v13m85 37v12"/></g><text x="320" y="126" font-size="10" font-family="monospace" fill="currentColor">40.00</text></svg>`;
  if (type === 'matrix') {
    const pixel = [
      '0000000000000000', '0000000000000000', '0001100000011000', '0011110000111100',
      '0111111001111110', '0111111111111110', '0111111111111110', '0011111111111100',
      '0001111111111000', '0000111111110000', '0000011111100000', '0000001111000000',
      '0000000110000000', '0000000000000000', '0000000000000000', '0000000000000000',
    ];
    return `<div class="dot-matrix">${pixel.flatMap(row => [...row].map(value => `<i class="${value === '1' ? 'lit' : ''}"></i>`)).join('')}</div><div class="matrix-code mono">0x0180, 0x03C0, 0x07E0</div>`;
  }
  if (type === 'car') return `<svg class="car-art" viewBox="0 0 400 190" fill="none" stroke="currentColor" stroke-width="1.4"><g transform="translate(92 18)"><rect x="32" y="20" width="136" height="122" rx="14"/><rect x="8" y="50" width="24" height="67" rx="8"/><rect x="168" y="50" width="24" height="67" rx="8"/><rect x="63" y="45" width="74" height="54" rx="5"/><path d="M83 45v54m10-54v54m10-54v54m10-54v54m10-54v54M72 53h57m-57 9h57m-57 9h57m-57 9h57m-57 9h57" opacity=".4"/><circle cx="100" cy="119" r="9"/><path d="M97 19v-7m-11 0a19 19 0 0 1 28 0m-35-7a29 29 0 0 1 42 0"/><path d="M43 34h8m-4-4v8m106 92h8m-4-4v8"/><path stroke-dasharray="4 5" opacity=".35" d="M100-2v164M-9 81h214"/></g><path d="m319 53 0 75m-7-69 7-6 7 6m-14 63 7 6 7-6" opacity=".5"/></svg>`;
  if (type === 'chip') return `<div class="chip-art"><div class="chip-pins top"></div><div class="chip-pins bottom"></div><div class="chip-pins left"></div><div class="chip-pins right"></div><strong class="mono">STM32</strong><span class="mono">F103C8T6</span><i></i></div>`;
  if (type === 'ros') return `<div class="terminal-art mono"><div><i></i><i></i><i></i></div><p><span>~</span> docker compose up</p><p class="terminal-muted">[+] Starting ros2-desktop</p><p><span>➜</span> ros2 run turtlesim</p><p class="terminal-cursor">_</p></div>`;
  return `<div class="chat-art"><span class="chat-bubble mono">Hello, world<span class="chat-spark">✳</span></span><span class="chat-response mono">你好，世界。<i></i></span></div>`;
}

export function buildContent() {
  const hero = `<section class="hero" aria-labelledby="hero-name"><div class="student-label"><span class="status-dot"></span>${text('student')}</div>${text('name', 'h1', 'id="hero-name"')}<div class="roman-name mono" data-i18n="nameRoman"></div>${text('headline', 'h2')}${text('intro', 'p', 'class="hero-intro"')}<div class="hero-actions"><button class="primary-button" data-view="work">${text('exploreWork')}${icons.arrow}</button><button class="text-button" data-view="about">${text('meetMe')}${icons.external}</button></div><div class="hero-school"><span class="school-mark">⌘</span><div>${text('universityShort', 'strong')}${text('classYear', 'span')}</div></div></section>`;
  const artifact = `<div class="artifact-caption"><div class="artifact-coordinates mono">FIG. 01 — CURIOSITY, IN THREE DIMENSIONS</div>${text('objectCaption', 'p')}${text('objectHint', 'span')}<div class="artifact-tags"><span>CODE</span><i>↔</i><span>HARDWARE</span><i>↔</i><span>DESIGN</span></div></div>`;
  const workHeading = `<div class="section-heading"><div>${text('workEyebrow', 'span', 'class="eyebrow"')}${text('workTitle', 'h2')}</div>${link(`${GITHUB}?tab=repositories&type=source`, `${text('viewAll')}${icons.external}`, 'subtle-link')}</div>`;
  const projectPanels = projects.map((p, i) => ({
    id: `project-${i}`, className: `project-card ${p.color}`, width: 398, height: 440,
    html: `<article aria-labelledby="project-title-${i}"><div class="project-visual ${p.visual}"><span class="project-index mono">0${i + 1}</span>${projectVisual(p.visual)}${text('illustrationNote', 'span', 'class="visual-caption"')}</div><div class="project-copy"><div class="project-category mono">${text(p.category)}${link(`${GITHUB}/${p.slug}`, icons.external, 'project-open')}</div><h3 id="project-title-${i}">${p.name}</h3>${text(p.description, 'p')}<div class="project-bottom"><div class="project-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>${link(`${GITHUB}/${p.slug}`, text('source'), 'source-link')}</div></div></article>`,
  }));
  const workFoot = `<div class="work-foot mono"><span>${text('workNote')} · <span>2026.10.09</span></span>${text('repoCount')}</div>`;
  const about = `<section class="about-card" aria-labelledby="about-title">${text('aboutEyebrow', 'span', 'class="eyebrow"')}${text('aboutTitle', 'h2', 'id="about-title"')}${text('aboutBody', 'p')}${text('aboutBody2', 'p')}<div class="about-signature"><span class="signature">Zhendong.</span><span class="tiny-rainbow" aria-label="Pride"></span></div></section>`;
  const skills = `<section class="skills-card">${text('learnTitle', 'h3')}<div class="skills-list">${[
    ['code', 'programming', 'programmingDesc'], ['chip', 'hardware', 'hardwareDesc'], ['cube', 'modeling', 'modelingDesc'], ['spark', 'systems', 'systemsDesc'],
  ].map(([icon, title, desc]) => `<div class="skill-row"><div class="skill-icon">${icons[icon]}</div><div>${text(title, 'h4')}${text(desc, 'p')}</div></div>`).join('')}</div></section>`;
  const journey = `<section class="journey-card"><div class="journey-top">${text('journeyTitle', 'h3')}<span class="mono">THE LEARNING NEVER STOPS</span></div><div class="journey-items">${[1,2,3].map(i => `<div class="journey-item"><div class="journey-dot"></div>${text(`journey${i}Time`, 'span', 'class="mono"')}${text(`journey${i}Title`, 'h4')}${text(`journey${i}Desc`, 'p')}</div>`).join('')}</div></section>`;
  const connect = `<section class="connect-card">${text('connectEyebrow', 'span', 'class="eyebrow"')}<div class="connect-layout"><div>${text('connectTitle', 'h2')}${text('connectDesc', 'p')}</div><div class="connect-links">${link(GITHUB, `${icons.github}<div><strong>GitHub</strong><span class="mono">@winterlzd</span></div>${icons.external}`, 'social-link')}${link(YOUTUBE, `${icons.youtube}<div><strong>YouTube</strong><span class="mono">@刘振冬-x7w</span></div>${icons.external}`, 'social-link')}</div></div></section>`;
  const footer = `<footer class="scene-footer"><span class="footer-brand">zd.</span>${text('footerNote')}<span class="footer-pride"><span class="tiny-rainbow"></span>${text('pride')}</span><span class="mono">© 2026</span></footer>`;
  return [
    {id:'hero', html:hero, width:730, height:590, x:-265, y:575, z:16, className:'hero-panel'},
    {id:'artifact', html:artifact, width:480, height:155, x:415, y:380, z:24, className:'artifact-panel'},
    {id:'work-heading',html:workHeading,width:1250,height:82,x:0,y:195,z:4,className:'heading-panel'},
    ...projectPanels.map((p,i) => ({...p,x:(i%3-1)*426,y:-100-Math.floor(i/3)*468,z:[12,28,6,18,6,24][i]})),
    {id:'work-foot',html:workFoot,width:1250,height:38,x:0,y:-828,z:4,className:'foot-panel'},
    {id:'about',html:about,width:620,height:620,x:-315,y:-1190,z:18,className:'about-panel'},
    {id:'skills',html:skills,width:602,height:620,x:324,y:-1190,z:4,className:'skills-panel'},
    {id:'journey',html:journey,width:1250,height:282,x:0,y:-1665,z:14,className:'journey-panel'},
    {id:'connect',html:connect,width:1250,height:340,x:0,y:-2010,z:20,className:'connect-panel'},
    {id:'footer',html:footer,width:1250,height:70,x:0,y:-2250,z:4,className:'footer-panel'},
  ];
}
