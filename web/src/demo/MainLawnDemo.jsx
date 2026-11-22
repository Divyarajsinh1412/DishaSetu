import React from 'react';
import KmlMapDemo from './KmlMapDemo';

/**
 * MainLawnDemo is preserved as an entry-point for the incremental campus demo.
 * It renders the unified KML Map Demo featuring both Main Lawn and Main Gate → D Block.
 */
export default function MainLawnDemo({ onExit }) {
  return <KmlMapDemo onExit={onExit} />;
}
