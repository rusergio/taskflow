import { RectButton, ScrollView as GHScrollView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Svg, { Circle, Path } from 'react-native-svg';
import { ComponentType, createElement, useEffect, useRef, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import {
    Animated, Dimensions, Keyboard,
    KeyboardAvoidingView, Modal, Platform, Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Theme ────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: '#F6F4F0', bgCard: '#FFFFFF', bgSurface: '#EEECEA',
  bgModal: '#FFFFFF',
  bgInput: '#EEECEA',
  text: '#1A1826', textMuted: '#8A8699', textSub: '#B0ADBB',
  border: 'rgba(0,0,0,0.06)', accent: '#6366f1',
  shadow: 'rgba(0,0,0,0.08)', statusBar: 'dark-content' as const,
  headerBg: '#F6F4F0',
  modalBackdrop: 'rgba(0,0,0,0.45)',
};
const DARK = {
  bg: '#14141f',
  bgModal: '#7a7aa8',
  bgCard: '#3d3d58',
  bgSurface: '#4f4f70',
  bgInput: '#2a2a38',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.88)',
  textSub: 'rgba(255,255,255,0.65)',
  border: 'rgba(255,255,255,0.65)',
  accent: '#6366f1',
  shadow: '#000',
  statusBar: 'light-content' as const,
  headerBg: '#14141f',
  modalBackdrop: '#000000',
};

// exported theme union covers both light and dark
export type Theme = typeof LIGHT | typeof DARK;

// ─── Category icons (Lucide-style SVG) ───────────────────────────────────────
type IconProps = { size?: number; color: string };

function BriefcaseIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LeafIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 18 4a1 1 0 011 1v2a1 1 0 01-1 1c-1 0-2 1-2 3 0 2 2 3 4 3h2a1 1 0 011 1v2a1 1 0 01-1 1h-2" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShoppingCartIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2zM1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CreditCardIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1 9h22" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Spaces (categorias) ─────────────────────────────────────────────────────
type Space = {
  id: string; label: string; color: string; light: string;
  Icon: ComponentType<IconProps>;
};

const SPACES: Space[] = [
  { id: 'trabalho', label: 'Trabalho',  color: '#6366f1', light: 'rgba(99,102,241,0.12)', Icon: BriefcaseIcon },
  { id: 'pessoal',  label: 'Pessoal',   color: '#10b981', light: 'rgba(16,185,129,0.12)', Icon: LeafIcon },
  { id: 'compras',  label: 'Compras',   color: '#f59e0b', light: 'rgba(245,158,11,0.12)', Icon: ShoppingCartIcon },
  { id: 'conta',    label: 'Conta',     color: '#8b5cf6', light: 'rgba(139,92,246,0.12)', Icon: CreditCardIcon },
];

// ─── Task type ────────────────────────────────────────────────────────────────
type Priority = 'alta' | 'média' | 'baixa';
type Task = {
  id: string; spaceId: string; title: string;
  done: boolean; priority: Priority;
  dueLabel?: string; // legacy, usado só para seed
  dueDate?: string;  // ISO "YYYY-MM-DD"
  dueTime?: string;  // "HH:mm"
};

const PRIORITY_COLOR: Record<Priority, string> = {
  alta: '#ef4444', média: '#f59e0b', baixa: '#10b981',
};

// ─── Priority icons: Lucide arrow-big-*-dash (paths from lucide-react-native) ─
function PriorityDownIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 11a1 1 0 0 0 1 1h2.939a1 1 0 0 1 .75 1.811l-6.835 6.836a1.207 1.207 0 0 1-1.707 0L4.31 13.81a1 1 0 0 1 .75-1.811H8a1 1 0 0 0 1-1V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9 4h6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PriorityRightIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 9a1 1 0 0 0 1-1V5.061a1 1 0 0 1 1.811-.75l6.836 6.836a1.207 1.207 0 0 1 0 1.707l-6.836 6.835a1 1 0 0 1-1.811-.75V16a1 1 0 0 0-1-1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M4 9v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PriorityUpIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 13a1 1 0 0 0-1-1H5.061a1 1 0 0 1-.75-1.811l6.836-6.835a1.207 1.207 0 0 1 1.707 0l6.835 6.835a1 1 0 0 1-.75 1.811H16a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9 20h6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Filter icons (Todos, Pendentes, Concluídas) ─────────────────────────────
function FilterAllIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function FilterPendingIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 22a10 10 0 100-20 10 10 0 000 20z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function FilterDoneIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 4L12 14.01l-3-3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
const FILTER_ICONS: Record<'todas' | 'pendentes' | 'concluídas', ComponentType<IconProps>> = {
  todas: FilterAllIcon,
  pendentes: FilterPendingIcon,
  concluídas: FilterDoneIcon,
};

const PRIORITY_ICON: Record<Priority, ComponentType<{ size?: number; color: string }>> = {
  baixa: PriorityDownIcon,
  média: PriorityRightIcon,
  alta: PriorityUpIcon,
};

// ─── Data / hora: helpers ─────────────────────────────────────────────────────
const PT_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDueDisplay(dueDate?: string, dueTime?: string): string {
  if (!dueDate) return '';
  const d = new Date(dueDate + (dueTime ? `T${dueTime}:00` : 'T12:00:00'));
  const today = new Date();
  const isToday = dueDate === today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = dueDate === tomorrow.toISOString().slice(0, 10);
  let label = '';
  if (isToday) label = 'Hoje';
  else if (isTomorrow) label = 'Amanhã';
  else label = `${PT_DAYS[d.getDay()]}, ${d.getDate()} ${PT_MONTHS[d.getMonth()]}`;
  if (dueTime) label += ` · ${dueTime}`;
  return label;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTimeForInput(date: Date): string {
  return date.toTimeString().slice(0, 5); // HH:mm
}

// Tarefas que vencem em breve: não concluídas, com data, dentro de 48h
function getTasksDueSoon(tasks: Task[]): Task[] {
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  return tasks.filter(t => {
    if (t.done || !t.dueDate) return false;
    const due = new Date(t.dueDate + (t.dueTime ? `T${t.dueTime}:00` : 'T23:59:59'));
    return due >= now && due <= in48h;
  }).sort((a, b) => {
    const da = new Date(a.dueDate! + (a.dueTime ? `T${a.dueTime}:00` : 'T23:59:59'));
    const db = new Date(b.dueDate! + (b.dueTime ? `T${b.dueTime}:00` : 'T23:59:59'));
    return da.getTime() - db.getTime();
  });
}

// ─── Seed data ────────────────────────────────────────────────────────────────
function seedDueDate(rel: 'today' | 'tomorrow' | string): string {
  const d = new Date();
  if (rel === 'today') return formatDateForInput(d);
  if (rel === 'tomorrow') { d.setDate(d.getDate() + 1); return formatDateForInput(d); }
  const day = { 'qui': 4, 'sex': 5, 'sáb': 6 }[rel.toLowerCase()];
  if (day != null) {
    const diff = (day + 7 - d.getDay()) % 7 || 7;
    d.setDate(d.getDate() + (diff === 7 ? 0 : diff));
    return formatDateForInput(d);
  }
  return formatDateForInput(d);
}

const SEED_TASKS: Task[] = [
  { id: '1', spaceId: 'trabalho', title: 'Revisar proposta do cliente', done: false, priority: 'alta', dueDate: seedDueDate('today'), dueTime: '09:00' },
  { id: '2', spaceId: 'trabalho', title: 'Reunião de sprint planning', done: true,  priority: 'média', dueDate: seedDueDate('tomorrow') },
  { id: '3', spaceId: 'trabalho', title: 'Deploy do novo módulo', done: false, priority: 'alta', dueDate: seedDueDate('sex') },
  { id: '4', spaceId: 'pessoal',  title: 'Meditar 10 minutos', done: true,  priority: 'baixa' },
  { id: '5', spaceId: 'pessoal',  title: 'Ligar para a mãe', done: false, priority: 'média', dueDate: seedDueDate('today'), dueTime: '18:00' },
  { id: '6', spaceId: 'pessoal',  title: 'Academia – pernas', done: false, priority: 'baixa', dueDate: seedDueDate('qui') },
  { id: '7', spaceId: 'compras',  title: 'Azeite e especiarias', done: false, priority: 'baixa' },
  { id: '8', spaceId: 'compras',  title: 'Novo cabo USB-C', done: true,  priority: 'média' },
  { id: '9', spaceId: 'compras',  title: 'Presente aniversário da Ana', done: false, priority: 'alta', dueDate: seedDueDate('sáb') },
  { id: '10', spaceId: 'conta',   title: 'Pagar fatura da luz', done: false, priority: 'alta', dueDate: seedDueDate('today') },
  { id: '11', spaceId: 'conta',   title: 'Subscrição Netflix', done: true,  priority: 'baixa' },
  { id: '12', spaceId: 'conta',   title: 'Transferir para poupança', done: false, priority: 'média', dueDate: seedDueDate('sáb') },
];

// ─── Task row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, T, space, onToggle }: {
  task: Task; T: Theme; space: Space; onToggle: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(task.done ? 1 : 0)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    Animated.timing(checkAnim, {
      toValue: task.done ? 0 : 1, duration: 220, useNativeDriver: false,
    }).start();
    onToggle();
  };

  const checkBg = checkAnim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', space.color] });
  const checkBorder = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [T.border, space.color] });

  return (
    <Animated.View style={[tR.row, { backgroundColor: T.bgCard, borderColor: T.border, transform: [{ scale }] }]}>
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.8} style={tR.checkWrap}>
        <Animated.View style={[tR.check, { backgroundColor: checkBg, borderColor: checkBorder }]}>
          {task.done && <Text style={tR.checkMark}>✓</Text>}
        </Animated.View>
      </TouchableOpacity>
      <View style={tR.content}>
        <Text style={[tR.title, { color: T.text }, task.done && { textDecorationLine: 'line-through', color: T.textSub }]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={tR.meta}>
          {createElement(PRIORITY_ICON[task.priority], { size: 16, color: PRIORITY_COLOR[task.priority] })}
          <Text style={[tR.metaText, { color: T.textMuted }]}>{task.priority}</Text>
          {(task.dueDate || task.dueLabel) && (() => {
            const label = task.dueDate ? formatDueDisplay(task.dueDate, task.dueTime) : task.dueLabel!;
            const isToday = task.dueDate === new Date().toISOString().slice(0, 10);
            return (
              <>
                <Text style={[tR.metaSep, { color: T.textSub }]}>·</Text>
                <Text style={[tR.metaText, { color: isToday ? space.color : T.textMuted }]}>{label}</Text>
              </>
            );
          })()}
        </View>
      </View>
    </Animated.View>
  );
}

