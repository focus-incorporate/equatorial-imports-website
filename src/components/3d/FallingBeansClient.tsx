'use client';

import dynamic from 'next/dynamic';

// Dynamically import GLB-loading 3D component
const FallingBeans = dynamic(() => import('./FallingBeans'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 pointer-events-none z-0" />
});

export default FallingBeans;