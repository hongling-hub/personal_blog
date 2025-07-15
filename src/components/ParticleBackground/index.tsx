import React, { useEffect, useRef } from 'react';
import { loadSlim } from 'tsparticles-slim';
import { Engine, tsParticles } from 'tsparticles-engine';
import type { Container } from 'tsparticles-engine';
import styles from './index.module.scss';

interface ParticleBackgroundProps {
  className?: string;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ className }) => {
  const particlesContainer = useRef<HTMLDivElement>(null);

useEffect(() => {
  let container: Container | undefined;

  async function loadParticles() {
    if (!particlesContainer.current) return;

    await loadSlim(tsParticles);
    
    try {
      container = await tsParticles.load({
        id: 'particles',
        element: particlesContainer.current,
        options: {
          autoPlay: true,
          background: { color: "transparent" },
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#1890ff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { 
              enable: true, 
              distance: 150, 
              color: '#1890ff', 
              opacity: 0.2, 
              width: 1 
            },
            move: { 
              enable: true, 
              speed: 1, 
              direction: 'none', 
              random: true, 
              straight: false, 
              out_mode: 'out', 
              bounce: false 
            }
          },
          interactivity: {
            detect_on: 'window',
            events: {
              onhover: { enable: true, mode: 'grab' },
              onclick: { enable: true, mode: 'push' },
              resize: true
            },
            modes: {
              grab: { distance: 140, line_linked: { opacity: 0.5 } },
              push: { particles_nb: 4 }
            }
          },
          detectRetina: true
        }
      });

      if (container) {
        container.refresh();
        container.play();
      }
    } catch (error) {
      console.error("Particles error:", error);
    }
  }

  loadParticles();

  return () => {
    if (particlesContainer.current) {
      particlesContainer.current.innerHTML = '';
    }
  };
}, []);

  return (
    <div 
      ref={particlesContainer} 
      id="particles-js" 
      className={`${styles.particles} ${className ?? ''}`}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: -1,
        backgroundColor: 'transparent'
      }}
    />
  );
};

export default ParticleBackground;