const tR = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 12 },
  checkWrap: { marginRight: 12 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '800', lineHeight: 16 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '500' },
  metaSep: { fontSize: 11 },
});

// ─── Bell (sino simples para header) ─────────────────────────────────────────
function BellIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.3 21a1.94 1.94 0 003.4 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── User round (perfil) — Lucide user-round ─────────────────────────────────
function UserRoundIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="5" fill="none" stroke={color} strokeWidth={1.8} />
      <Path d="M20 21a8 8 0 00-16 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── BellRing (tarefas a vencer) ─────────────────────────────────────────────
function BellRingIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.3 21a1.94 1.94 0 003.4 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 2C2.8 3.7 2 5.7 2 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 8c0-2.3-.8-4.3-2-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Theme toggle icons (Sun / Moon) ─────────────────────────────────────────
function SunIcon({ size = 18, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5.64 5.64L4.22 4.22M19.78 19.78l-1.42-1.42M5.64 18.36L4.22 19.78M19.78 4.22l-1.42 1.42" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

function MoonIcon({ size = 18, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Lucide-style icons (inline SVG) ─────────────────────────────────────────
function LucideEditIcon({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 3a2.828 2.828 0 014 4L7.5 20.5 3 21.5l1-4.5L17 3z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LucideTrashIcon({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2M9 10v7M15 10v7M5 6l1 14a1 1 0 001 1h10a1 1 0 001-1l1-14"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Swipeable task row (swipe left → editar / eliminar) ─────────────────────
const ACTION_WIDTH = 52;

function SwipeableTaskRow({ task, T, space, onToggle, onEdit, onDelete, onSwipeOpen }: {
  task: Task; T: Theme; space: Space; onToggle: () => void; onEdit: () => void; onDelete: () => void;
  onSwipeOpen?: (close: () => void) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const closeAnd = (fn: () => void) => {
    swipeRef.current?.close();
    fn();
  };

  const handleSwipeableOpen = () => {
    onSwipeOpen?.(() => swipeRef.current?.close());
  };

  const renderRightActions = () => (
    <View style={swR.actions}>
      <RectButton style={swR.btn} onPress={() => closeAnd(onEdit)}>
        <LucideEditIcon size={22} color="#22c55e" />
        <Text style={[swR.btnLabel, { color: '#22c55e' }]}>Editar</Text>
      </RectButton>
      <RectButton style={swR.btn} onPress={() => closeAnd(onDelete)}>
        <LucideTrashIcon size={22} color="#ef4444" />
        <Text style={[swR.btnLabel, { color: '#ef4444' }]}>Excluir</Text>
      </RectButton>
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      onSwipeableOpen={handleSwipeableOpen}
    >
      <TaskRow task={task} T={T} space={space} onToggle={onToggle} />
    </Swipeable>
  );
}

const swR = StyleSheet.create({
  actions: { flexDirection: 'row', marginBottom: 8 },
  btn: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  btnEdit: {},
  btnDelete: {},
  btnLabel: { fontSize: 10, fontWeight: '700', marginTop: 2 },
});

// ─── Space tab pill ───────────────────────────────────────────────────────────
function SpaceTab({ space, active, T, onPress }: {
  space: Space; active: boolean; T: Theme; onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPress={() => { Animated.sequence([Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }), Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true })]).start(); onPress(); }}
      activeOpacity={0.85}
    >
      <Animated.View style={[
        sT.pill,
        { backgroundColor: active ? space.color : T.bgSurface, borderColor: active ? space.color : T.border, transform: [{ scale }] },
      ]}>
        {createElement(space.Icon, { size: 18, color: active ? '#fff' : T.textMuted })}
        <Text style={[sT.label, { color: active ? '#fff' : T.textMuted }]}>{space.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const sT = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  label: { fontSize: 13, fontWeight: '700' },
});

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({ space, tasks, T, active, onPress }: {
  space: Space; tasks: Task[]; T: Theme; active: boolean; onPress: () => void;
}) {
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length > 0 ? done / tasks.length : 0;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, { toValue: pct, duration: 700, useNativeDriver: false }).start();
  }, [pct]);

  const barW = barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginRight: 12 }}>
      <View style={[
        sc.card,
        { backgroundColor: active ? space.color : T.bgCard, borderColor: active ? space.color : T.border, shadowColor: active ? space.color : T.shadow },
      ]}>
        <View style={sc.iconWrap}>
          {createElement(space.Icon, { size: 28, color: active ? '#fff' : space.color })}
        </View>
        <Text style={[sc.label, { color: active ? '#fff' : T.text }]}>{space.label}</Text>
        <Text style={[sc.count, { color: active ? 'rgba(255,255,255,0.7)' : T.textMuted }]}>{tasks.length} tarefas</Text>
        <View style={[sc.barBg, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : T.bgSurface }]}>
          <Animated.View style={[sc.barFill, { width: barW, backgroundColor: active ? '#fff' : space.color }]} />
        </View>
        <Text style={[sc.pct, { color: active ? 'rgba(255,255,255,0.8)' : T.textMuted }]}>{Math.round(pct * 100)}%</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Inline quick-add (em cada categoria) ─────────────────────────────────────
function InlineAddRow({ space, T, onAdd }: { space: Space; T: Theme; onAdd: (title: string, priority: Priority) => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('média');

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    onAdd(t, priority);
    setTitle('');
  };

  return (
    <View style={[ia.wrap, { backgroundColor: T.bgCard, borderColor: T.border }]}>
      <TouchableOpacity onPress={submit} style={[ia.plusBtn, { backgroundColor: space.color }]} activeOpacity={0.8}>
        <Text style={ia.plusText}>＋</Text>
      </TouchableOpacity>
      <TextInput
        style={[ia.input, { color: T.text, backgroundColor: T.bgInput, borderColor: T.border }]}
        placeholder="Nova tarefa..."
        placeholderTextColor={T.textSub}
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={submit}
        returnKeyType="done"
      />
      <View style={ia.priorityWrap}>
        {(['baixa', 'média', 'alta'] as Priority[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[ia.prioBtn, { backgroundColor: priority === p ? PRIORITY_COLOR[p] : T.bgSurface, borderColor: priority === p ? PRIORITY_COLOR[p] : T.border }]}
            onPress={() => setPriority(p)}
          >
            {createElement(PRIORITY_ICON[p], { size: 14, color: priority === p ? '#fff' : T.textMuted })}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const ia = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 10 },
  plusBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  plusText: { color: '#fff', fontSize: 20, fontWeight: '300', lineHeight: 22 },
  input: { flex: 1, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  priorityWrap: { flexDirection: 'row', gap: 4 },
  prioBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
});

const sc = StyleSheet.create({
  card: { width: 130, borderRadius: 20, padding: 16, borderWidth: 1, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6 },
  iconWrap: { marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  count: { fontSize: 11, fontWeight: '500', marginBottom: 10 },
  barBg: { height: 4, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: 4, borderRadius: 4 },
  pct: { fontSize: 11, fontWeight: '700' },
});


// ─── Add task modal component ─────────────────────────────────────────────────
function AddTaskModal({ visible, T, spaces, defaultSpaceId, onClose, onAdd }: {
  visible: boolean; T: Theme; spaces: Space[];
  defaultSpaceId: string; onClose: () => void;
  onAdd: (title: string, spaceId: string, priority: Priority, dueDate?: string, dueTime?: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [spaceId, setSpaceId] = useState(defaultSpaceId);
  const [priority, setPriority] = useState<Priority>('média');
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [dueTime, setDueTime] = useState<string | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateTemp, setDateTemp] = useState(() => new Date());
  const [timeTemp, setTimeTemp] = useState(() => new Date());

  useEffect(() => { setSpaceId(defaultSpaceId); }, [defaultSpaceId]);
  useEffect(() => { if (!visible) { setDueDate(undefined); setDueTime(undefined); setShowDatePicker(false); setShowTimePicker(false); } }, [visible]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), spaceId, priority, dueDate, dueTime);
    setTitle(''); setPriority('média'); setDueDate(undefined); setDueTime(undefined);
    onClose();
  };

  const handleDateChange = (_: unknown, d?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (d) { setDueDate(formatDateForInput(d)); setDateTemp(d); }
  };
  const handleTimeChange = (_: unknown, d?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (d) { setDueTime(formatTimeForInput(d)); setTimeTemp(d); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[m.kavWrap, { backgroundColor: T.modalBackdrop }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Pressable style={[m.overlay, { backgroundColor: 'transparent' }]} onPress={onClose}>
          <Pressable
            style={[m.sheet, { backgroundColor: T.bgModal, borderColor: T.border, ...m.sheetShadow }]}
            onPress={e => e.stopPropagation()}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={m.sheetScroll}
            >
              <View style={[m.handle, { backgroundColor: T.border }]} />
              <Text style={[m.heading, { color: T.text }]}>Nova tarefa</Text>

              <TextInput
                style={[m.input, { backgroundColor: T.bgInput, color: T.text, borderColor: T.border }]}
                placeholder="O que precisa ser feito?" placeholderTextColor={T.textSub}
                value={title} onChangeText={setTitle} autoFocus
              />

              <Text style={[m.sectionLabel, { color: T.textMuted }]}>Espaço</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {spaces.map(sp => (
                  <TouchableOpacity
                    key={sp.id}
                    style={[m.chip, { backgroundColor: spaceId === sp.id ? sp.color : T.bgSurface, borderColor: spaceId === sp.id ? sp.color : T.border }]}
                    onPress={() => setSpaceId(sp.id)}
                  >
                    {createElement(sp.Icon, { size: 16, color: spaceId === sp.id ? '#fff' : T.textMuted })}
                    <Text style={[m.chipLabel, { color: spaceId === sp.id ? '#fff' : T.textMuted }]}>{sp.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[m.sectionLabel, { color: T.textMuted }]}>Prioridade</Text>
              <View style={m.priorityRow}>
                {(['baixa', 'média', 'alta'] as Priority[]).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[m.priorityChip, { backgroundColor: priority === p ? PRIORITY_COLOR[p] : T.bgSurface, borderColor: priority === p ? PRIORITY_COLOR[p] : T.border }]}
                    onPress={() => setPriority(p)}
                  >
                    {createElement(PRIORITY_ICON[p], { size: 20, color: priority === p ? '#fff' : T.textMuted })}
                    <Text style={[m.priorityLabel, { color: priority === p ? '#fff' : T.textMuted }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[m.sectionLabel, { color: T.textMuted }]}>Data e hora (opcional)</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity
                  style={[m.chip, { flex: 1, backgroundColor: dueDate ? spaces.find(s => s.id === spaceId)?.color ?? T.accent : T.bgSurface, borderColor: dueDate ? spaces.find(s => s.id === spaceId)?.color ?? T.accent : T.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[m.chipLabel, { color: dueDate ? '#fff' : T.textMuted }]}>
                    {dueDate ? formatDueDisplay(dueDate) : 'Definir data'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[m.chip, { flex: 1, backgroundColor: dueTime ? spaces.find(s => s.id === spaceId)?.color ?? T.accent : T.bgSurface, borderColor: dueTime ? spaces.find(s => s.id === spaceId)?.color ?? T.accent : T.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[m.chipLabel, { color: dueTime ? '#fff' : T.textMuted }]}>
                    {dueTime || 'Definir hora'}
                  </Text>
                </TouchableOpacity>
              </View>
              {(dueDate || dueTime) && (
                <TouchableOpacity
                  onPress={() => { setDueDate(undefined); setDueTime(undefined); }}
                  style={{ marginBottom: 16 }}
                >
                  <Text style={{ fontSize: 13, color: T.textMuted, textDecorationLine: 'underline' }}>Remover data/hora</Text>
                </TouchableOpacity>
              )}

              {(showDatePicker || showTimePicker) && (
                <View style={{ marginBottom: 16 }}>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dueDate ? new Date(dueDate + 'T12:00:00') : dateTemp}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                  {showTimePicker && (
                    <DateTimePicker
                      value={dueTime ? (() => { const [h, m] = dueTime.split(':'); const d = new Date(); d.setHours(parseInt(h, 10), parseInt(m, 10), 0); return d; })() : timeTemp}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleTimeChange}
                    />
                  )}
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }} style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 14, color: T.accent, fontWeight: '600' }}>Fechar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity style={[m.addBtn, { backgroundColor: spaces.find(s => s.id === spaceId)?.color ?? '#6366f1' }]} onPress={submit} activeOpacity={0.85}>
                <Text style={m.addBtnText}>Adicionar tarefa</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const m = StyleSheet.create({
  kavWrap: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, borderWidth: 2, borderBottomWidth: 0, paddingBottom: 40, maxHeight: '90%' },
  sheetShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 28,
  },
  sheetScroll: { paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  heading: { fontSize: 20, fontWeight: '800', marginBottom: 18 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  priorityChip: { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  priorityLabel: { fontSize: 13, fontWeight: '600' },
  addBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// ─── Edit task modal ─────────────────────────────────────────────────────────
function EditTaskModal({ visible, task, T, spaces, onClose, onSave }: {
  visible: boolean; task: Task | null; T: Theme; spaces: Space[];
  onClose: () => void; onSave: (id: string, title: string, spaceId: string, priority: Priority, dueDate?: string, dueTime?: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [priority, setPriority] = useState<Priority>('média');
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [dueTime, setDueTime] = useState<string | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateTemp, setDateTemp] = useState(() => new Date());
  const [timeTemp, setTimeTemp] = useState(() => new Date());

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSpaceId(task.spaceId);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime);
    }
  }, [task]);

  const submit = () => {
    if (!task || !title.trim()) return;
    onSave(task.id, title.trim(), spaceId, priority, dueDate, dueTime);
    onClose();
  };

  const handleDateChange = (_: unknown, d?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (d) { setDueDate(formatDateForInput(d)); setDateTemp(d); }
  };
  const handleTimeChange = (_: unknown, d?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (d) { setDueTime(formatTimeForInput(d)); setTimeTemp(d); }
  };

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={[m.kavWrap, { backgroundColor: T.modalBackdrop }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <Pressable style={[m.overlay, { backgroundColor: 'transparent' }]} onPress={onClose}>
          <Pressable
            style={[m.sheet, { backgroundColor: T.bgModal, borderColor: T.border, ...m.sheetShadow }]}
            onPress={e => e.stopPropagation()}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={m.sheetScroll}>
              <View style={[m.handle, { backgroundColor: T.border }]} />
              <Text style={[m.heading, { color: T.text }]}>Editar tarefa</Text>
              <TextInput
                style={[m.input, { backgroundColor: T.bgInput, color: T.text, borderColor: T.border }]}
                placeholder="O que precisa ser feito?" placeholderTextColor={T.textSub}
                value={title} onChangeText={setTitle}
              />
              <Text style={[m.sectionLabel, { color: T.textMuted }]}>Espaço</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {spaces.map(sp => (
                  <TouchableOpacity
                    key={sp.id}
                    style={[m.chip, { backgroundColor: spaceId === sp.id ? sp.color : T.bgSurface, borderColor: spaceId === sp.id ? sp.color : T.border }]}
                    onPress={() => setSpaceId(sp.id)}
                  >
                    {createElement(sp.Icon, { size: 16, color: spaceId === sp.id ? '#fff' : T.textMuted })}
                    <Text style={[m.chipLabel, { color: spaceId === sp.id ? '#fff' : T.textMuted }]}>{sp.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[m.sectionLabel, { color: T.textMuted }]}>Prioridade</Text>
              <View style={m.priorityRow}>
                {(['baixa', 'média', 'alta'] as Priority[]).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[m.priorityChip, { backgroundColor: priority === p ? PRIORITY_COLOR[p] : T.bgSurface, borderColor: priority === p ? PRIORITY_COLOR[p] : T.border }]}
                    onPress={() => setPriority(p)}
                  >
                    {createElement(PRIORITY_ICON[p], { size: 20, color: priority === p ? '#fff' : T.textMuted })}
                    <Text style={[m.priorityLabel, { color: priority === p ? '#fff' : T.textMuted }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[m.sectionLabel, { color: T.textMuted }]}>Data e hora (opcional)</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity
                  style={[m.chip, { flex: 1, backgroundColor: dueDate ? spaces.find(s => s.id === spaceId)?.color ?? T.accent : T.bgSurface, borderColor: dueDate ? spaces.find(s => s.id === spaceId)?.color ?? T.accent : T.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[m.chipLabel, { color: dueDate ? '#fff' : T.textMuted }]}>
                    {dueDate ? formatDueDisplay(dueDate) : 'Definir data'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[m.chip, { flex: 1, backgroundColor: dueTime ? spaces.find(s => s.id === spaceId)?.color ?? T.accent : T.bgSurface, borderColor: dueTime ? spaces.find(s => s.id === spaceId)?.color ?? T.accent : T.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[m.chipLabel, { color: dueTime ? '#fff' : T.textMuted }]}>
                    {dueTime || 'Definir hora'}
                  </Text>
                </TouchableOpacity>
              </View>
              {(dueDate || dueTime) && (
                <TouchableOpacity
                  onPress={() => { setDueDate(undefined); setDueTime(undefined); }}
                  style={{ marginBottom: 16 }}
                >
                  <Text style={{ fontSize: 13, color: T.textMuted, textDecorationLine: 'underline' }}>Remover data/hora</Text>
                </TouchableOpacity>
              )}

              {(showDatePicker || showTimePicker) && (
                <View style={{ marginBottom: 16 }}>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dueDate ? new Date(dueDate + 'T12:00:00') : dateTemp}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                  {showTimePicker && (
                    <DateTimePicker
                      value={dueTime ? (() => { const [h, m] = dueTime.split(':'); const d = new Date(); d.setHours(parseInt(h, 10), parseInt(m, 10), 0); return d; })() : timeTemp}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleTimeChange}
                    />
                  )}
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }} style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 14, color: T.accent, fontWeight: '600' }}>Fechar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity style={[m.addBtn, { backgroundColor: spaces.find(s => s.id === spaceId)?.color ?? '#6366f1' }]} onPress={submit} activeOpacity={0.85}>
                <Text style={m.addBtnText}>Guardar</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const scheme = useColorScheme();
  const [manualDark, setManualDark] = useState<boolean | null>(null);
  const isDark = manualDark !== null ? manualDark : scheme === 'dark';
  const T = isDark ? DARK : LIGHT;

  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [activeSpace, setActiveSpace] = useState<string>('trabalho');
  const [filter, setFilter] = useState<'todas' | 'pendentes' | 'concluídas'>('todas');
  const [showAdd, setShowAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState('');
  const [showNotifCountOnBell, setShowNotifCountOnBell] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const lastOpenSwipeClose = useRef<(() => void) | null>(null);

  const dueSoon = getTasksDueSoon(tasks);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const space = SPACES.find(s => s.id === activeSpace)!;
  const spaceTasks = tasks.filter(t => t.spaceId === activeSpace);
  const filtered = spaceTasks.filter(t =>
    filter === 'todas' ? true : filter === 'pendentes' ? !t.done : t.done
  );
  const donePct = spaceTasks.length > 0
    ? Math.round((spaceTasks.filter(t => t.done).length / spaceTasks.length) * 100) : 0;

  const toggleTask = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const addTask = (title: string, spaceId: string, priority: Priority, dueDate?: string, dueTime?: string) =>
    setTasks(prev => [...prev, { id: Date.now().toString(), spaceId, title, done: false, priority, dueDate, dueTime }]);

  const deleteTask = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const updateTask = (id: string, patch: Partial<Pick<Task, 'title' | 'spaceId' | 'priority' | 'dueDate' | 'dueTime'>>) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));

  const hour = new Date().getHours();
  const greetingBase = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const greeting = userName.trim()
    ? `${greetingBase}, ${userName.trim()}`
    : greetingBase;

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={[hs.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} />

      <GHScrollView style={{ flex: 1, backgroundColor: T.bg }} showsVerticalScrollIndicator={false} contentContainerStyle={hs.scroll}>

        {/* ── Header ── */}
        <Animated.View style={[hs.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <View>
            <Text style={[hs.greeting, { color: T.textMuted }]}>{greeting} 👋</Text>
            <Text style={[hs.heroTitle, { color: T.text }]}>Meus Espaços</Text>
          </View>
          <View style={hs.headerActions}>
            <TouchableOpacity
              style={[hs.headerIconBtn, { backgroundColor: T.bgSurface, borderColor: T.border }]}
              onPress={() => setShowProfile(true)}
              activeOpacity={0.75}
            >
              <UserRoundIcon size={20} color={T.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[hs.headerIconBtn, { backgroundColor: T.bgSurface, borderColor: T.border }]}
              onPress={() => setShowNotifications(true)}
              activeOpacity={0.75}
            >
              <BellIcon size={20} color={T.text} />
              {showNotifCountOnBell && dueSoon.length > 0 && (
                <View style={[hs.notifBadge, { backgroundColor: '#ef4444' }]}>
                  <Text style={hs.notifBadgeText}>{dueSoon.length > 9 ? '9+' : dueSoon.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[hs.themeBtn, { backgroundColor: T.bgSurface, borderColor: T.border }]}
              onPress={() => setManualDark(!isDark)} activeOpacity={0.75}
            >
              {isDark ? <SunIcon size={20} color={T.text} /> : <MoonIcon size={20} color={T.text} />}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Categorias (Summary cards) ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hs.summaryScroll} contentContainerStyle={{ paddingHorizontal: 24 }}>
          {SPACES.map(sp => (
            <SummaryCard
              key={sp.id}
              space={sp}
              tasks={tasks.filter(t => t.spaceId === sp.id)}
              T={T}
              active={activeSpace === sp.id}
              onPress={() => setActiveSpace(sp.id)}
            />
          ))}
        </ScrollView>

        {/* ── Space tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hs.tabsScroll} contentContainerStyle={{ paddingHorizontal: 24 }}>
          {SPACES.map(sp => (
            <SpaceTab key={sp.id} space={sp} active={activeSpace === sp.id} T={T} onPress={() => setActiveSpace(sp.id)} />
          ))}
        </ScrollView>

        {/* ── Progress bar ── */}
        <View style={[hs.progressWrap, { paddingHorizontal: 24 }]}>
          <View style={[hs.progressRow]}>
            <Text style={[hs.progressLabel, { color: T.textMuted }]}>
              {spaceTasks.filter(t => t.done).length}/{spaceTasks.length} concluídas
            </Text>
            <Text style={[hs.progressPct, { color: space.color }]}>{donePct}%</Text>
          </View>
          <View style={[hs.progressBarBg, { backgroundColor: T.bgSurface }]}>
            <View style={[hs.progressBarFill, { width: `${donePct}%` as any, backgroundColor: space.color }]} />
          </View>
        </View>

        {/* ── Filter pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hs.filterScroll} contentContainerStyle={{ paddingHorizontal: 24 }}>
          {(['todas', 'pendentes', 'concluídas'] as const).map(f => {
            const FilterIcon = FILTER_ICONS[f];
            const color = filter === f ? space.color : T.textMuted;
            return (
              <TouchableOpacity
                key={f}
                style={[hs.filterPill, {
                  backgroundColor: filter === f ? space.light : T.bgSurface,
                  borderColor: filter === f ? space.color : T.border,
                }]}
                onPress={() => setFilter(f)}
                activeOpacity={0.75}
              >
                {createElement(FilterIcon, { size: 16, color })}
                <Text style={[hs.filterText, { color }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Inline add + Task list ── */}
        <View style={hs.taskList}>
          <InlineAddRow
            space={space}
            T={T}
            onAdd={(title, priority) => addTask(title, activeSpace, priority)}
          />
          {filtered.length === 0 ? (
            <View style={hs.emptyWrap}>
              <Text style={hs.emptyEmoji}>🎉</Text>
              <Text style={[hs.emptyText, { color: T.textMuted }]}>
                {filter === 'concluídas' ? 'Nenhuma tarefa concluída ainda.' : 'Nenhuma tarefa por aqui!'}
              </Text>
            </View>
          ) : (
            filtered.map(task => (
              <SwipeableTaskRow
                key={task.id}
                task={task}
                T={T}
                space={space}
                onToggle={() => toggleTask(task.id)}
                onEdit={() => setEditingTaskId(task.id)}
                onDelete={() => deleteTask(task.id)}
                onSwipeOpen={(close) => {
                  lastOpenSwipeClose.current?.();
                  lastOpenSwipeClose.current = close;
                }}
              />
            ))
          )}
        </View>
      </GHScrollView>

      {/* ── FAB ── */}
      {!showAdd && (
        <TouchableOpacity
          style={[hs.fab, { backgroundColor: space.color, shadowColor: space.color }]}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
        >
          <Text style={hs.fabIcon}>＋</Text>
        </TouchableOpacity>
      )}

      {/* ── Perfil e definições ── */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={[pModal.wrap, { backgroundColor: T.modalBackdrop }]}>
          <Pressable style={[pModal.dim, { backgroundColor: 'transparent' }]} onPress={() => setShowProfile(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={pModal.kav}
          >
            <Pressable style={[pModal.sheet, { backgroundColor: T.bgModal, borderColor: T.border }, m.sheetShadow]} onPress={e => e.stopPropagation()}>
              <View style={[pModal.handle, { backgroundColor: T.border }]} />
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={pModal.scroll}>
                <View style={pModal.hero}>
                  <View style={[pModal.avatar, { backgroundColor: T.bgSurface, borderColor: T.border }]}>
                    <UserRoundIcon size={40} color={T.text} />
                  </View>
                  <Text style={[pModal.heroTitle, { color: T.text }]}>Perfil</Text>
                  <Text style={[pModal.heroSub, { color: T.textMuted }]}>Definições básicas da conta</Text>
                </View>

                <Text style={[pModal.sectionLabel, { color: T.textMuted }]}>Conta</Text>
                <View style={[pModal.card, { backgroundColor: T.bgSurface, borderColor: T.border }]}>
                  <Text style={[pModal.fieldLabel, { color: T.textMuted }]}>Nome</Text>
                  <TextInput
                    style={[pModal.input, { color: T.text, borderColor: T.border, backgroundColor: T.bgInput }]}
                    placeholder="Como te chamas?"
                    placeholderTextColor={T.textSub}
                    value={userName}
                    onChangeText={setUserName}
                    autoCapitalize="words"
                  />
                </View>

                <Text style={[pModal.sectionLabel, { color: T.textMuted }]}>Preferências</Text>
                <View style={[pModal.card, { backgroundColor: T.bgSurface, borderColor: T.border }]}>
                  <View style={pModal.row}>
                    <View style={pModal.rowText}>
                      <Text style={[pModal.rowTitle, { color: T.text }]}>Modo escuro</Text>
                      <Text style={[pModal.rowHint, { color: T.textMuted }]}>Igual ao botão sol/lua no topo</Text>
                    </View>
                    <Switch
                      value={isDark}
                      onValueChange={v => setManualDark(v)}
                      trackColor={{ false: '#767577', true: T.accent }}
                      thumbColor="#f4f3f4"
                    />
                  </View>
                  <View style={[pModal.divider, { backgroundColor: T.border }]} />
                  <View style={pModal.row}>
                    <View style={pModal.rowText}>
                      <Text style={[pModal.rowTitle, { color: T.text }]}>Contagem no sino</Text>
                      <Text style={[pModal.rowHint, { color: T.textMuted }]}>Mostrar número de tarefas a vencer</Text>
                    </View>
                    <Switch
                      value={showNotifCountOnBell}
                      onValueChange={setShowNotifCountOnBell}
                      trackColor={{ false: '#767577', true: T.accent }}
                      thumbColor="#f4f3f4"
                    />
                  </View>
                </View>

                <Text style={[pModal.sectionLabel, { color: T.textMuted }]}>Sobre</Text>
                <View style={[pModal.card, { backgroundColor: T.bgSurface, borderColor: T.border }]}>
                  <Text style={[pModal.aboutLine, { color: T.text }]}>TaskFlow</Text>
                  <Text style={[pModal.aboutVer, { color: T.textMuted }]}>Versão {appVersion}</Text>
                </View>
              </ScrollView>
              <TouchableOpacity style={[pModal.closeBtn, { borderColor: T.border }]} onPress={() => setShowProfile(false)}>
                <Text style={[pModal.closeText, { color: T.textMuted }]}>Fechar</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Full-screen add task modal ── */}
      <AddTaskModal
        visible={showAdd}
        T={T}
        spaces={SPACES}
        defaultSpaceId={activeSpace}
        onClose={() => setShowAdd(false)}
        onAdd={addTask}
      />

      {/* ── Notifications modal (tarefas a vencer) ── */}
      <Modal visible={showNotifications} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: T.modalBackdrop }}>
          <Pressable style={[nModal.overlay, { backgroundColor: 'transparent' }]} onPress={() => setShowNotifications(false)}>
          <Pressable style={[nModal.sheet, { backgroundColor: T.bgModal, borderColor: T.border }, m.sheetShadow]} onPress={e => e.stopPropagation()}>
            <View style={nModal.header}>
              <View style={nModal.titleRow}>
                <BellRingIcon size={22} color={T.text} />
                <Text style={[nModal.title, { color: T.text }]}>Tarefas a vencer</Text>
              </View>
              <Text style={[nModal.subtitle, { color: T.textMuted }]}>Próximas 48 horas</Text>
            </View>
            {dueSoon.length === 0 ? (
              <View style={nModal.empty}>
                <Text style={[nModal.emptyText, { color: T.textMuted }]}>Nenhuma tarefa nas próximas 48h</Text>
              </View>
            ) : (
              <ScrollView style={nModal.list} showsVerticalScrollIndicator={false}>
                {dueSoon.map(task => {
                  const sp = SPACES.find(s => s.id === task.spaceId)!;
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[nModal.item, { backgroundColor: T.bgSurface, borderColor: T.border }]}
                      onPress={() => { setActiveSpace(task.spaceId); setShowNotifications(false); }}
                      activeOpacity={0.7}
                    >
                      <View style={[nModal.itemDot, { backgroundColor: sp.color }]} />
                      <View style={nModal.itemContent}>
                        <Text style={[nModal.itemTitle, { color: T.text }]} numberOfLines={2}>{task.title}</Text>
                        <Text style={[nModal.itemMeta, { color: T.textMuted }]}>
                          {formatDueDisplay(task.dueDate, task.dueTime)} · {sp.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity style={[nModal.closeBtn, { borderColor: T.border }]} onPress={() => setShowNotifications(false)}>
              <Text style={[nModal.closeText, { color: T.textMuted }]}>Fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
        </View>
      </Modal>

      {/* ── Edit task modal ── */}
      <EditTaskModal
        visible={editingTaskId !== null}
        task={editingTaskId ? tasks.find(t => t.id === editingTaskId) ?? null : null}
        T={T}
        spaces={SPACES}
        onClose={() => setEditingTaskId(null)}
        onSave={(id, title, spaceId, priority, dueDate, dueTime) => {
          updateTask(id, { title, spaceId, priority, dueDate, dueTime });
          setEditingTaskId(null);
        }}
      />
    </View>
  );
}

const pModal = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  dim: { ...StyleSheet.absoluteFillObject },
  kav: { width: '100%', maxHeight: '92%' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 2, paddingBottom: 28 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 10, marginBottom: 8 },
  scroll: { paddingHorizontal: 24, paddingBottom: 8 },
  hero: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '800' },
  heroSub: { fontSize: 13, marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowHint: { fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 14 },
  aboutLine: { fontSize: 15, fontWeight: '700' },
  aboutVer: { fontSize: 13, marginTop: 4 },
  closeBtn: { marginHorizontal: 24, marginTop: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  closeText: { fontSize: 14, fontWeight: '600' },
});

const nModal = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 2, maxHeight: '70%', paddingBottom: 34 },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 4 },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  list: { maxHeight: 280, paddingHorizontal: 24 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  itemDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600' },
  itemMeta: { fontSize: 12, marginTop: 2 },
  closeBtn: { marginHorizontal: 24, marginTop: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  closeText: { fontSize: 14, fontWeight: '600' },
});

const hs = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 4, position: 'relative' },
  notifBadge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  notifBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  greeting: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  heroTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.3 },
  themeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 4 },
  summaryScroll: { marginBottom: 24 },
  tabsScroll: { marginBottom: 20 },
  progressWrap: { marginBottom: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: '500' },
  progressPct: { fontSize: 12, fontWeight: '800' },
  progressBarBg: { height: 6, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 6 },
  filterScroll: { marginBottom: 20 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  filterText: { fontSize: 13, fontWeight: '600' },
  taskList: { paddingHorizontal: 24 },
  emptyWrap: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  fabIcon: { color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 32, marginTop: -2 },
});