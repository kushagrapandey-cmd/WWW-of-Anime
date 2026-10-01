import { useState } from 'react';
// Optional user-supplied local artwork. The container's gradient always remains underneath.
export default function LocalHeroArt({ filename }) {
  const [failed, setFailed] = useState(false);
  return failed ? null : <img className="local-hero-art" src={`/hero/${filename}`} alt="" aria-hidden="true" loading="lazy" onError={() => setFailed(true)} />;
}
