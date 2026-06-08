import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import NOCHE from './theme'
import BBALL from './content'

function pickEnVoice() {
  const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  return (
    vs.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Google US|Aaron|Allison/i.test(v.name)) ||
    vs.find(v => /en[-_]US/i.test(v.lang)) ||
    vs.find(v => /^en/i.test(v.lang)) || null
  );
}

function useSpeak() {
  const ready = useRef(false);
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const warm = () => { ready.current = true; };
    speechSynthesis.onvoiceschanged = warm; warm();
  }, []);
  return useCallback((text, { onend } = {}) => {
    if (!window.speechSynthesis) { onend && onend(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickEnVoice();
    if (v) u.voice = v;
    u.lang = 'en-US'; u.rate = 0.9; u.pitch = 1;
    if (onend) u.onend = onend;
    speechSynthesis.speak(u);
  }, []);
}

const Ic = {
  home: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 11.5 12 5l8 6.5M6 10v9h12v-9" /><path d="M9.5 19v-5h5v5"/></svg>,
  vocab: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18v15H6.5A1.5 1.5 0 0 0 5 20.5z"/><path d="M5 20.5A1.5 1.5 0 0 1 6.5 19H18"/></svg>,
  phrases: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z"/></svg>,
  drills: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="M9 3.5h6v2.5H9z"/><path d="M9.5 11.5l2 2 3.5-4"/></svg>,
  practice: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.5"/></svg>,
  speaker: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 9.5v5h3.5L13 19V5L7.5 9.5z"/><path d="M16 9c1.2 1 1.2 5 0 6M18.2 7c2.4 2 2.4 8 0 10"/></svg>,
  play: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M7 4.5v15l13-7.5z"/></svg>,
  pause: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>,
  back: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M15 5l-7 7 7 7"/></svg>,
  chev: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M9 5l7 7-7 7"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M5 12.5l4.5 4.5L19 7"/></svg>,
  refresh: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M19 12a7 7 0 1 1-2-4.9M19 4v3.5h-3.5"/></svg>,
  whistle: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="9" cy="14" r="4.5"/><path d="M12.8 11.5 21 8.5l-1 4-7 1.2M9 9.5V6h4"/></svg>,
};

function Icon({ name, size = 22, stroke = 2 }) {
  const C = Ic[name];
  return <C width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke}
            strokeLinecap="round" strokeLinejoin="round" />;
}

function SpeakBtn({ text, speak, big }) {
  const [on, setOn] = useState(false);
  const go = (e) => { e.stopPropagation(); setOn(true); speak(text, { onend: () => setOn(false) }); };
  return (
    <button className={'bb-speak' + (on ? ' is-on' : '') + (big ? ' big' : '')} onClick={go} aria-label="Escuchar">
      <Icon name="speaker" size={big ? 24 : 19} stroke={2} />
      {on && <span className="bb-wave"><i/><i/><i/></span>}
    </button>
  );
}

