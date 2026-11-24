import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Goal = { id: number; title: string; done: boolean };
type Quest = { id: number; title: string; detail: string; xp: number; done: boolean };
type Mood = { date: string; mood: string; note: string };
type Skill = "Mind" | "Body" | "Creativity" | "Discipline";

const load = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(`unplug-${key}`);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
};

const initialQuests: Quest[] = [
  { id: 1, title: "Touch grass. Literally.", detail: "Spend 15 minutes outside without scrolling.", xp: 30, done: false },
  { id: 2, title: "Read a real page", detail: "Read a book or magazine for 10 minutes.", xp: 20, done: false },
  { id: 3, title: "Move your body", detail: "Stretch, walk, skate, dance or train for 15 minutes.", xp: 30, done: false },
  { id: 4, title: "Create something", detail: "Draw, write, build or make something offline.", xp: 40, done: false },
  { id: 5, title: "Human connection", detail: "Have a proper conversation with someone.", xp: 25, done: false },
];

const navItems = [
  ["Home", "⌂"], ["My Goals", "◎"], ["Focus Space", "◷"], ["Detox Island", "🏝️"],
  ["Challenges", "⚡"], ["Skill Tree", "✳"], ["Study Planner", "▤"],
  ["Mood Check", "☀"], ["Distraction Lab", "⌁"], ["Rewards", "◇"],
  ["Mind Reset", "♡"], ["My Progress", "↗"], ["Future Self", "✉"], ["Settings", "⚙"],
];

