interface RegisterParams {
  username: string;
  password: string;
  captcha: string;
}

declare module 'particles.js' {
  interface ParticleOptions {
    particles?: {
      number?: {
        value?: number;
        density?: {
          enable?: boolean;
          value_area?: number;
        };
      };
      color?: {
        value?: string | string[];
      };
      shape?: {
        type?: string | string[];
      };
      opacity?: {
        value?: number;
        random?: boolean;
      };
      size?: {
        value?: number;
        random?: boolean;
      };
      line_linked?: {
        enable?: boolean;
        distance?: number;
        color?: string;
        opacity?: number;
        width?: number;
      };
      move?: {
        enable?: boolean;
        speed?: number;
        direction?: string;
        random?: boolean;
        straight?: boolean;
        out_mode?: string;
        bounce?: boolean;
      };
    };
    interactivity?: {
      detect_on?: string;
      events?: {
        onhover?: {
          enable?: boolean;
          mode?: string | string[];
        };
        onclick?: {
          enable?: boolean;
          mode?: string | string[];
        };
        resize?: boolean;
      };
      modes?: {
        grab?: {
          distance?: number;
          line_linked?: {
            opacity?: number;
          };
        };
        push?: {
          particles_nb?: number;
        };
      };
    };
    retina_detect?: boolean;
  }

  interface ParticlesJS {
    (tagId: string, params: ParticleOptions): void;
    load(tagId: string, pathConfigJson: string, callback: () => void): void;
    setOptions(tagId: string, params: ParticleOptions): void;
    destroy(tagId: string): void;
  }

  const particlesJS: ParticlesJS;
  export default particlesJS;
}
