import '@testing-library/jest-dom'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return React.createElement('img', props)
  },
}))

// Mock three.js for 3D components
jest.mock('three', () => ({
  Mesh: jest.fn(),
  Scene: jest.fn(),
  WebGLRenderer: jest.fn(),
  PerspectiveCamera: jest.fn(),
  DirectionalLight: jest.fn(),
  AmbientLight: jest.fn(),
}))

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => React.createElement('div', { 'data-testid': 'three-canvas' }, children),
  useFrame: jest.fn(),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    img: 'img',
  },
  AnimatePresence: ({ children }) => children,
}))

// Global test setup
global.React = require('react')