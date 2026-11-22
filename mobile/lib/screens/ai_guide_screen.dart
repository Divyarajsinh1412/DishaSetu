import 'package:flutter/material.dart';
import '../models/ai_message.dart';
import '../services/ai_assistant_service.dart';

class AIGuideScreen extends StatefulWidget {
  const AIGuideScreen({super.key});

  @override
  State<AIGuideScreen> createState() => _AIGuideScreenState();
}

class _AIGuideScreenState extends State<AIGuideScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<AIMessage> _messages = [];
  bool _isTyping = false;

  final List<String> _quickPrompts = [
    'Where is D Block Labs?',
    'Show me E Block Classrooms',
    'Where is Central Library?',
    'Where is Hatti Kaapi & what is on menu?',
    'Campus Emergency Numbers',
    'Where is Auditorium & Convention Hall?',
    'What rooms are in F Block?',
    'How do I reach MBA/SOM Block?',
  ];

  @override
  void initState() {
    super.initState();
    _messages.add(AIAssistantService.getInitialGreeting());
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSendMessage([String? overrideText]) async {
    final text = (overrideText ?? _textController.text).trim();
    if (text.isEmpty) return;

    if (overrideText == null) {
      _textController.clear();
    }

    final userMsg = AIMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}_user',
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
      _isTyping = true;
    });
    _scrollToBottom();

    // Query AI assistant with simulated latency
    await Future.delayed(const Duration(milliseconds: 350));
    final botMsg = await AIAssistantService.answerQuery(text);

    if (mounted) {
      setState(() {
        _messages.add(botMsg);
        _isTyping = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF071B32),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.5)),
              ),
              child: const Icon(Icons.psychology, color: Color(0xFF38BDF8), size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'DishaSetu AI Guide',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  'Presidency University Intelligent Assistant',
                  style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF94A3B8), size: 20),
            tooltip: 'Clear Chat',
            onPressed: () {
              setState(() {
                _messages.clear();
                _messages.add(AIAssistantService.getInitialGreeting());
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Quick prompt chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            color: const Color(0xFF0B132B),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _quickPrompts.map((prompt) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      backgroundColor: const Color(0xFF1E293B),
                      side: const BorderSide(color: Color(0xFF334155)),
                      label: Text(
                        prompt,
                        style: const TextStyle(fontSize: 11, color: Color(0xFF38BDF8)),
                      ),
                      onPressed: () => _handleSendMessage(prompt),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Message list
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg.isUser;

                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.82,
                    ),
                    decoration: BoxDecoration(
                      color: isUser ? const Color(0xFF0284C7) : const Color(0xFF1E293B),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isUser ? 16 : 4),
                        bottomRight: Radius.circular(isUser ? 4 : 16),
                      ),
                      border: Border.all(
                        color: isUser ? const Color(0xFF38BDF8) : const Color(0xFF334155),
                        width: 1,
                      ),
                      boxShadow: const [
                        BoxShadow(color: Colors.black38, blurRadius: 4, offset: Offset(0, 2)),
                      ],
                    ),
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isUser ? Icons.person : Icons.smart_toy,
                              size: 13,
                              color: isUser ? Colors.white70 : const Color(0xFF38BDF8),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              isUser ? 'You' : 'DishaSetu AI',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isUser ? Colors.white70 : const Color(0xFF38BDF8),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          msg.text,
                          style: TextStyle(
                            fontSize: 13,
                            color: isUser ? Colors.white : const Color(0xFFE2E8F0),
                            height: 1.4,
                          ),
                        ),
                        if (msg.suggestions.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: msg.suggestions.map((sug) {
                              return ActionChip(
                                visualDensity: VisualDensity.compact,
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                backgroundColor: const Color(0xFF0F172A),
                                side: const BorderSide(color: Color(0xFF0284C7)),
                                label: Text(
                                  sug,
                                  style: const TextStyle(fontSize: 10, color: Color(0xFF38BDF8)),
                                ),
                                onPressed: () => _handleSendMessage(sug),
                              );
                            }).toList(),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Typing indicator
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: const [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF38BDF8)),
                  ),
                  SizedBox(width: 8),
                  Text(
                    'DishaSetu AI is thinking...',
                    style: TextStyle(fontSize: 11, color: Colors.white54, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),

          // Input text bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(top: BorderSide(color: Color(0xFF334155))),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Ask about blocks, rooms, labs, food...',
                        hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(color: Color(0xFF334155)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(color: Color(0xFF0284C7)),
                        ),
                      ),
                      onSubmitted: (_) => _handleSendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFF0284C7),
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 18),
                      onPressed: () => _handleSendMessage(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
