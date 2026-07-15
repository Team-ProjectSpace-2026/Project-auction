import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './CricketBallCursor.css';

const CricketBallCursor = () => {
  const ballRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return;

    const quickX = gsap.quickTo(ball, 'x', { duration: 0.4, ease: 'power3.out' });
    const quickY = gsap.quickTo(ball, 'y', { duration: 0.4, ease: 'power3.out' });

    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      quickX(e.clientX);
      quickY(e.clientY);
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      ref={ballRef}
      className="cricket-ball-cursor"
      aria-hidden="true"
    >
      <div className="cricket-ball-stitch" />
    </div>
  );
};

export default CricketBallCursor;
