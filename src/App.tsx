import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Gamepad2, Trophy, Zap, Play, RotateCcw, Sparkles, Award, UserRound, Medal } from 'lucide-react';

type GameId = 'snake' | 'dash' | 'space';
type Point = { x: number; y: number };
const SIZE = 16;
const START: Point[] = [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }];

function randomFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
  } while (snake.some((part) => part.x === p.x && part.y === p.y));
  return p;
}

function SnakeGame({ onBack, onScore }: { onBack: () => void; onScore: (score: number) => void }) {
  const [snake, setSnake] = useState<Point[]>(START);
  const [food, setFood] = useState<Point>(() => randomFood(START));
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const directionRef = useRef(direction);
  directionRef.current = direction;

  const turn = useCallback((next: Point) => {
    const current = directionRef.current;
    if (next.x !== -current.x || next.y !== -current.y) setDirection(next);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const keys: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }
      };
      if (keys[event.key]) { event.preventDefault(); turn(keys[event.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  useEffect(() => {
    if (!running || over) return;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const dir = directionRef.current;
        const head = { x: current[0].x + dir.x, y: current[0].y + dir.y };
        const ate = head.x === food.x && head.y === food.y;
        const body = ate ? current : current.slice(0, -1);
        if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE || body.some((p) => p.x === head.x && p.y === head.y)) {
          setRunning(false); setOver(true); return current;
        }
        const next = [head, ...current.slice(0, ate ? current.length : -1)];
        if (ate) {
          setScore((s) => { const value = s + 10; onScore(value); return value; });
          setFood(randomFood(next));
        }
        return next;
      });
    }, 145);
    return () => window.clearInterval(timer);
  }, [running, over, food, onScore]);

  const restart = () => {
    setSnake(START); setFood(randomFood(START)); setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 }; setScore(0); setOver(false); setRunning(true);
  };

  return <section className="game-screen">
    <div className="game-top"><button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Volver</button><span className="game-tag">ARCADE ORIGINAL</span></div>
    <div className="game-heading"><div><p className="eyebrow">MINIJUEGO 01</p><h2>Snake <span className="gradient-text">X</span></h2><p className="muted">Come los píxeles. No choques contigo mismo.</p></div><div className="score-box"><Trophy size={17} /><strong>{score}</strong><small>PUNTOS</small></div></div>
    <div className="snake-board" role="img" aria-label="Tablero de Snake">
      {Array.from({ length: SIZE * SIZE }, (_, i) => {
        const x = i % SIZE, y = Math.floor(i / SIZE);
        const isHead = snake[0]?.x === x && snake[0]?.y === y;
        const isBody = snake.slice(1).some((p) => p.x === x && p.y === y);
        const isFood = food.x === x && food.y === y;
        return <div key={i} className={`cell ${isHead ? 'head' : isBody ? 'body' : isFood ? 'food' : ''}`} />;
      })}
    </div>
    <div className="game-actions">
      {over ? <div className="over-note">¡Partida terminada! Puntaje: {score}</div> : !running ? <div className="over-note">Pulsa iniciar cuando estés listo.</div> : <div className="over-note">¡Dale, vas bien! 🐍</div>}
      <button className="primary-btn" onClick={() => running ? setRunning(false) : over ? restart() : setRunning(true)}><Play size={17} /> {over ? 'Jugar otra vez' : running ? 'Pausar' : 'Iniciar partida'}</button>
      <button className="icon-btn" aria-label="Reiniciar" onClick={restart}><RotateCcw size={18} /></button>
    </div>
    <div className="mobile-controls">
      <button onClick={() => turn({ x: 0, y: -1 })} aria-label="Arriba"><ArrowUp /></button>
      <div><button onClick={() => turn({ x: -1, y: 0 })} aria-label="Izquierda"><ArrowLeft /></button><button onClick={() => turn({ x: 0, y: 1 })} aria-label="Abajo"><ArrowDown /></button><button onClick={() => turn({ x: 1, y: 0 })} aria-label="Derecha"><ArrowRight /></button></div>
    </div>
    <p className="controls-hint">Controles: flechas del teclado o WASD · En móvil usa los botones</p>
  </section>;
}

