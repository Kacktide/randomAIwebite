import { useState } from "react";
import {
  Nfc, ShieldCheck, Users, GraduationCap, BookOpen, Wallet, Megaphone,
  User, ScanLine, Bell, LogOut, CreditCard, CheckCircle2,
  Clock, Package, Send, Radio, ChevronRight, X, FileText, AlertCircle,
  DoorOpen, Utensils
} from "lucide-react";

/* ---------------------------------- seed data ---------------------------------- */

const MONTHS = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
const WORKING_DAYS = [22,20,21,23,20,22,21,19,20,22,20,23];

const SEED_STUDENTS = [
  { id: "S1", name: "Aarav Mehta", roll: "10A-01", cls: "10", sec: "A", nfc: "NFC-10021", guardian: "Rohit Mehta", wallet: 450,
    attendance: [22,19,21,23,18,20,21,17,19,21,20,0], today: "not-marked", inTime: null, outTime: null,
    fees: { tuition: "paid", transport: "pending", exam: "paid" }, feeBalance: 1800 },
  { id: "S2", name: "Diya Kapoor", roll: "10A-02", cls: "10", sec: "A", nfc: "NFC-10022", guardian: "Neha Kapoor", wallet: 620,
    attendance: [21,20,21,22,19,21,20,18,20,22,19,0], today: "not-marked", inTime: null, outTime: null,
    fees: { tuition: "paid", transport: "paid", exam: "pending" }, feeBalance: 900 },
  { id: "S3", name: "Vihaan Sharma", roll: "9B-14", cls: "9", sec: "B", nfc: "NFC-10023", guardian: "Anil Sharma", wallet: 210,
    attendance: [20,18,19,21,17,19,18,16,18,20,18,0], today: "not-marked", inTime: null, outTime: null,
    fees: { tuition: "pending", transport: "pending", exam: "paid" }, feeBalance: 4200 },
  { id: "S4", name: "Ishita Rao", roll: "12A-05", cls: "12", sec: "A", nfc: "NFC-10024", guardian: "Kavya Rao", wallet: 800,
    attendance: [23,21,22,23,20,22,22,19,21,23,21,0], today: "not-marked", inTime: null, outTime: null,
    fees: { tuition: "paid", transport: "paid", exam: "paid" }, feeBalance: 0 },
];

const SEED_BOOKS = [
  { id: "B1", title: "Fundamentals of Physics", author: "D. Halliday", copies: 6, issued: 2 },
  { id: "B2", title: "A Tale of Two Cities", author: "C. Dickens", copies: 4, issued: 1 },
  { id: "B3", title: "Discrete Mathematics", author: "K. Rosen", copies: 5, issued: 3 },
  { id: "B4", title: "Wings of Fire", author: "A.P.J. Abdul Kalam", copies: 8, issued: 4 },
];

const READERS = [
  { id: "R1", name: "Main Gate", location: "Entrance", action: "gate", icon: DoorOpen },
  { id: "R2", name: "Library Desk", location: "Library", action: "library", icon: BookOpen },
  { id: "R3", name: "Canteen Counter", location: "Canteen", action: "canteen", icon: Utensils },
  { id: "R4", name: "Classroom 10A", location: "Block B", action: "classroom", icon: Users },
];

const CANTEEN_ITEMS = [
  { item: "Veg Thali", price: 60 }, { item: "Samosa", price: 15 }, { item: "Milkshake", price: 40 },
];

const ROLES = [
  { key: "admin", label: "Admin", icon: ShieldCheck },
  { key: "teacher", label: "Teacher", icon: GraduationCap },
  { key: "student", label: "Student", icon: User },
  { key: "parent", label: "Parent", icon: Users },
  { key: "librarian", label: "Librarian", icon: BookOpen },
];

const NAV = {
  admin: ["Overview", "NFC Simulator", "Students", "Announcements"],
  teacher: ["Overview", "Homework", "Messages"],
  student: ["Overview", "Attendance", "Library", "Fees", "Digital ID"],
  parent: ["Overview", "NFC Activity", "Fees", "Messages"],
  librarian: ["Overview", "Issue / Return", "Catalog"],
};

