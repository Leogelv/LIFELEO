'use client'

import { useEffect } from 'react'

declare const particlesJS: any

export function ParticlesBackground() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: 40,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ['#E8D9C5', '#C2A790', '#90C290', '#90C2C2']
          },
          shape: {
            type: 'circle'
          },
          opacity: {
            value: 0.2,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.3,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#E8D9C5',
            opacity: 0.1,
            width: 1
          },
          move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'bubble'
            },
            resize: true
          },
          modes: {
            bubble: {
              distance: 200,
              size: 6,
              duration: 2,
              opacity: 0.4,
              speed: 3
            }
          }
        },
        retina_detect: true
      })
    }
  }, [])

  return (
    <div id="particles-js" className="absolute inset-0" />
  )
} 