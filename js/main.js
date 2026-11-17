/* Tammam Bettayeb · portfolio
 *
 * One page with hash routes:  ""  → Home   ·   "#<project id>" → that project's page.
 * "#top", "#meet", "#work" and "#contact" are places on Home; any other hash falls back to Home.
 * All content comes from data/projects.json. This file adds only headings, labels and the two headlines (COPY).
 *
 * Sections: config · copy · helpers · data · devices · home · project page · loop film ·
 *           spotlight · demo films · router · events · boot
 */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- config */

  const CONFIG = {
    dataUrl: 'data/projects.json',
    media: 'assets/media/',
    // Below this width a demo film plays its square cut instead of the 16:9 one.
    phoneQuery: '(max-width: 640px)',
    // Below this width Home uses the phone layout; its hero film is a phone cut ('vertical' or 'code').
    phoneLayoutQuery: '(max-width: 700px)',
    phoneHero: 'code',
    // Device demos that may play at once; the oldest stops first.
    maxPlaying: 2,
  };

  /* ------------------------------------------------------------------ copy */

  const COPY = {
    headline: '<span class="l1">Hi, I’m Tammam.</span> <em>I build what your business needs.</em>',
    hireLine: '<span class="l1">You dream it,</span> <em>I build it.</em>',
    cta: 'Tell me your idea',
    ctaNote: ' (opens my Upwork profile)',
    seeWork: 'See the work',
    seeProject: 'See the project',
    allWork: 'All work',
    proofJss: '100% Job Success',
    proofRate: '5.0',
    proofLabel: 'Upwork profile: 100% Job Success, rated 5.0 out of 5',
    loopLabel: 'What I build: websites, bots and data pipelines, AI solutions. A silent looping film of my projects.',
    reviews: 'What clients say',
    story: [['problem', 'The need'], ['built', 'What I built'], ['hard', 'The hard part'], ['outcome', 'The result']],
    voice: 'What the client said',
    stack: 'Built with',
    newTab: ' (opens in a new tab)',
    copy: 'Copy',
    copied: 'Copied',
    selected: 'Selected',
  };

  /* --------------------------------------------------------------- helpers */

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const media = (file) => CONFIG.media + file;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduce.matches;
  const smooth = () => (still() ? 'auto' : 'smooth');
  const phoneScreen = matchMedia(CONFIG.phoneQuery);
  const phoneLayout = matchMedia(CONFIG.phoneLayoutQuery);
  const bar = $('.bar');
  const barH = () => bar.getBoundingClientRect().height;
  const playSafe = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };

  const svg = (d, fill = true) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${fill
    ? `<path fill="currentColor" d="${d}"/>`
    : `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`}</svg>`;
  const ICON = {
    down: svg('M6 9l6 6 6-6', false),
    left: svg('M19 12H5M11 6l-6 6 6 6', false),
    soundOff: svg('M11 5L6 9H3v6h3l5 4V5zM22 9l-6 6M16 9l6 6', false),
    soundOn: svg('M11 5L6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13', false),
    full: svg('M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5', false),
    play: svg('M8 5v14l11-7z'),
    pause: svg('M7 5h4v14H7zM13 5h4v14h-4z'),
  };
  // The Upwork Job Success badge: a ring with a crown (colour from the --jss token).
  const JSS = '<svg class="jss" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="19"/>'
    + '<svg x="9" y="9" width="22" height="22" viewBox="0 0 24 24"><path d="M18.37 19.002H5.63v-1.867h12.74v1.867zm.02-3.736H5.608L3 8.314l4.992 1.664L12 5l4.008 4.978L21 8.314l-2.61 6.952z"/></svg></svg>';

  /* ------------------------------------------------------------------ data */

  const state = { data: null, view: null, current: null, homeY: null, jump: null, homeTitle: document.title, homeDesc: '' };
  const D = () => state.data;

  function prepare(raw) {
    const projects = raw.projects.map((p) => Object.assign({}, p, {
      name: p.name || p.title,
      gallery: p.gallery || [],
      links: p.links || [],
      screens: p.screens || {},
      stackFlat: [...new Set((p.stack || []).flatMap((group) => group.items))],
    }));
    const byId = new Map(projects.map((p) => [p.id, p]));
    const acts = (raw.acts || []).map((a) => Object.assign({}, a, { projects: a.projects.map((id) => byId.get(id)).filter(Boolean) }));
    acts.forEach((a) => a.projects.forEach((p) => { p.act = a; }));
    const contact = raw.person.contact || [];
    const upwork = contact.find((c) => /upwork\.com/.test(c.url));
    return {
      person: raw.person,
      loop: raw.loop,
      acts,
      projects,
      byId,
      // Next and Previous follow the act order.
      order: acts.flatMap((a) => a.projects),
      reviews: new Map((raw.reviews || []).map((r) => [r.id, r])),
      contact,
      upwork: upwork ? upwork.url : '#contact',
    };
  }

  /* --------------------------------------------------------------- devices */
  /*
   * Devices.forProject(p, play) builds the right device for one project from its `screens`:
   *   laptop (the clean demo recording, or a slideshow of `slides`) with an optional phone beside it,
   *   or two phones (`phones`) for a phone-only app.
   * play: 'inview' starts when 60% visible; 'manual' waits for Devices.play(root); 'none' stays still.
   * Videos load lazily, at most CONFIG.maxPlaying play at once, and with reduced motion nothing autoplays.
   */
  const Devices = (() => {
    const playing = new Set();
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const img = (src, alt) => { const i = el('img'); i.src = src; i.alt = alt || ''; i.loading = 'lazy'; i.decoding = 'async'; return i; };

    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const s = en.target;
      if (en.intersectionRatio >= 0.6) { if (!still() && !s.manual) start(s); }
      else if (s.classList.contains('dv-playing')) stop(s);
    }), { threshold: [0, 0.6] });
    const slideIO = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) startSlides(en.target); else stopSlides(en.target);
    }), { threshold: 0.3 });

    function screen({ src, poster, label, play = 'inview', slides = null, bg = null }) {
      const s = el('div', 'dv-screen');
      if (slides && slides.length) {
        s.classList.add('dv-slides');
        if (bg) s.style.background = bg;
        slides.forEach((u, i) => { const im = img(u, i ? '' : label); if (!i) im.classList.add('dv-on'); s.appendChild(im); });
        if (slides.length > 1 && play !== 'none') { s.slides = true; if (play === 'inview') slideIO.observe(s); }
        return s;
      }
      s.appendChild(img(poster, label));
      if (src && play !== 'none') {
        const v = el('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
        ['muted', 'playsinline'].forEach((a) => v.setAttribute(a, ''));
        v.setAttribute('aria-hidden', 'true');
        v.dataset.src = src;
        s.appendChild(v);
        const b = el('button', 'dv-play', ICON.play);
        b.type = 'button';
        b.setAttribute('aria-label', `Play demo: ${label}`);
        b.addEventListener('click', (e) => { e.preventDefault(); s.manual = true; if (s.classList.contains('dv-playing')) stop(s); else start(s); });
        s.appendChild(b);
        if (play === 'inview') io.observe(s);
      }
      return s;
    }

    function start(s) {
      const v = s.querySelector('video');
      if (!v) { if (s.slides) startSlides(s); return; }
      if (playing.has(s)) return;
      if (playing.size >= CONFIG.maxPlaying) stop(playing.values().next().value);
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      playSafe(v);
      playing.add(s);
      s.classList.add('dv-playing');
      const b = s.querySelector('.dv-play');
      if (b) { b.innerHTML = ICON.pause; b.setAttribute('aria-label', 'Pause demo'); }
    }
    function stop(s) {
      if (!s) return;
      if (s.slides) stopSlides(s);
      const v = s.querySelector('video');
      if (v) v.pause();
      playing.delete(s);
      s.classList.remove('dv-playing');
      const b = s.querySelector('.dv-play');
      if (b) { b.innerHTML = ICON.play; b.setAttribute('aria-label', 'Play demo'); }
    }
    // Slideshows advance every 3 s while in view (never with reduced motion).
    function startSlides(s) {
      if (s.timer || still()) return;
      s.timer = setInterval(() => {
        if (!s.isConnected) { stopSlides(s); return; }
        const ims = [...s.querySelectorAll('img')], i = ims.findIndex((x) => x.classList.contains('dv-on'));
        ims[i].classList.remove('dv-on');
        ims[(i + 1) % ims.length].classList.add('dv-on');
      }, 3000);
    }
    function stopSlides(s) { if (s.timer) { clearInterval(s.timer); s.timer = null; } }

    const wrap = (cls, inner) => { const d = el('div', `dv ${cls}`); inner.forEach((x) => d.appendChild(x)); return d; };
    const laptop = (o) => { const lid = el('div', 'dv-lid'); lid.appendChild(screen(o)); return wrap('dv-laptop', [lid, el('div', 'dv-base')]); };
    const phone = (o) => wrap('dv-phone', [el('div', 'dv-island'), screen(o)]);

    function forProject(p, play = 'inview') {
      const s = p.screens, label = p.title;
      if (s.phones) {
        const g = el('div', 'dv-group dv-phones');
        s.phones.slice(0, 2).forEach((f, i) => g.appendChild(phone({ poster: media(f), label: i ? '' : label, play: 'none' })));
        return g;
      }
      const lap = s.laptop ? { src: media(s.laptop), poster: media(p.hero), label, play }
        : s.slides ? { slides: s.slides.map(media), bg: s.slideBg, label, play }
          : { poster: media(p.hero), label, play: 'none' };
      const g = el('div', 'dv-group');
      g.appendChild(laptop(lap));
      if (s.phone) {
        g.appendChild(phone(s.phoneDemo
          ? { src: media(s.phoneDemo), poster: media(s.phone), label: `${label} on a phone`, play }
          : { poster: media(s.phone), label: `${label} on a phone`, play: 'none' }));
      }
      return g;
    }

    const screens = (root) => (root ? $$('.dv-screen', root) : []);
    return {
      forProject,
      play: (root) => screens(root).forEach((s) => { if (!still()) start(s); }),
      pause: (root) => screens(root).forEach((s) => { s.manual = false; stop(s); }),
      // Stop and forget every screen inside root, before it leaves the page.
      drop: (root) => screens(root).forEach((s) => { stop(s); io.unobserve(s); slideIO.unobserve(s); }),
      stopAll: () => [...playing].forEach(stop),
    };
  })();

  function mountDevices(root, play) {
    $$('[data-slot]', root).forEach((slot) => slot.appendChild(Devices.forProject(D().byId.get(slot.dataset.slot), play)));
  }

  /* ---------------------------------------------------------- shared parts */

  const proof = () => `<p class="proof"><a class="proof-a" href="${esc(D().upwork)}" target="_blank" rel="noopener" aria-label="${esc(COPY.proofLabel)}">
      <span class="proof-jss">${JSS}<b>${esc(COPY.proofJss)}</b></span>
      <span class="proof-rate"><span class="stars" aria-hidden="true">★★★★★</span><span><b>${esc(COPY.proofRate)}</b> on Upwork</span></span></a></p>`;

  // The main button opens his Upwork profile.
  const ctaBtn = () => `<a class="btn btn-primary btn-big" href="${esc(D().upwork)}" target="_blank" rel="noopener">${esc(COPY.cta)}<span class="sr">${esc(COPY.ctaNote)}</span></a>`;

  /** The approved strength line: before → after, one big figure, or a sentence. */
  function res(p) {
    const s = p.strength || {};
    if (s.before && s.after) {
      return `<p class="res"><span class="res-big" aria-label="from ${esc(s.before)} to ${esc(s.after)}"><s>${esc(s.before)}</s><span class="arr" aria-hidden="true">→</span>${esc(s.after)}</span><span class="res-label">${esc(s.label)}</span></p>`;
    }
    if (s.big) return `<p class="res"><span class="res-big${s.big.length > 7 ? ' long' : ''}">${esc(s.big)}</span><span class="res-label">${esc(s.label)}</span></p>`;
    return s.sentence ? `<p class="res res-sentence">${esc(s.sentence)}</p>` : '';
  }

  const reviewImg = (r, cls) => `<figure class="${cls}"><img src="${media(r.file)}" alt="${esc(r.alt)}" width="${r.width}" height="${r.height}" loading="lazy" decoding="async"></figure>`;

  /** The closing light band: headline, button, proof and the contact pills. */
  function hire(k) {
    return `<section class="hire sec" data-anchor="contact" aria-labelledby="${k}-hire-h">
      <div class="hire-in wrap"><h2 class="hire-h" id="${k}-hire-h">${COPY.hireLine}</h2>
        ${ctaBtn()}
        ${proof()}
        ${contactList(k)}</div></section>`;
  }

  // Email shows as text with a copy button (mail links don't reliably open a mail app).
  function contactList(k) {
    return `<ul class="contact" aria-label="Other ways to reach me">${D().contact.map((c) => (/^mailto:/.test(c.url)
      ? `<li class="contact-email"><span class="contact-k">${esc(c.label)}</span><span class="contact-v" id="${k}-email">${esc(c.text || c.url.slice(7))}</span>
          <button type="button" class="contact-copy" data-copy="${k}-email" aria-label="Copy my email address">${esc(COPY.copy)}</button><span class="sr" aria-live="polite"></span></li>`
      : `<li><a href="${esc(c.url)}" target="_blank" rel="noopener"><span class="contact-k">${esc(c.label)}</span><span class="contact-v">${esc(c.text || c.url)}</span><span class="sr">${esc(COPY.newTab)}</span></a></li>`)).join('')}
    </ul>`;
  }

  /* ------------------------------------------------------------------ home */

  function renderHome() {
    const d = D(), ph = d.person.photo;
    const home = $('#home');
    home.innerHTML = `
      ${heroHTML()}
      <section class="meet sec" data-anchor="meet" aria-labelledby="meet-h">
        <div class="meet-in wrap">
          <figure class="meet-photo"><div class="halo" aria-hidden="true"></div>
            <img src="${media(ph.file)}" alt="${esc(ph.alt)}" width="${ph.width}" height="${ph.height}" decoding="async"></figure>
          <div class="meet-text">
            <h1 class="headline" id="meet-h">${COPY.headline}</h1>
            ${proof()}
            <div class="ctas">${ctaBtn()}<a class="btn btn-ghost btn-big" href="#work" data-scroll="work">${esc(COPY.seeWork)} <span aria-hidden="true">↓</span></a></div>
          </div>
        </div></section>
      <div class="work" data-anchor="work">${d.acts.map(actHTML).join('')}</div>
      <section class="reviews sec" aria-labelledby="rev-h">
        <div class="wrap">
          <div class="rev-head"><h2 class="sec-h" id="rev-h">${esc(COPY.reviews)}</h2>${proof()}</div>
          <div class="rev-grid">${[...d.reviews.values()].map((r) => reviewImg(r, 'rev')).join('')}</div>
        </div></section>
      ${hire('home')}`;
    mountDevices(home, 'manual');
    setupLoop(home);
  }

  const actHTML = (a, i) => `<section class="act sec" aria-labelledby="act-${a.id}">
      <header class="act-head wrap"><h2 class="act-h" id="act-${a.id}"><span class="lead">${esc(a.lead)}</span> <span class="word">${esc(a.word)}</span></h2></header>
      <div class="sp wrap">${a.projects.map((p) => `
        <article class="sp-item" data-id="${p.id}"><div class="sp-dev" data-slot="${p.id}"></div>
          <div class="cap"><h3 class="p-title">${esc(p.name)}</h3>${res(p)}
            <a class="see" href="#${p.id}">${esc(COPY.seeProject)}<span aria-hidden="true">→</span><span class="sr">: ${esc(p.title)}</span></a></div></article>`).join('')}</div>
    </section>`;

  /* ---------------------------------------------------------- project page */

  /** A project page: the demo film across the screen, then the details, the client's words, the stack, the closing band. */
  function renderProject(p) {
    const page = $('#project');
    page.innerHTML = `
      <article class="pp" aria-labelledby="pp-title">
        <section class="pp-film sec" aria-label="${esc(p.title)}: demo film">${filmHTML(p)}</section>
        <section class="pp-hero sec"><div class="wrap">
          <a class="back" href="#work" data-back>${ICON.left}${esc(COPY.allWork)}</a>
          <h1 class="pp-title" id="pp-title" tabindex="-1">${esc(p.title)}</h1>
          ${res(p)}
          <p class="pp-one">${esc(p.oneliner)}</p>
        </div></section>
        ${voiceHTML(p)}
        <section class="pp-story sec" aria-label="The story"><div class="wrap story">${COPY.story.map(([key, label]) => {
          const text = p[key] || (key === 'outcome' ? p.result : '');
          return text ? `<div class="story-b"><h2 class="story-k">${esc(label)}</h2><p>${esc(text)}</p></div>` : '';
        }).join('')}</div></section>
        <section class="pp-built sec" aria-labelledby="pp-stack-h"><div class="wrap">
          <h2 class="pp-h" id="pp-stack-h">${esc(COPY.stack)}</h2>
          <ul class="pills">${p.stackFlat.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          ${p.links.length ? `<ul class="pp-links">${p.links.map((l) => `<li><a class="btn btn-ghost" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}<span aria-hidden="true">↗</span><span class="sr">${esc(COPY.newTab)}</span></a></li>`).join('')}</ul>` : ''}
        </div></section>
      </article>
      ${hire('pp')}`;
    $$('[data-film]', page).forEach(setupFilm);
  }

  /** The client's own words: the real review screenshots where there are some, else the text quote. */
  function voiceHTML(p) {
    const revs = (p.reviews || []).map((id) => D().reviews.get(id)).filter(Boolean);
    const body = revs.length ? `<div class="voice">${revs.map((r) => reviewImg(r, 'voice-rev')).join('')}</div>`
      : p.quote ? `<figure class="quote"><blockquote><p>“${esc(p.quote.text)}”</p></blockquote><figcaption>${esc(p.quote.source)}</figcaption></figure>` : '';
    return body ? `<section class="pp-voice sec" aria-labelledby="pp-voice-h"><div class="wrap">
        <h2 class="pp-h" id="pp-voice-h">${esc(COPY.voice)}</h2>${body}</div></section>` : '';
  }


  /* ------------------------------------------------------------- loop film */
  // Plays only while on screen; a small button pauses it; with reduced motion it starts paused.

  // Wide screens play the 16:9 film with its words in the picture. Phones play one of two cuts, set by
  // <html data-phone-hero>: "vertical" (a 9:16 cut, words in the picture) or "code" (the text-free cut in a
  // laptop, with the words and captions drawn here in sync with the film's clock, from loop.timeline).
  const phoneHero = () => document.documentElement.dataset.phoneHero || CONFIG.phoneHero;
  function loopVideo(cut) {
    const c = cut ? D().loop[cut] : D().loop;
    const sharp = (innerWidth * Math.min(devicePixelRatio || 1, 2)) > (cut === 'vertical' ? 760 : 1300);
    return `<video class="loop-v" muted loop playsinline${still() ? '' : ' autoplay'} preload="${still() ? 'none' : 'auto'}"
      poster="${media(c.poster)}" src="${media(sharp ? c.hd : c.sd)}" aria-label="${esc(COPY.loopLabel)}"></video>`;
  }
  function heroHTML() {
    const tail = `<a class="cue" href="#meet" data-scroll="meet" aria-label="Scroll down">${ICON.down}</a>
        <button type="button" class="loop-ctl" data-loopctl aria-label="Pause the film">${ICON.pause}</button>`;
    if (!phoneLayout.matches) {
      return `<section class="vhero sec" aria-label="What I build"><div class="loopbox pool">${loopVideo()}</div>${tail}</section>`;
    }
    if (phoneHero() === 'vertical') {
      return `<section class="vhero vhero-vert sec" aria-label="What I build"><div class="vert-box">${loopVideo('vertical')}</div>${tail}</section>`;
    }
    const tl = D().loop.timeline;
    return `<section class="vhero vhero-code sec" aria-label="What I build">
        <p class="vh-words"><span class="vh-lead">${esc(tl.lead)}</span><span class="vh-roll" data-roll aria-live="off"></span></p>
        <div class="clean-box">${loopVideo('clean')}</div>
        <p class="vh-cap" data-cap aria-hidden="true"></p>${tail}</section>`;
  }
  function refreshHero() {
    const home = $('#home'), old = $('.vhero', home);
    if (!old) return;
    if (wordsRaf) cancelAnimationFrame(wordsRaf);
    const tmp = document.createElement('div');
    tmp.innerHTML = heroHTML();
    old.replaceWith(tmp.firstElementChild);
    setupLoop(home);
  }

  /* The words and captions over the text-free cut, driven by the film's own clock. */
  let wordsRaf = 0;
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  function wordHTML(w) { return `<span class="vh-w">${esc(w.word)}${w.word2 ? `<br>${esc(w.word2)}` : ''}</span>`; }
  function syncWords(root) {
    const v = $('.vhero-code video.loop-v', root);
    if (!v) return;
    const tl = D().loop.timeline, L = tl.loop;
    const words = [Object.assign({ start: -1, duration: 0 }, tl.atStart)].concat(tl.words);
    const roll = $('[data-roll]', root), cap = $('[data-cap]', root);
    roll.innerHTML = `<span class="vh-a"></span><span class="vh-b"></span>`;
    const [a, b] = [...roll.children];
    let shown = '';
    const inSpan = (t, c) => { const len = ((c.out - c.in) % L + L) % L; const d = ((t - c.in) % L + L) % L; return d <= len + c.outDuration ? d : -1; };
    const tick = () => {
      if (!v.isConnected) return;
      const t = v.currentTime % L;
      let i = 0;
      words.forEach((w, k) => { if (w.start <= t) i = k; });
      const cur = words[i], prev = words[i - 1] || words[words.length - 1];
      const p = cur.duration ? Math.min(1, (t - cur.start) / cur.duration) : 1;
      const key = `${i}`;
      if (key !== shown) { a.innerHTML = wordHTML(prev); b.innerHTML = wordHTML(cur); shown = key; }
      const e = easeOut(p);
      a.style.transform = `translateY(${-e * 100}%)`; a.style.opacity = String(1 - e);
      b.style.transform = `translateY(${(1 - e) * 100}%)`; b.style.opacity = String(e);
      let c = null, d = -1;
      for (const x of tl.captions) { const dx = inSpan(t, x); if (dx >= 0) { c = x; d = dx; break; } }
      if (c) {
        const len = ((c.out - c.in) % L + L) % L;
        const fin = Math.min(1, d / c.inDuration), fout = d > len ? 1 - Math.min(1, (d - len) / c.outDuration) : 1;
        if (cap.textContent !== c.text) cap.textContent = c.text;
        cap.style.opacity = String(Math.min(fin, fout));
        cap.style.transform = `translateY(${(1 - easeOut(fin)) * 14}px)`;
      } else cap.style.opacity = '0';
      wordsRaf = requestAnimationFrame(tick);
    };
    tick();
  }
  function setupLoop(root) {
    const v = $('video.loop-v', root);
    if (!v) return;
    v.userPaused = still();
    new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && !v.userPaused) playSafe(v); else v.pause();
    }), { threshold: 0.2 }).observe(v);
    syncLoopCtl(v);
    syncWords(root);
  }
  function syncLoopCtl(v) {
    const b = $('[data-loopctl]', v.closest('.sec'));
    b.innerHTML = v.userPaused ? ICON.play : ICON.pause;
    b.setAttribute('aria-label', v.userPaused ? 'Play the film' : 'Pause the film');
  }

  /* ------------------------------------------------------------- spotlight */
  // The project nearest the middle of the screen lights up and plays; the others dim.

  let lit = null;
  function spotlight() {
    if (state.view !== 'home') return;
    const mid = (innerHeight + barH()) / 2;
    let best = null, bd = Infinity;
    $$('.sp-item', $('#home')).forEach((it) => {
      const r = it.getBoundingClientRect(), dist = Math.abs(r.top + r.height / 2 - mid);
      if (r.bottom > barH() && r.top < innerHeight && dist < bd) { bd = dist; best = it; }
    });
    if (best && bd > innerHeight * 0.5) best = null;
    if (best === lit) return;
    if (lit) { lit.classList.remove('lit'); Devices.pause(lit); }
    lit = best;
    if (lit) { lit.classList.add('lit'); Devices.play(lit); }
  }
  function unlight() {
    if (lit) lit.classList.remove('lit');
    lit = null;
  }

  /* ------------------------------------------------------------ demo films */
  // A project page opens on its demo film across the screen: the 16:9 cut on wide screens, the square cut on phones.
  // It starts muted (browsers only autoplay muted films); its own controls turn the sound on. Reduced motion: it waits.

  function filmCut(p) {
    if (p.film) {
      const square = phoneScreen.matches && p.film.square;
      return Object.assign({ square: !!square }, square ? p.film.square : p.film.wide);
    }
    return p.video ? { src: p.video, poster: p.hero, square: false } : null;
  }
  function filmHTML(p) {
    const cut = filmCut(p);
    if (!cut) return '';
    return `<figure class="film${cut.square ? ' square' : ''}" data-film="${p.id}">
        <video playsinline muted${still() ? '' : ' autoplay'} preload="${still() ? 'none' : 'auto'}" poster="${media(cut.poster)}" src="${media(cut.src)}" aria-label="${esc(p.title)}: demo film"></video>
        <button type="button" class="film-sound" data-film-sound>${ICON.soundOff}<span>Turn sound on</span></button>
        <div class="film-ctl">
          <button type="button" class="film-btn" data-film-play aria-label="Play">${ICON.play}</button>
          <span class="film-time" data-film-time>0:00</span>
          <input type="range" class="film-seek" data-film-seek min="0" max="1000" step="1" value="0" aria-label="Seek in the film">
          <span class="film-time" data-film-dur>0:00</span>
          <button type="button" class="film-btn" data-film-mute aria-label="Turn sound on">${ICON.soundOff}</button>
          <button type="button" class="film-btn" data-film-full aria-label="Full screen">${ICON.full}</button>
        </div>
      </figure>`;
  }

  // The film's own controls: play/pause, a seek bar, time, sound and full screen. They fade while it plays untouched.
  const clock = (t) => { t = Math.max(0, Math.floor(t || 0)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  function setupFilm(fig) {
    const v = $('video', fig), seek = $('[data-film-seek]', fig), play = $('[data-film-play]', fig), mute = $('[data-film-mute]', fig), sound = $('[data-film-sound]', fig);
    let idle = null;
    const wake = () => { fig.classList.remove('idle'); clearTimeout(idle); if (!v.paused) idle = setTimeout(() => fig.classList.add('idle'), 2200); };
    const syncPlay = () => {
      fig.classList.toggle('is-playing', !v.paused);
      play.innerHTML = v.paused ? ICON.play : ICON.pause;
      play.setAttribute('aria-label', v.paused ? 'Play' : 'Pause');
      wake();
    };
    const syncSound = () => {
      const off = v.muted || v.volume === 0;
      mute.innerHTML = off ? ICON.soundOff : ICON.soundOn;
      mute.setAttribute('aria-label', off ? 'Turn sound on' : 'Mute');
      sound.hidden = !off;
    };
    const syncTime = () => {
      const f = v.duration ? v.currentTime / v.duration : 0;
      seek.value = Math.round(f * 1000);
      fig.style.setProperty('--p', `${(f * 100).toFixed(2)}%`);
      $('[data-film-time]', fig).textContent = clock(v.currentTime);
    };
    v.addEventListener('loadedmetadata', () => { $('[data-film-dur]', fig).textContent = clock(v.duration); syncTime(); });
    v.addEventListener('timeupdate', syncTime);
    v.addEventListener('play', syncPlay);
    v.addEventListener('pause', syncPlay);
    v.addEventListener('volumechange', syncSound);
    v.addEventListener('click', () => (v.paused ? playSafe(v) : v.pause()));
    seek.addEventListener('input', () => { if (v.duration) v.currentTime = (seek.value / 1000) * v.duration; syncTime(); });
    play.addEventListener('click', () => (v.paused ? playSafe(v) : v.pause()));
    mute.addEventListener('click', () => { v.muted = !v.muted; if (!v.muted && v.volume === 0) v.volume = 1; });
    sound.addEventListener('click', () => { v.muted = false; if (v.volume === 0) v.volume = 1; if (v.paused) playSafe(v); });
    $('[data-film-full]', fig).addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (fig.requestFullscreen) fig.requestFullscreen().catch(() => {});
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
    ['pointermove', 'focusin', 'touchstart'].forEach((ev) => fig.addEventListener(ev, wake, { passive: true }));
    if (v.readyState >= 1) { $('[data-film-dur]', fig).textContent = clock(v.duration); syncTime(); }
    syncPlay();
    syncSound();
  }

  // When the screen crosses the phone width, a film still at its start swaps to the other cut.
  function swapFilms() {
    $$('[data-film]').forEach((fig) => {
      const v = $('video', fig);
      if (v && v.currentTime > 1) return;
      const tmp = document.createElement('div');
      tmp.innerHTML = filmHTML(D().byId.get(fig.dataset.film));
      const next = tmp.firstElementChild;
      fig.replaceWith(next);
      setupFilm(next);
    });
  }

  /* ---------------------------------------------------------------- router */

  const PLACES = new Set(['top', 'meet', 'work', 'contact']);

  function hashId() {
    try { return decodeURIComponent(location.hash.slice(1)); } catch (err) { return ''; }
  }

  /** The page y of a place in the view now showing, or null when this view has no such place. */
  function placeY(k) {
    const view = state.view === 'home' ? $('#home') : $('#project');
    if (k === 'top') return state.view === 'home' ? 0 : null;
    const el = $(`[data-anchor="${k}"]`, view);
    return el ? Math.max(0, el.getBoundingClientRect().top + scrollY - barH() + 1) : null;
  }

  function setDescription(text) { $('meta[name="description"]').setAttribute('content', text); }

  function route() {
    const id = hashId();
    const p = D().byId.get(id);
    if (p) showProject(p); else showHome(PLACES.has(id) ? id : '');
  }

  function showProject(p) {
    const first = state.view === null;
    if (state.view === 'home') { state.homeY = scrollY; leaveHome(); }
    else Devices.drop($('#project'));
    renderProject(p);
    $('#home').hidden = true;
    $('#project').hidden = false;
    state.view = 'project';
    state.current = p.id;
    document.title = `${p.title} · ${D().person.name}`;
    setDescription(p.oneliner);
    scrollTo(0, 0);
    if (!first) $('#pp-title').focus({ preventScroll: true });
    onScroll();
  }

  function leaveHome() {
    Devices.stopAll();
    unlight();
  }

  function showHome(place) {
    const from = state.view === 'project' ? state.current : null;
    if (from) { Devices.drop($('#project')); $('#project').replaceChildren(); }
    if (!$('#home').firstElementChild) renderHome();
    $('#project').hidden = true;
    $('#home').hidden = false;
    state.view = 'home';
    state.current = null;
    document.title = state.homeTitle;
    setDescription(state.homeDesc);
    // A link to a place goes there; Back from a project returns to where the visitor was among the projects.
    const jump = state.jump;
    state.jump = null;
    let y = 0;
    if (jump === 'top') y = 0;
    else if (jump === 'meet' || jump === 'contact') y = placeY(jump);
    else if (from && state.homeY != null) y = state.homeY;
    else if (place && place !== 'top') y = placeY(place);
    else if (from) {
      const item = $(`.sp-item[data-id="${from}"]`);
      if (item) { const r = item.getBoundingClientRect(); y = r.top + scrollY - (innerHeight - r.height) / 2; }
    }
    scrollTo(0, Math.max(0, y || 0));
    if (from) {
      const see = $(`.sp-item[data-id="${from}"] .see`);
      if (see) see.focus({ preventScroll: true });
    }
    unlight();
    onScroll();
  }

  /* ---------------------------------------------------------------- events */

  let ticking = false;
  function onScroll() {
    bar.classList.toggle('scrolled', scrollY > 8);
    spotlight();
  }

  function copyEmail(btn) {
    const source = $(`#${btn.dataset.copy}`), live = btn.nextElementSibling, text = source.textContent.trim();
    const done = (msg) => {
      btn.textContent = msg;
      live.textContent = msg === COPY.copied ? `Copied ${text}` : `${text} is selected`;
      clearTimeout(btn.resetTimer);
      btn.resetTimer = setTimeout(() => { btn.textContent = COPY.copy; }, 1800);
    };
    const select = () => {
      const r = document.createRange();
      r.selectNodeContents(source);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      done(COPY.selected);
    };
    try { navigator.clipboard.writeText(text).then(() => done(COPY.copied), select); } catch (err) { select(); }
  }

  function bindEvents() {
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; onScroll(); });
    }, { passive: true });
    addEventListener('resize', onScroll);
    addEventListener('hashchange', route);
    phoneScreen.addEventListener('change', swapFilms);
    phoneLayout.addEventListener('change', refreshHero);
    // The preview can switch the phone hero cut: set <html data-phone-hero> and send this event.
    document.addEventListener('phonehero', refreshHero);

    document.addEventListener('click', (e) => {
      const plain = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
      const skip = e.target.closest('[data-skip]');
      if (skip) { e.preventDefault(); $('#main').focus(); return; }
      // A place in the view now showing scrolls there; otherwise the link changes the hash and the router takes over.
      const sc = e.target.closest('[data-scroll]');
      if (sc && plain) {
        const y = placeY(sc.dataset.scroll);
        if (y == null) { state.jump = sc.dataset.scroll; return; }
        e.preventDefault();
        scrollTo({ top: y, behavior: smooth() });
        return;
      }
      const copy = e.target.closest('[data-copy]');
      if (copy) { copyEmail(copy); return; }
      const lc = e.target.closest('[data-loopctl]');
      if (lc) {
        const v = $('video.loop-v');
        v.userPaused = !v.userPaused;
        if (v.userPaused) v.pause(); else playSafe(v);
        syncLoopCtl(v);
      }
    });
  }

  /* ------------------------------------------------------------------ boot */

  async function boot() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    state.homeDesc = $('meta[name="description"]').getAttribute('content');
    try {
      const response = await fetch(CONFIG.dataUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = prepare(await response.json());
    } catch (err) {
      $('#load-error').hidden = false;
      return;
    }
    bindEvents();
    route();
  }

  boot();
})();
