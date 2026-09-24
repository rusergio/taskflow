import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");

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

// ─── Themes ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#F6F4F0",
  bgCard: "#FFFFFF",
  bgInput: "#EEECEA",
  bgInputFocus: "#EAE6FD",
  border: "rgba(0,0,0,0.07)",
  borderFocus: "rgba(99,102,241,0.5)",
  text: "#1A1826",
  textMuted: "#8A8699",
  textPlaceholder: "#B5B2C0",
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.10)",
  tabBg: "#E8E6E2",
  divider: "rgba(0,0,0,0.07)",
  orbA: "rgba(99,102,241,0.09)",
  orbB: "rgba(139,92,246,0.07)",
  orbC: "rgba(16,185,129,0.06)",
  statusBar: "dark-content" as const,
  eyeColor: "#9996AA",
};
const DARK = {
  bg: "#0a0a14",
  bgCard: "rgba(255,255,255,0.05)",
  bgInput: "rgba(255,255,255,0.06)",
  bgInputFocus: "rgba(99,102,241,0.08)",
  border: "rgba(255,255,255,0.08)",
  borderFocus: "rgba(99,102,241,0.6)",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.4)",
  textPlaceholder: "rgba(255,255,255,0.28)",
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.18)",
  tabBg: "rgba(255,255,255,0.06)",
  divider: "rgba(255,255,255,0.08)",
  orbA: "rgba(99,102,241,0.18)",
  orbB: "rgba(139,92,246,0.14)",
  orbC: "rgba(16,185,129,0.11)",
  statusBar: "light-content" as const,
  eyeColor: "rgba(255,255,255,0.35)",
};

// ─── Floating orb ─────────────────────────────────────────────────────────────
function FloatingOrb({
  size,
  color,
  x,
  y,
  delay = 0,
}: {
  size: number;
  color: string;
  x: number;
  y: number;
  delay?: number;
}) {
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(op, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(ty, {
              toValue: -16,
              duration: 3400,
              useNativeDriver: true,
            }),
            Animated.timing(ty, {
              toValue: 0,
              duration: 3400,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]),
    ]).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateY: ty }],
      }}
    />
  );
}

// ─── Real Google logo in SVG ──────────────────────────────────────────────────
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <ClipPath id="clip">
          <Rect width="48" height="48" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip)">
        {/* Blue */}
        <Path
          d="M44.5 20H24v8.5h11.7C34.1 33.9 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
          fill="#FFC107"
        />
        <Path
          d="M6.3 14.7l7 5.1C15.1 16 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"
          fill="#FF3D00"
        />
        <Path
          d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.6 37 27 38 24 38c-5.6 0-10.3-3.8-12-9l-7 5.4C8.3 41.5 15.6 46 24 46z"
          fill="#4CAF50"
        />
        <Path
          d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.6C42 36.4 45 31 45 24c0-1.3-.2-2.7-.5-4z"
          fill="#1976D2"
        />
      </G>
    </Svg>
  );
}

// ─── Eye icon (open / closed) ─────────────────────────────────────────────────
function EyeIcon({
  visible,
  color,
  size = 20,
}: {
  visible: boolean;
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {visible ? (
        // Eye open
        <G>
          <Path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-1 1-8z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      ) : (
        // Eye closed (slash through)
        <G>
          <Path
            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M14.12 14.12a3 3 0 01-4.24-4.24"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M1 1l22 22"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      )}
    </Svg>
  );
}