function DashGame({ onBack, onScore }: { onBack: () => void; onScore: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [active, setActive] = useState(false);
  const [ended, setEnded] = useState(false);
  const [target, setTarget] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTarget((n) => (n + 1) % 9), 750);
    const end = window.setTimeout(() => { setActive(false); setEnded(true); }, 15000);
    return () => { window.clearInterval(id); window.clearTimeout(end); };
  }, [active]);
  const start = () => { setScore(0); onScore(0); setTarget(0); setEnded(false); setActive(true); };
  return <section className="game-screen">
    <div className="game-top"><button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Volver</button><span className="game-tag">REFLEJOS</span></div>
    <div className="game-heading"><div><p className="eyebrow">MINIJUEGO 02</p><h2>Pixel <span className="gradient-text">Dash</span></h2><p className="muted">Toca el cuadro brillante antes de que cambie.</p></div><div className="score-box"><Trophy size={17} /><strong>{score}</strong><small>PUNTOS</small></div></div>
    <div className="dash-grid">{Array.from({ length: 9 }, (_, i) => <button key={i} disabled={!active} className={`dash-cell ${active && i === target ? 'lit' : ''}`} onClick={() => { if (i === target) { setScore((s) => { const v = s + 1; onScore(v); return v; }); setTarget((n) => (n + 4) % 9); } }} aria-label={`Cuadro ${i + 1}`} />)}</div>
    <div className="game-actions"><div className="over-note">{ended ? '¡Tiempo! Buen intento.' : active ? '¡Encuentra el cuadro encendido!' : 'Tienes 15 segundos. ¿Listo?'}</div><button className="primary-btn" onClick={start}><Play size={17} /> {ended || active ? 'Reiniciar' : 'Comenzar'}</button></div>
  </section>;
}

