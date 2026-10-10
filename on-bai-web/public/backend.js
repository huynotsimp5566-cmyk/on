// Lớp dữ liệu. Giao diện (app.js) chỉ gọi các hàm ở đây.
// Có hai bản: Firebase thật, và bản xem thử lưu trong localStorage.

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";

const addDays = (base, days) => new Date(base.getTime() + days * 86400000);

export async function createBackend(CONFIG) {
  const isDemo = String(CONFIG.firebase.apiKey).startsWith("YOUR_");
  return isDemo ? demoBackend(CONFIG) : firebaseBackend(CONFIG);
}

/* ---------------------------------------------------------------- Firebase */
async function firebaseBackend(CONFIG) {
  const [appM, authM, fs] = await Promise.all([
    import(FB + "firebase-app.js"),
    import(FB + "firebase-auth.js"),
    import(FB + "firebase-firestore.js"),
  ]);
  const app = appM.initializeApp(CONFIG.firebase);
  const auth = authM.getAuth(app);
  const db = fs.getFirestore(app);
  const { doc, getDoc, setDoc, addDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, increment, Timestamp, writeBatch } = fs;

  const toPayment = (d) => {
    const x = d.data();
    return { id: d.id, uid: x.uid, email: x.email, plan: x.plan, amount: x.amount, code: x.code, status: x.status,
      createdAt: x.createdAt && x.createdAt.toDate ? x.createdAt.toDate() : new Date() };
  };
  const byNewest = (a, b) => b.createdAt - a.createdAt;

  return {
    demo: false,
    onAuth(cb) {
      authM.onAuthStateChanged(auth, (u) =>
        cb(u ? { uid: u.uid, email: u.email || "", name: u.displayName || u.email || "", photo: u.photoURL || null } : null));
    },
    signIn: () => authM.signInWithPopup(auth, new authM.GoogleAuthProvider()),
    signOut: () => authM.signOut(auth),

    async loadProfile(u) {
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { email: u.email, name: u.name, photo: u.photo, createdAt: serverTimestamp() });
        return { proUntil: null };
      }
      const p = snap.data().proUntil;
      return { proUntil: p && p.toDate ? p.toDate() : null };
    },

    async getDaily(uid, key) {
      const s = await getDoc(doc(db, "users", uid, "daily", key));
      return s.exists() ? s.data().count || 0 : 0;
    },
    addDaily: (uid, key) => setDoc(doc(db, "users", uid, "daily", key), { count: increment(1) }, { merge: true }),

    async getProgress(uid) {
      const s = await getDoc(doc(db, "users", uid, "progress", "main"));
      return s.exists() ? s.data() : null;
    },
    setProgress: (uid, p) => setDoc(doc(db, "users", uid, "progress", "main"), p),

    async createPayment(p) {
      const r = await addDoc(collection(db, "payments"), {
        uid: p.uid, email: p.email, plan: p.plan, amount: p.amount, code: p.code,
        status: "pending", createdAt: serverTimestamp(),
      });
      return r.id;
    },
    async myPayments(uid) {
      const s = await getDocs(query(collection(db, "payments"), where("uid", "==", uid)));
      return s.docs.map(toPayment).sort(byNewest);
    },

    async adminPayments() {
      const [a, b] = await Promise.all([
        getDocs(query(collection(db, "payments"), where("status", "==", "pending"))),
        getDocs(query(collection(db, "payments"), where("status", "in", ["approved", "rejected"]))),
      ]);
      return { pending: a.docs.map(toPayment).sort(byNewest), done: b.docs.map(toPayment).sort(byNewest).slice(0, 30) };
    },
    async adminDecide(p, approve) {
      const payRef = doc(db, "payments", p.id);
      if (!approve) return updateDoc(payRef, { status: "rejected", decidedAt: serverTimestamp() });
      const userRef = doc(db, "users", p.uid);
      const us = await getDoc(userRef);
      const cur = us.exists() && us.data().proUntil ? us.data().proUntil.toDate() : null;
      const now = new Date();
      const base = cur && cur > now ? cur : now;
      const until = addDays(base, CONFIG.plans[p.plan].days);
      const batch = writeBatch(db);
      batch.update(payRef, { status: "approved", decidedAt: serverTimestamp() });
      batch.update(userRef, { proUntil: Timestamp.fromDate(until) });
      return batch.commit();
    },
  };
}

/* ---------------------------------------------------------------- Xem thử */
function demoBackend(CONFIG) {
  const KEY = "onbai_demo_v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* bỏ qua */ } };
  const user = { uid: "demo-user", email: CONFIG.adminEmail, name: "Người dùng thử", photo: null };
  let cb = () => {};
  const norm = (p) => ({ ...p, createdAt: new Date(p.createdAt) });
  const byNewest = (a, b) => b.createdAt - a.createdAt;

  return {
    demo: true,
    onAuth(f) { cb = f; f(load().signedIn ? user : null); },
    async signIn() { const s = load(); s.signedIn = true; save(s); cb(user); },
    async signOut() { const s = load(); s.signedIn = false; save(s); cb(null); },
    async loadProfile() { const s = load(); return { proUntil: s.proUntil ? new Date(s.proUntil) : null }; },
    async getDaily(uid, key) { return (load().daily || {})[key] || 0; },
    async addDaily(uid, key) { const s = load(); s.daily = s.daily || {}; s.daily[key] = (s.daily[key] || 0) + 1; save(s); },
    async getProgress() { return load().progress || null; },
    async setProgress(uid, p) { const s = load(); s.progress = p; save(s); },
    async createPayment(p) {
      const s = load(); s.payments = s.payments || [];
      const id = "p" + Date.now();
      s.payments.push({ id, uid: p.uid, email: p.email, plan: p.plan, amount: p.amount, code: p.code, status: "pending", createdAt: new Date().toISOString() });
      save(s); return id;
    },
    async myPayments() { return (load().payments || []).map(norm).sort(byNewest); },
    async adminPayments() {
      const all = (load().payments || []).map(norm).sort(byNewest);
      return { pending: all.filter((p) => p.status === "pending"), done: all.filter((p) => p.status !== "pending") };
    },
    async adminDecide(p, approve) {
      const s = load();
      const row = (s.payments || []).find((x) => x.id === p.id);
      if (!row) return;
      row.status = approve ? "approved" : "rejected";
      if (approve) {
        const cur = s.proUntil ? new Date(s.proUntil) : null;
        const now = new Date();
        s.proUntil = addDays(cur && cur > now ? cur : now, CONFIG.plans[p.plan].days).toISOString();
      }
      save(s);
    },
  };
}