// ─── Animated form field wrapper ──────────────────────────────────────────────
// Slides in from below with a slight fade when it mounts
function AnimatedField({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(op, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(ty, {
          toValue: 0,
          tension: 120,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: op, transform: [{ translateY: ty }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const [manualDark, setManualDark] = useState<boolean | null>(null);
  const isDark = manualDark !== null ? manualDark : scheme === "dark";
  const T = isDark ? DARK : LIGHT;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  // ── Entrance animations ──
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 55,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Tab slider animation ──
  // The active indicator pill slides from left (Entrar) to right (Cadastrar)
  const tabSlider = useRef(new Animated.Value(0)).current;
  // formContent fades out then back in on tab switch
  const formOpacity = useRef(new Animated.Value(1)).current;

  const switchTab = (toRegister: boolean) => {
    if (toRegister === isRegister) return;

    // 1. Fade out form fields
    Animated.timing(formOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setIsRegister(toRegister);
      // 2. Slide the indicator pill
      Animated.spring(tabSlider, {
        toValue: toRegister ? 1 : 0,
        tension: 180,
        friction: 18,
        useNativeDriver: true,
      }).start();
      // 3. Fade fields back in
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSubmit = () => {
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    if (isRegister) {
      console.log("register", { email, password, name });
      // TODO: implementar registo
    } else {
      console.log("login", { email, password, name });
      router.replace("/home");
    }
  };

  const inputWrapStyle = (focused: boolean) => [
    s.inputWrap,
    {
      backgroundColor: focused ? T.bgInputFocus : T.bgInput,
      borderColor: focused ? T.borderFocus : T.border,
    },
  ];

  // Tab pill translateX: 0 = left half, 1 = right half
  // We calculate the pill width as (cardInnerWidth / 2) - 4px padding
  // Using percentage-based approach with transform
  const TAB_INNER = (width - 48 - 44 - 8) / 2; // approx half-tab width
  const pillerX = tabSlider.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_INNER + 8],
  });

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} />

      {/* Orbs */}
      <FloatingOrb size={210} color={T.orbA} x={-70} y={-50} delay={0} />
      <FloatingOrb
        size={150}
        color={T.orbB}
        x={width - 110}
        y={50}
        delay={200}
      />
      <FloatingOrb
        size={100}
        color={T.orbC}
        x={width * 0.25}
        y={height * 0.7}
        delay={400}
      />

      {/* Theme toggle */}
      <TouchableOpacity
        style={[
          s.themeToggle,
          { backgroundColor: T.bgInput, borderColor: T.border },
        ]}
        onPress={() => setManualDark(!isDark)}
        activeOpacity={0.75}
      >
        {isDark ? <SunIcon size={18} color={T.textMuted} /> : <MoonIcon size={18} color={T.textMuted} />}
        <Text style={[s.themeLabel, { color: T.textMuted }]}>
          {isDark ? "Claro" : "Escuro"}
        </Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            s.inner,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          {/* ── Logo ── */}
          <Animated.View
            style={[s.logoArea, { transform: [{ scale: logoScale }] }]}
          >
            <View
              style={[
                s.logoWrap,
                {
                  backgroundColor: T.accentSoft,
                  borderColor: isDark
                    ? "rgba(99,102,241,0.4)"
                    : "rgba(99,102,241,0.2)",
                  shadowColor: T.accent,
                },
              ]}
            >
              <View style={[s.logoInner, { backgroundColor: T.accent }]}>
                <Text style={s.logoIconText}>✦</Text>
              </View>
            </View>
            <Text style={[s.appName, { color: T.text }]}>Task Flow</Text>
            <Text style={[s.tagline, { color: T.textMuted }]}>
              Organize · Focus · Deliver
            </Text>
          </Animated.View>

          {/* ── Card ── */}
          <View
            style={[
              s.card,
              {
                backgroundColor: T.bgCard,
                borderColor: T.border,
                shadowColor: isDark ? "#000" : "rgba(0,0,0,0.12)",
              },
            ]}
          >
            {/* ── Custom animated tab switcher ── */}
            <View style={[s.tabTrack, { backgroundColor: T.tabBg }]}>
              {/* Sliding pill behind labels */}
              <Animated.View
                style={[
                  s.tabPill,
                  {
                    backgroundColor: T.accent,
                    transform: [{ translateX: pillerX }],
                    shadowColor: T.accent,
                  },
                ]}
              />
              {/* Labels on top */}
              {[
                { label: "Entrar", val: false },
                { label: "Cadastrar", val: true },
              ].map(({ label, val }) => {
                const active = isRegister === val;
                return (
                  <TouchableOpacity
                    key={label}
                    style={s.tabBtn}
                    onPress={() => switchTab(val)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        s.tabText,
                        { color: active ? "#fff" : T.textMuted },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Animated form fields ── */}
            <Animated.View style={{ opacity: formOpacity }}>
              {isRegister && (
                <AnimatedField delay={0}>
                  <View style={inputWrapStyle(nameFocused)}>
                    <Text style={[s.inputLabel, { color: T.textMuted }]}>
                      Nome completo
                    </Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      style={[s.input, { color: T.text }]}
                      placeholder="Seu nome"
                      placeholderTextColor={T.textPlaceholder}
                      autoCapitalize="words"
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                    />
                  </View>
                </AnimatedField>
              )}

              <AnimatedField delay={isRegister ? 60 : 0}>
                <View style={inputWrapStyle(emailFocused)}>
                  <Text style={[s.inputLabel, { color: T.textMuted }]}>
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    style={[s.input, { color: T.text }]}
                    placeholder="seu@email.com"
                    placeholderTextColor={T.textPlaceholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </AnimatedField>

              <AnimatedField delay={isRegister ? 120 : 60}>
                <View style={inputWrapStyle(passwordFocused)}>
                  <Text style={[s.inputLabel, { color: T.textMuted }]}>
                    Senha
                  </Text>
                  <View style={s.passwordRow}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      style={[s.input, s.passwordInput, { color: T.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={T.textPlaceholder}
                      secureTextEntry={!showPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((v) => !v)}
                      style={s.eyeBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.65}
                    >
                      <EyeIcon
                        visible={showPassword}
                        color={T.eyeColor}
                        size={19}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </AnimatedField>

              {!isRegister && (
                <AnimatedField delay={80}>
                  <TouchableOpacity style={s.forgotWrap} activeOpacity={0.7}>
                    <Text style={[s.forgotText, { color: T.accent }]}>
                      Esqueceu a senha?
                    </Text>
                  </TouchableOpacity>
                </AnimatedField>
              )}
            </Animated.View>

            {/* ── Submit button ── */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <Pressable
                style={({ pressed }) => [
                  s.primaryBtn,
                  { backgroundColor: T.accent, shadowColor: T.accent },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleSubmit}
              >
                <Text style={s.primaryBtnText}>
                  {isRegister ? "Criar conta" : "Entrar"}
                </Text>
              </Pressable>
            </Animated.View>

            {/* ── Divider ── */}
            <View style={s.divider}>
              <View style={[s.divLine, { backgroundColor: T.divider }]} />
              <Text style={[s.divText, { color: T.textMuted }]}>
                ou continue com
              </Text>
              <View style={[s.divLine, { backgroundColor: T.divider }]} />
            </View>

            {/* ── Google button with real logo ── */}
            <Pressable
              style={({ pressed }) => [
                s.googleBtn,
                { backgroundColor: T.bgInput, borderColor: T.border },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => {
                console.log("google sign in");
                router.replace("/home");
              }}
            >
              <View style={s.googleLogoWrap}>
                <GoogleLogo size={20} />
              </View>
              <Text style={[s.googleBtnText, { color: T.text }]}>
                Continuar com Google
              </Text>
            </Pressable>
          </View>

          {/* ── Footer ── */}
          <View style={s.footer}>
            <Text style={[s.footerText, { color: T.textMuted }]}>
              {isRegister ? "Já tem uma conta? " : "Não tem conta? "}
            </Text>
            <TouchableOpacity
              onPress={() => switchTab(!isRegister)}
              activeOpacity={0.7}
            >
              <Text style={[s.footerLink, { color: T.accent }]}>
                {isRegister ? "Entrar" : "Cadastrar"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  kav: { flex: 1 },

  themeToggle: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeIcon: { fontSize: 14 },
  themeLabel: { fontSize: 12, fontWeight: "600" },

  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Logo
  logoArea: { alignItems: "center", marginBottom: 28 },
  logoWrap: {
    width: 66,
    height: 66,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  logoInner: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIconText: { fontSize: 22, color: "#fff" },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "500",
  },

  // Card
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 16,
  },

  // ── Tab switcher with sliding pill ──
  tabTrack: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
    position: "relative",
    height: 46,
  },
  tabPill: {
    position: "absolute",
    top: 4,
    left: 4,
    // width = half track minus padding; set dynamically via layout but this is close
    width: "48%",
    bottom: 4,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tabBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabText: { fontSize: 14, fontWeight: "700" },

  // Inputs
  inputWrap: {
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  input: { fontSize: 15, height: 26, padding: 0 },

  // Password row with eye toggle
  passwordRow: { flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1 },
  eyeBtn: { paddingLeft: 8, justifyContent: "center", alignItems: "center" },

  // Forgot
  forgotWrap: { alignSelf: "flex-end", marginBottom: 18, marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: "500" },

  // Primary button
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 2,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Divider
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  divLine: { flex: 1, height: 1 },
  divText: { marginHorizontal: 12, fontSize: 12, fontWeight: "500" },

  // Google button
  googleBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  googleLogoWrap: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  googleBtnText: { fontSize: 14, fontWeight: "600", letterSpacing: 0.2 },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
    paddingBottom: 8,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "700" },
});
