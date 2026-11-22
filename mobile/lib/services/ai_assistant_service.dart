import '../models/ai_message.dart';

class AIAssistantService {
  static AIMessage getInitialGreeting() {
    return AIMessage(
      id: 'msg_welcome',
      text: 'Namaskara! I am your DishaSetu Campus AI Guide for Presidency University Bengaluru.\n\nAsk me about finding classrooms, engineering labs, cafeteria menus, campus walking routes, or department locations!',
      isUser: false,
      timestamp: DateTime.now(),
      suggestions: const [
        'Where is N Block Law classrooms?',
        'How to reach D Block Labs from Main Gate?',
        'Show Hatti Kaapi cafe & menu',
        'Where is Central Library & Health Centre?',
      ],
    );
  }

  static Future<AIMessage> answerQuery(String query) async {
    final q = query.toLowerCase().trim();
    String reply = '';
    List<String> suggestions = [];
    String? relatedLocationId;

    if (q.contains('d block') || q.contains('lab') || q.contains('dgl') || q.contains('dfl')) {
      reply = '🔬 **D Block (Engineering Laboratories)** houses all core laboratories:\n\n'
          '• **Ground Floor**: DGL01 to DGL06 (Robotics Studio, Fluid Mechanics, Materials Testing)\n'
          '• **First Floor**: DFL01 to DFL06 (Mechatronics, Thermodynamics, Kinematics)\n'
          '• **Second Floor**: DSL01 to DSL06 (Structural Analysis, Concrete Materials)\n\n'
          'All rooms in D Block are classified as **Laboratories**.';
      relatedLocationId = 'bld_d_block';
      suggestions = ['Navigate to D Block', 'View D Block Floor Plan', 'How to reach from Main Gate?'];
    } else if (q.contains('n block') || q.contains('law') || q.contains('ng01') || q.contains('moot')) {
      reply = '⚖️ **N Block (School of Law)** houses all law lecture halls and seminar suites:\n\n'
          '• **Ground Floor**: NG01 to NG06 (Jurisprudence, Constitutional Law)\n'
          '• **First Floor**: NF01 to NF06 (Criminal Law, Law of Torts, Corporate Law)\n'
          '• **Second Floor**: NS01 to NS06 (Cyber Law, Environmental Law, Legal Drafting)\n\n'
          'All rooms in N Block are classified as **Classrooms**.';
      relatedLocationId = 'bld_n_block';
      suggestions = ['Navigate to N Block', 'View N Block Floor Plan', 'Where is Moot Court?'];
    } else if (q.contains('e block') || q.contains('computer') || q.contains('cs') || q.contains('eg01')) {
      reply = '💻 **E Block (Computer Science & Engineering)** features smart lecture halls:\n\n'
          '• **Ground Floor**: EG01 to EG06 (Data Structures, OS, Software Engg)\n'
          '• **First Floor**: EF01 to EF06 (AI, Machine Learning, Cloud Computing)\n'
          '• **Second Floor**: ES01 to ES06 (Computer Vision, Distributed Systems, IoT)\n\n'
          'All rooms in E Block are classified as **Classrooms**.';
      relatedLocationId = 'bld_e_block';
      suggestions = ['Navigate to E Block', 'View E Block Floor Plan', 'Show walkway to D Block'];
    } else if (q.contains('f block') || q.contains('info') || q.contains('fg01') || q.contains('fs01')) {
      reply = '🖥️ **F Block (Information Science & Engineering)**:\n\n'
          '• **Ground Floor**: FG01 to FG06 (OOP, System Architecture, Web Apps)\n'
          '• **First Floor**: FF01 to FF06 (DevOps, NLP, Network Security)\n'
          '• **Second Floor**: FS01 to FS06 (Blockchain, Digital Forensics, Cognitive Systems)\n\n'
          'All rooms in F Block are classified as **Classrooms**.';
      relatedLocationId = 'bld_f_block';
      suggestions = ['Navigate to F Block', 'View F Block Floor Plan', 'Classrooms on Ground Floor'];
    } else if (q.contains('m block') || q.contains('som') || q.contains('management') || q.contains('mba') || q.contains('mg01')) {
      reply = '📈 **M Block (School of Management - SOM)**:\n\n'
          '• **Ground Floor**: MG01 to MG06 (Principles of Management, Accounting)\n'
          '• **First Floor**: MF01 to MF06 (Corporate Finance, Business Analytics)\n'
          '• **Second Floor**: MS01 to MS06 (Investment Banking, Venture Capital)\n\n'
          'All rooms in M Block are classified as **Classrooms**.';
      relatedLocationId = 'bld_som_block';
      suggestions = ['Navigate to M Block', 'View M Block Floor Plan'];
    } else if (q.contains('l block') || q.contains('science') || q.contains('lg01')) {
      reply = '🧪 **L Block (Basic Sciences & Humanities)**:\n\n'
          '• **Ground Floor**: LG01 to LG06 (Applied Physics, Chemistry, Calculus)\n'
          '• **First Floor**: LF01 to LF06 (Differential Equations, Organic Chemistry)\n'
          '• **Second Floor**: LS01 to LS06 (Complex Analysis, Materials Science)\n\n'
          'All rooms in L Block are classified as **Classrooms**.';
      relatedLocationId = 'bld_l_block';
      suggestions = ['Navigate to L Block', 'View L Block Floor Plan'];
    } else if (q.contains('cafe') || q.contains('coffee') || q.contains('hatti') || q.contains('food') || q.contains('eat')) {
      reply = '☕ **Campus Cafeterias & Dining**:\n\n'
          '1. **Hatti Kaapi (D Block Quadrangle)**: Authentic South Indian filter coffee, ghee podi idlis, and snacks. (Rating: 4.8 ⭐)\n'
          '2. **Central University Food Court**: Multi-cuisine dining hall with north and south Indian meals.\n'
          '3. **Campus Juice Pavilion**: Fresh juices and quick bites near DSA Lawn.';
      relatedLocationId = 'PU-CAFE-D-BLOCK';
      suggestions = ['View Hatti Kaapi Menu', 'Navigate to Cafe', 'Opening Hours'];
    } else if (q.contains('library') || q.contains('book')) {
      reply = '📚 **Central University Library**:\n\n'
          'Located in the heart of Presidency University quadrangle opposite DSA Lawn. Houses over 50,000 reference volumes, digital e-resource labs, and quiet study carrels.';
      relatedLocationId = 'bld_library';
      suggestions = ['Navigate to Library', 'Library Timings'];
    } else if (q.contains('health') || q.contains('doctor') || q.contains('medical') || q.contains('hospital')) {
      reply = '🏥 **University Health Centre**:\n\n'
          'Open 24/7 with on-duty physicians, emergency triage, nursing care, and dedicated campus ambulance dispatch.\n\n'
          'Emergency Hotline: **+91 80 4925 5566**';
      relatedLocationId = 'bld_health_centre';
      suggestions = ['Call Health Centre', 'Navigate to Health Centre'];
    } else if (q.contains('route') || q.contains('gate') || q.contains('walk') || q.contains('navigate')) {
      reply = '🗺️ **Walking Navigation Available**:\n\n'
          '• **Main Gate → D Block**: 423m paved scenic walkway past the Main Lawn and Central Fountain (approx. 4 mins walk).\n'
          '• **D Block → E Block Walkway**: 36m direct sheltered walkway linking Labs to Computer Science amphitheaters.';
      suggestions = ['Start Walking Route', 'Select Destination'];
    } else {
      reply = 'I found campus information matching "$query".\n\n'
          'Presidency University Bengaluru features 6 academic blocks (D, E, F, L, N, M), Hatti Kaapi dining, Central Library, and comprehensive indoor floor navigation.\n\n'
          'Would you like directions, floor maps, or department contacts?';
      suggestions = ['Show All Buildings', 'Campus Master Map', 'Cafes & Dining'];
    }

    return AIMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      text: reply,
      isUser: false,
      timestamp: DateTime.now(),
      suggestions: suggestions,
      relatedLocationId: relatedLocationId,
    );
  }
}