let idCounter = 1000;
const nextId = (p) => `${p}${idCounter++}`;
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ---------------------------------- small ui bits ---------------------------------- */

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>
        <Icon className="w-5 h-5 text-neutral-950" />
      </div>
      <div>
        <p className="text-neutral-500 text-xs">{label}</p>
        <p className="text-neutral-100 text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-neutral-200 font-semibold text-sm tracking-wide uppercase mb-3">{children}</h2>;
}

function Card({ children, className = "" }) {
  return <div className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 ${className}`}>{children}</div>;
}

function Pill({ text, tone = "neutral" }) {
  const tones = {
    neutral: "bg-neutral-800 text-neutral-300",
    good: "bg-emerald-500 text-emerald-950",
    warn: "bg-amber-500 text-amber-950",
    info: "bg-cyan-500 text-cyan-950",
  };
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${tones[tone]}`}>{text}</span>;
}

function Button({ children, onClick, variant = "primary", className = "", disabled }) {
  const variants = {
    primary: "bg-cyan-400 text-neutral-950 hover:bg-cyan-300",
    ghost: "bg-neutral-800 text-neutral-200 hover:bg-neutral-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- NFC card visual (signature element) ---------------------------------- */

function NfcCard({ student, pulsing }) {
  return (
    <div className="relative">
      <div className="w-72 h-44 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700 p-4 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400 text-xs tracking-widest uppercase">Campus ID</span>
          <div className="relative">
            <Nfc className="w-6 h-6 text-cyan-400" />
            {pulsing && <span className="scan-ring" />}
          </div>
        </div>
        <div>
          <p className="text-neutral-100 font-semibold text-base">{student?.name || "—"}</p>
          <p className="text-neutral-500 text-xs">{student ? `${student.roll} · Class ${student.cls}-${student.sec}` : ""}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 text-xs font-mono">{student?.nfc || "NFC-000000"}</span>
          <span className="text-neutral-600 text-xs">TAP TO ACT</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- app ---------------------------------- */

export default function App() {
  const [role, setRole] = useState(null);
  const [activeStudentId, setActiveStudentId] = useState("S1");
  const [nav, setNav] = useState("Overview");

  const [students, setStudents] = useState(SEED_STUDENTS);
  const [books, setBooks] = useState(SEED_BOOKS);
  const [libraryRecords, setLibraryRecords] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scanLogs, setScanLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [homework, setHomework] = useState([
    { id: "H1", cls: "10A", subject: "Mathematics", title: "Quadratic Equations Worksheet", due: "28 Jul", status: "Posted" },
    { id: "H2", cls: "10A", subject: "Mathematics", title: "Trigonometry Practice Set", due: "31 Jul", status: "Posted" },
  ]);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [pulseReader, setPulseReader] = useState(null);

  const activeStudent = students.find((s) => s.id === activeStudentId);
  const monthIdx = 0;

  const pushNotification = (n) => setNotifications((prev) => [{ id: nextId("N"), time: now(), ...n }, ...prev]);
  const pushLog = (l) => setScanLogs((prev) => [{ id: nextId("L"), time: now(), ...l }, ...prev]);
  const updateStudent = (id, patch) => setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  /* ---------------- core NFC engine ---------------- */
  function simulateScan(studentId, readerId) {
    const student = students.find((s) => s.id === studentId);
    const reader = READERS.find((r) => r.id === readerId);
    if (!student || !reader) return;

    setPulseReader(readerId);
    setTimeout(() => setPulseReader(null), 900);

    switch (reader.action) {
      case "gate": {
        if (!student.inTime || (student.inTime && student.outTime)) {
          const t = now();
          const newAttendance = [...student.attendance];
          if (!student.inTime) newAttendance[monthIdx] = Math.min(newAttendance[monthIdx] + 1, WORKING_DAYS[monthIdx]);
          updateStudent(studentId, { today: "present", inTime: t, outTime: null, attendance: newAttendance });
          pushLog({ studentId, reader: reader.name, action: "Checked IN" });
          pushNotification({ audience: "parent-nfc", studentId, text: `${student.name} arrived at school at ${t} (Main Gate scan).` });
        } else {
          const t = now();
          updateStudent(studentId, { outTime: t });
          pushLog({ studentId, reader: reader.name, action: "Checked OUT" });
          pushNotification({ audience: "parent-nfc", studentId, text: `${student.name} left school at ${t} (Main Gate scan).` });
        }
        break;
      }
      case "classroom": {
        pushLog({ studentId, reader: reader.name, action: "Subject attendance marked (Mathematics, Period 3)" });
        pushNotification({ audience: "parent-nfc", studentId, text: `${student.name}'s subject attendance marked in Class ${student.cls}${student.sec}.` });
        break;
      }
      case "library": {
        const activeRecord = libraryRecords.find((r) => r.studentId === studentId && !r.returned);
        if (activeRecord) {
          setLibraryRecords((prev) => prev.map((r) => (r.id === activeRecord.id ? { ...r, returned: true } : r)));
          setBooks((prev) => prev.map((b) => (b.id === activeRecord.bookId ? { ...b, issued: Math.max(0, b.issued - 1) } : b)));
          const book = books.find((b) => b.id === activeRecord.bookId);
          pushLog({ studentId, reader: reader.name, action: `Returned "${book?.title}"` });
          pushNotification({ audience: "parent-nfc", studentId, text: `${student.name} returned "${book?.title}" to the library.` });
        } else {
          const available = books.find((b) => b.issued < b.copies);
          if (available) {
            setBooks((prev) => prev.map((b) => (b.id === available.id ? { ...b, issued: b.issued + 1 } : b)));
            setLibraryRecords((prev) => [
              { id: nextId("LR"), studentId, bookId: available.id, issued: new Date().toLocaleDateString(), returned: false },
              ...prev,
            ]);
            pushLog({ studentId, reader: reader.name, action: `Issued "${available.title}"` });
            pushNotification({ audience: "parent-nfc", studentId, text: `${student.name} borrowed "${available.title}" from the library.` });
          } else {
            pushLog({ studentId, reader: reader.name, action: "No copies available to issue" });
          }
        }
        break;
      }
      case "canteen": {
        const pick = CANTEEN_ITEMS[Math.floor(Math.random() * CANTEEN_ITEMS.length)];
        const newWallet = Math.max(0, student.wallet - pick.price);
        updateStudent(studentId, { wallet: newWallet });
        setTransactions((prev) => [
          { id: nextId("T"), studentId, item: pick.item, price: pick.price, time: now(), place: reader.name },
          ...prev,
        ]);
        pushLog({ studentId, reader: reader.name, action: `Purchased ${pick.item} (Rs.${pick.price})` });
        pushNotification({ audience: "parent-nfc", studentId, text: `${student.name} purchased ${pick.item} for Rs.${pick.price} at ${reader.name}. Wallet balance: Rs.${newWallet}.` });
        break;
      }
      default:
        pushLog({ studentId, reader: reader.name, action: "Scan recorded" });
    }
  }

  /* ---------------- login ---------------- */
  if (!role) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <style>{customCss}</style>
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-2">
              <Nfc className="w-7 h-7 text-cyan-400" />
              <span className="text-neutral-100 font-semibold tracking-tight text-lg">CampusTap</span>
            </div>
            <h1 className="text-neutral-100 text-3xl font-semibold leading-tight text-center md:text-left">
              One card.<br />Every part of school, connected.
            </h1>
            <p className="text-neutral-500 text-sm max-w-sm text-center md:text-left">
              Tap the ID card demo below. A single scan can check a student in at the gate, issue a library book, or ring up a canteen purchase, live.
            </p>
            <NfcCard student={activeStudent} pulsing={true} />
          </div>

          <Card className="w-full">
            <SectionTitle>Sign in</SectionTitle>
            <p className="text-neutral-500 text-xs mb-4">Choose a role to enter its dashboard. Demo login barrier, no credentials asked for now.</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => { setRole(r.key); setNav("Overview"); }}
                  className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl px-3 py-3 text-sm transition"
                >
                  <r.icon className="w-4 h-4 text-cyan-400" />
                  {r.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const RoleIcon = ROLES.find((r) => r.key === role)?.icon || User;
  const myNotifications = notifications.filter((n) =>
    (role === "parent" || role === "student")
      ? (n.audience === "broadcast") || (n.audience === "parent-nfc" && n.studentId === activeStudentId)
      : false
  );

  return (
    <div className="min-h-screen bg-neutral-950 flex text-neutral-200">
      <style>{customCss}</style>

      <aside className="w-56 border-r border-neutral-800 flex flex-col p-4 gap-6 shrink-0">
        <div className="flex items-center gap-2 px-1">
          <Nfc className="w-6 h-6 text-cyan-400" />
          <span className="font-semibold text-neutral-100">CampusTap</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV[role].map((n) => (
            <button
              key={n}
              onClick={() => setNav(n)}
              className={`text-left px-3 py-2 rounded-xl text-sm transition flex items-center justify-between ${
                nav === n ? "bg-neutral-800 text-neutral-50" : "text-neutral-400 hover:bg-neutral-900"
              }`}
            >
              {n}
              {nav === n && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          {(role === "student" || role === "parent") && (
            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-neutral-300"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{role === "parent" ? `Child: ${s.name}` : s.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => { setRole(null); setNav("Overview"); }}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-200 text-xs px-3 py-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b border-neutral-800 px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-xs">{ROLES.find((r) => r.key === role)?.label} Dashboard</p>
            <h1 className="text-neutral-100 font-semibold">{nav}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-neutral-400" />
              {myNotifications.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full" />}
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
              <RoleIcon className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
          {role === "admin" && (
            <AdminViews
              nav={nav} students={students} scanLogs={scanLogs} books={books}
              readers={READERS} simulateScan={simulateScan} pulseReader={pulseReader}
              announcements={announcements}
              onSend={(text) => {
                setAnnouncements((prev) => [{ id: nextId("A"), text, time: now() }, ...prev]);
                pushNotification({ audience: "broadcast", studentId: null, text: `Announcement: ${text}` });
              }}
            />
          )}
          {role === "teacher" && (
            <TeacherViews
              nav={nav} homework={homework}
              onPush={(id) => {
                setHomework((prev) => prev.map((h) => (h.id === id ? { ...h, status: `Updated ${now()}` } : h)));
                pushNotification({ audience: "broadcast", studentId: null, text: `Homework updated by teacher — check the latest assignment.` });
              }}
              messages={messages}
              onSendMessage={(text) => setMessages((prev) => [{ id: nextId("M"), studentId: activeStudentId, from: "Teacher", text, time: now() }, ...prev])}
              students={students}
            />
          )}
          {role === "student" && (
            <StudentViews
              nav={nav} student={activeStudent} libraryRecords={libraryRecords} books={books}
              onPayFee={(type) => updateStudent(activeStudentId, { fees: { ...activeStudent.fees, [type]: "paid" } })}
              transactions={transactions.filter((t) => t.studentId === activeStudentId)}
              notifications={myNotifications}
            />
          )}
          {role === "parent" && (
            <ParentViews
              nav={nav} student={activeStudent} notifications={myNotifications}
              scanLogs={scanLogs.filter((l) => l.studentId === activeStudentId)}
              messages={messages.filter((m) => m.studentId === activeStudentId)}
              onSendMessage={(text) => setMessages((prev) => [{ id: nextId("M"), studentId: activeStudentId, from: "Parent", text, time: now() }, ...prev])}
              onPayFee={(type) => updateStudent(activeStudentId, { fees: { ...activeStudent.fees, [type]: "paid" } })}
              reportOpen={reportOpen} setReportOpen={setReportOpen}
            />
          )}
          {role === "librarian" && (
            <LibrarianViews
              nav={nav} students={students} books={books} libraryRecords={libraryRecords}
              onIssue={(studentId, bookId) => {
                setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, issued: b.issued + 1 } : b)));
                setLibraryRecords((prev) => [{ id: nextId("LR"), studentId, bookId, issued: new Date().toLocaleDateString(), returned: false }, ...prev]);
                const book = books.find((b) => b.id === bookId);
                pushNotification({ audience: "parent-nfc", studentId, text: `${students.find((s) => s.id === studentId)?.name} borrowed "${book?.title}" from the library.` });
              }}
              onReturn={(recordId, bookId, studentId) => {
                setLibraryRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, returned: true } : r)));
                setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, issued: Math.max(0, b.issued - 1) } : b)));
                const book = books.find((b) => b.id === bookId);
                pushNotification({ audience: "parent-nfc", studentId, text: `${students.find((s) => s.id === studentId)?.name} returned "${book?.title}" to the library.` });
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------------------------- Admin ---------------------------------- */

function AdminViews({ nav, students, scanLogs, books, readers, simulateScan, pulseReader, announcements, onSend }) {
  const [selStudent, setSelStudent] = useState(students[0].id);
  const [selReader, setSelReader] = useState(readers[0].id);
  const [text, setText] = useState("");

  const todayPresent = students.filter((s) => s.today === "present").length;
  const pendingFees = students.reduce((acc, s) => acc + Object.values(s.fees).filter((v) => v === "pending").length, 0);
  const booksIssued = books.reduce((a, b) => a + b.issued, 0);

  if (nav === "Overview") {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Students" value={students.length} tint="bg-cyan-400" />
          <StatCard icon={CheckCircle2} label="Present Today" value={todayPresent} tint="bg-emerald-400" />
          <StatCard icon={AlertCircle} label="Fees Pending" value={pendingFees} tint="bg-amber-400" />
          <StatCard icon={BookOpen} label="Books Issued" value={booksIssued} tint="bg-violet-400" />
        </div>
        <Card>
          <SectionTitle>Recent Scan Feed</SectionTitle>
          <ScanFeed logs={scanLogs} students={students} />
        </Card>
      </div>
    );
  }

  if (nav === "NFC Simulator") {
    const reader = readers.find((r) => r.id === selReader);
    const student = students.find((s) => s.id === selStudent);
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Simulate a Tap</SectionTitle>
          <p className="text-neutral-500 text-xs mb-4">No physical hardware yet — pick a card and a reader, then tap. Every module reacts live.</p>
          <div className="flex flex-col gap-3">
            <label className="text-xs text-neutral-500">Student card</label>
            <select value={selStudent} onChange={(e) => setSelStudent(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm">
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.nfc}</option>)}
            </select>
            <label className="text-xs text-neutral-500 mt-2">Reader location</label>
            <select value={selReader} onChange={(e) => setSelReader(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm">
              {readers.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.location})</option>)}
            </select>
            <Button className="mt-3" onClick={() => simulateScan(selStudent, selReader)}>
              <span className="flex items-center gap-2"><ScanLine className="w-4 h-4" /> Tap Card</span>
            </Button>
          </div>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-4">
          <NfcCard student={student} pulsing={pulseReader === selReader} />
          <div className="flex items-center gap-2 text-neutral-500 text-xs">
            {reader && <reader.icon className="w-4 h-4 text-cyan-400" />}
            <span>{reader?.name} · {reader?.location}</span>
          </div>
        </Card>
        <Card className="md:col-span-2">
          <SectionTitle>Live Scan Log</SectionTitle>
          <ScanFeed logs={scanLogs} students={students} />
        </Card>
      </div>
    );
  }

  if (nav === "Students") {
    return (
      <Card>
        <SectionTitle>All Students</SectionTitle>
        <table className="w-full text-sm">
          <thead className="text-neutral-500 text-xs uppercase">
            <tr><th className="text-left py-2">Name</th><th className="text-left">Class</th><th className="text-left">NFC UID</th><th className="text-left">Wallet</th><th className="text-left">Today</th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-neutral-800">
                <td className="py-2">{s.name}</td>
                <td>{s.cls}{s.sec}</td>
                <td className="font-mono text-xs text-neutral-400">{s.nfc}</td>
                <td>Rs.{s.wallet}</td>
                <td><Pill text={s.today} tone={s.today === "present" ? "good" : "neutral"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }

  if (nav === "Announcements") {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>New Announcement</SectionTitle>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
            placeholder="Write a school-wide notice..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm mb-3" />
          <Button disabled={!text.trim()} onClick={() => { onSend(text); setText(""); }}>
            <span className="flex items-center gap-2"><Megaphone className="w-4 h-4" /> Send to Students & Parents</span>
          </Button>
        </Card>
        <Card>
          <SectionTitle>Sent</SectionTitle>
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
            {announcements.length === 0 && <p className="text-neutral-600 text-sm">Nothing sent yet.</p>}
            {announcements.map((a) => (
              <div key={a.id} className="border-b border-neutral-800 pb-2">
                <p className="text-neutral-200 text-sm">{a.text}</p>
                <span className="text-neutral-600 text-xs">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }
  return null;
}

function ScanFeed({ logs, students }) {
  if (logs.length === 0) return <p className="text-neutral-600 text-sm">No scans yet — try the NFC Simulator.</p>;
  return (
    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
      {logs.slice(0, 20).map((l) => {
        const s = students.find((st) => st.id === l.studentId);
        return (
          <div key={l.id} className="flex items-center justify-between text-sm border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-neutral-300">{s?.name}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-500">{l.reader}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-400">{l.action}</span>
              <span className="text-neutral-600 text-xs">{l.time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------- Teacher ---------------------------------- */

function TeacherViews({ nav, homework, onPush, messages, onSendMessage, students }) {
  const [msg, setMsg] = useState("");

  if (nav === "Overview") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Homework Posted" value={homework.length} tint="bg-cyan-400" />
        <StatCard icon={Users} label="Class 10A Size" value={students.length} tint="bg-violet-400" />
        <StatCard icon={Package} label="Messages" value={messages.length} tint="bg-emerald-400" />
      </div>
    );
  }
  if (nav === "Homework") {
    return (
      <Card>
        <SectionTitle>Class 10A · Mathematics</SectionTitle>
        <div className="flex flex-col gap-3">
          {homework.map((h) => (
            <div key={h.id} className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <p className="text-neutral-200 text-sm font-medium">{h.title}</p>
                <p className="text-neutral-500 text-xs">Due {h.due} · {h.status}</p>
              </div>
              <Button variant="ghost" onClick={() => onPush(h.id)}>
                <span className="flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Push Update</span>
              </Button>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  if (nav === "Messages") {
    return (
      <Card>
        <SectionTitle>Parent Messages</SectionTitle>
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto mb-3">
          {messages.length === 0 && <p className="text-neutral-600 text-sm">No messages yet.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`text-sm px-3 py-2 rounded-xl max-w-md ${m.from === "Teacher" ? "bg-cyan-400 text-neutral-950 self-end" : "bg-neutral-800 text-neutral-200"}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Reply to parent..." className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm" />
          <Button disabled={!msg.trim()} onClick={() => { onSendMessage(msg); setMsg(""); }}>Send</Button>
        </div>
      </Card>
    );
  }
  return null;
}

/* ---------------------------------- Student ---------------------------------- */

function StudentViews({ nav, student, libraryRecords, books, onPayFee, transactions, notifications }) {
  if (!student) return null;
  const myRecords = libraryRecords.filter((r) => r.studentId === student.id);

  if (nav === "Overview") {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Wallet} label="Wallet Balance" value={`Rs.${student.wallet}`} tint="bg-cyan-400" />
          <StatCard icon={CheckCircle2} label="Today" value={student.today} tint={student.today === "present" ? "bg-emerald-400" : "bg-neutral-600"} />
          <StatCard icon={BookOpen} label="Books Out" value={myRecords.filter((r) => !r.returned).length} tint="bg-violet-400" />
          <StatCard icon={AlertCircle} label="Fee Balance" value={`Rs.${student.feeBalance}`} tint="bg-amber-400" />
        </div>
        <Card>
          <SectionTitle>Announcements</SectionTitle>
          {notifications.length === 0 && <p className="text-neutral-600 text-sm">Nothing yet.</p>}
          {notifications.map((n) => <p key={n.id} className="text-sm text-neutral-300 border-b border-neutral-800 pb-2 pt-1">{n.text} <span className="text-neutral-600 text-xs">· {n.time}</span></p>)}
        </Card>
      </div>
    );
  }
  if (nav === "Attendance") {
    return (
      <Card>
        <SectionTitle>Attendance — All 12 Months</SectionTitle>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {MONTHS.map((m, i) => (
            <div key={m} className="bg-neutral-800 rounded-xl p-3 text-center">
              <p className="text-neutral-500 text-xs">{m}</p>
              <p className="text-neutral-100 text-lg font-semibold">{student.attendance[i]}</p>
              <p className="text-neutral-600 text-xs">/ {WORKING_DAYS[i]} days</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  if (nav === "Library") {
    return (
      <Card>
        <SectionTitle>My Library Records</SectionTitle>
        {myRecords.length === 0 && <p className="text-neutral-600 text-sm">No borrow history yet — try an NFC tap at the Library Desk.</p>}
        <div className="flex flex-col gap-2">
          {myRecords.map((r) => {
            const b = books.find((bk) => bk.id === r.bookId);
            return (
              <div key={r.id} className="flex items-center justify-between border-b border-neutral-800 pb-2 text-sm">
                <span className="text-neutral-200">{b?.title}</span>
                <span className="text-neutral-500 text-xs">Issued {r.issued}</span>
                <Pill text={r.returned ? "Returned" : "Borrowed"} tone={r.returned ? "neutral" : "info"} />
              </div>
            );
          })}
        </div>
      </Card>
    );
  }
  if (nav === "Fees") {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Fee Status</SectionTitle>
          <div className="flex flex-col gap-2">
            {Object.entries(student.fees).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="capitalize text-sm text-neutral-300">{k}</span>
                {v === "paid" ? <Pill text="Paid" tone="good" /> : (
                  <Button variant="ghost" onClick={() => onPayFee(k)}>
                    <span className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Pay Now</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle>Wallet & Purchases</SectionTitle>
          <p className="text-neutral-100 text-2xl font-semibold mb-3">Rs.{student.wallet}</p>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {transactions.length === 0 && <p className="text-neutral-600 text-sm">No purchases yet.</p>}
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between text-sm border-b border-neutral-800 pb-1">
                <span>{t.item}</span><span className="text-neutral-500">{t.place}</span><span>Rs.{t.price}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }
  if (nav === "Digital ID") {
    return <div className="flex justify-center"><NfcCard student={student} pulsing={false} /></div>;
  }
  return null;
}

/* ---------------------------------- Parent ---------------------------------- */

function ParentViews({ nav, student, notifications, scanLogs, messages, onSendMessage, onPayFee, reportOpen, setReportOpen }) {
  const [msg, setMsg] = useState("");
  if (!student) return null;

  if (nav === "Overview") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={CheckCircle2} label="Today" value={student.today} tint={student.today === "present" ? "bg-emerald-400" : "bg-neutral-600"} />
        <StatCard icon={Clock} label="Check-in" value={student.inTime || "—"} tint="bg-cyan-400" />
        <StatCard icon={AlertCircle} label="Fee Balance" value={`Rs.${student.feeBalance}`} tint="bg-amber-400" />
        <Card className="col-span-2 md:col-span-3">
          <SectionTitle>Recent Notifications</SectionTitle>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {notifications.length === 0 && <p className="text-neutral-600 text-sm">Nothing yet.</p>}
            {notifications.map((n) => <p key={n.id} className="text-sm text-neutral-300 border-b border-neutral-800 pb-2">{n.text} <span className="text-neutral-600 text-xs">· {n.time}</span></p>)}
          </div>
        </Card>
      </div>
    );
  }
  if (nav === "NFC Activity") {
    return (
      <Card>
        <SectionTitle>{student.name}'s NFC Card Activity</SectionTitle>
        {scanLogs.length === 0 && <p className="text-neutral-600 text-sm">No card activity yet.</p>}
        <div className="flex flex-col gap-2">
          {scanLogs.map((l) => (
            <div key={l.id} className="flex justify-between text-sm border-b border-neutral-800 pb-2">
              <span className="flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-cyan-400" />{l.reader}</span>
              <span className="text-neutral-400">{l.action}</span>
              <span className="text-neutral-600 text-xs">{l.time}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  if (nav === "Fees") {
    return (
      <Card>
        <SectionTitle>Fee Payments</SectionTitle>
        <div className="flex flex-col gap-2">
          {Object.entries(student.fees).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="capitalize text-sm">{k}</span>
              {v === "paid" ? <Pill text="Paid" tone="good" /> : <Button variant="ghost" onClick={() => onPayFee(k)}>Pay Now</Button>}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <Button onClick={() => setReportOpen(true)}><span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Download Report Card</span></Button>
        </div>
        {reportOpen && (
          <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-50 p-6">
            <Card className="max-w-md w-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-neutral-100">Report Card — {student.name}</h3>
                <button onClick={() => setReportOpen(false)}><X className="w-4 h-4 text-neutral-400" /></button>
              </div>
              <p className="text-neutral-500 text-xs mb-3">Class {student.cls}{student.sec} · Roll {student.roll}</p>
              <div className="flex justify-between text-sm border-b border-neutral-800 py-1"><span>Attendance (this month)</span><span>{student.attendance[0]}/{WORKING_DAYS[0]}</span></div>
              <div className="flex justify-between text-sm py-1"><span>Fee Balance</span><span>Rs.{student.feeBalance}</span></div>
              <Button className="mt-4" variant="ghost" onClick={() => setReportOpen(false)}>Close</Button>
            </Card>
          </div>
        )}
      </Card>
    );
  }
  if (nav === "Messages") {
    return (
      <Card>
        <SectionTitle>Message the Teacher</SectionTitle>
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto mb-3">
          {messages.length === 0 && <p className="text-neutral-600 text-sm">No messages yet.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`text-sm px-3 py-2 rounded-xl max-w-md ${m.from === "Parent" ? "bg-cyan-400 text-neutral-950 self-end" : "bg-neutral-800 text-neutral-200"}`}>{m.text}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message the teacher..." className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm" />
          <Button disabled={!msg.trim()} onClick={() => { onSendMessage(msg); setMsg(""); }}>Send</Button>
        </div>
      </Card>
    );
  }
  return null;
}

/* ---------------------------------- Librarian ---------------------------------- */

function LibrarianViews({ nav, students, books, libraryRecords, onIssue, onReturn }) {
  const [selStudent, setSelStudent] = useState(students[0].id);
  const [selBook, setSelBook] = useState(books[0].id);

  if (nav === "Overview") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Total Copies" value={books.reduce((a, b) => a + b.copies, 0)} tint="bg-cyan-400" />
        <StatCard icon={CheckCircle2} label="Issued" value={books.reduce((a, b) => a + b.issued, 0)} tint="bg-violet-400" />
        <StatCard icon={Package} label="Titles" value={books.length} tint="bg-emerald-400" />
      </div>
    );
  }
  if (nav === "Issue / Return") {
    const activeForStudent = libraryRecords.find((r) => r.studentId === selStudent && !r.returned);
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Issue a Book</SectionTitle>
          <select value={selStudent} onChange={(e) => setSelStudent(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm mb-2">
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={selBook} onChange={(e) => setSelBook(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm mb-3">
            {books.filter((b) => b.issued < b.copies).map((b) => <option key={b.id} value={b.id}>{b.title} ({b.copies - b.issued} left)</option>)}
          </select>
          <Button onClick={() => onIssue(selStudent, selBook)}>Issue Book</Button>
        </Card>
        <Card>
          <SectionTitle>Return for Selected Student</SectionTitle>
          {activeForStudent ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-200">{books.find((b) => b.id === activeForStudent.bookId)?.title}</span>
              <Button variant="ghost" onClick={() => onReturn(activeForStudent.id, activeForStudent.bookId, selStudent)}>Return</Button>
            </div>
          ) : <p className="text-neutral-600 text-sm">No active borrow for this student.</p>}
          <div className="mt-4">
            <SectionTitle>All Active Borrows</SectionTitle>
            {libraryRecords.filter((r) => !r.returned).map((r) => (
              <div key={r.id} className="flex justify-between text-sm border-b border-neutral-800 py-1">
                <span>{students.find((s) => s.id === r.studentId)?.name}</span>
                <span className="text-neutral-500">{books.find((b) => b.id === r.bookId)?.title}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }
  if (nav === "Catalog") {
    return (
      <Card>
        <SectionTitle>Catalog</SectionTitle>
        <table className="w-full text-sm">
          <thead className="text-neutral-500 text-xs uppercase"><tr><th className="text-left py-2">Title</th><th className="text-left">Author</th><th className="text-left">Copies</th><th className="text-left">Available</th></tr></thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id} className="border-t border-neutral-800">
                <td className="py-2">{b.title}</td><td>{b.author}</td><td>{b.copies}</td><td>{b.copies - b.issued}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }
  return null;
}

const customCss = `
  .scan-ring {
    position: absolute; inset: -6px; border-radius: 9999px;
    border: 2px solid rgb(34 211 238 / 0.6);
    animation: scanpulse 0.9s ease-out;
  }
  @keyframes scanpulse {
    0% { transform: scale(0.6); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
  }
`;