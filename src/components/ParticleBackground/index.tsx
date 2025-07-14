import React, { useEffect, useRef } from 'react';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import styles from './index.module.scss';

const ParticleBackground: React.FC = () => {
  const particlesContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadParticles() {
      if (particlesContainer.current) {
        await loadSlim(particlesContainer.current as unknown as Engine);
      }
    }
    loadParticles();

    return () => {
      const canvas = document.getElementById('particles-js');
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    };
  }, []);

  return <div ref={particlesContainer} id="particles-js" className={styles.particles}></div>;
};

export default ParticleBackground;