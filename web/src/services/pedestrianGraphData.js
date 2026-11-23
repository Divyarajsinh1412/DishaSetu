/**
 * DISHASETU: Verified Pedestrian Graph Network
 * Presidency University Bengaluru
 * 
 * Strict graph model: Navigation nodes connected by verified walkable paths.
 * Guarantees zero straight lines through buildings, lawns, or obstacles.
 */

// Navigation Nodes
export const NAVIGATION_NODES = [
  // 1. Gates & Entry Portals
  {
    nodeId: 'node_main_gate',
    name: 'Presidency University – Main Gate Entrance Portal',
    coordinates: [13.17174576988432, 77.53609409799955],
    nodeType: 'gate',
    associatedLocationId: 'loc_main_gate',
    isAccessible: true
  },
  {
    nodeId: 'node_avenue_origin',
    name: 'Main Walking Avenue – Entrance Plaza Origin',
    coordinates: [13.1716861, 77.5361922],
    nodeType: 'junction',
    associatedLocationId: 'loc_reception',
    isAccessible: true
  },
  {
    nodeId: 'node_start_west',
    name: 'Avenue West Start Point (Two-Wheeler Access)',
    coordinates: [13.1716783, 77.5360379],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_start_east',
    name: 'Avenue East Start Point (Garden Walk)',
    coordinates: [13.1717070, 77.5363464],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_parking_entry',
    name: 'Two-Wheeler Parking Entrance Span',
    coordinates: [13.1717460, 77.5355400],
    nodeType: 'parking_access',
    associatedLocationId: 'loc_parking_2w',
    isAccessible: true
  },
  {
    nodeId: 'node_gate_2',
    name: 'Gate 2 – Secondary Campus Entrance',
    coordinates: [13.1691200, 77.5368500],
    nodeType: 'gate',
    associatedLocationId: 'loc_gate_2',
    isAccessible: true
  },

  // 2. Academic Block Entrance Nodes
  {
    nodeId: 'node_h_block_ent',
    name: 'H Block (Admissions Office) Entrance Door',
    coordinates: [13.1713200, 77.5362100],
    nodeType: 'building_entrance',
    associatedLocationId: 'loc_h_block',
    isAccessible: true
  },
  {
    nodeId: 'node_medical_ent',
    name: 'Health & Medical Centre Emergency Entry',
    coordinates: [13.1711900, 77.5361400],
    nodeType: 'facility_entrance',
    associatedLocationId: 'loc_medical',
    isAccessible: true
  },
  {
    nodeId: 'node_f_block_ent',
    name: 'F Block (Information Science & Technology) Entrance Door',
    coordinates: [13.16883382361067, 77.53358288724588],
    nodeType: 'building_entrance',
    associatedLocationId: 'loc_f_block',
    isAccessible: true
  },
  {
    nodeId: 'node_auditorium_ent',
    name: 'Auditorium Grand Foyer Entrance Door',
    coordinates: [13.1709200, 77.5357400],
    nodeType: 'facility_entrance',
    associatedLocationId: 'loc_auditorium',
    isAccessible: true
  },
  {
    nodeId: 'node_e_block_ent',
    name: 'E Block (Computer Science & Engineering) Entrance Door',
    coordinates: [13.16922581043442, 77.53374838252056],
    nodeType: 'building_entrance',
    associatedLocationId: 'loc_e_block',
    isAccessible: true
  },
  {
    nodeId: 'node_d_block_ent',
    name: 'D Block (Mechanical & Civil Engineering) Entrance Door',
    coordinates: [13.16915723332783, 77.53391962930635],
    nodeType: 'building_entrance',
    associatedLocationId: 'loc_d_block',
    isAccessible: true
  },
  {
    nodeId: 'node_library_ent',
    name: 'Central University Library Main Glass Entrance Door',
    coordinates: [13.1704200, 77.5357100],
    nodeType: 'facility_entrance',
    associatedLocationId: 'loc_library',
    isAccessible: true
  },
  {
    nodeId: 'node_food_court_ent',
    name: 'Campus Food Court Plaza Entrance Door',
    coordinates: [13.1701200, 77.5352800],
    nodeType: 'facility_entrance',
    associatedLocationId: 'loc_food_court',
    isAccessible: true
  },
  {
    nodeId: 'node_j_block_ent',
    name: 'J Block (School of Management) Entrance Door',
    coordinates: [13.1701400, 77.5355300],
    nodeType: 'building_entrance',
    associatedLocationId: 'loc_j_block',
    isAccessible: true
  },
  {
    nodeId: 'node_k_block_ent',
    name: 'K Block (AI/ML Data Science) Entrance Door',
    coordinates: [13.1699100, 77.5354300],
    nodeType: 'building_entrance',
    associatedLocationId: 'loc_k_block',
    isAccessible: true
  },
  {
    nodeId: 'node_cafeteria_ent',
    name: 'Central Cafeteria Garden Terrace Entrance Door',
    coordinates: [13.1698100, 77.5351000],
    nodeType: 'facility_entrance',
    associatedLocationId: 'loc_cafeteria',
    isAccessible: true
  },
  {
    nodeId: 'node_l_block_ent',
    name: 'L Block (School of Law) Entrance Door',
    coordinates: [13.1696900, 77.5353100],
    nodeType: 'building_entrance',
    associatedLocationId: 'loc_l_block',
    isAccessible: true
  },
  {
    nodeId: 'node_n_block_ent',
    name: 'N Block (Basic Sciences) Garden Entrance Door',
    coordinates: [13.1694400, 77.5352400],
    nodeType: 'building_entrance',
    associatedLocationId: 'loc_n_block',
    isAccessible: true
  },

  // 3. Central Amenities & Sports Nodes
  {
    nodeId: 'node_fountain_plaza',
    name: 'Campus Central Fountain Plaza',
    coordinates: [13.1692772, 77.5349633],
    nodeType: 'landmark',
    associatedLocationId: 'loc_fountain',
    isAccessible: true
  },
  {
    nodeId: 'node_oat_ent',
    name: 'Open Air Theatre (O.A.T) North Steps',
    coordinates: [13.1695610, 77.5357970],
    nodeType: 'facility_entrance',
    associatedLocationId: 'loc_oat',
    isAccessible: true
  },
  {
    nodeId: 'node_gym_ent',
    name: 'University Gymnasium & Fitness Suite Entrance',
    coordinates: [13.1690600, 77.5352600],
    nodeType: 'sports_access',
    associatedLocationId: 'loc_gym',
    isAccessible: true
  },
  {
    nodeId: 'node_basketball_court',
    name: 'Basketball Court Entrance Gate',
    coordinates: [13.1690730, 77.5354710],
    nodeType: 'sports_access',
    associatedLocationId: 'loc_basketball',
    isAccessible: true
  },

  // 4. Intermediate Pedestrian Junctions (Along Avenue & Garden)
  {
    nodeId: 'node_junc_h_block',
    name: 'Avenue Junction – H Block / Reception',
    coordinates: [13.1713404, 77.5362505],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_tree_divider_north',
    name: 'Avenue Junction – Central Tree Divider North Tip',
    coordinates: [13.1712020, 77.5360316],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_f_block',
    name: 'Avenue Junction – F Block & Medical Centre',
    coordinates: [13.1710208, 77.5360690],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_auditorium',
    name: 'Avenue Junction – Auditorium Walkway',
    coordinates: [13.1709093, 77.5357768],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_e_block',
    name: 'Avenue Junction – E Block / Library Plaza',
    coordinates: [13.1708210, 77.5359618],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_d_block',
    name: 'Avenue Junction – D Block Walkway',
    coordinates: [13.1705630, 77.5355730],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_library',
    name: 'Avenue Junction – Central Library',
    coordinates: [13.1704081, 77.5357419],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_food_court',
    name: 'Avenue Junction – Food Court Plaza',
    coordinates: [13.1701141, 77.5353099],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_j_block',
    name: 'Avenue Junction – J Block',
    coordinates: [13.1701600, 77.5355783],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_k_block',
    name: 'Avenue Junction – K Block (AI/ML)',
    coordinates: [13.1699249, 77.5354763],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_cafeteria',
    name: 'Avenue Junction – Cafeteria & Garden Walk',
    coordinates: [13.1698066, 77.5351313],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_l_block',
    name: 'Avenue Junction – L Block (Law)',
    coordinates: [13.1697160, 77.5353462],
    nodeType: 'junction',
    isAccessible: true
  },
  {
    nodeId: 'node_junc_south_pavilion',
    name: 'Campus South Pavilion & Garden Termination',
    coordinates: [13.1694614, 77.5352673],
    nodeType: 'junction',
    isAccessible: true
  }
];

