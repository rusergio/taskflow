import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const isDark = scheme === 'dark';

  const bg = isDark ? '#020617' : '#F5F5F7';
  const card = isDark ? '#020817' : '#FFFFFF';
  const text = isDark ? '#F9FAFB' : '#0F172A';
  const muted = isDark ? '#64748B' : '#94A3B8';
  const accent = '#6366F1';

  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[s.back, { color: accent }]}>Voltar</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: text }]}>Plano mensal</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={[s.card, { backgroundColor: card }]}>
        <Text style={[s.monthLabel, { color: text }]}>Março 2026</Text>
        <Text style={[s.helper, { color: muted }]}>
          Aqui vai aparecer o calendário mensal com os seus planos.
        </Text>

        <View style={s.weekRow}>
          {days.map(d => (
            <Text key={d} style={[s.weekDay, { color: muted }]}>
              {d}
            </Text>
          ))}
        </View>

        <View style={s.grid}>
          {Array.from({ length: 35 }).map((_, idx) => (
            <View key={idx} style={s.dayCell}>
              <Text style={[s.dayNumber, { color: text }]}>{idx + 1 <= 31 ? idx + 1 : ''}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800' },
  card: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  monthLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  helper: { fontSize: 12, marginBottom: 16 },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: { fontSize: 11, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayNumber: { fontSize: 12, fontWeight: '500' },
});

