/* Tammam Bettayeb · portfolio
 *
 * One page, hash routes:  ""  → Home   ·   "#<project id>" → that project's page.
 * Home anchors (#work, #contact, #quotes) stay on Home and scroll to the section.
 * Unknown hashes fall back to Home.
 * All content comes from data/projects.json. This file only adds headings, labels and the hero lines (COPY).
 *
 * Sections: config · copy · helpers · data · media frames · home (hero, picker, cards) ·
 *           pop-up · project page · image viewer · contact · router · boot
 */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- config */

  const CONFIG = {
    dataUrl: 'data/projects.json',
    mediaBase: 'assets/media/',
    // Below this width a demo film plays its short square cut instead of the long 16:9 one.
    phoneQuery: '(max-width: 640px)',
    // A phone screenshot is only framed as a phone when it is this tall (width / height).
    phoneRatioMax: 0.62,
  };

  // Per-image frame overrides: an image hosted somewhere other than the project's main site.
  const FRAME_OVERRIDES = {
    '01-targets-g5.jpg': { linkLabel: /showcase prototype/i },
  };

  /* ------------------------------------------------------------------ copy */
  // Headings, labels and the hero lines.

  const COPY = {
    heroTitle: 'You describe the problem, I build the solution tailored for your needs.',
    heroLine: 'Websites and Shopify stores · Bots and automation · Data pipelines and scrapers · AI and machine-learning solutions',
    role: 'Freelance software engineer',
    proof: [
      { text: '100% Job Success', label: '100% Job Success on Upwork' },
      { text: '5-star rated', label: '5-star rated on Upwork', stars: 5 },
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
  };

  // Filled marks (fill comes from a CSS token on the class).
  const MARKS = {
    // Upwork logo mark (simple-icons).
    upwork: 'M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z',
    star: 'M12 1.8l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.56l-6.18 3.25L7 13.93 2 9.06l6.91-1z',
  };

  function svgBase(size) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    return svg;
  }

  function icon(name, size = 16) {
    const svg = svgBase(size);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('class', 'icon');
    svg.innerHTML = ICONS[name]; // trusted constants only
    return svg;
  }

  function mark(name, size, className) {
    const svg = svgBase(size);
    svg.setAttribute('class', className);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', MARKS[name]);
    svg.append(path);
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

  // "A · B" that never wraps around the dot: a break falls inside A instead.
  const joinDot = (a, b) => `${a} · ${b}`;

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
    const projects = (raw.projects || []).map((p, index) => {
      const site = (p.links || []).find(isSiteLink);
      const thumbs = Array.isArray(p.thumb) ? p.thumb : [p.thumb || p.hero];
      return Object.assign({}, p, {
        index,
        host: site ? hostOf(site.url) : '',
        lanes: p.lanes || [p.lane],
        links: p.links || [],
        gallery: p.gallery || [],
        stackFlat: Array.from(new Set((p.stack || []).flatMap((group) => group.items))),
        thumb: { files: thumbs, pos: p.thumbPos || '50% 0%' },
      });
    });
    const byId = new Map(projects.map((p) => [p.id, p]));
    return {
      person: raw.person,
      lanes: prepareLanes(raw, projects, byId),
      projects,
      byId,
      contact: indexContacts((raw.person && raw.person.contact) || []),
    };
  }

  /** Each lane lists its projects by id, in order; without a list, a lane takes the projects that name it. */
  function prepareLanes(raw, projects, byId) {
    return (raw.lanes || []).map((lane) => Object.assign({}, lane, {
      projects: Array.isArray(lane.projects)
        ? lane.projects.map((id) => byId.get(id)).filter(Boolean)
        : projects.filter((p) => p.lanes.includes(lane.id)),
    }));
  }

  function indexContacts(list) {
    const out = {};
    for (const item of list) out[item.label.toLowerCase()] = item;
    const email = out.email ? out.email.url.replace(/^mailto:/, '') : '';
    const wa = out.whatsapp ? out.whatsapp.url.replace(/\D/g, '') : '';
    return {
      upwork: out.upwork ? out.upwork.url : '#contact',
      email,
      whatsapp: out.whatsapp ? { url: out.whatsapp.url, text: formatPhone(wa) } : null,
      github: out.github ? { url: out.github.url, text: hostOf(out.github.url) } : null,
      linkedin: out.linkedin ? { url: out.linkedin.url, text: hostOf(out.linkedin.url) } : null,
    };
  }

  function formatPhone(digits) {
    const m = /^(216)(\d{2})(\d{3})(\d{3})$/.exec(digits);
    return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
  }

  const laneById = (id) => state.data.lanes.find((lane) => lane.id === id) || null;

  /** The lane a project is shown under: its own lane if that lane lists it, else the first lane listing it. */
  function laneOf(p) {
    const lanes = state.data.lanes;
    return lanes.find((lane) => lane.id === p.lane && lane.projects.includes(p))
      || lanes.find((lane) => lane.projects.includes(p))
      || null;
  }

  function shownProjects() {
    const lane = state.need === 'all' ? null : laneById(state.need);
    return lane ? lane.projects : state.data.projects;
  }

  function needOptions() {
    const lanes = state.data.lanes.map((lane) => ({
      id: lane.id,
      phrase: lane.need,
      hint: lane.hint || '',
      label: lane.label,
      count: lane.projects.length,
    }));
    const everything = { id: 'all', phrase: COPY.everything, hint: '', label: COPY.allWork, count: state.data.projects.length };
    return { lanes, everything };
  }

  /* --------------------------------------------------------- media frames */

  function image(file, alt, { eager = false } = {}) {
    return h('img', { src: mediaUrl(file), alt: alt || '', loading: eager ? 'eager' : 'lazy', decoding: 'async' });
  }

  // A demo film comes in two cuts: the long 16:9 one, and a short square one for phones.
  const phoneScreen = window.matchMedia(CONFIG.phoneQuery);
  const filmCut = () => (phoneScreen.matches ? 'square' : 'wide');

  function videoEl(p, { controls = true, autoplay = true } = {}) {
    const cut = p.film ? p.film[filmCut()] || p.film.wide : null;
    const video = h('video', {
      src: mediaUrl(cut ? cut.src : p.video),
      poster: mediaUrl(cut ? cut.poster : p.hero),
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

  function frame(kind, content, { host = '' } = {}) {
    const screen = h('div', { class: 'frame-screen' }, content);
    if (kind !== 'browser') return h('div', { class: `frame frame--${kind}` }, screen);
    const bar = h('div', { class: 'frame-bar' },
      h('span', { class: 'frame-dots', 'aria-hidden': 'true' }, h('span'), h('span'), h('span')),
      host ? h('span', { class: 'frame-url' }, icon('lock', 11), h('span', { class: 'frame-host' }, host)) : null,
      h('span', { class: 'frame-spacer', 'aria-hidden': 'true' }));
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

  /** The main media for the pop-up and project page: the demo film or video, else the hero image. */
  function mainMedia(p, { eager = false } = {}) {
    // A film draws its own browser and phone frames, so it sits in a plain frame with no plate.
    if (p.film) {
      return h('div', { class: `stage stage--fit stage--film stage--film-${filmCut()}`, dataset: { film: p.id } },
        frame('plain', videoEl(p)));
    }
    const kind = p.video ? videoKind(p) : heroKind(p);
    const content = p.video ? videoEl(p) : image(p.hero, `${p.title}, main screenshot`, { eager });
    return h('div', { class: `stage stage--fit stage--${kind}` }, frame(kind, content, { host: p.host }));
  }

  /** When the screen crosses the phone width, swap each showing film for the other cut. */
  function swapFilmCuts() {
    for (const stage of $$('[data-film]')) {
      const p = state.data && state.data.byId.get(stage.dataset.film);
      if (p) stage.replaceWith(mainMedia(p));
    }
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

  /** Headline, line and the needs picker on the left; the portrait with the proof items on the right. */
  function renderHero() {
    setChildren($('#hero'), h('div', { class: 'wrap' },
      h('div', { class: 'hero-grid' },
        h('div', { class: 'hero-copy' },
          availability({ location: false }),
          h('h1', { class: 'hero-title' }, COPY.heroTitle),
          h('p', { class: 'hero-line' }, COPY.heroLine),
          picker()),
        h('div', { class: 'hero-media' }, me()))));
  }

  function availability({ location = true } = {}) {
    const person = state.data.person;
    return h('p', { class: 'eyebrow' }, h('span', { class: 'status-dot', 'aria-hidden': 'true' }),
      location ? joinDot(person.availability, person.location) : person.availability);
  }

  /** Portrait with his name and role, then the proof items. */
  function me() {
    const person = state.data.person;
    return h('div', { class: 'me' },
      h('img', { class: 'me-photo', src: mediaUrl(person.portrait), alt: person.name, width: 600, height: 750, decoding: 'async' }),
      h('div', { class: 'me-text' },
        h('p', { class: 'me-name' }, person.name),
        h('p', { class: 'me-role' }, joinDot(COPY.role, person.location)),
        proof()));
  }

  /** The two proof items, each a link to his Upwork profile. */
  function proof() {
    const url = state.data.contact.upwork;
    return h('ul', { class: 'proof' }, COPY.proof.map((item) => h('li', null,
      h('a', { class: 'proof-item', href: url, target: '_blank', rel: 'noopener', 'aria-label': item.label },
        mark('upwork', 18, 'upwork-mark'),
        item.stars ? h('span', { class: 'stars', 'aria-hidden': 'true' },
          Array.from({ length: item.stars }, () => mark('star', 14, 'star'))) : null,
        h('span', { class: 'proof-text' }, item.text)))));
  }

  function hireButton({ large = false } = {}) {
    return h('a', {
      class: `btn btn-primary${large ? ' btn-lg' : ''}`,
      href: state.data.contact.upwork,
      target: '_blank',
      rel: 'noopener',
    }, COPY.hireLong);
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
    h('span', { class: 'need-text' },
      h('span', { class: 'need-phrase' }, o.phrase),
      o.hint ? h('span', { class: 'need-hint' }, o.hint) : null),
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
    const lane = state.need === 'all' ? null : laneById(state.need);
    if (!lane) {
      status.replaceChildren(h('strong', { dataset: { count: shown } }, String(shown)), ` ${COPY.projects}`);
    } else {
      status.replaceChildren(h('strong', { dataset: { count: shown } }, String(shown)), ` of ${total} ${COPY.projects} for “${lane.need}”`);
    }
    $('#work-reset').hidden = !lane;
  }

  function renderGrid() {
    setChildren($('#project-grid'), h('ul', { class: 'cards' }, shownProjects().map(card)));
  }

  /**
   * A card preview fills one 16:10 box edge to edge with the project's `thumb` (two phone screens
   * side by side when `thumb` lists two), cropped at `thumbPos`, with the domain over the image.
   */
  function preview(p) {
    const { files, pos } = p.thumb;
    const shot = h('div', { class: `preview-shot${files.length > 1 ? ' preview-shot--pair' : ''}` },
      files.map((file) => {
        const img = image(file, '');
        img.style.objectPosition = pos;
        return img;
      }));
    return h('div', { class: 'preview', 'aria-hidden': 'true' },
      shot,
      p.host ? h('span', { class: 'preview-tag' }, p.host) : null,
      p.video ? h('span', { class: 'badge' }, icon('play', 11), COPY.demo) : null);
  }

  function card(p) {
    return h('li', { class: 'card', dataset: { project: p.id } },
      preview(p),
      h('h3', { class: 'card-title' }, h('a', { href: `#${p.id}`, dataset: { open: p.id } }, p.title)),
      h('p', { class: 'card-meta label' }, `${p.type} · ${p.year}`),
      h('p', { class: 'card-oneliner' }, p.oneliner),
      h('p', { class: 'card-result' }, p.result));
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
    const filtered = popup.list.length !== state.data.projects.length;
    const lane = filtered ? laneById(state.need) : null;
    $('#popup-pos').textContent = `${popup.index + 1} of ${popup.list.length}${lane ? ` · ${lane.label}` : ''}`;
    const body = $('#popup-body');
    body.replaceChildren(...popupContent(p));
    body.scrollTop = 0;
    $('#popup-full').href = `#${p.id}`;
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
    const lane = laneOf(p);

    $('#view-project').replaceChildren(
      h('article', { class: 'project', 'aria-labelledby': 'project-title' },
        h('div', { class: 'wrap' },
          h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
            h('a', { href: '#work' }, icon('arrowLeft'), COPY.allWork),
            h('span', { 'aria-hidden': 'true' }, '/'),
            h('span', { 'aria-current': 'page' }, p.title)),
          h('header', { class: 'project-head' },
            h('p', { class: 'label' }, [p.num, lane ? lane.label : ''].filter(Boolean).join(' · ')),
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
        h('div', { class: 'contact-person' },
          person.avatar ? h('img', { class: 'avatar avatar--contact', src: mediaUrl(person.avatar), alt: '', width: 340, height: 340, loading: 'lazy', decoding: 'async' }) : null,
          h('div', null,
            h('p', { class: 'contact-name' }, person.name),
            h('p', { class: 'contact-avail' }, h('span', { class: 'status-dot', 'aria-hidden': 'true' }), joinDot(person.availability, person.location)))),
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
    phoneScreen.addEventListener('change', swapFilmCuts);
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
