// Node 20 built-in fetch

async function main() {
  const payload = {
    featureId: 'feat_def_blocks',
    name: 'DEF Blocks',
    category: 'boundary',
    geometryType: 'Polygon',
    coordinates: [
      [13.16828186104801, 77.53263433547887],
      [13.168026534086, 77.53317107659311],
      [13.16677606947738, 77.53263663130764],
      [13.16651440674394, 77.53344099346141],
      [13.1691612075576, 77.5345945482777],
      [13.16969830413923, 77.53332483536148],
      [13.16828186104801, 77.53263433547887]
    ],
    style: {
      color: '#FBC02D',
      fillColor: '#FBC02D',
      weight: 3.5,
      opacity: 0.95,
      fillOpacity: 0.25,
      dashArray: '8, 5'
    },
    metadata: {
      description: 'Exact surveyed boundary polygon for DEF Blocks complex extracted from Google Earth KML.',
      placemarkName: 'DEF blocks',
      kmlSource: 'Untitled map project(1).kml',
      blocksIncluded: ['D Block', 'E Block', 'F Block']
    },
    verified: true,
    status: 'published'
  };

  const response = await fetch('http://localhost:5000/api/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resJson = await response.json();
  console.log('Result:', JSON.stringify(resJson, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