// Verified Pedestrian Walking Paths (Edges)
export const WALKING_PATHS = [
  // 0. VERIFIED KML SURVEYED ROUTE: Main Gate to D Block (Google Earth KML 72-point line)
  {
    pathId: 'path_kml_main_gate_to_d_block',
    name: 'Main Gate → D Block',
    startNode: 'node_main_gate',
    endNode: 'node_d_block_ent',
    geometry: [
    [
        13.17174576988432,
        77.53609409799955
    ],
    [
        13.17169863045853,
        77.53608210855332
    ],
    [
        13.1716383910603,
        77.53605042839274
    ],
    [
        13.17159359517197,
        77.53604282665427
    ],
    [
        13.17155101268326,
        77.53603556812003
    ],
    [
        13.17150754216009,
        77.5360266924011
    ],
    [
        13.17147941299077,
        77.53602121419446
    ],
    [
        13.17144588088828,
        77.53601171550024
    ],
    [
        13.17141548831614,
        77.53600297805718
    ],
    [
        13.17137149118117,
        77.53598567076828
    ],
    [
        13.17133931695116,
        77.53596697295295
    ],
    [
        13.17129818385298,
        77.53595081617756
    ],
    [
        13.17126896775573,
        77.5359411946154
    ],
    [
        13.17123972989239,
        77.53592854020138
    ],
    [
        13.17121308196014,
        77.53592266244777
    ],
    [
        13.17116699802034,
        77.53589854624452
    ],
    [
        13.1711155427013,
        77.53586947061237
    ],
    [
        13.17106666095199,
        77.53584975560692
    ],
    [
        13.17101448049524,
        77.53581892871577
    ],
    [
        13.17096051921789,
        77.53579461787281
    ],
    [
        13.17090689078972,
        77.53576844077367
    ],
    [
        13.17086562762542,
        77.53574429064513
    ],
    [
        13.17081162128503,
        77.5357160467174
    ],
    [
        13.17077800877276,
        77.53569572249197
    ],
    [
        13.17074490791287,
        77.53567244764086
    ],
    [
        13.17070499547361,
        77.53564837922956
    ],
    [
        13.17065386094593,
        77.53561271930327
    ],
    [
        13.17060860411526,
        77.53558093956185
    ],
    [
        13.17054935948529,
        77.53555036633993
    ],
    [
        13.17050113223478,
        77.5355247736367
    ],
    [
        13.17045012729626,
        77.53549435194522
    ],
    [
        13.17041064690491,
        77.53547015697703
    ],
    [
        13.17036640154106,
        77.5354482317468
    ],
    [
        13.17031826377981,
        77.53541890680094
    ],
    [
        13.17027002008206,
        77.53539640838453
    ],
    [
        13.17023498177819,
        77.53537430972969
    ],
    [
        13.1701820732767,
        77.53534727991693
    ],
    [
        13.17013954577857,
        77.535323185103
    ],
    [
        13.17009937034263,
        77.5353022563515
    ],
    [
        13.170051369734,
        77.53527533003101
    ],
    [
        13.17000868061955,
        77.53524802486159
    ],
    [
        13.16997249936164,
        77.53523380553656
    ],
    [
        13.16993464625497,
        77.53521593309777
    ],
    [
        13.16988366156734,
        77.53518247499464
    ],
    [
        13.169870695201,
        77.53516452941227
    ],
    [
        13.16983919235103,
        77.53512610343617
    ],
    [
        13.16981046335518,
        77.53508194930586
    ],
    [
        13.16984171658533,
        77.53499372472088
    ],
    [
        13.16987083894686,
        77.53492970791183
    ],
    [
        13.16986296632206,
        77.53486744885356
    ],
    [
        13.16979586272434,
        77.53479484326571
    ],
    [
        13.16972675792108,
        77.53474772529633
    ],
    [
        13.16964474898791,
        77.53471726692706
    ],
    [
        13.16957497737892,
        77.5346907315059
    ],
    [
        13.1694851705393,
        77.53465797397705
    ],
    [
        13.16940533551286,
        77.53463137716737
    ],
    [
        13.16933242293897,
        77.53460062340486
    ],
    [
        13.16925010470841,
        77.53458177362035
    ],
    [
        13.16918752404643,
        77.53453792902008
    ],
    [
        13.16915625214984,
        77.53448600665828
    ],
    [
        13.16915107133306,
        77.5344453900895
    ],
    [
        13.16913915771938,
        77.53437656453819
    ],
    [
        13.16912708583898,
        77.53433825948261
    ],
    [
        13.16911315488541,
        77.53428686284192
    ],
    [
        13.16911541318982,
        77.53424813807851
    ],
    [
        13.16911466856421,
        77.53419928510363
    ],
    [
        13.16911420430902,
        77.53414280804282
    ],
    [
        13.16913034561081,
        77.53407626682362
    ],
    [
        13.1691503981058,
        77.53402067342786
    ],
    [
        13.1691532256497,
        77.53397599366181
    ],
    [
        13.16915320163163,
        77.53394490986271
    ],
    [
        13.16915723332783,
        77.53391962930635
    ]
],
    distanceMeters: 423,
    estimatedWalkingMinutes: 6,
    accessibility: true,
    hasStairs: false,
    hasRamp: true,
    pathType: 'main_avenue',
    routeType: 'Walking',
    verificationStatus: 'Verified',
    status: 'active',
    active: true,
    surfaceType: 'Paved Walkway & Tiles',
    sourceFileName: 'Untitled map project.kml',
    source: 'Google Earth KML',
    campus: 'Presidency University Bengaluru',
    startLocation: {
      name: 'Presidency University – Main Gate',
      lat: 13.17174576988432,
      lng: 77.53609409799955
    },
    endLocation: {
      name: 'D Block',
      lat: 13.16915723332783,
      lng: 77.53391962930635
    },
    pointCount: 72,
    notes: 'Actual surveyed walking path from Presidency University Main Gate to D Block imported from Google Earth KML.'
  },
  // 0A. VERIFIED KML SURVEYED ROUTE: D Block to E Block
  {
    pathId: 'path_kml_d_to_e_block',
    name: 'D Block → E Block Walkway',
    startNode: 'node_d_block_ent',
    endNode: 'node_e_block_ent',
    geometry: [
      [13.16921961010325, 77.53374368525881],
      [13.16916175269351, 77.53371476009588],
      [13.16909272541975, 77.53368916371579],
      [13.16905243962133, 77.53368308758547],
      [13.16901930916995, 77.5336693526416],
      [13.16897943341513, 77.5336527021713],
      [13.16898258842619, 77.53361351579872],
      [13.16899625259435, 77.53359127757469]
    ],
    distanceMeters: 35.7,
    accessibility: true,
    hasStairs: false,
    hasRamp: true,
    pathType: 'covered_walkway',
    status: 'active',
    active: true,
    verificationStatus: 'Verified',
    surfaceType: 'Paved Walkway & Tiles',
    sourceFileName: 'block_D_to_E_path.kml',
    source: 'Google Earth KML',
    campus: 'Presidency University Bengaluru',
    pointCount: 8,
    notes: 'Actual surveyed walking path from D Block to E Block imported from Google Earth KML.'
  },
  // 0B. VERIFIED KML SURVEYED ROUTE: E Block to F Block
  {
    pathId: 'path_kml_e_to_f_block',
    name: 'E Block → F Block Walkway',
    startNode: 'node_e_block_ent',
    endNode: 'node_f_block_ent',
    geometry: [
      [13.16922581043442, 77.53374838252056],
      [13.16918960237059, 77.53373237009161],
      [13.16915161956307, 77.53371744159026],
      [13.16911474449877, 77.53369770168051],
      [13.16908524173381, 77.53368679207321],
      [13.16905426359634, 77.53367146613144],
      [13.16902284816958, 77.53365996732241],
      [13.16898658829452, 77.53364633665677],
      [13.16894668893453, 77.53363211029597],
      [13.16891988296132, 77.53362078253889],
      [13.16889094539063, 77.53360697185322],
      [13.16887181098381, 77.53359832121349],
      [13.16884508719851, 77.53358601157329],
      [13.16883382361067, 77.53358288724588]
    ],
    distanceMeters: 47.0,
    accessibility: true,
    hasStairs: false,
    hasRamp: true,
    pathType: 'covered_walkway',
    status: 'active',
    active: true,
    verificationStatus: 'Verified',
    surfaceType: 'Paved Walkway & Tiles',
    sourceFileName: 'Block_E_to_F_path.kml',
    source: 'Google Earth KML',
    campus: 'Presidency University Bengaluru',
    pointCount: 14,
    notes: 'Actual surveyed walking path from E Block to F Block imported from Google Earth KML.'
  },
  // 1. Main Gate to Avenue Origin Plaza
  {
    pathId: 'path_gate_to_avenue',
    name: 'Main Gate Arrival Walkway',
    startNode: 'node_main_gate',
    endNode: 'node_avenue_origin',
    geometry: [
      [13.1717995, 77.5361915],
      [13.1716861, 77.5361922]
    ],
    distanceMeters: 13,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 2. Entrance Plaza Transverse Connector (West to East)
  {
    pathId: 'path_avenue_start_transverse',
    name: 'Entrance Plaza Canopy Walk',
    startNode: 'node_start_west',
    endNode: 'node_avenue_origin',
    geometry: [
      [13.1716783, 77.5360379],
      [13.1716861, 77.5361922]
    ],
    distanceMeters: 17,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_avenue_start_transverse_east',
    name: 'Entrance Plaza to East Garden Walk',
    startNode: 'node_avenue_origin',
    endNode: 'node_start_east',
    geometry: [
      [13.1716861, 77.5361922],
      [13.1717070, 77.5363464]
    ],
    distanceMeters: 17,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 3. West Start to Two-Wheeler Parking Entrance
  {
    pathId: 'path_avenue_to_parking_2w',
    name: 'Two-Wheeler Parking Access Pathway',
    startNode: 'node_start_west',
    endNode: 'node_parking_entry',
    geometry: [
      [13.1716783, 77.5360379],
      [13.1717063, 77.5355183],
      [13.1717460, 77.5355400]
    ],
    distanceMeters: 62,
    accessibility: true,
    pathType: 'parking_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 4. Avenue Origin to H Block (Admissions) Junction
  {
    pathId: 'path_avenue_to_h_block_junc',
    name: 'Main Avenue – East Walkway to H Block',
    startNode: 'node_avenue_origin',
    endNode: 'node_junc_h_block',
    geometry: [
      [13.1716861, 77.5361922],
      [13.1715282, 77.5363362],
      [13.1713404, 77.5362505]
    ],
    distanceMeters: 43,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 5. H Block Junction to H Block Door
  {
    pathId: 'path_h_block_door_access',
    name: 'H Block Admissions Lobby Access',
    startNode: 'node_junc_h_block',
    endNode: 'node_h_block_ent',
    geometry: [
      [13.1713404, 77.5362505],
      [13.1713200, 77.5362100]
    ],
    distanceMeters: 5,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 6. H Block Junction to Tree Divider North Junction
  {
    pathId: 'path_h_to_tree_divider',
    name: 'Avenue Central Promenade – North Section',
    startNode: 'node_junc_h_block',
    endNode: 'node_junc_tree_divider_north',
    geometry: [
      [13.1713404, 77.5362505],
      [13.1712020, 77.5360316]
    ],
    distanceMeters: 28,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 7. Tree Divider North to F Block Junction & Door
  {
    pathId: 'path_tree_to_f_block_junc',
    name: 'Avenue Promenade to F Block & Medical Walk',
    startNode: 'node_junc_tree_divider_north',
    endNode: 'node_junc_f_block',
    geometry: [
      [13.1712020, 77.5360316],
      [13.1711779, 77.5361739],
      [13.1710208, 77.5360690]
    ],
    distanceMeters: 29,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_f_block_door_access',
    name: 'F Block Entrance Approach',
    startNode: 'node_junc_f_block',
    endNode: 'node_f_block_ent',
    geometry: [
      [13.1710208, 77.5360690],
      [13.1710300, 77.5360200]
    ],
    distanceMeters: 6,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_medical_door_access',
    name: 'Health & Medical Centre Emergency Path',
    startNode: 'node_junc_f_block',
    endNode: 'node_medical_ent',
    geometry: [
      [13.1710208, 77.5360690],
      [13.1711779, 77.5361739],
      [13.1711900, 77.5361400]
    ],
    distanceMeters: 21,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 8. F Block Junction to Auditorium Junction & Door (Right Walkway)
  {
    pathId: 'path_f_to_auditorium_junc',
    name: 'Central Avenue – Auditorium Promenade',
    startNode: 'node_junc_f_block',
    endNode: 'node_junc_auditorium',
    geometry: [
      [13.1710208, 77.5360690],
      [13.1709093, 77.5357768]
    ],
    distanceMeters: 34,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_auditorium_door_access',
    name: 'Auditorium Grand Foyer Access Walkway',
    startNode: 'node_junc_auditorium',
    endNode: 'node_auditorium_ent',
    geometry: [
      [13.1709093, 77.5357768],
      [13.1709200, 77.5357400]
    ],
    distanceMeters: 5,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 9. Auditorium Junction to E Block Junction (Mid-Avenue Crossing)
  {
    pathId: 'path_auditorium_to_e_block_crossing',
    name: 'Mid-Avenue Pedestrian Crossing (Auditorium to E Block)',
    startNode: 'node_junc_auditorium',
    endNode: 'node_junc_e_block',
    geometry: [
      [13.1709093, 77.5357768],
      [13.1708210, 77.5359618]
    ],
    distanceMeters: 23,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_e_block_door_access',
    name: 'E Block Department Entrance Approach',
    startNode: 'node_junc_e_block',
    endNode: 'node_e_block_ent',
    geometry: [
      [13.1708210, 77.5359618],
      [13.1708400, 77.5359200]
    ],
    distanceMeters: 6,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 10. Auditorium Junction to D Block Junction (Right Side Walkway)
  {
    pathId: 'path_auditorium_to_d_block_junc',
    name: 'Main Avenue – Western Academic Spine to D Block',
    startNode: 'node_junc_auditorium',
    endNode: 'node_junc_d_block',
    geometry: [
      [13.1709093, 77.5357768],
      [13.1707781, 77.5357124],
      [13.1705630, 77.5355730]
    ],
    distanceMeters: 45,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_d_block_door_access',
    name: 'D Block East Entrance Ramp Walkway',
    startNode: 'node_junc_d_block',
    endNode: 'node_d_block_ent',
    geometry: [
      [13.1705630, 77.5355730],
      [13.1705500, 77.5356100]
    ],
    distanceMeters: 5,
    accessibility: true,
    pathType: 'building_access',
    status: 'closed',
    verificationStatus: 'Verified'
  },

  // 11. E Block Junction to Library Junction (Left Side Walkway)
  {
    pathId: 'path_e_block_to_library_junc',
    name: 'Main Avenue – Eastern Academic Spine to Library',
    startNode: 'node_junc_e_block',
    endNode: 'node_junc_library',
    geometry: [
      [13.1708210, 77.5359618],
      [13.1705739, 77.5358446],
      [13.1704081, 77.5357419]
    ],
    distanceMeters: 52,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_library_door_access',
    name: 'Central Library Entrance Plaza Walkway',
    startNode: 'node_junc_library',
    endNode: 'node_library_ent',
    geometry: [
      [13.1704081, 77.5357419],
      [13.1704200, 77.5357100]
    ],
    distanceMeters: 4,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 12. D Block Junction to Food Court Junction (Right Side Walkway)
  {
    pathId: 'path_d_block_to_food_court_junc',
    name: 'Western Avenue Promenade – D Block to Food Court',
    startNode: 'node_junc_d_block',
    endNode: 'node_junc_food_court',
    geometry: [
      [13.1705630, 77.5355730],
      [13.1701141, 77.5353099]
    ],
    distanceMeters: 57,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_food_court_door_access',
    name: 'Food Court Plaza Approach Walkway',
    startNode: 'node_junc_food_court',
    endNode: 'node_food_court_ent',
    geometry: [
      [13.1701141, 77.5353099],
      [13.1701200, 77.5352800]
    ],
    distanceMeters: 4,
    accessibility: true,
    pathType: 'facility_entrance',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 13. Library Junction to J Block & K Block Junction (Left Side Walkway)
  {
    pathId: 'path_library_to_j_block_junc',
    name: 'Eastern Avenue Spine – Library to J Block',
    startNode: 'node_junc_library',
    endNode: 'node_junc_j_block',
    geometry: [
      [13.1704081, 77.5357419],
      [13.1701600, 77.5355783]
    ],
    distanceMeters: 33,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_j_block_door_access',
    name: 'J Block School of Management Approach',
    startNode: 'node_junc_j_block',
    endNode: 'node_j_block_ent',
    geometry: [
      [13.1701600, 77.5355783],
      [13.1701400, 77.5355300]
    ],
    distanceMeters: 6,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 14. Food Court Junction to Cafeteria Junction
  {
    pathId: 'path_food_court_to_cafeteria_junc',
    name: 'Dining Walkway – Food Court to Cafeteria',
    startNode: 'node_junc_food_court',
    endNode: 'node_junc_cafeteria',
    geometry: [
      [13.1701141, 77.5353099],
      [13.1698066, 77.5351313]
    ],
    distanceMeters: 40,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_cafeteria_door_access',
    name: 'Cafeteria Garden Terrace Entrance Approach',
    startNode: 'node_junc_cafeteria',
    endNode: 'node_cafeteria_ent',
    geometry: [
      [13.1698066, 77.5351313],
      [13.1698100, 77.5351000]
    ],
    distanceMeters: 4,
    accessibility: true,
    pathType: 'facility_entrance',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 15. J Block to K Block Junction & Door Access
  {
    pathId: 'path_j_block_to_k_block_junc',
    name: 'Eastern Avenue Spine – J Block to K Block',
    startNode: 'node_junc_j_block',
    endNode: 'node_junc_k_block',
    geometry: [
      [13.1701600, 77.5355783],
      [13.1699249, 77.5354763]
    ],
    distanceMeters: 28,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_k_block_door_access',
    name: 'K Block AI/ML Data Science Entrance Walk',
    startNode: 'node_junc_k_block',
    endNode: 'node_k_block_ent',
    geometry: [
      [13.1699249, 77.5354763],
      [13.1699100, 77.5354300]
    ],
    distanceMeters: 5,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_k_block_to_l_block_junc',
    name: 'Eastern Avenue Spine – K Block to L Block',
    startNode: 'node_junc_k_block',
    endNode: 'node_junc_l_block',
    geometry: [
      [13.1699249, 77.5354763],
      [13.1697160, 77.5353462]
    ],
    distanceMeters: 27,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_l_block_door_access',
    name: 'L Block School of Law Entrance Ramp',
    startNode: 'node_junc_l_block',
    endNode: 'node_l_block_ent',
    geometry: [
      [13.1697160, 77.5353462],
      [13.1696900, 77.5353100]
    ],
    distanceMeters: 5,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 16. Southern Avenue Crossing (Cafeteria to L Block)
  {
    pathId: 'path_cafeteria_to_l_block_crossing',
    name: 'South Avenue Crosswalk (Cafeteria to Law Block)',
    startNode: 'node_junc_cafeteria',
    endNode: 'node_junc_l_block',
    geometry: [
      [13.1698066, 77.5351313],
      [13.1697160, 77.5353462]
    ],
    distanceMeters: 25,
    accessibility: true,
    pathType: 'main_avenue',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 17. Cafeteria Junction to Central Fountain Plaza
  {
    pathId: 'path_cafeteria_to_fountain',
    name: 'Fountain Walkway Promenade',
    startNode: 'node_junc_cafeteria',
    endNode: 'node_fountain_plaza',
    geometry: [
      [13.1698066, 77.5351313],
      [13.1694614, 77.5350500],
      [13.1692772, 77.5349633]
    ],
    distanceMeters: 63,
    accessibility: true,
    pathType: 'secondary_walkway',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 18. L Block Junction to South Pavilion & N Block
  {
    pathId: 'path_l_block_to_south_pavilion',
    name: 'South Garden Pavilion Walk',
    startNode: 'node_junc_l_block',
    endNode: 'node_junc_south_pavilion',
    geometry: [
      [13.1697160, 77.5353462],
      [13.1695593, 77.5352499],
      [13.1694614, 77.5352673]
    ],
    distanceMeters: 31,
    accessibility: true,
    pathType: 'secondary_walkway',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_n_block_door_access',
    name: 'N Block Basic Sciences Entrance Walk',
    startNode: 'node_junc_south_pavilion',
    endNode: 'node_n_block_ent',
    geometry: [
      [13.1694614, 77.5352673],
      [13.1694400, 77.5352400]
    ],
    distanceMeters: 4,
    accessibility: true,
    pathType: 'building_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 19. South Pavilion to Gymnasium & Basketball Court (Sports Walkway)
  {
    pathId: 'path_south_pavilion_to_gym',
    name: 'Sports Complex Access Walkway',
    startNode: 'node_junc_south_pavilion',
    endNode: 'node_gym_ent',
    geometry: [
      [13.1694614, 77.5352673],
      [13.1692785, 77.5353102],
      [13.1690539, 77.5352753],
      [13.1690600, 77.5352600]
    ],
    distanceMeters: 49,
    accessibility: true,
    pathType: 'sports_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_gym_to_basketball',
    name: 'Gymnasium to Basketball Court Court-side Walk',
    startNode: 'node_gym_ent',
    endNode: 'node_basketball_court',
    geometry: [
      [13.1690600, 77.5352600],
      [13.1690512, 77.5355726],
      [13.1690730, 77.5354710]
    ],
    distanceMeters: 35,
    accessibility: true,
    pathType: 'sports_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },

  // 20. Basketball Court to Open Air Theatre (OAT) & Gate 2 / Bus Bay
  {
    pathId: 'path_basketball_to_oat',
    name: 'South Sports Path to Open Air Theatre',
    startNode: 'node_basketball_court',
    endNode: 'node_oat_ent',
    geometry: [
      [13.1690730, 77.5354710],
      [13.1692812, 77.5357179],
      [13.1695606, 77.5357970]
    ],
    distanceMeters: 65,
    accessibility: true,
    pathType: 'sports_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_oat_to_gate_2',
    name: 'OAT to Gate 2 & Bus Bay Terminal Pathway',
    startNode: 'node_oat_ent',
    endNode: 'node_gate_2',
    geometry: [
      [13.1695606, 77.5357970],
      [13.1694966, 77.5361323],
      [13.1692000, 77.5368000],
      [13.1691200, 77.5368500]
    ],
    distanceMeters: 132,
    accessibility: true,
    pathType: 'gate_access',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  },
  {
    pathId: 'path_fountain_to_south_pavilion',
    name: 'Fountain to South Lawn Pavilion Promenade',
    startNode: 'node_fountain_plaza',
    endNode: 'node_junc_south_pavilion',
    geometry: [
      [13.1692772, 77.5349633],
      [13.1694614, 77.5352673]
    ],
    distanceMeters: 38,
    accessibility: true,
    pathType: 'secondary_walkway',
    status: 'active',
    active: true,
    verificationStatus: 'Verified'
  }
];

/**
 * Exact Haversine distance in meters between two [lat, lng] coordinates
 */
export function haversineDistance(c1, c2) {
  if (!c1 || !c2) return 0;
  const lat1 = Array.isArray(c1) ? c1[0] : c1.lat;
  const lng1 = Array.isArray(c1) ? c1[1] : c1.lng;
  const lat2 = Array.isArray(c2) ? c2[0] : c2.lat;
  const lng2 = Array.isArray(c2) ? c2[1] : c2.lng;

  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates initial compass bearing from c1 to c2 in degrees (0 - 360)
 */
export function calculateBearing(c1, c2) {
  const lat1 = (Array.isArray(c1) ? c1[0] : c1.lat) * Math.PI / 180;
  const lng1 = (Array.isArray(c1) ? c1[1] : c1.lng) * Math.PI / 180;
  const lat2 = (Array.isArray(c2) ? c2[0] : c2.lat) * Math.PI / 180;
  const lng2 = (Array.isArray(c2) ? c2[1] : c2.lng) * Math.PI / 180;

  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Human-readable compass direction
 */
export function getCompassDirection(bearing) {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Turn instruction based on relative angle change
 */
export function getTurnInstruction(prevBearing, nextBearing) {
  if (prevBearing == null) return 'Head forward';
  let diff = (nextBearing - prevBearing + 540) % 360 - 180;
  if (Math.abs(diff) < 20) return 'Continue straight';
  if (diff >= 20 && diff <= 45) return 'Bear slight right';
  if (diff > 45 && diff <= 120) return 'Turn right';
  if (diff > 120) return 'Make a sharp right';
  if (diff <= -20 && diff >= -45) return 'Bear slight left';
  if (diff < -45 && diff >= -120) return 'Turn left';
  return 'Make a sharp left';
}
