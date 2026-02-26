'use client';
import { useRef, useEffect } from 'react';

const LetterGlitch = ({ glitchColors = ['#2E4036', '#CC5833', '#F2F0E9'], className = '', glitchSpeed = 50, centerVignette = false, outerVignette = true, smooth = true, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789', style = {} }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const letters = useRef([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const ctx = useRef(null);
  const lastGlitch = useRef(Date.now());
  const chars = Array.from(characters);
  const fontSize = 16, cw = 10, ch = 20;

  const getRandChar = () => chars[Math.floor(Math.random() * chars.length)];
  const getRandColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];
  const hexToRgb = hex => { const s = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m,r,g,b)=>r+r+g+g+b+b); const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s); return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null; };
  const lerp = (a, b, t) => `rgb(${Math.round(a.r+(b.r-a.r)*t)},${Math.round(a.g+(b.g-a.g)*t)},${Math.round(a.b+(b.b-a.b)*t)})`;

  const init = (cols, rows) => {
    grid.current = { columns: cols, rows };
    letters.current = Array.from({ length: cols * rows }, () => ({ char: getRandChar(), color: getRandColor(), targetColor: getRandColor(), prog: 1 }));
  };

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    if (ctx.current) ctx.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { columns, rows } = { columns: Math.ceil(rect.width / cw), rows: Math.ceil(rect.height / ch) };
    init(columns, rows);
    draw();
  };

  const draw = () => {
    if (!ctx.current || !letters.current.length) return;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    ctx.current.clearRect(0, 0, width, height);
    ctx.current.font = `${fontSize}px monospace`;
    ctx.current.textBaseline = 'top';
    letters.current.forEach((l, i) => {
      const x = (i % grid.current.columns) * cw;
      const y = Math.floor(i / grid.current.columns) * ch;
      ctx.current.fillStyle = l.color;
      ctx.current.fillText(l.char, x, y);
    });
  };

  const update = () => {
    if (!letters.current.length) return;
    const n = Math.max(1, Math.floor(letters.current.length * 0.05));
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[idx]) continue;
      letters.current[idx].char = getRandChar();
      letters.current[idx].targetColor = getRandColor();
      if (!smooth) { letters.current[idx].color = letters.current[idx].targetColor; letters.current[idx].prog = 1; }
      else letters.current[idx].prog = 0;
    }
  };

  const handleSmooth = () => {
    let needs = false;
    letters.current.forEach(l => {
      if (l.prog < 1) {
        l.prog = Math.min(1, l.prog + 0.05);
        const s = hexToRgb(l.color);
        const e = hexToRgb(l.targetColor);
        if (s && e) { l.color = lerp(s, e, l.prog); needs = true; }
      }
    });
    if (needs) draw();
  };

  const animate = () => {
    const now = Date.now();
    if (now - lastGlitch.current >= glitchSpeed) { update(); draw(); lastGlitch.current = now; }
    if (smooth) handleSmooth();
    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctx.current = canvas.getContext('2d');
    resize();
    animate();
    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(() => { cancelAnimationFrame(animRef.current); resize(); animate(); }, 100); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', onResize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, smooth]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#1A1A2E', overflow: 'hidden', ...style }} className={className}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      {outerVignette && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%)' }} />}
      {centerVignette && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)' }} />}
    </div>
  );
};

export default LetterGlitch;
