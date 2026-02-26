'use client';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

function FlowingMenu({ items = [], speed = 15, textColor = '#F2F0E9', bgColor = '#1A1A2E', marqueeBgColor = '#CC5833', marqueeTextColor = '#F2F0E9', borderColor = 'rgba(242,240,233,0.15)' }) {
  return (
    <div className="flowing-menu-wrap" style={{ backgroundColor: bgColor }}>
      <nav className="flowing-menu">
        {items.map((item, idx) => (
          <FlowingMenuItem key={idx} {...item} speed={speed} textColor={textColor} marqueeBgColor={marqueeBgColor} marqueeTextColor={marqueeTextColor} borderColor={borderColor} />
        ))}
      </nav>
    </div>
  );
}

function FlowingMenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animRef = useRef(null);
  const [reps, setReps] = useState(4);
  const animDefs = { duration: 0.6, ease: 'expo' };

  const findEdge = (mx, my, w, h) => {
    const td = dist(mx, my, w / 2, 0);
    const bd = dist(mx, my, w / 2, h);
    return td < bd ? 'top' : 'bottom';
  };
  const dist = (x, y, x2, y2) => (x - x2) ** 2 + (y - y2) ** 2;

  useEffect(() => {
    const calc = () => {
      if (!marqueeInnerRef.current) return;
      const part = marqueeInnerRef.current.querySelector('.flowing-marquee__part');
      if (!part) return;
      const cw = part.offsetWidth;
      const vw = window.innerWidth;
      setReps(Math.max(4, Math.ceil(vw / cw) + 2));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [text, image]);

  useEffect(() => {
    const setup = () => {
      if (!marqueeInnerRef.current) return;
      const part = marqueeInnerRef.current.querySelector('.flowing-marquee__part');
      if (!part) return;
      const cw = part.offsetWidth;
      if (!cw) return;
      if (animRef.current) animRef.current.kill();
      animRef.current = gsap.to(marqueeInnerRef.current, { x: -cw, duration: speed, ease: 'none', repeat: -1 });
    };
    const t = setTimeout(setup, 50);
    return () => { clearTimeout(t); animRef.current?.kill(); };
  }, [text, image, reps, speed]);

  const onEnter = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const r = itemRef.current.getBoundingClientRect();
    const edge = findEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
    gsap.timeline({ defaults: animDefs })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' });
  };

  const onLeave = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const r = itemRef.current.getBoundingClientRect();
    const edge = findEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
    gsap.timeline({ defaults: animDefs })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' });
  };

  return (
    <div className="flowing-menu__item" ref={itemRef} style={{ borderColor }}>
      <a className="flowing-menu__item-link" href={link} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ color: textColor }}>
        {text}
      </a>
      <div className="flowing-marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="flowing-marquee__inner-wrap">
          <div className="flowing-marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(reps)].map((_, i) => (
              <div className="flowing-marquee__part" key={i} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                {image && <div className="flowing-marquee__img" style={{ backgroundImage: `url(${image})` }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