function HomeScreen({ go, speak, focusTerms, phraseOfDay }) {
  return (
    <div className="bb-scroll">
      <header className="bb-top">
        <div className="bb-kicker">Hoy en la pista</div>
        <h1 className="bb-h1">Buenos días,<br/>coach.</h1>
      </header>

      <div className="bb-pad">
        <div className="bb-card bb-feature">
          <div className="bb-feature-label">Frase del día</div>
          <div className="bb-feature-en">{phraseOfDay.en}</div>
          <div className="bb-feature-es">{phraseOfDay.es}</div>
          <div className="bb-feature-foot">
            <span className="bb-say">{phraseOfDay.say}</span>
            <SpeakBtn text={phraseOfDay.en} speak={speak} big />
          </div>
        </div>

        <button className="bb-cta" onClick={() => go('practice')}>
          <span><Icon name="practice" size={20}/> Repaso rápido</span>
          <span className="bb-cta-sub">5 tarjetas · 2 min</span>
        </button>

        <div className="bb-sec-head"><span className="t">Foco de hoy</span> <span>repite hasta que se quede</span></div>
        <div className="bb-focus-list">
          {focusTerms.map((t, i) => (
            <div key={i} className="bb-row bb-card" role="button" onClick={() => speak(t.en)}>
              <div className="bb-row-main">
                <div className="bb-row-en">{t.en}</div>
                <div className="bb-row-es">{t.es}</div>
              </div>
              <SpeakBtn text={t.en} speak={speak} />
            </div>
          ))}
        </div>

        <div className="bb-quick">
          <button className="bb-quick-btn bb-card" onClick={() => go('drills')}>
            <Icon name="drills" size={22}/><span>Explicar un<br/>ejercicio</span>
          </button>
          <button className="bb-quick-btn bb-card" onClick={() => go('phrases')}>
            <Icon name="phrases" size={22}/><span>Frases de<br/>instrucción</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function VocabScreen({ speak }) {
  const cats = BBALL.categories;
  const [open, setOpen] = useState(null);
  const cat = cats.find(c => c.id === open);

  if (cat) {
    return (
      <div className="bb-scroll">
        <header className="bb-top with-back">
          <button className="bb-back" onClick={() => setOpen(null)}><Icon name="back" size={22}/></button>
          <div className="bb-kicker">{cat.es}</div>
          <h1 className="bb-h1 sm">{cat.en}</h1>
        </header>
        <div className="bb-pad">
          {cat.terms.map((t, i) => (
            <div key={i} className="bb-row bb-card term">
              <div className="bb-row-main">
                <div className="bb-row-en">{t.en}</div>
                <div className="bb-row-es">{t.es}</div>
                <div className="bb-say">{t.say}</div>
                {t.note && <div className="bb-note">{t.note}</div>}
              </div>
              <SpeakBtn text={t.en} speak={speak} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bb-scroll">
      <header className="bb-top">
        <div className="bb-kicker">Diccionario</div>
        <h1 className="bb-h1">Vocabulario</h1>
      </header>
      <div className="bb-pad">
        {cats.map(c => (
          <button key={c.id} className="bb-row bb-card cat" onClick={() => setOpen(c.id)}>
            <div className="bb-cat-glyph" data-g={c.glyph}>{c.terms.length}</div>
            <div className="bb-row-main">
              <div className="bb-row-en">{c.es}</div>
              <div className="bb-row-es">{c.en}</div>
            </div>
            <Icon name="chev" size={20}/>
          </button>
        ))}
      </div>
    </div>
  );
}

function PhrasesScreen({ speak }) {
  const groups = BBALL.phraseGroups;
  return (
    <div className="bb-scroll">
      <header className="bb-top">
        <div className="bb-kicker">Para dirigir</div>
        <h1 className="bb-h1">Frases</h1>
      </header>
      <div className="bb-pad">
        {groups.map((g, gi) => (
          <section key={gi} className="bb-group">
            <div className="bb-group-head">{g.es}</div>
            <div className="bb-card bb-group-card">
              {g.items.map((p, i) => (
                <div key={i} className="bb-prow" role="button" onClick={() => speak(p.en)}>
                  <div className="bb-row-main">
                    <div className="bb-row-en sm">{p.en}</div>
                    <div className="bb-row-es">{p.es}</div>
                  </div>
                  <SpeakBtn text={p.en} speak={speak} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function DrillScript({ drill, speak, back }) {
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(-1);
  const seq = useMemo(
    () => [{ en: 'Setup. ' + drill.setup.en }, ...drill.steps],
    [drill]
  );
  const stop = useCallback(() => { speechSynthesis && speechSynthesis.cancel(); setPlaying(false); setIdx(-1); }, []);
  const playAll = () => {
    if (playing) { stop(); return; }
    setPlaying(true);
    let i = 0;
    const next = () => {
      if (i >= seq.length) { setPlaying(false); setIdx(-1); return; }
      setIdx(i);
      speak(seq[i].en, { onend: () => { i += 1; setTimeout(next, 420); } });
    };
    next();
  };
  useEffect(() => () => { speechSynthesis && speechSynthesis.cancel(); }, []);

  return (
    <div className="bb-scroll">
      <header className="bb-top with-back">
        <button className="bb-back" onClick={() => { stop(); back(); }}><Icon name="back" size={22}/></button>
        <div className="bb-kicker">{drill.meta}</div>
        <h1 className="bb-h1 sm">{drill.en}</h1>
        <div className="bb-h1-sub">{drill.es}</div>
      </header>
      <div className="bb-pad">
        <button className={'bb-cta playall' + (playing ? ' on' : '')} onClick={playAll}>
          <span><Icon name={playing ? 'pause' : 'play'} size={18}/> {playing ? 'Parar' : 'Leer todo en voz alta'}</span>
          <span className="bb-cta-sub">{seq.length} pasos</span>
        </button>

        <div className={'bb-step bb-card setup' + (idx === 0 ? ' active' : '')}>
          <div className="bb-step-tag">Montaje</div>
          <div className="bb-row-en sm">{drill.setup.en}</div>
          <div className="bb-row-es">{drill.setup.es}</div>
          <div className="bb-step-speak"><SpeakBtn text={drill.setup.en} speak={speak} /></div>
        </div>

        {drill.steps.map((s, i) => (
          <div key={i} className={'bb-step bb-card' + (idx === i + 1 ? ' active' : '')}>
            <div className="bb-step-n">{i + 1}</div>
            <div className="bb-step-body">
              <div className="bb-row-en sm">{s.en}</div>
              <div className="bb-row-es">{s.es}</div>
            </div>
            <div className="bb-step-speak"><SpeakBtn text={s.en} speak={speak} /></div>
          </div>
        ))}

        <div className="bb-cues">
          <div className="bb-cues-head"><Icon name="whistle" size={18}/> Para corregir en marcha</div>
          {drill.cues.map((c, i) => (
            <button key={i} className="bb-cue" onClick={() => speak(c.en)}>
              <span className="bb-cue-en">"{c.en}"</span>
              <span className="bb-cue-es">{c.es}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DrillsScreen({ speak }) {
  const drills = BBALL.drills;
  const [open, setOpen] = useState(null);
  const drill = drills.find(d => d.id === open);
  if (drill) return <DrillScript drill={drill} speak={speak} back={() => setOpen(null)} />;
  return (
    <div className="bb-scroll">
      <header className="bb-top">
        <div className="bb-kicker">Guiones listos</div>
        <h1 className="bb-h1">Ejercicios</h1>
      </header>
      <div className="bb-pad">
        <p className="bb-lead">Explica un ejercicio entero en inglés, paso a paso. Pulsa <strong>Leer todo</strong> y sígueme.</p>
        {drills.map(d => (
          <button key={d.id} className="bb-row bb-card drill" onClick={() => setOpen(d.id)}>
            <div className="bb-drill-icon"><Icon name="drills" size={22}/></div>
            <div className="bb-row-main">
              <div className="bb-row-en">{d.en}</div>
              <div className="bb-row-es">{d.es}</div>
              <div className="bb-drill-meta">{d.meta}</div>
            </div>
            <Icon name="chev" size={20}/>
          </button>
        ))}
      </div>
    </div>
  );
}

function buildDeck() {
  const out = [];
  BBALL.categories.forEach(c =>
    c.terms.forEach(t => out.push({ en: t.en, es: t.es, say: t.say, cat: c.es })));
  return out;
}

function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [x[i], x[j]] = [x[j], x[i]]; } return x; }

function FlashMode({ speak }) {
  const deck = useMemo(() => shuffle(buildDeck()), []);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const card = deck[i % deck.length];
  const reveal = () => { if (!flip) { setFlip(true); speak(card.en); } };
  const next = (got) => { if (got) setKnown(k => k + 1); setFlip(false); setI(v => v + 1); };
  return (
    <div className="bb-practice">
      <div className="bb-prog"><span style={{ width: `${(i % deck.length) / deck.length * 100}%` }}/></div>
      <div className="bb-prog-label">{(i % deck.length) + 1} / {deck.length} · {known} acertadas</div>

      <div className={'bb-flash' + (flip ? ' flipped' : '')} role="button" onClick={reveal}>
        <div className="bb-flash-inner">
        <div className="bb-flash-face front">
          <div className="bb-flash-tag">Dilo en inglés</div>
          <div className="bb-flash-es">{card.es}</div>
          <div className="bb-flash-hint">Toca para ver la respuesta</div>
        </div>
        <div className="bb-flash-face back">
          <div className="bb-flash-tag">{card.cat}</div>
          <div className="bb-flash-en">{card.en}</div>
          <div className="bb-say big">{card.say}</div>
          <div className="bb-flash-speak"><SpeakBtn text={card.en} speak={speak} big/></div>
        </div>
        </div>
      </div>

      <div className={'bb-rate' + (flip ? ' show' : '')}>
        <button className="bb-rate-btn again" onClick={() => next(false)}><Icon name="refresh" size={18}/> Otra vez</button>
        <button className="bb-rate-btn got" onClick={() => next(true)}><Icon name="check" size={18}/> La sé</button>
      </div>
    </div>
  );
}

function ListenMode({ speak }) {
  const deck = useMemo(() => shuffle(buildDeck()), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const correct = deck[i % deck.length];
  const options = useMemo(() => {
    const others = shuffle(deck.filter(d => d.es !== correct.es)).slice(0, 2);
    return shuffle([correct, ...others]);
  }, [i]);
  useEffect(() => { const t = setTimeout(() => speak(correct.en), 280); return () => clearTimeout(t); }, [i]);
  const pick = (o) => { if (picked) return; setPicked(o); };
  const next = () => { setPicked(null); setI(v => v + 1); };
  return (
    <div className="bb-practice">
      <div className="bb-listen-q">
        <div className="bb-flash-tag">¿Qué he dicho?</div>
        <button className="bb-listen-play" onClick={() => speak(correct.en)}>
          <Icon name="speaker" size={30}/> <span>Escuchar de nuevo</span>
        </button>
      </div>
      <div className="bb-opts">
        {options.map((o, k) => {
          let cls = 'bb-opt';
          if (picked) {
            if (o.es === correct.es) cls += ' right';
            else if (o.es === picked.es) cls += ' wrong';
            else cls += ' dim';
          }
          return <button key={k} className={cls} onClick={() => pick(o)}>{o.es}</button>;
        })}
      </div>
      {picked && (
        <div className="bb-listen-foot">
          <div className="bb-listen-ans">{correct.en} <span className="bb-say">{correct.say}</span></div>
          <button className="bb-rate-btn got" onClick={next}>Siguiente <Icon name="chev" size={16}/></button>
        </div>
      )}
    </div>
  );
}

function PracticeScreen({ speak }) {
  const [mode, setMode] = useState('flash');
  return (
    <div className="bb-scroll">
      <header className="bb-top">
        <div className="bb-kicker">Que se quede</div>
        <h1 className="bb-h1">Práctica</h1>
      </header>
      <div className="bb-pad">
        <div className="bb-seg">
          <button className={mode === 'flash' ? 'on' : ''} onClick={() => setMode('flash')}>Tarjetas</button>
          <button className={mode === 'listen' ? 'on' : ''} onClick={() => setMode('listen')}>Escucha</button>
        </div>
        {mode === 'flash'
          ? <FlashMode key="f" speak={speak} />
          : <ListenMode key="l" speak={speak} />}
      </div>
    </div>
  );
}

const TABS = [
  { id: 'home', label: 'Hoy', icon: 'home' },
  { id: 'vocab', label: 'Vocab', icon: 'vocab' },
  { id: 'phrases', label: 'Frases', icon: 'phrases' },
  { id: 'drills', label: 'Drills', icon: 'drills' },
  { id: 'practice', label: 'Práctica', icon: 'practice' },
];

export default function CoachApp({ theme = NOCHE }) {
  const [tab, setTab] = useState(() => {
    try { return localStorage.getItem('ec.tab') || 'home'; } catch (e) { return 'home'; }
  });
  useEffect(() => { try { localStorage.setItem('ec.tab', tab); } catch (e) {} }, [tab]);
  const speak = useSpeak();
  const focusTerms = useMemo(() => {
    const off = BBALL.categories.find(c => c.id === 'offense').terms;
    const def = BBALL.categories.find(c => c.id === 'defense').terms;
    return [off[0], def[3], off[10]];
  }, []);
  const phraseOfDay = BBALL.phraseGroups[2].items[5];

  const screen = {
    home: <HomeScreen go={setTab} speak={speak} focusTerms={focusTerms} phraseOfDay={phraseOfDay} />,
    vocab: <VocabScreen speak={speak} />,
    phrases: <PhrasesScreen speak={speak} />,
    drills: <DrillsScreen speak={speak} />,
    practice: <PracticeScreen speak={speak} />,
  }[tab];

  return (
    <div className={'bb-app theme-' + theme.id} style={theme.vars}>
      <div className="bb-app-body">{screen}</div>
      <nav className="bb-tabs">
        {TABS.map(t => (
          <button key={t.id} className={'bb-tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={23} stroke={tab === t.id ? 2.4 : 1.9} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
