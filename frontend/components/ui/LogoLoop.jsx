'use client';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';

const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };
const toCssLength = v => (typeof v === 'number' ? `${v}px` : (v ?? undefined));

const useResizeObserver = (callback, elements, dependencies) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const h = () => callback();
      window.addEventListener('resize', h);
      callback();
      return () => window.removeEventListener('resize', h);
    }
    const obs = elements.map(ref => {
      if (!ref.current) return null;
      const o = new ResizeObserver(callback);
      o.observe(ref.current);
      return o;
    });
    callback();
    return () => obs.forEach(o => o?.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...dependencies]);
};

const useImageLoader = (seqRef, onLoad, dependencies) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (!images.length) { onLoad(); return; }
    let remaining = images.length;
    const done = () => { if (--remaining === 0) onLoad(); };
    images.forEach(img => {
      if (img.complete) done();
      else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
    return () => images.forEach(img => { img.removeEventListener('load', done); img.removeEventListener('error', done); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLoad, seqRef, ...dependencies]);
};

const useAnimationLoop = (trackRef, targetVel, seqW, seqH, isHovered, hoverSpeed, isVert) => {
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const offsetRef = useRef(0);
  const velRef = useRef(0);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const seqSize = isVert ? seqH : seqW;
    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVert ? `translate3d(0,${-offsetRef.current}px,0)` : `translate3d(${-offsetRef.current}px,0,0)`;
    }
    const animate = ts => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.max(0, ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVel;
      const k = 1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU);
      velRef.current += (target - velRef.current) * k;
      if (seqSize > 0) {
        let next = ((offsetRef.current + velRef.current * dt) % seqSize + seqSize) % seqSize;
        offsetRef.current = next;
        track.style.transform = isVert ? `translate3d(0,${-next}px,0)` : `translate3d(${-next}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; lastTsRef.current = null; };
  }, [targetVel, seqW, seqH, isHovered, hoverSpeed, isVert, trackRef]);
};

export const LogoLoop = memo(({ logos, speed = 120, direction = 'left', width = '100%', logoHeight = 28, gap = 32, pauseOnHover, hoverSpeed, fadeOut = false, fadeOutColor, scaleOnHover = false, renderItem, ariaLabel = 'Partner logos', className, style }) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const seqRef = useRef(null);
  const [seqW, setSeqW] = useState(0);
  const [seqH, setSeqH] = useState(0);
  const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    return undefined;
  }, [hoverSpeed, pauseOnHover]);

  const isVert = direction === 'up' || direction === 'down';
  const targetVel = useMemo(() => {
    const mag = Math.abs(speed);
    const dir = isVert ? (direction === 'up' ? 1 : -1) : (direction === 'left' ? 1 : -1);
    return mag * dir * (speed < 0 ? -1 : 1);
  }, [speed, direction, isVert]);

  const update = useCallback(() => {
    const cW = containerRef.current?.clientWidth ?? 0;
    const rect = seqRef.current?.getBoundingClientRect?.();
    const sW = rect?.width ?? 0;
    const sH = rect?.height ?? 0;
    if (isVert) {
      const ph = containerRef.current?.parentElement?.clientHeight ?? 0;
      if (containerRef.current && ph > 0) containerRef.current.style.height = `${Math.ceil(ph)}px`;
      if (sH > 0) { setSeqH(Math.ceil(sH)); setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil((containerRef.current?.clientHeight ?? ph ?? sH) / sH) + ANIMATION_CONFIG.COPY_HEADROOM)); }
    } else if (sW > 0) {
      setSeqW(Math.ceil(sW));
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil(cW / sW) + ANIMATION_CONFIG.COPY_HEADROOM));
    }
  }, [isVert]);

  useResizeObserver(update, [containerRef, seqRef], [logos, gap, logoHeight, isVert]);
  useImageLoader(seqRef, update, [logos, gap, logoHeight, isVert]);
  useAnimationLoop(trackRef, targetVel, seqW, seqH, isHovered, effectiveHoverSpeed, isVert);

  const onEnter = useCallback(() => { if (effectiveHoverSpeed !== undefined) setIsHovered(true); }, [effectiveHoverSpeed]);
  const onLeave = useCallback(() => { if (effectiveHoverSpeed !== undefined) setIsHovered(false); }, [effectiveHoverSpeed]);

  const renderLogo = useCallback((item, key) => {
    if (renderItem) return <li className="logoloop__item" key={key} role="listitem">{renderItem(item, key)}</li>;
    const isNode = 'node' in item;
    const content = isNode ? <span className="logoloop__node">{item.node}</span> : <img src={item.src} alt={item.alt ?? ''} loading="lazy" decoding="async" draggable={false} />;
    const label = isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);
    const inner = item.href ? <a className="logoloop__link" href={item.href} aria-label={label || 'logo'} target="_blank" rel="noreferrer noopener">{content}</a> : content;
    return <li className="logoloop__item" key={key} role="listitem">{inner}</li>;
  }, [renderItem]);

  const lists = useMemo(() => Array.from({ length: copyCount }, (_, ci) => (
    <ul className="logoloop__list" key={`c-${ci}`} role="list" aria-hidden={ci > 0} ref={ci === 0 ? seqRef : undefined}>
      {logos.map((item, ii) => renderLogo(item, `${ci}-${ii}`))}
    </ul>
  )), [copyCount, logos, renderLogo]);

  const rootCls = ['logoloop', isVert ? 'logoloop--vertical' : 'logoloop--horizontal', fadeOut && 'logoloop--fade', scaleOnHover && 'logoloop--scale-hover', className].filter(Boolean).join(' ');
  const cssVars = { '--logoloop-gap': `${gap}px`, '--logoloop-logoHeight': `${logoHeight}px`, ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor }) };
  const contStyle = { width: isVert ? (toCssLength(width) === '100%' ? undefined : toCssLength(width)) : (toCssLength(width) ?? '100%'), ...cssVars, ...style };

  return (
    <div ref={containerRef} className={rootCls} style={contStyle} role="region" aria-label={ariaLabel}>
      <div className="logoloop__track" ref={trackRef} onMouseEnter={onEnter} onMouseLeave={onLeave}>{lists}</div>
    </div>
  );
});
LogoLoop.displayName = 'LogoLoop';
export default LogoLoop;
