/* Tammam Benbettaieb · portfolio
 *
 * One page, hash routes:  ""  → Home   ·   "#<project id>" → that project's page.
 * Home anchors (#work, #contact, #quotes) stay on Home and scroll to the section.
 * Unknown hashes fall back to Home.
 * All content comes from data/projects.json. This file only adds headings and labels (COPY).
 *
 * Sections: config · copy · helpers · data · media frames · home · pop-up ·
 *           project page · image viewer · contact · router · boot
 */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- config */

  const CONFIG = {
    dataUrl: 'data/projects.json',
    mediaBase: 'assets/media/',
    heroProjectNum: '01',
    // A phone screenshot is only framed as a phone when it is this tall (width / height).
    phoneRatioMax: 0.62,
  };

  // Per-image frame overrides: an image hosted somewhere other than the project's main site.
  const FRAME_OVERRIDES = {
    '01-targets-g5.jpg': { linkLabel: /showcase prototype/i },
  };

  /* ------------------------------------------------------------------ copy */
  // Headings and labels only. Hero lines reuse words from person.headline / person.intro.

  const COPY = {
    heroLine: "I'm Tammam, a freelance software and automation engineer in Tunisia.",
    credentials: [
      { text: '5.0 on both public Upwork reviews', href: '#quotes' },
      { text: '1st of 30+, DataLeaders 2.0 ML competition', open: 'competitions' },
    ],
    pickerTitle: 'What do you need?',
    everything: 'Show all projects',
    showEverything: 'Show everything',
    allWork: 'All work',
    workTitle: 'Work',
    project: 'project',
    projects: 'projects',
    demo: 'Demo',
    result: 'Result',
    openProject: 'Open project',
    hireLong: 'Hire me on Upwork',
    built: 'What I built',
    stack: 'Stack',
    links: 'Links',
    noLinks: 'No public links for this project.',
    quotesTitle: 'What clients said',
    quoteSource: 'Upwork review',
    contactTitle: 'Tell me about your project',
    hireTitle: 'Need something similar?',
    copy: 'Copy',
    copied: 'Copied',
    selected: 'Selected',
    facts: { type: 'Type', year: 'Year', role: 'Role', status: 'Status', links: 'Links' },
    story: [
      ['problem', 'The problem'],
      ['built', 'What I built'],
      ['hard', 'The hard part'],
      ['outcome', 'The result'],
    ],
    gallery: 'Gallery',
    images: 'images',
    stackTitle: 'Built with',
    previous: 'Previous',
    next: 'Next',
    pause: 'Pause',
    play: 'Play',
    channels: { email: 'Email', whatsapp: 'WhatsApp', github: 'GitHub', linkedin: 'LinkedIn' },
  };

  /* --------------------------------------------------------------- helpers */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Create an element. props: class, text, dataset, on<Event>, boolean or string attributes. */
  function h(tag, props, ...children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value == null || value === false) continue;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'dataset') Object.assign(node.dataset, value);
        else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
        else node.setAttribute(key, value === true ? '' : String(value));
      }
    }
    appendAll(node, children);
    return node;
  }

  /** Replace a node's children; null and false entries are skipped. */
  function setChildren(node, ...children) {
    node.replaceChildren();
    return appendAll(node, children);
  }

  function appendAll(node, children) {
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false) continue;
      node.append(child instanceof Node ? child : String(child));
    }
    return node;
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
    external: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevronLeft: '<path d="m15 6-6 6 6 6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M7.5 5h3v14h-3zM13.5 5h3v14h-3z" fill="currentColor" stroke="none"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  };

  function icon(name, size = 16) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'icon');
    svg.innerHTML = ICONS[name]; // trusted constants only
    return svg;
  }

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hostOf = (url) => String(url || '')
    .replace(/^mailto:/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

  const mediaUrl = (file) => CONFIG.mediaBase + file;

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  /* ------------------------------------------------------------------ data */

  const state = {
    data: null,
    need: 'all',
    view: null,
    homeTitle: '',
  };

  // Links that point at the project's own running site (not code or a package page).
  const isSiteLink = (link) => /\b(live|preview)\b/i.test(link.label) && !/(github\.com|pypi\.org)/i.test(link.url);

  function prepare(raw) {
    const lanes = raw.lanes || [];
    const laneById = new Map(lanes.map((lane) => [lane.id, lane]));
    const projects = (raw.projects || []).map((p, index) => {
      const site = (p.links || []).find(isSiteLink);
      const host = site ? hostOf(site.url) : '';
      const gallery = p.gallery || [];
      const phoneOnly = gallery.length > 0 && gallery.every((g) => g.kind === 'mobile');
      return Object.assign({}, p, {
        index,
        host,
        lanes: p.lanes || [p.lane],
        links: p.links || [],
        gallery,
        laneLabel: (laneById.get(p.lane) || {}).label || '',
        stackFlat: Array.from(new Set((p.stack || []).flatMap((group) => group.items))),
        // Card media: phone-only projects show two phone screens, others their hero.
        cardMedia: !host && phoneOnly
          ? { kind: 'phones', images: gallery.slice(0, 2) }
          : { kind: host ? 'browser' : 'plain', image: p.hero },
      });
    });
    return {
      person: raw.person,
      lanes,
      projects,
      byId: new Map(projects.map((p) => [p.id, p])),
      contact: indexContacts((raw.person && raw.person.contact) || []),
    };
  }

  function indexContacts(list) {
    const out = {};
    for (const item of list) out[item.label.toLowerCase()] = item;
    const email = out.email ? out.email.url.replace(/^mailto:/, '') : '';
    const wa = out.whatsapp ? out.whatsapp.url.replace(/\D/g, '') : '';
    return {
      upwork: out.upwork ? out.upwork.url : '#contact',
      email,
      emailUrl: out.email ? out.email.url : '',
      whatsapp: out.whatsapp ? { url: out.whatsapp.url, text: formatPhone(wa) } : null,
      github: out.github ? { url: out.github.url, text: hostOf(out.github.url) } : null,
      linkedin: out.linkedin ? { url: out.linkedin.url, text: hostOf(out.linkedin.url) } : null,
    };
  }

  function formatPhone(digits) {
    const m = /^(216)(\d{2})(\d{3})(\d{3})$/.exec(digits);
    return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
  }

  const heroProject = () => state.data.projects.find((p) => p.num === CONFIG.heroProjectNum) || state.data.projects[0];

  function matches(project, need) {
    return need === 'all' || project.lanes.includes(need);
  }

  const shownProjects = () => state.data.projects.filter((p) => matches(p, state.need));

  function needOptions() {
    const all = state.data.projects;
    const lanes = state.data.lanes.map((lane) => ({
      id: lane.id,
      phrase: lane.need,
      rest: lane.need.replace(/^I need\s+/i, ''),
      label: lane.label,
      count: all.filter((p) => matches(p, lane.id)).length,
    }));
    const everything = { id: 'all', phrase: COPY.everything, rest: COPY.everything, label: COPY.allWork, count: all.length };
    return { lanes, everything };
  }

  /* --------------------------------------------------------- media frames */

  function image(file, alt, { eager = false } = {}) {
    return h('img', { src: mediaUrl(file), alt: alt || '', loading: eager ? 'eager' : 'lazy', decoding: 'async' });
  }

  function videoEl(p, { controls = true, autoplay = true } = {}) {
    const video = h('video', {
      src: mediaUrl(p.video),
      poster: mediaUrl(p.hero),
      preload: 'metadata',
      playsinline: true,
      loop: true,
      muted: true,
      controls,
      autoplay: autoplay && !reducedMotion(),
      'aria-label': `${p.title}: ${p.videoCaption || 'demo video'}`,
    });
    video.muted = true;
    video.defaultMuted = true;
    return video;
  }

  function frame(kind, content, { host = '', action = null } = {}) {
    const screen = h('div', { class: 'frame-screen' }, content);
    if (kind !== 'browser') return h('div', { class: `frame frame--${kind}` }, screen);
    const bar = h('div', { class: 'frame-bar' },
      h('span', { class: 'frame-dots', 'aria-hidden': 'true' }, h('span'), h('span'), h('span')),
      host ? h('span', { class: 'frame-url' }, icon('lock', 11), h('span', { class: 'frame-host' }, host)) : null,
      action || h('span', { class: 'frame-spacer', 'aria-hidden': 'true' }));
    return h('div', { class: 'frame frame--browser' }, bar, screen);
  }

  // Phone screenshots that turn out not to be tall (a side-by-side composite) fall back to a plain frame.
  function phoneFrame(img, onWide) {
    const el = frame('phone', img);
    const check = () => {
      if (!img.naturalWidth) return;
      if (img.naturalWidth / img.naturalHeight > CONFIG.phoneRatioMax) {
        el.className = 'frame frame--plain';
        if (onWide) onWide();
      }
    };
    if (img.complete) check(); else img.addEventListener('load', check, { once: true });
    return el;
  }

  const heroKind = (p) => (p.host ? 'browser' : 'plain');
  const videoKind = (p) => (/^phone\b/i.test(p.videoCaption || '') ? 'phone' : heroKind(p));

  /** The main media for the pop-up and project page: the demo video, else the hero image. */
  function mainMedia(p, { eager = false } = {}) {
    const kind = p.video ? videoKind(p) : heroKind(p);
    const content = p.video ? videoEl(p) : image(p.hero, `${p.title}, main screenshot`, { eager });
    return h('div', { class: `stage stage--fit stage--${kind}` }, frame(kind, content, { host: p.host }));
  }

  function galleryFrameInfo(p, item) {
    if (item.kind === 'mobile') return { kind: 'phone' };
    if (item.kind === 'chart') return { kind: 'plain' };
    const override = FRAME_OVERRIDES[item.file];
    if (override && override.linkLabel) {
      const link = p.links.find((l) => override.linkLabel.test(l.label));
      if (link) return { kind: 'browser', host: hostOf(link.url) };
    }
    return p.host ? { kind: 'browser', host: p.host } : { kind: 'plain' };
  }

  /* ------------------------------------------------------------------ home */

  function renderHome() {
    renderHero();
    renderWorkHead();
    renderGrid();
    renderClosing();
  }

  function renderHero() {
    const person = state.data.person;
    setChildren($('#hero'), h('div', { class: 'wrap' },
      h('div', { class: 'hero-grid' },
        h('div', { class: 'hero-copy' },
          availability(),
          h('h1', { class: 'hero-title' }, person.headline),
          h('p', { class: 'hero-line' }, COPY.heroLine),
          credentials(),
          picker()),
        demo(heroProject()))));
  }

  function availability() {
    const person = state.data.person;
    return h('p', { class: 'eyebrow' }, h('span', { class: 'status-dot', 'aria-hidden': 'true' }), `${person.availability} · ${person.location}`);
  }

  function credentials() {
    const links = COPY.credentials.map((item) => (item.open
      ? h('a', { href: `#${item.open}`, dataset: { open: item.open } }, item.text)
      : h('a', { href: item.href }, item.text)));
    return h('p', { class: 'credentials' }, links);
  }

  function hireButton({ large = false } = {}) {
    return h('a', {
      class: `btn btn-primary${large ? ' btn-lg' : ''}`,
      href: state.data.contact.upwork,
      target: '_blank',
      rel: 'noopener',
    }, COPY.hireLong);
  }

  function demo(p) {
    const video = videoEl(p, { controls: false });
    const label = h('span', null, video.autoplay ? COPY.pause : COPY.play);
    const glyph = h('span', { class: 'frame-action-icon' }, icon(video.autoplay ? 'pause' : 'play', 12));
    const toggle = h('button', { type: 'button', class: 'frame-action', 'aria-label': `${video.autoplay ? COPY.pause : COPY.play} demo video` }, glyph, label);
    const sync = () => {
      const playing = !video.paused;
      label.textContent = playing ? COPY.pause : COPY.play;
      glyph.replaceChildren(icon(playing ? 'pause' : 'play', 12));
      toggle.setAttribute('aria-label', `${playing ? COPY.pause : COPY.play} demo video`);
    };
    toggle.addEventListener('click', () => {
      if (video.paused) video.play().catch(() => {}); else video.pause();
    });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);

    return h('figure', { class: 'demo' },
      h('div', { class: 'stage stage--fit' }, frame('browser', video, { host: p.host, action: toggle })),
      h('figcaption', { class: 'demo-caption' },
        h('span', null, h('strong', null, p.title), ` · ${p.videoCaption || ''}`),
        h('a', { class: 'text-link', href: `#${p.id}`, dataset: { open: p.id } }, COPY.openProject, icon('arrowRight'))));
  }

  /** The needs picker: one big choice per lane, then "Show all projects". */
  function picker() {
    const { lanes, everything } = needOptions();
    const row = (o, extra = '') => h('button', {
      type: 'button',
      class: `need${extra}`,
      dataset: { need: o.id },
      'aria-pressed': String(state.need === o.id),
      onClick: () => setNeed(o.id, { scroll: true }),
    },
    h('span', { class: 'need-phrase' }, o.phrase),
    h('span', { class: 'need-count label' }, String(o.count), h('span', { class: 'need-unit' }, ` ${o.count === 1 ? COPY.project : COPY.projects}`)),
    icon('arrowRight'));
    return h('div', { class: 'picker' },
      h('p', { class: 'picker-title', id: 'picker-title' }, COPY.pickerTitle),
      h('div', { class: 'need-list', role: 'group', 'aria-labelledby': 'picker-title' },
        lanes.map((o) => row(o)), row(everything, ' need--all')));
  }

  function setNeed(id, { scroll = false } = {}) {
    state.need = id;
    for (const button of $$('[data-need]')) button.setAttribute('aria-pressed', String(button.dataset.need === id));
    renderStatus();
    renderGrid();
    if (scroll) $('#work').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function renderWorkHead() {
    setChildren($('#work-head'),
      h('div', { class: 'work-bar' },
        h('h2', { class: 'work-title', id: 'work-title' }, COPY.workTitle),
        h('p', { class: 'work-status', id: 'work-status', 'aria-live': 'polite' }),
        h('button', { type: 'button', class: 'btn btn-quiet work-reset', id: 'work-reset', hidden: true, onClick: () => setNeed('all') }, COPY.showEverything)));
    renderStatus();
  }

  function renderStatus() {
    const status = $('#work-status');
    if (!status) return;
    const total = state.data.projects.length;
    const shown = shownProjects().length;
    if (state.need === 'all') {
      status.replaceChildren(h('strong', { dataset: { count: shown } }, String(shown)), ` ${COPY.projects}`);
    } else {
      const lane = state.data.lanes.find((l) => l.id === state.need);
      status.replaceChildren(h('strong', { dataset: { count: shown } }, String(shown)), ` of ${total} ${COPY.projects} for “${lane ? lane.need : ''}”`);
    }
    $('#work-reset').hidden = state.need === 'all';
  }

  function renderGrid() {
    setChildren($('#project-grid'), h('ul', { class: 'cards' }, shownProjects().map(card)));
  }

  function cardStage(p) {
    const m = p.cardMedia;
    const stage = h('div', { class: `stage stage--card stage--${m.kind}`, 'aria-hidden': 'true' });
    if (m.kind === 'phones') {
      for (const shot of m.images) stage.append(frame('phone', image(shot.file, '')));
    } else {
      stage.append(frame(m.kind, image(m.image, ''), { host: p.host }));
    }
    if (p.video) stage.append(h('span', { class: 'badge' }, icon('play', 11), COPY.demo));
    return stage;
  }

  function card(p) {
    return h('li', { class: 'card', dataset: { project: p.id } },
      cardStage(p),
      h('div', { class: 'card-body' },
        h('h3', { class: 'card-title' }, h('a', { href: `#${p.id}`, dataset: { open: p.id } }, p.title)),
        h('p', { class: 'card-meta label' }, `${p.type} · ${p.year}`),
        h('p', { class: 'card-oneliner' }, p.oneliner),
        h('p', { class: 'card-result' }, h('span', { class: 'result-label label' }, COPY.result), p.result)));
  }

  /* --------------------------------------------------------------- pop-up */

  const popup = {
    el: null,
    list: [],
    index: 0,
    opener: null,
    openedId: '',
    restoreFocus: true,
    pointerOnBackdrop: false,
  };

  function openPopup(id, opener) {
    const project = state.data.byId.get(id);
    if (!project) return;
    const shown = shownProjects();
    popup.list = shown.includes(project) ? shown : state.data.projects;
    popup.index = popup.list.indexOf(project);
    popup.opener = opener || null;
    popup.openedId = id;
    popup.restoreFocus = true;
    renderPopup();
    if (!popup.el.open) {
      lockScroll(true);
      popup.el.showModal();
    }
    $('#popup-close').focus();
  }

  function renderPopup() {
    const p = popup.list[popup.index];
    const lane = state.need === 'all' ? '' : ` · ${(state.data.lanes.find((l) => l.id === state.need) || {}).label || ''}`;
    $('#popup-pos').textContent = `${popup.index + 1} of ${popup.list.length}${popup.list.length === state.data.projects.length ? '' : lane}`;
    const body = $('#popup-body');
    body.replaceChildren(...popupContent(p));
    body.scrollTop = 0;
    const full = $('#popup-full');
    full.href = `#${p.id}`;
    popup.el.dataset.project = p.id;
  }

  function popupContent(p) {
    const block = (title, ...content) => h('section', { class: 'popup-block' }, h('h3', { class: 'block-title label' }, title), content);
    return [
      h('div', { class: 'popup-media' }, mainMedia(p, { eager: true })),
      h('div', { class: 'popup-content' },
        h('header', null,
          h('h2', { class: 'popup-title', id: 'popup-title' }, p.title),
          h('p', { class: 'popup-meta' }, [p.type, p.year, p.role].filter(Boolean).join(' · '))),
        h('div', { class: 'popup-grid' },
          h('div', { class: 'popup-main' },
            h('p', { class: 'popup-summary' }, p.summary),
            block(COPY.built, h('ul', { class: 'ticks' }, (p.highlights || []).slice(0, 3).map((t) => h('li', null, t)))),
            block(COPY.result, h('p', { class: 'result-text' }, p.result), p.quote ? quoteFigure(p.quote) : null)),
          h('div', { class: 'popup-side' },
            block(COPY.stack, h('ul', { class: 'chips' }, p.stackFlat.map((item) => h('li', { class: 'chip' }, item)))),
            block(COPY.links, linkList(p.links))))),
    ];
  }

  function quoteFigure(quote) {
    return h('figure', { class: 'quote' },
      h('blockquote', null, h('p', null, `“${quote.text}”`)),
      h('figcaption', null, quote.source));
  }

  function linkList(links) {
    if (!links.length) return h('p', { class: 'no-links' }, COPY.noLinks);
    return h('ul', { class: 'links' }, links.map((link) => h('li', null,
      h('a', { class: 'link-row', href: link.url, target: '_blank', rel: 'noopener' },
        h('span', { class: 'link-text' },
          h('span', { class: 'link-label' }, link.label),
          h('span', { class: 'link-host label' }, hostOf(link.url))),
        icon('external')))));
  }

  function stepPopup(delta) {
    const n = popup.list.length;
    if (n < 2) return;
    popup.index = (popup.index + delta + n) % n;
    renderPopup();
  }

  function closePopup({ restoreFocus = true } = {}) {
    if (!popup.el.open) return;
    popup.restoreFocus = restoreFocus;
    popup.el.close();
  }

  function onPopupClosed() {
    const currentId = popup.el.dataset.project;
    $('#popup-body').replaceChildren(); // stops the video
    lockScroll(false);
    if (!popup.restoreFocus) return;
    // Back to the card that opened it; after Previous/Next, to the card now shown.
    let target = popup.opener;
    if (currentId !== popup.openedId || !target || !target.isConnected) {
      target = $(`#project-grid [data-open="${currentId}"]`) || (target && target.isConnected ? target : null);
    }
    if (target) target.focus();
  }

  function bindPopup() {
    popup.el = $('#popup');
    $('#popup-close').append(icon('close', 18));
    $('#popup-prev').append(icon('chevronLeft', 18));
    $('#popup-next').append(icon('chevronRight', 18));
    $('#popup-close').addEventListener('click', () => closePopup());
    $('#popup-prev').addEventListener('click', () => stepPopup(-1));
    $('#popup-next').addEventListener('click', () => stepPopup(1));
    popup.el.addEventListener('close', onPopupClosed);
    // A click on the backdrop (the dialog box itself, outside its content) closes it.
    popup.el.addEventListener('pointerdown', (e) => { popup.pointerOnBackdrop = e.target === popup.el; });
    popup.el.addEventListener('click', (e) => {
      if (e.target === popup.el && popup.pointerOnBackdrop) closePopup();
      popup.pointerOnBackdrop = false;
    });
    popup.el.addEventListener('keydown', (e) => {
      if (e.target.closest('video, input, textarea, select')) return;
      if (e.key === 'ArrowRight') stepPopup(1);
      if (e.key === 'ArrowLeft') stepPopup(-1);
    });
  }

  function lockScroll(on) {
    document.documentElement.classList.toggle('is-locked', on);
  }

  /* --------------------------------------------------------- project page */

  function renderProjectPage(p) {
    const all = state.data.projects;
    const i = all.indexOf(p);
    const prev = all[(i - 1 + all.length) % all.length];
    const next = all[(i + 1) % all.length];
    const media = mainMedia(p, { eager: true });

    $('#view-project').replaceChildren(
      h('article', { class: 'project', 'aria-labelledby': 'project-title' },
        h('div', { class: 'wrap' },
          h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
            h('a', { href: '#work' }, icon('arrowLeft'), COPY.allWork),
            h('span', { 'aria-hidden': 'true' }, '/'),
            h('span', { 'aria-current': 'page' }, p.title)),
          h('header', { class: 'project-head' },
            h('p', { class: 'label' }, `${p.num} · ${p.laneLabel}`),
            h('h1', { class: 'project-title', id: 'project-title', tabindex: '-1' }, p.title),
            h('p', { class: 'project-lede' }, p.oneliner)),
          facts(p),
          h('figure', { class: 'project-media' }, media, p.video && p.videoCaption ? h('figcaption', null, p.videoCaption) : null),
          h('div', { class: 'story' }, COPY.story.map(([key, title]) => h('section', { class: 'story-block' },
            h('h2', null, title),
            h('p', null, p[key])))),
          p.quote ? h('figure', { class: 'project-quote' },
            h('blockquote', null, h('p', null, `“${p.quote.text}”`)),
            h('figcaption', null, p.quote.source)) : null,
          gallery(p),
          stackGroups(p),
          h('nav', { class: 'pager', 'aria-label': 'More projects' },
            h('a', { class: 'pager-prev', href: `#${prev.id}` },
              h('span', { class: 'pager-dir label' }, icon('arrowLeft', 14), COPY.previous),
              h('span', { class: 'pager-title' }, prev.title)),
            h('a', { class: 'pager-next', href: `#${next.id}` },
              h('span', { class: 'pager-dir label' }, COPY.next, icon('arrowRight', 14)),
              h('span', { class: 'pager-title' }, next.title)))),
        h('section', { class: 'hire-block', 'aria-labelledby': 'hire-title' },
          h('div', { class: 'wrap hire-inner' },
            h('div', null,
              h('h2', { id: 'hire-title' }, COPY.hireTitle),
              h('p', { class: 'contact-avail' }, h('span', { class: 'status-dot', 'aria-hidden': 'true' }), `${state.data.person.availability} · ${state.data.person.location}`)),
            h('div', { class: 'hire-actions' },
              hireButton({ large: true }),
              emailLine('project'))))));
  }

  function facts(p) {
    const fact = (name, value, extra = '') => h('div', { class: `fact${extra}` }, h('dt', { class: 'label' }, name), h('dd', null, value));
    const links = p.links.length
      ? h('ul', { class: 'fact-links' }, p.links.map((link) => h('li', null,
        h('a', { class: 'btn btn-secondary', href: link.url, target: '_blank', rel: 'noopener' },
          link.label, icon('external', 14)))))
      : h('span', { class: 'no-links' }, COPY.noLinks);
    return h('dl', { class: 'facts' },
      fact(COPY.facts.type, p.type),
      fact(COPY.facts.year, p.year),
      fact(COPY.facts.role, p.role),
      fact(COPY.facts.status, p.status),
      fact(COPY.facts.links, links, ' fact--links'));
  }

  function gallery(p) {
    if (!p.gallery.length) return null;
    const items = p.gallery.map((g, index) => ({ g, index, info: galleryFrameInfo(p, g) }));
    const shot = ({ g, index, info }) => {
      const img = image(g.file, g.caption);
      const li = h('li', { class: 'shot-item' });
      const framed = info.kind === 'phone'
        ? phoneFrame(img, () => li.classList.add('is-wide'))
        : frame(info.kind, img, { host: info.host });
      const button = h('button', { type: 'button', class: 'shot', 'aria-label': `View larger: ${g.caption}` }, framed);
      button.addEventListener('click', () => openViewer(p, index, button));
      return appendAll(li, [button, h('p', { class: 'shot-caption' }, g.caption)]);
    };
    const wide = items.filter((it) => it.info.kind !== 'phone');
    const phones = items.filter((it) => it.info.kind === 'phone');
    return h('section', { class: 'gallery', 'aria-labelledby': 'gallery-title' },
      h('div', { class: 'section-head' },
        h('h2', { id: 'gallery-title' }, COPY.gallery),
        h('p', { class: 'label' }, plural(p.gallery.length, 'image', COPY.images))),
      wide.length ? h('ul', { class: 'shots shots--wide' }, wide.map(shot)) : null,
      phones.length ? h('ul', { class: 'shots shots--phones' }, phones.map(shot)) : null);
  }

  function stackGroups(p) {
    return h('section', { class: 'stack', 'aria-labelledby': 'stack-title' },
      h('div', { class: 'section-head' }, h('h2', { id: 'stack-title' }, COPY.stackTitle)),
      h('div', { class: 'stack-groups' }, (p.stack || []).map((group) => h('div', { class: 'stack-group' },
        h('h3', { class: 'label' }, group.group),
        h('ul', null, group.items.map((item) => h('li', null, item)))))));
  }

  /* ---------------------------------------------------------- image viewer */

  const viewer = { el: null, items: [], index: 0, opener: null };

  function openViewer(p, index, opener) {
    viewer.items = p.gallery;
    viewer.index = index;
    viewer.opener = opener;
    renderViewer();
    lockScroll(true);
    viewer.el.showModal();
    $('#viewer-close').focus();
  }

  function renderViewer() {
    const item = viewer.items[viewer.index];
    const img = $('#viewer-img');
    img.src = mediaUrl(item.file);
    img.alt = item.caption;
    $('#viewer-caption').textContent = item.caption;
    $('#viewer-count').textContent = `${viewer.index + 1} / ${viewer.items.length}`;
    const single = viewer.items.length < 2;
    $('#viewer-prev').hidden = single;
    $('#viewer-next').hidden = single;
  }

  function stepViewer(delta) {
    const n = viewer.items.length;
    viewer.index = (viewer.index + delta + n) % n;
    renderViewer();
  }

  function bindViewer() {
    viewer.el = $('#viewer');
    $('#viewer-close').append(icon('close', 18));
    $('#viewer-prev').append(icon('chevronLeft', 18));
    $('#viewer-next').append(icon('chevronRight', 18));
    $('#viewer-close').addEventListener('click', () => viewer.el.close());
    $('#viewer-prev').addEventListener('click', () => stepViewer(-1));
    $('#viewer-next').addEventListener('click', () => stepViewer(1));
    $('#viewer-stage').addEventListener('click', (e) => { if (e.target.id === 'viewer-stage') viewer.el.close(); });
    viewer.el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') stepViewer(1);
      if (e.key === 'ArrowLeft') stepViewer(-1);
    });
    viewer.el.addEventListener('close', () => {
      lockScroll(false);
      $('#viewer-img').removeAttribute('src');
      if (viewer.opener && viewer.opener.isConnected) viewer.opener.focus();
    });
  }

  /* --------------------------------------------------------------- contact */

  function renderClosing() {
    const quoted = state.data.projects.filter((p) => p.quote);
    const quotes = quoted.length ? h('div', { class: 'quotes', id: 'quotes' },
      h('h2', { class: 'quotes-title' }, COPY.quotesTitle),
      quoted.map((p) => h('figure', { class: 'quote-item' },
        h('blockquote', null, h('p', null, `“${p.quote.text}”`)),
        h('figcaption', null,
          h('a', { href: `#${p.id}`, dataset: { open: p.id } }, p.title),
          h('span', { 'aria-hidden': 'true' }, '·'),
          COPY.quoteSource)))) : null;

    const c = state.data.contact;
    const person = state.data.person;
    const channel = (name, value, extra) => h('li', { class: 'channel' }, h('span', { class: 'channel-name label' }, name), value, extra || null);
    const external = (info) => h('a', { class: 'channel-value', href: info.url, target: '_blank', rel: 'noopener' }, info.text);

    setChildren($('#closing'),
      quotes,
      h('div', { class: 'contact-card' },
        h('h2', { class: 'contact-title', id: 'contact-title' }, COPY.contactTitle),
        h('p', { class: 'contact-avail' }, h('span', { class: 'status-dot', 'aria-hidden': 'true' }), `${person.availability} · ${person.location}`),
        hireButton({ large: true }),
        h('ul', { class: 'channels' },
          c.email ? channel(COPY.channels.email,
            h('span', { class: 'channel-value channel-value--email', id: 'email-home' }, c.email),
            copyButton('email-home')) : null,
          c.whatsapp ? channel(COPY.channels.whatsapp, external(c.whatsapp), icon('external')) : null,
          c.github ? channel(COPY.channels.github, external(c.github), icon('external')) : null,
          c.linkedin ? channel(COPY.channels.linkedin, external(c.linkedin), icon('external')) : null)));
  }

  function emailLine(prefix) {
    const c = state.data.contact;
    if (!c.email) return null;
    const id = `email-${prefix}`;
    return h('p', { class: 'email-line' },
      h('span', { class: 'channel-value--email', id }, c.email),
      copyButton(id));
  }

  function copyButton(targetId) {
    const button = h('button', { type: 'button', class: 'btn btn-secondary channel-copy', id: `${targetId}-copy`, 'aria-describedby': targetId }, COPY.copy);
    const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
    button.addEventListener('click', () => copyText(button, $(`#${targetId}`), live));
    return [button, live];
  }

  function copyText(button, source, live) {
    const text = source.textContent.trim();
    const done = (message) => {
      button.textContent = message;
      live.textContent = message === COPY.copied ? `Copied ${text}` : `${text} is selected`;
      window.clearTimeout(button.resetTimer);
      button.resetTimer = window.setTimeout(() => { button.textContent = COPY.copy; }, 2000);
    };
    const selectInstead = () => {
      const range = document.createRange();
      range.selectNodeContents(source);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      done(COPY.selected);
    };
    try {
      navigator.clipboard.writeText(text).then(() => done(COPY.copied), selectInstead);
    } catch (err) {
      selectInstead();
    }
  }

  /* ---------------------------------------------------------------- router */

  function currentHash() {
    try {
      return decodeURIComponent(location.hash.slice(1));
    } catch (err) {
      return ''; // a malformed hash falls back to Home
    }
  }

  function route() {
    const id = currentHash();
    const project = state.data.byId.get(id);
    const nextView = project ? 'project' : 'home';
    const changed = nextView !== state.view || nextView === 'project';

    closePopup({ restoreFocus: false });
    if (viewer.el.open) viewer.el.close();

    $('#view-home').hidden = nextView !== 'home';
    $('#view-project').hidden = nextView !== 'project';

    if (project) {
      renderProjectPage(project);
      document.title = `${project.title} · ${state.data.person.name}`;
      window.scrollTo(0, 0);
      if (state.view !== null) $('#project-title').focus({ preventScroll: true });
    } else {
      $('#view-project').replaceChildren();
      document.title = state.homeTitle;
      const anchor = id ? document.getElementById(id) : null;
      if (anchor && $('#view-home').contains(anchor)) {
        if (changed) anchor.scrollIntoView({ block: 'start' });
      } else if (changed) {
        window.scrollTo(0, 0);
      }
    }
    state.view = nextView;
  }

  function bindGlobal() {
    // Any [data-open] link opens that project's pop-up; modified clicks keep the plain link.
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-open]');
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!$('#view-home').contains(link)) return;
      e.preventDefault();
      openPopup(link.dataset.open, link);
    });
    $('[data-to-top]').addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    });
    window.addEventListener('hashchange', route);
  }

  function fillStatic() {
    const person = state.data.person;
    const [first, ...rest] = person.name.split(' ');
    $('.brand-first').textContent = first;
    $('.brand-last').textContent = rest.join(' ');
    $('[data-footer-name]').textContent = `${person.name} · ${person.location}`;
    for (const link of $$('[data-hire]')) link.href = state.data.contact.upwork;
  }

  /* ------------------------------------------------------------------ boot */

  async function boot() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    state.homeTitle = document.title;
    bindPopup();
    bindViewer();
    try {
      const response = await fetch(CONFIG.dataUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = prepare(await response.json());
    } catch (err) {
      $('#load-error').hidden = false;
      return;
    }
    fillStatic();
    renderHome();
    bindGlobal();
    route();
  }

  boot();
})();