const themes = [
  { id: "ocean", name: "Ocean Focus", colors: "🌊" },
  { id: "earth", name: "Warm Earth", colors: "🌿" },
  { id: "night", name: "Night Shift", colors: "🌙" },
  { id: "contrast", name: "Maximum Clarity", colors: "◐" },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [page, setPage] = useState("Home");
  const [theme, setTheme] = useState(() => load("theme", "ocean"));
  const [goals, setGoals] = useState<Goal[]>(() => load("goals", [
    { id: 1, title: "Finish my most important task", done: false },
    { id: 2, title: "Spend 30 minutes learning something", done: false },
    { id: 3, title: "Take a proper screen break", done: false },
  ]));
  const [goalInput, setGoalInput] = useState("");
  const [points, setPoints] = useState(() => load("points", 0));
  const [sessions, setSessions] = useState(() => load("sessions", 0));
  const [minutes, setMinutes] = useState(() => load("minutes", 0));
  const [distractions, setDistractions] = useState<string[]>(() => load("distractions", []));
  const [distractionInput, setDistractionInput] = useState("");
  const [distractionReason, setDistractionReason] = useState("Boredom");
  const [quests, setQuests] = useState<Quest[]>(() => load("quests", initialQuests));
  const [moods, setMoods] = useState<Mood[]>(() => load("moods", []));
  const [moodNote, setMoodNote] = useState("");
  const [selectedMood, setSelectedMood] = useState("😊");
  const [claimed, setClaimed] = useState<string[]>(() => load("claimed", []));
  const [letter, setLetter] = useState(() => load("letter", ""));
  const [studyTasks, setStudyTasks] = useState<string[]>(() => load("studyTasks", []));
  const [studyInput, setStudyInput] = useState("");
  const [studyDate, setStudyDate] = useState(today());
  const [reflection, setReflection] = useState("");
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [challengeDay, setChallengeDay] = useState(() => load("challengeDay", 1));
  const [challengeDone, setChallengeDone] = useState<string[]>(() => load("challengeDone", []));
  const [islandLevel, setIslandLevel] = useState(() => load("islandLevel", 1));

  useEffect(() => {
    const data: Record<string, unknown> = {
      theme, goals, points, sessions, minutes, distractions, quests, moods,
      claimed, letter, studyTasks, challengeDay, challengeDone, islandLevel,
    };
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(`unplug-${key}`, JSON.stringify(value));
    });
    document.documentElement.dataset.theme = theme;
  }, [theme, goals, points, sessions, minutes, distractions, quests, moods, claimed, letter, studyTasks, challengeDay, challengeDone, islandLevel]);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTimerRunning(false);
          setTimerDone(true);
          setPoints((p) => p + 25);
          setSessions((s) => s + 1);
          setMinutes((m) => m + duration);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, duration]);

  const completedGoals = goals.filter((g) => g.done).length;
  const completedQuests = quests.filter((q) => q.done).length;
  const level = Math.floor(points / 100) + 1;
  const progress = points % 100;
  const streak = useMemo(() => {
    const dates = [...new Set(moods.map((m) => m.date))].sort().reverse();
    return dates.length;
  }, [moods]);

  const addPoints = (amount: number) => setPoints((p) => p + amount);
  const addGoal = () => {
    if (!goalInput.trim()) return;
    setGoals((g) => [...g, { id: Date.now(), title: goalInput.trim(), done: false }]);
    setGoalInput("");
  };
  const toggleGoal = (id: number) => {
    setGoals((items) => items.map((g) => {
      if (g.id !== id) return g;
      if (!g.done) addPoints(10);
      return { ...g, done: !g.done };
    }));
  };
  const startTimer = () => {
    if (remaining === 0 || timerDone) {
      setRemaining(duration * 60);
      setTimerDone(false);
    }
    setTimerRunning(true);
  };
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerDone(false);
    setRemaining(duration * 60);
  };
  const changeDuration = (value: number) => {
    setDuration(value);
    setRemaining(value * 60);
    setTimerRunning(false);
    setTimerDone(false);
  };
  const completeQuest = (id: number) => {
    setQuests((items) => items.map((q) => {
      if (q.id !== id || q.done) return q;
      addPoints(q.xp);
      return { ...q, done: true };
    }));
    setIslandLevel((n) => Math.min(10, n + 1));
  };
  const logDistraction = () => {
    if (!distractionInput.trim()) return;
    setDistractions((d) => [`${distractionInput.trim()} — ${distractionReason}`, ...d]);
    setDistractionInput("");
  };
  const logMood = () => {
    setMoods((m) => [...m, { date: today(), mood: selectedMood, note: moodNote }]);
    setMoodNote("");
    addPoints(5);
  };
  const addStudyTask = () => {
    if (!studyInput.trim()) return;
    setStudyTasks((t) => [...t, `${studyDate} | ${studyInput.trim()}`]);
    setStudyInput("");
  };
  const claimReward = (name: string, cost: number) => {
    if (points < cost || claimed.includes(name)) return;
    setPoints((p) => p - cost);
    setClaimed((c) => [...c, name]);
  };
  const finishChallenge = (id: string, xp: number) => {
    if (challengeDone.includes(id)) return;
    setChallengeDone((d) => [...d, id]);
    addPoints(xp);
    setChallengeDay((d) => Math.min(7, d + 1));
  };
  const time = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  const Stat = ({ icon, value, label }: { icon: string; value: string | number; label: string }) => (
    <div className="stat-card"><span className="stat-icon">{icon}</span><strong>{value}</strong><span>{label}</span></div>
  );
  const Panel = ({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <section className={`panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{children}</section>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">U.</div><div><strong>UNPLUG</strong><small>YOUR LIFE. YOUR RULES.</small></div></div>
        <div className="side-label">YOUR SPACE</div>
        <nav className="side-nav">
          {navItems.map(([name, icon]) => (
            <button key={name} className={page === name ? "nav-item active" : "nav-item"} onClick={() => setPage(name)}>
              <span>{icon}</span>{name}{name === "Challenges" && <i>NEW</i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><div className="mini-level"><span>LEVEL {level}</span><strong>{points} XP</strong></div><div className="xp-track"><span style={{ width: `${progress}%` }} /></div><p>Small steps. Big main-character energy.</p></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div><span className="eyebrow">YOUR DIGITAL WELLNESS HQ</span><h1>{page}</h1></div><div className="topbar-right"><span className="level-pill">✦ LEVEL {level}</span><span className="points-pill">⚡ {points} XP</span></div></header>
        <div className="content">
          {page === "Home" && <>
            <section className="hero">
              <div className="hero-copy"><span className="hero-tag">THE WORLD IS WAITING</span><h2>Less scrolling.<br /><em>More living.</em></h2><p>Your attention is your superpower. Spend it on things that actually matter.</p><button className="primary-btn" onClick={() => setPage("Focus Space")}>Enter focus mode <span>↗</span></button></div>
              <div className="hero-art"><div className="sun" /><div className="island island-one" /><div className="island island-two" /><div className="hero-orbit">✦</div><span className="hero-art-label">RECLAIM YOUR DAY</span></div>
            </section>
            <div className="stats-grid"><Stat icon="⚡" value={points} label="Total XP"/><Stat icon="◷" value={sessions} label="Focus sessions"/><Stat icon="⌛" value={`${minutes}m`} label="Time focused"/><Stat icon="◎" value={`${completedGoals}/${goals.length}`} label="Goals completed"/></div>
            <div className="dashboard-grid">
              <Panel title="Today's mission" subtitle="Make today count."><div className="goal-list">{goals.slice(0, 4).map((g) => <label className="goal-row" key={g.id}><input type="checkbox" checked={g.done} onChange={() => toggleGoal(g.id)}/><span className={g.done ? "done" : ""}>{g.title}</span></label>)}</div><button className="text-btn" onClick={() => setPage("My Goals")}>See all goals →</button></Panel>
              <Panel title="Your island is growing" subtitle="Every offline action builds your world."><div className="island-preview"><div className="island-sun">☀</div><div className="island-ground"><span>🌴</span><span>🏡</span><span>🌳</span><span>🌼</span></div></div><div className="inline-between"><strong>Island level {islandLevel}</strong><button className="text-btn" onClick={() => setPage("Detox Island")}>Visit island →</button></div></Panel>
            </div>
            <Panel title="Your next move" subtitle="Pick one. Start now."><div className="quick-actions"><button onClick={() => setPage("Focus Space")}>◷ <b>Focus sprint</b><small>Lock in for 25 minutes</small></button><button onClick={() => setPage("Challenges")}>⚡ <b>Take a challenge</b><small>Earn XP in real life</small></button><button onClick={() => setPage("Mood Check")}>☀ <b>Check your mood</b><small>See how you're doing</small></button></div></Panel>
            <div className="quote-strip">“You don't need more time. You need fewer distractions.” <span>— THE UNPLUG RULE</span></div>
          </>}

          {page === "My Goals" && <><div className="page-intro"><p>Make your goals visible. Make your progress undeniable.</p></div><Panel title="Add a new goal" subtitle="One clear target beats ten vague wishes."><div className="form-row"><input value={goalInput} onChange={(e) => setGoalInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGoal()} placeholder="What do you want to get done?"/><button className="primary-btn" onClick={addGoal}>Add goal +</button></div></Panel><Panel title="Your goal list" subtitle="Complete a goal to earn 10 XP."><div className="goal-list">{goals.map((g) => <div className="goal-row goal-edit" key={g.id}><label><input type="checkbox" checked={g.done} onChange={() => toggleGoal(g.id)}/><span className={g.done ? "done" : ""}>{g.title}</span></label><button className="icon-btn" aria-label="Delete goal" onClick={() => setGoals((a) => a.filter((x) => x.id !== g.id))}>×</button></div>)}</div>{goals.length === 0 && <p className="empty">Your next chapter starts with one goal.</p>}</Panel></>}

          {page === "Focus Space" && <><div className="page-intro"><p>One task. One timer. No negotiating with distractions.</p></div><Panel title="The focus chamber" subtitle="Choose your sprint length and get into it." className="focus-panel"><div className="timer-wrap"><div className="timer-ring"><div><strong>{time}</strong><span>{timerDone ? "SESSION COMPLETE" : timerRunning ? "YOU'RE LOCKED IN" : "READY WHEN YOU ARE"}</span></div></div></div><div className="duration-options">{[15, 25, 45, 60].map((n) => <button key={n} className={duration === n ? "selected" : ""} onClick={() => changeDuration(n)}>{n} min</button>)}</div><div className="timer-actions"><button className="primary-btn" onClick={timerRunning ? () => setTimerRunning(false) : startTimer}>{timerRunning ? "Pause session" : timerDone ? "Start again" : "Start focusing →"}</button><button className="secondary-btn" onClick={resetTimer}>Reset</button></div>{timerDone && <p className="success-note">You did it. +25 XP. Go enjoy a screen-free break.</p>}</Panel><div className="tip-card">✦ <div><b>FOCUS TIP</b><p>Put your phone in another room. Make distractions harder to reach than your goals.</p></div></div></>}

          {page === "Detox Island" && <><div className="page-intro"><p>This little world grows when you spend more time in the real one.</p></div><Panel title={`Welcome to island level ${islandLevel}`} subtitle="Your offline life is building something beautiful."><div className="big-island"><div className="big-island-sun">☀</div><div className="cloud cloud-a">☁</div><div className="cloud cloud-b">☁</div><div className="big-island-land"><div className="island-water">〰 〰 〰 〰 〰</div><div className="island-decor">🌴　🌳　🏡　🌲　🌴</div><div className="island-decor flowers">🌼　🌷　🌿　🌻</div></div><div className="island-caption">A LITTLE MORE LIFE, EVERY DAY.</div></div><div className="inline-between"><span>Island growth</span><b>Level {islandLevel} / 10</b></div><div className="xp-track large"><span style={{ width: `${islandLevel * 10}%` }}/></div><p className="muted">Complete offline quests to grow your island. Your progress is saved on this device.</p></Panel><Panel title="How to grow your island" subtitle="Real-world actions. Real-world wins."><button className="primary-btn" onClick={() => setPage("Challenges")}>Explore offline quests →</button></Panel></>}

          {page === "Challenges" && <><div className="page-intro"><p>Seven days. Seven small wins. A better relationship with your screen.</p></div><div className="challenge-banner"><span>THE UNPLUG RESET</span><h2>7 days to take<br/>your time back.</h2><p>Complete each daily mission to earn XP and build momentum.</p><div className="challenge-progress"><span style={{ width: `${challengeDone.length / 7 * 100}%` }}/></div><b>{challengeDone.length} / 7 days completed</b></div><div className="challenge-list">{[{t:"Day 1 — Notice your habits",d:"Track when and why you reach for your phone.",x:20},{t:"Day 2 — First 30 minutes offline",d:"Start your morning without checking your phone.",x:25},{t:"Day 3 — A real break",d:"Take a 20-minute break without a screen.",x:25},{t:"Day 4 — Move more",d:"Do 20 minutes of movement you enjoy.",x:30},{t:"Day 5 — Create, don't consume",d:"Make something instead of watching something.",x:30},{t:"Day 6 — Connect in real life",d:"Spend quality time with someone.",x:35},{t:"Day 7 — Your personal reset",d:"Plan one screen habit you want to change.",x:50}].map((c,i) => <div className="challenge-row" key={i}><div className="challenge-number">{i+1}</div><div className="challenge-info"><b>{c.t}</b><p>{c.d}</p><small>+{c.x} XP</small></div><button className={challengeDone.includes(String(i)) ? "completed-btn" : "secondary-btn"} disabled={challengeDone.includes(String(i))} onClick={() => finishChallenge(String(i), c.x)}>{challengeDone.includes(String(i)) ? "Completed ✓" : "Complete"}</button></div>)}</div></>}

          {page === "Skill Tree" && <><div className="page-intro"><p>Level up the parts of life that matter outside a screen.</p></div><div className="skill-grid">{([{name:"Mind",icon:"🧠",desc:"Learning, reading and curiosity",xp:points},{name:"Body",icon:"💪",desc:"Movement, rest and energy",xp:completedQuests * 20},{name:"Creativity",icon:"🎨",desc:"Making, drawing and building",xp:quests.filter(q=>q.done && q.title.includes("Create")).length * 40},{name:"Discipline",icon:"🎯",desc:"Consistency and focused effort",xp:sessions * 25}] as {name:Skill;icon:string;desc:string;xp:number}[]).map((s) => <div className="skill-card" key={s.name}><span className="skill-icon">{s.icon}</span><span className="skill-label">SKILL PATH</span><h2>{s.name}</h2><p>{s.desc}</p><div className="skill-level">LEVEL {Math.floor(s.xp / 100) + 1}</div><div className="xp-track"><span style={{width:`${s.xp % 100}%`}}/></div><small>{s.xp} XP earned</small></div>)}</div><Panel title="Your skill philosophy"><p className="muted">You don't level up by tapping a button. You level up by doing the thing. Use offline quests, focus sessions and goals to build your real-life skills.</p></Panel></>}

          {page === "Study Planner" && <><div className="page-intro"><p>Turn the “I have so much to do” panic into a plan you can actually follow.</p></div><Panel title="Add a study task" subtitle="Choose a date and write one clear task."><div className="form-row"><input type="date" value={studyDate} onChange={(e) => setStudyDate(e.target.value)}/><input value={studyInput} onChange={(e) => setStudyInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addStudyTask()} placeholder="e.g. Revise biology chapter 3"/><button className="primary-btn" onClick={addStudyTask}>Add task +</button></div></Panel><Panel title="Your study plan" subtitle="Keep it realistic. Progress beats perfection."><div className="goal-list">{studyTasks.map((task,i) => <div className="goal-row goal-edit" key={`${task}-${i}`}><span>{task}</span><button className="icon-btn" onClick={() => setStudyTasks((t) => t.filter((_,n) => n !== i))}>×</button></div>)}</div>{studyTasks.length === 0 && <p className="empty">No study tasks yet. Add one small step above.</p>}</Panel><div className="tip-card">✦ <div><b>THE 25–5 RULE</b><p>Try 25 minutes of focused study, then take a 5-minute screen-free break.</p></div></div></>}

          {page === "Mood Check" && <><div className="page-intro"><p>Your mood matters. Your productivity isn't your whole personality.</p></div><Panel title="How are you feeling?" subtitle="A quick check-in. No judgement, ever."><div className="mood-options">{["😄","😊","😐","😔","😣"].map((m) => <button key={m} className={selectedMood === m ? "mood-selected" : ""} onClick={() => setSelectedMood(m)}>{m}</button>)}</div><label className="field-label">Anything on your mind? (optional)<textarea value={moodNote} onChange={(e) => setMoodNote(e.target.value)} placeholder="A few words about today..." rows={3}/></label><button className="primary-btn" onClick={logMood}>Save check-in +5 XP</button></Panel><Panel title="Recent check-ins" subtitle="Look for patterns, not perfection.">{moods.length ? moods.slice(-7).reverse().map((m,i) => <div className="mood-history" key={i}><span>{m.mood}</span><div><b>{m.date}</b><p>{m.note || "No note added"}</p></div></div>) : <p className="empty">Your check-in history will show up here.</p>}</Panel></>}

          {page === "Distraction Lab" && <><div className="page-intro"><p>Don't beat yourself up about distractions. Study them. Outsmart them.</p></div><Panel title="Catch a distraction" subtitle="What pulled you away from what mattered?"><div className="form-row"><input value={distractionInput} onChange={(e) => setDistractionInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && logDistraction()} placeholder="e.g. Random video rabbit hole"/><select value={distractionReason} onChange={(e) => setDistractionReason(e.target.value)}><option>Boredom</option><option>Notifications</option><option>Stress</option><option>Habit</option><option>FOMO</option><option>Other</option></select><button className="primary-btn" onClick={logDistraction}>Log it</button></div></Panel><Panel title="Your distraction radar" subtitle="Awareness is the first step to changing a habit.">{distractions.length ? distractions.map((d,i) => <div className="distraction-row" key={i}><span>⌁</span>{d}</div>) : <p className="empty">No distractions logged. Keep noticing what steals your attention.</p>}</Panel><Panel title="Try this"><p className="muted">When you notice a distraction, pause and ask: “What was I looking for?” Maybe it was rest, connection, excitement or escape. Find a healthier way to meet that need.</p></Panel></>}

          {page === "Rewards" && <><div className="page-intro"><p>You've earned your XP. Redeem it for little reminders that you're making progress.</p></div><div className="reward-balance"><span>YOUR XP BALANCE</span><strong>⚡ {points}</strong></div><div className="reward-grid">{[{name:"Focus Champion",cost:50,icon:"🏆",desc:"Your first focus milestone."},{name:"Offline Explorer",cost:100,icon:"🧭",desc:"A badge for choosing the real world."},{name:"Consistency Club",cost:150,icon:"🔥",desc:"A reminder to keep showing up."},{name:"Mindful Master",cost:250,icon:"🧘",desc:"You made space for yourself."}].map((r) => <div className="reward-card" key={r.name}><span>{r.icon}</span><h3>{r.name}</h3><p>{r.desc}</p><b>{r.cost} XP</b><button className="secondary-btn" disabled={claimed.includes(r.name) || points < r.cost} onClick={() => claimReward(r.name,r.cost)}>{claimed.includes(r.name) ? "Claimed ✓" : points < r.cost ? "Not enough XP" : "Redeem reward"}</button></div>)}</div></>}

          {page === "Mind Reset" && <><div className="page-intro"><p>Pause. Breathe. You are allowed to take a moment.</p></div><Panel title="The 60-second reset" subtitle="Follow the circle. Let your shoulders drop."><div className="breathing-area"><div className="breath-circle"><span>BREATHE</span></div></div><p className="muted centered">Breathe in for 4 seconds · Hold for 4 · Breathe out for 4</p></Panel><Panel title="Clear your head" subtitle="Write it down. Get it out of your brain."><textarea className="reflection-area" rows={5} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="What's taking up space in your mind right now?"/><p className="muted">This reflection stays in this session and is not sent anywhere.</p></Panel></>}

          {page === "My Progress" && <><div className="page-intro"><p>Look how far you've come. Every small action counts.</p></div><div className="stats-grid"><Stat icon="⚡" value={points} label="XP balance"/><Stat icon="◷" value={sessions} label="Focus sessions"/><Stat icon="⌛" value={`${minutes}m`} label="Focus minutes"/><Stat icon="🌱" value={completedQuests} label="Offline quests"/></div><Panel title="Your level journey" subtitle="Earn XP to unlock your next level."><div className="level-display"><strong>LEVEL {level}</strong><span>{progress} / 100 XP to next level</span></div><div className="xp-track large"><span style={{width:`${progress}%`}}/></div></Panel><Panel title="Your activity snapshot"><div className="progress-list"><div><span>Goals completed</span><b>{completedGoals} / {goals.length}</b></div><div><span>Challenges completed</span><b>{challengeDone.length} / 7</b></div><div><span>Offline quests completed</span><b>{completedQuests} / {quests.length}</b></div><div><span>Mood check-ins</span><b>{moods.length}</b></div><div><span>Distractions noticed</span><b>{distractions.length}</b></div></div></Panel></>}

          {page === "Future Self" && <><div className="page-intro"><p>Write to the person you're becoming. Give them something worth reading.</p></div><Panel title="A message from present you" subtitle="What do you hope your future self remembers?"><div className="letter-paper"><span>DEAR FUTURE ME,</span><textarea value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="I hope you remember that..." rows={10}/><small>Saved automatically on this device.</small></div></Panel><div className="tip-card">✦ <div><b>A LITTLE REMINDER</b><p>You don't have to have everything figured out. Just keep taking the next good step.</p></div></div></>}

          {page === "Settings" && <><div className="page-intro"><p>Make UNPLUG feel like your space.</p></div><Panel title="Colour themes" subtitle="Choose a theme that feels comfortable to look at."><div className="theme-grid">{themes.map((t) => <button key={t.id} className={`theme-option ${theme === t.id ? "theme-active" : ""}`} onClick={() => setTheme(t.id)}><span>{t.colors}</span><b>{t.name}</b>{theme === t.id && <small>Selected ✓</small>}</button>)}</div><p className="muted">Maximum Clarity uses stronger contrast and reduces decorative animation. Colour is never the only way information is shown.</p></Panel><Panel title="Your data"><p className="muted">Your goals, XP, theme and activity are stored in this browser using local storage. They do not automatically sync across devices.</p><button className="danger-btn" onClick={() => { if (window.confirm("This will erase your UNPLUG progress on this device. Are you sure?")) { Object.keys(localStorage).filter((k) => k.startsWith("unplug-")).forEach((k) => localStorage.removeItem(k)); window.location.reload(); } }}>Reset all my data</button></Panel><Panel title="Made by HACKERZZ"><p className="muted">Build better habits. Create better futures.</p><div className="creator-grid">{["ISHAN FSB","VAISHNAV VINOD","ABHAY AJITH","ISAAC"].map((n,i) => <div className="creator" key={n}><span>0{i+1}</span><b>{n}</b></div>)}</div></Panel></>}

          <footer className="footer"><div className="footer-brand">UNPLUG<span>.</span></div><p>Disconnect from distractions. Reconnect with your dreams.</p><small>BUILT BY HACKERZZ · BUILD BETTER HABITS. CREATE BETTER FUTURES.</small></footer>
        </div>
      </main>
    </div>
  );
}