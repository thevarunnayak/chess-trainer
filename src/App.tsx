/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { ChessGameContainer } from './components/ChessGame';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay for loading experience
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <ChessGameContainer />
    </div>
  );
}
