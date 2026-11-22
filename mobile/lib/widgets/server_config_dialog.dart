import 'package:flutter/material.dart';
import '../config/app_config.dart';

class ServerConfigDialog extends StatefulWidget {
  final VoidCallback onSaved;

  const ServerConfigDialog({super.key, required this.onSaved});

  static Future<void> show(BuildContext context, {required VoidCallback onSaved}) {
    return showDialog(
      context: context,
      builder: (ctx) => ServerConfigDialog(onSaved: onSaved),
    );
  }

  @override
  State<ServerConfigDialog> createState() => _ServerConfigDialogState();
}

class _ServerConfigDialogState extends State<ServerConfigDialog> {
  late final TextEditingController _urlController;

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(text: AppConfig.baseUrl);
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF0F172A),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: Color(0xFF334155)),
      ),
      title: Row(
        children: const [
          Icon(Icons.settings_ethernet, color: Color(0xFF38BDF8), size: 24),
          SizedBox(width: 10),
          Text(
            'Backend API Server',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Configure Node.js Express backend endpoint for DishaSetu Mobile:',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _urlController,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF475569)),
                ),
                hintText: 'http://10.0.2.2:5000/api',
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'Quick Presets:',
              style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _buildPresetChip('Android Emulator', AppConfig.defaultAndroidEmulatorUrl),
                _buildPresetChip('Localhost (Desktop/Web)', AppConfig.defaultLocalhostUrl),
                _buildPresetChip('Production Server', AppConfig.defaultProductionUrl),
              ],
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2563EB),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () async {
            await AppConfig.setBaseUrl(_urlController.text);
            if (mounted) Navigator.pop(context);
            widget.onSaved();
          },
          child: const Text('Save & Reconnect', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildPresetChip(String label, String url) {
    return ActionChip(
      backgroundColor: const Color(0xFF1E293B),
      side: const BorderSide(color: Color(0xFF334155)),
      label: Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF38BDF8))),
      onPressed: () {
        setState(() {
          _urlController.text = url;
        });
      },
    );
  }
}
