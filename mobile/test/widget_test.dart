import 'package:flutter_test/flutter_test.dart';
import 'package:dishasetu/main.dart';

void main() {
  testWidgets('DishaSetu app launches successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const DishaSetuApp());
    expect(find.byType(DishaSetuApp), findsOneWidget);
  });
}
