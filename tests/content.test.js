import test from 'node:test';
import assert from 'node:assert/strict';
import { translations, detectLanguage } from '../src/i18n.js';
import { buildContent, projects } from '../src/content.js';

test('system language detection handles regional variants and unsupported languages',()=>{
  assert.equal(detectLanguage(['zh-TW','en-US']),'zh');
  assert.equal(detectLanguage(['ja-JP','en-US']),'ja');
  assert.equal(detectLanguage(['de-DE','en-GB']),'en');
  assert.equal(detectLanguage(['fr-FR']),'en');
});

test('all three translations cover every content and interface key',()=>{
  const expected=Object.keys(translations.zh).sort();
  for(const [lang,copy] of Object.entries(translations)) {
    assert.deepEqual(Object.keys(copy).sort(),expected,lang);
    assert.ok(Object.values(copy).every(s=>typeof s==='string'&&s.trim().length>0));
  }
  const markup=buildContent().map(p=>p.html).join('');
  for(const match of markup.matchAll(/data-i18n="([^"]+)"/g)) assert.ok(match[1] in translations.zh,match[1]);
});

test('project list contains exactly the six verified non-fork repositories',()=>{
  assert.deepEqual(projects.map(p=>p.slug).sort(),[
    'animatrix','dongdong','Docker-ROS2Lyrical_arm64-desktop-full-for-macOS','openSolid','RemoteCar_wifi','STM32LearningProjects',
  ].sort());
  assert.ok(!projects.some(p=>['one-ip','chat-on-steroids','school-auto-submitter'].includes(p.slug)));
});