function SpaceGame({ onBack, onScore }: { onBack: () => void; onScore: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState(4);
  return <section className="game-screen">
    <div className="game-top"><button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Volver</button><span className="game-tag">PUNTUACIÓN</span></div>
    <div className="game-heading"><div><p className="eyebrow">MINIJUEGO 03</p><h2>Space <span className="gradient-text">Tap</span></h2><p className="muted">Defiende la galaxia tocando los objetivos.</p></div><div className="score-box"><Trophy size={17} /><strong>{score}</strong><small>PUNTOS</small></div></div>
    <div className="space-field"><div className="stars">✦　·　　 ✧　　·　✦<br />　·　✧　　·　　　✦</div><button className="space-target" style={{ left: `${15 + (target * 17) % 70}%`, top: `${18 + (target * 13) % 60}%` }} onClick={() => { if (started) { setScore((s) => { const v = s + 10; onScore(v); return v; }); setTarget((n) => n + 1); } }}>✦</button><div className="space-ship">▲</div></div>
    <div className="game-actions"><div className="over-note">{started ? '¡Objetivo localizado! Sigue tocando.' : 'Pulsa comenzar para activar el radar.'}</div><button className="primary-btn" onClick={() => { setStarted(true); setScore(0); onScore(0); setTarget(4); }}><Play size={17} /> {started ? 'Reiniciar' : 'Comenzar'}</button></div>
  </section>;
}

export default function App() {
  const [game, setGame] = useState<GameId | null>(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('arcadehub-player') || 'Jugador 1');
  const [played, setPlayed] = useState<Record<GameId, number>>(() => {
    try { return JSON.parse(localStorage.getItem('arcadehub-played') || '{"snake":0,"dash":0,"space":0}'); }
    catch { return { snake: 0, dash: 0, space: 0 }; }
  });
  const [best, setBest] = useState<Record<GameId, number>>(() => {
    try { return JSON.parse(localStorage.getItem('arcadehub-best') || '{"snake":0,"dash":0,"space":0}'); }
    catch { return { snake: 0, dash: 0, space: 0 }; }
  });
  const saveScore = useCallback((id: GameId, score: number) => {
    setBest((old) => {
      const next = { ...old, [id]: Math.max(old[id], score) };
      localStorage.setItem('arcadehub-best', JSON.stringify(next));
      return next;
    });
  }, []);
  const launchGame = (id: GameId) => {
    setPlayed((old) => {
      const next = { ...old, [id]: old[id] + 1 };
      localStorage.setItem('arcadehub-played', JSON.stringify(next));
      return next;
    });
    setGame(id);
  };
  const renamePlayer = () => {
    const value = window.prompt('¿Cómo quieres aparecer en ArcadeHub?', playerName);
    if (value && value.trim()) {
      const clean = value.trim().slice(0, 18);
      setPlayerName(clean);
      localStorage.setItem('arcadehub-player', clean);
    }
  };
  const totalPlays = Object.values(played).reduce((sum, value) => sum + value, 0);
  const totalRecords = Object.values(best).reduce((sum, value) => sum + value, 0);
  const achievements = [
    { title: 'Primer despegue', detail: 'Juega tu primera partida', unlocked: totalPlays >= 1, icon: '🚀' },
    { title: 'Rey de los píxeles', detail: 'Consigue 50 puntos en Snake X', unlocked: best.snake >= 50, icon: '🐍' },
    { title: 'Reflejos turbo', detail: 'Consigue 10 puntos en Pixel Dash', unlocked: best.dash >= 10, icon: '⚡' },
    { title: 'Explorador espacial', detail: 'Consigue 100 puntos en Space Tap', unlocked: best.space >= 100, icon: '🌌' },
    { title: 'Coleccionista', detail: 'Prueba los tres minijuegos', unlocked: Object.values(played).every((value) => value > 0), icon: '🏆' }
  ];

  if (game === 'snake') return <main className="app-shell"><SnakeGame onBack={() => setGame(null)} onScore={(s) => saveScore('snake', s)} /></main>;
  if (game === 'dash') return <main className="app-shell"><DashGame onBack={() => setGame(null)} onScore={(s) => saveScore('dash', s)} /></main>;
  if (game === 'space') return <main className="app-shell"><SpaceGame onBack={() => setGame(null)} onScore={(s) => saveScore('space', s)} /></main>;

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Gamepad2 size={23} /></span>Arcade<span className="gradient-text">Hub</span></a><div className="top-status"><span className="status-dot" /> SALA ABIERTA</div></header>
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><Sparkles size={14} /> TU NUEVA SALA DE JUEGOS</div><h1>Un mundo de juegos.<br /><span className="gradient-text">Una sola pantalla.</span></h1><p>Entra, elige tu minijuego y rompe tu propio récord. La diversión empieza aquí.</p><button className="primary-btn hero-btn" onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}><Play size={17} fill="currentColor" /> Explorar juegos</button></div>
      <div className="hero-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="console"><div className="console-screen"><span>ARCADE</span><strong>HUB<span>_</span></strong><small>INSERT COIN TO PLAY</small></div><div className="console-controls"><i /><b /><b /><b /><b /></div></div><div className="floating-chip chip-one">✦ +10</div><div className="floating-chip chip-two">PLAYER 1</div></div>
    </section>
    <section id="games" className="games-section"><div className="section-head"><div><p className="eyebrow">ESCOGE TU RETO</p><h2>Catálogo <span className="gradient-text">arcade</span></h2></div><span className="game-count">03 JUEGOS DISPONIBLES</span></div>
      <div className="game-cards">
        <button className="game-card snake-card" onClick={() => launchGame('snake')}><div className="card-art snake-art"><span className="pixel-snake">▰ ▰ ▰<br />　　●</span><span className="art-label">01 / CLÁSICO</span></div><div className="card-info"><div><h3>Snake X</h3><p>El clásico que nunca falla.</p></div><span className="card-arrow">↗</span></div><div className="card-footer"><span><Zap size={13} /> INDIVIDUAL</span><span>RÉCORD: {best.snake}</span></div></button>
        <button className="game-card dash-card" onClick={() => launchGame('dash')}><div className="card-art dash-art"><span className="dash-symbol">▦</span><span className="art-label">02 / REFLEJOS</span></div><div className="card-info"><div><h3>Pixel Dash</h3><p>Tu velocidad manda.</p></div><span className="card-arrow">↗</span></div><div className="card-footer"><span><Zap size={13} /> INDIVIDUAL</span><span>RÉCORD: {best.dash}</span></div></button>
        <button className="game-card space-card" onClick={() => launchGame('space')}><div className="card-art space-art"><span className="planet">✦</span><span className="art-label">03 / ARCADE</span></div><div className="card-info"><div><h3>Space Tap</h3><p>La galaxia necesita tu ayuda.</p></div><span className="card-arrow">↗</span></div><div className="card-footer"><span><Zap size={13} /> INDIVIDUAL</span><span>RÉCORD: {best.space}</span></div></button>
      </div>
    </section>
    <section className="profile-section">
      <div className="profile-heading"><div><p className="eyebrow"><UserRound size={14} /> CENTRO DE JUGADOR</p><h2>Tu perfil <span className="gradient-text">arcade</span></h2></div><button className="edit-profile" onClick={renamePlayer}>Editar perfil</button></div>
      <div className="profile-panel">
        <div className="player-identity"><div className="player-avatar"><Gamepad2 size={27} /></div><div><strong>{playerName}</strong><small>PLAYER 01 · EN ENTRENAMIENTO</small></div></div>
        <div className="profile-stats"><div><strong>{totalPlays}</strong><small>PARTIDAS</small></div><div><strong>{totalRecords}</strong><small>RÉCORDS SUMADOS</small></div><div><strong>{achievements.filter((item) => item.unlocked).length}/{achievements.length}</strong><small>LOGROS</small></div></div>
      </div>
      <div className="achievement-title"><h3><Medal size={17} /> Colección de logros</h3><span>{achievements.filter((item) => item.unlocked).length} desbloqueados</span></div>
      <div className="achievement-grid">{achievements.map((item) => <div key={item.title} className={`achievement-card ${item.unlocked ? 'unlocked' : 'locked'}`}><span className="achievement-icon">{item.unlocked ? item.icon : '🔒'}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div><Award size={16} /></div>)}</div>
    </section>
    <section className="features"><div><Trophy /><span><strong>Récords locales</strong><small>Supera tus mejores marcas.</small></span></div><div><Gamepad2 /><span><strong>Hecho para jugar</strong><small>Diseño adaptable a móvil y PC.</small></span></div><div><Sparkles /><span><strong>En construcción</strong><small>Nuevos modos llegarán pronto.</small></span></div></section>
    <footer><span>ARCADEHUB © 2026</span><span>HECHO PARA DIVERTIRSE <b>✦</b></span></footer>
  </main>;
}