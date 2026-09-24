import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Home,
  Layers3,
  LockKeyhole,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import "./styles.css";
import {
  lessons,
  units,
  lessonNumber,
  type Word,
  type Lesson,
} from "./data/course";

type Tab = "home" | "learn" | "practice" | "progress";
type Session = { lessonId: number; step: number; practice: boolean };
type Progress = {
  completed: number[];
  days: string[];
  session: Session | null;
};

const emptyProgress: Progress = { completed: [], days: [], session: null };
const storageKey = "qadam-progress-v2";
function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function readProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!saved || !Array.isArray(saved.completed) || !Array.isArray(saved.days))
      return emptyProgress;
    const session = saved.session;
    return {
      completed: [
        ...new Set<number>(
          saved.completed.filter((id: number) =>
            lessons.some((l) => l.id === id),
          ),
        ),
      ],
      days: [
        ...new Set<string>(
          saved.days.filter(
            (d: unknown) =>
              typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d),
          ),
        ),
      ],
      session:
        session &&
        lessons.some((l) => l.id === session.lessonId) &&
        Number.isInteger(session.step) &&
        session.step >= (session.practice ? 3 : 0) &&
        session.step < 6 &&
        typeof session.practice === "boolean"
          ? session
          : null,
    };
  } catch {
    return emptyProgress;
  }
}
function getStreak(days: string[]) {
  const date = new Date();
  if (!days.includes(dateKey(date))) date.setDate(date.getDate() - 1);
  let count = 0;
  while (days.includes(dateKey(date))) {
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
}
function weekDates() {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return dateKey(d);
  });
}
function Landscape() {
  return (
    <svg
      className="landscape"
      viewBox="0 0 420 240"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="304" cy="77" r="38" fill="#F3CC83" />
      <circle cx="304" cy="77" r="51" stroke="#F3CC83" strokeOpacity=".18" />
      <path d="m106 174 85-105 58 67 35-37 105 89 31 52H0z" fill="#628D82" />
      <path d="m191 69-32 40 32-14 20 15z" fill="#D3DDD0" />
      <path d="m230 192 84-85 106 95v38H141z" fill="#386D62" />
      <path d="M0 202c73-34 120-23 180 1s168-29 240-17v54H0z" fill="#205549" />
      <path d="M0 223c97-36 175 24 265 1s113-12 155-5v21H0z" fill="#163F38" />
      <path d="m305 240-49-66-20 1 17 65" fill="#D9B27D" opacity=".6" />
      <path d="M66 200v-19c0-19 17-36 39-36s39 17 39 36v19z" fill="#F3E9D1" />
      <path d="M60 179c8-21 24-34 45-34s37 13 45 34z" fill="#D8C8A8" />
      <path d="M99 200v-22h14v22" fill="#8B6246" />
      <path
        d="M74 184h13m36 0h13M105 145v-7"
        stroke="#8B6246"
        strokeWidth="2"
      />
      <path
        d="m238 53 7-3 7 3m-24-10 5-2 5 2"
        stroke="#CBD4B3"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [activeSession, setActiveSession] = useState(false);
  const [result, setResult] = useState<{
    lessonId: number;
    practice: boolean;
  } | null>(null);
  const [alphabet, setAlphabet] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [today, setToday] = useState(dateKey);
  const headingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [progress]);
  useEffect(() => {
    const update = () => setToday(dateKey());
    window.addEventListener("focus", update);
    const timer = window.setInterval(update, 60000);
    return () => {
      window.removeEventListener("focus", update);
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab, activeSession, result]);
  const streak = getStreak(progress.days);
  const nextLesson =
    lessons.find((l) => !progress.completed.includes(l.id)) || lessons[0];
  const heroLesson = progress.session
    ? lessons.find((l) => l.id === progress.session!.lessonId)!
    : nextLesson;
  const nextIndex = lessons.findIndex((lesson) => lesson.id === nextLesson.id);
  const pathStart = Math.min(nextIndex, Math.max(0, lessons.length - 3));
  const nearbyLessons = lessons.slice(pathStart, pathStart + 3);
  const start = (lessonId: number, practice = false) => {
    setProgress((p) => ({
      ...p,
      session:
        p.session?.lessonId === lessonId && p.session.practice === practice
          ? p.session
          : { lessonId, step: practice ? 3 : 0, practice },
    }));
    setResult(null);
    setActiveSession(true);
  };
  const go = (target: Tab) => {
    setTab(target);
    setResult(null);
  };
  const finish = () => {
    if (!progress.session) return;
    const { lessonId, practice } = progress.session;
    setProgress((p) => ({
      completed: practice
        ? p.completed
        : [...new Set([...p.completed, lessonId])],
      days: [...new Set([...p.days, dateKey()])],
      session: null,
    }));
    setActiveSession(false);
    setResult({ lessonId, practice });
  };
  const navigation = [
    { id: "home" as Tab, label: "Inicio", icon: Home },
    { id: "learn" as Tab, label: "Aprender", icon: BookOpen },
    { id: "practice" as Tab, label: "Repasar", icon: Layers3 },
    { id: "progress" as Tab, label: "Mi progreso", icon: Trophy },
  ];
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (!activeSession) go("home");
          }}
        >
          <span className="brand-symbol">q</span>
          <span>
            qadam<span className="brand-caption">KAZAJO, PASO A PASO</span>
          </span>
        </a>
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              disabled={activeSession}
              className={tab === id ? "active" : ""}
              key={id}
              onClick={() => go(id)}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon size={20} />
              {label}
              {tab === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span lang="kk">қадам</span>
          <p>
            Significa «paso» en kazajo.
            <br />
            El siguiente lo das tú.
          </p>
          <div className="small-ornament" aria-hidden="true">
            ✳
          </div>
        </div>
        <span className="sidebar-footer">Hecho para empezar desde cero.</span>
      </aside>
      <div className={`app-main ${activeSession ? "in-lesson" : ""}`}>
        <header className="topbar">
          <a
            href="#"
            className="brand mobile-brand"
            onClick={(e) => {
              e.preventDefault();
              if (!activeSession) go("home");
            }}
          >
            <span className="brand-symbol">q</span>
            <span>
              qadam<span className="brand-caption">PASO A PASO</span>
            </span>
          </a>
          <div className="desktop-breadcrumb">
            Tu pequeño viaje al kazajo <span> / </span>
            <b>
              {activeSession
                ? "Tu lección"
                : navigation.find((n) => n.id === tab)?.label}
            </b>
          </div>
          <button
            disabled={activeSession}
            className="streak-pill"
            onClick={() => go("progress")}
            aria-label={`Tu racha: ${streak} días. Ver progreso`}
          >
            <Flame size={18} />
            <strong>{streak}</strong>
            <span>{streak === 1 ? "día" : "días"}</span>
          </button>
        </header>
        <main ref={headingRef} tabIndex={-1} id="main-content">
          {storageError && (
            <p className="storage-notice" role="status">
              Tu navegador no permite guardar el progreso. Se conservará
              mientras esta página esté abierta.
            </p>
          )}
          {activeSession && progress.session ? (
            <LessonView
              key={`${progress.session.lessonId}-${progress.session.practice}`}
              session={progress.session}
              onStep={(step) =>
                setProgress((p) => ({
                  ...p,
                  session: p.session ? { ...p.session, step } : null,
                }))
              }
              onClose={() => setActiveSession(false)}
              onFinish={finish}
            />
          ) : result ? (
            <section className="result-screen screen">
              <div className="result-medal">
                <Trophy size={44} />
                <Sparkles className="medal-sparkle" size={24} />
              </div>
              <p className="eyebrow">UN PASO MÁS, BIEN HECHO</p>
              <h1>
                {result.practice
                  ? "Cada vez más fácil."
                  : "Ya sabes un poco más."}
              </h1>
              <p>
                Has {result.practice ? "repasado" : "completado"}{" "}
                <strong>
                  {lessons
                    .find((l) => l.id === result.lessonId)
                    ?.title.toLowerCase()}
                </strong>
                .
              </p>
              <div className="result-words">
                {lessons
                  .find((l) => l.id === result.lessonId)
                  ?.words.map((w) => (
                    <div key={w.kazakh}>
                      <span lang="kk">{w.kazakh}</span>
                      <span>
                        {w.spanish}
                        <Check size={16} />
                      </span>
                    </div>
                  ))}
              </div>
              <p className="result-note">
                Tu práctica de hoy cuenta. Vuelve mañana para seguir creciendo.
              </p>
              <button className="primary-button" onClick={() => go("learn")}>
                Seguir aprendiendo
                <ArrowRight size={19} />
              </button>
              <button className="text-button" onClick={() => go("progress")}>
                Ver mi progreso
                <ChevronRight size={17} />
              </button>
            </section>
          ) : (
            <>
              {tab === "home" && (
                <section className="screen home-screen">
                  <div className="welcome">
                    <p className="eyebrow">
                      <span className="live-dot" /> UN NUEVO DÍA, UN PEQUEÑO
                      PASO
                    </p>
                    <h1>
                      <span lang="kk">Сәлем!</span>{" "}
                      <span className="greeting">Hola.</span>
                      <br />
                      Tu viaje empieza <em>aquí.</em>
                    </h1>
                    <p>Un poquito de kazajo. Un mundo por descubrir.</p>
                  </div>
                  <div className="home-columns">
                    <div className="home-primary">
                      <section className="hero-lesson">
                        <Landscape />
                        <div className="hero-copy">
                          <span className="hero-tag">
                            <span />{" "}
                            {progress.session
                              ? "RETOMA DONDE LO DEJASTE"
                              : progress.completed.length === lessons.length
                                ? "SIGUE PRACTICANDO"
                                : "TU SIGUIENTE PASO"}
                          </span>
                          <p className="hero-number">
                            LECCIÓN {lessonNumber(heroLesson.id)} <span>·</span>{" "}
                            NIVEL INICIAL
                          </p>
                          <h2>{heroLesson.title}</h2>
                          <p className="hero-description">
                            {progress.completed.includes(heroLesson.id)
                              ? "Tres palabras que ya conoces."
                              : "Tres palabras nuevas."}
                            <br />
                            Muchas conversaciones por empezar.
                          </p>
                          <div className="lesson-meta">
                            <span>
                              <Clock3 size={15} /> 3 min
                            </span>
                            <span>
                              <BookOpen size={15} /> 3 palabras
                            </span>
                          </div>
                        </div>
                        <button
                          className="primary-button"
                          onClick={() =>
                            progress.session
                              ? start(
                                  progress.session.lessonId,
                                  progress.session.practice,
                                )
                              : start(nextLesson.id)
                          }
                        >
                          {progress.session
                            ? "Continuar mi lección"
                            : progress.completed.length === lessons.length
                              ? "Volver a practicar"
                              : "Empezar mi lección"}
                          <ArrowRight size={20} />
                        </button>
                      </section>
                      <section className="daily-goal">
                        <div
                          className={`goal-icon ${progress.days.includes(today) ? "done" : ""}`}
                        >
                          {progress.days.includes(today) ? (
                            <Check size={22} />
                          ) : (
                            <Target size={23} />
                          )}
                        </div>
                        <div>
                          <strong>
                            {progress.days.includes(today)
                              ? "¡Objetivo de hoy completado!"
                              : "Un ratito para ti"}
                          </strong>
                          <p>
                            {progress.days.includes(today)
                              ? "Cada pequeño paso cuenta. Sigue así."
                              : "Tu objetivo diario: una lección de 3 minutos."}
                          </p>
                        </div>
                        <span className="goal-count">
                          {progress.days.includes(today) ? "1" : "0"}
                          <small>/ 1</small>
                        </span>
                      </section>
                      <div className="section-heading">
                        <div>
                          <p className="eyebrow">PASO A PASO</p>
                          <h2>Tu camino</h2>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => go("learn")}
                        >
                          Ver todo
                          <ArrowRight size={16} />
                        </button>
                      </div>
                      <div className="path-list">
                        {nearbyLessons.map((lesson) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            completed={progress.completed}
                            onStart={start}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="home-secondary">
                      <section className="word-of-day">
                        <div className="section-heading">
                          <span className="eyebrow">UNA PALABRA PARA HOY</span>
                          <span className="sun-symbol" aria-hidden="true">
                            ✳
                          </span>
                        </div>
                        <span className="word-language">ҚАЗАҚША · KAZAJO</span>
                        <strong lang="kk">Рахмет</strong>
                        <span className="word-latin">Raqmet</span>
                        <div className="word-meaning">
                          <span>Gracias</span>
                          <AudioButton word={lessons[0].words[1]} />
                        </div>
                        <p>
                          Las grandes conexiones empiezan
                          <br />
                          con palabras pequeñas.
                        </p>
                      </section>
                      <button
                        className="alphabet-banner"
                        onClick={() => setAlphabet(true)}
                      >
                        <span className="alphabet-glyph" lang="kk">
                          Ә
                        </span>
                        <span>
                          <span className="eyebrow">DESCUBRE EL IDIOMA</span>
                          <strong>Un alfabeto diferente</strong>
                          <small>Tu primera mirada al kazajo</small>
                        </span>
                        <ArrowRight size={19} />
                      </button>
                      <div className="gentle-note">
                        <span className="note-line" />
                        <span>Sin prisa. A tu ritmo.</span>
                        <span className="note-line" />
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {tab === "learn" && (
                <LearnView
                  completed={progress.completed}
                  nextLesson={nextLesson}
                  onStart={start}
                  onAlphabet={() => setAlphabet(true)}
                />
              )}
              {tab === "practice" && (
                <PracticeView
                  completed={progress.completed}
                  onStart={start}
                  onLearn={() => go("learn")}
                />
              )}
              {tab === "progress" && (
                <section className="screen">
                  <PageHeading
                    eyebrow="TODO EMPIEZA CON UN PASO"
                    title="Mira cuánto"
                    accent="has avanzado."
                    description="Este es tu camino. Cada vez que vuelves, cuenta."
                  />
                  <div className="stats-grid">
                    <div className="stat-card peach">
                      <Flame size={22} />
                      <strong>{streak}</strong>
                      <span>
                        {streak === 1 ? "día de racha" : "días de racha"}
                      </span>
                    </div>
                    <div className="stat-card sage">
                      <BookOpen size={22} />
                      <strong>{progress.completed.length}</strong>
                      <span>lecciones completadas</span>
                    </div>
                    <div className="stat-card butter">
                      <Sparkles size={22} />
                      <strong>
                        {progress.completed.reduce(
                          (sum, id) =>
                            sum +
                            lessons.find((l) => l.id === id)!.words.length,
                          0,
                        )}
                      </strong>
                      <span>palabras aprendidas</span>
                    </div>
                  </div>
                  <section className="week-card">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">TU CONSTANCIA</p>
                        <h2>Esta semana</h2>
                      </div>
                      <span className="week-total">
                        {
                          weekDates().filter((d) => progress.days.includes(d))
                            .length
                        }{" "}
                        / 7 días
                      </span>
                    </div>
                    <div className="week-days">
                      {weekDates().map((day, i) => (
                        <div
                          key={day}
                          className={`week-day ${day === today ? "today" : ""}`}
                        >
                          <span>{["L", "M", "X", "J", "V", "S", "D"][i]}</span>
                          <div
                            className={
                              progress.days.includes(day) ? "filled" : ""
                            }
                            aria-label={`${day}${progress.days.includes(day) ? ": objetivo completado" : ": sin actividad"}`}
                          >
                            {progress.days.includes(day) ? (
                              <Check size={21} />
                            ) : (
                              <span />
                            )}
                          </div>
                          <small>{day === today ? "Hoy" : "\u00a0"}</small>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="milestone">
                    <div className="milestone-icon">
                      <Trophy size={27} />
                    </div>
                    <div>
                      <span className="eyebrow">
                        {streak >= 7 ? "HITO CONSEGUIDO" : "TU PRÓXIMO HITO"}
                      </span>
                      <h3>Siete días, un nuevo hábito</h3>
                      <p>
                        {streak >= 7
                          ? "¡Has conseguido una semana de constancia!"
                          : `Practica ${7 - streak} ${7 - streak === 1 ? "día más" : "días más"} seguidos para conseguirlo.`}
                      </p>
                    </div>
                  </section>
                  <button
                    className="primary-button"
                    onClick={() => start(nextLesson.id)}
                  >
                    Dar mi siguiente paso
                    <ArrowRight size={19} />
                  </button>
                  <p className="footnote">
                    Tu progreso se guarda en este navegador.
                  </p>
                </section>
              )}
            </>
          )}
        </main>
        {!activeSession && (
          <nav className="bottom-nav" aria-label="Navegación principal">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button
                className={tab === id ? "active" : ""}
                key={id}
                onClick={() => go(id)}
                aria-current={tab === id ? "page" : undefined}
              >
                <span className="nav-icon">
                  <Icon size={21} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
      {alphabet && <AlphabetDialog onClose={() => setAlphabet(false)} />}
    </div>
  );
}
function PageHeading({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>
        {title}
        <br />
        <em>{accent}</em>
      </h1>
      <p>{description}</p>
    </div>
  );
}
function UnitPicker({
  value,
  onChange,
  availableUnits = units,
  label = "Explorar por tema",
}: {
  value: number;
  onChange: (id: number) => void;
  availableUnits?: typeof units;
  label?: string;
}) {
  return (
    <label className="unit-picker">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {availableUnits.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {lessonNumber(unit.id)} · {unit.title}
          </option>
        ))}
      </select>
    </label>
  );
}

function LearnView({
  completed,
  nextLesson,
  onStart,
  onAlphabet,
}: {
  completed: number[];
  nextLesson: Lesson;
  onStart: (id: number) => void;
  onAlphabet: () => void;
}) {
  const [unitId, setUnitId] = useState(nextLesson.unitId);
  const unit = units.find((item) => item.id === unitId)!;
  const unitLessons = lessons.filter((lesson) => lesson.unitId === unitId);
  const finished = unitLessons.filter((lesson) =>
    completed.includes(lesson.id),
  ).length;
  return (
    <section className="screen">
      <PageHeading
        eyebrow="TU RUTA DE APRENDIZAJE"
        title="Pequeños pasos."
        accent="Grandes comienzos."
        description={`${lessons.length} lecciones, ${units.length} temas y ${lessons.reduce((count, lesson) => count + lesson.words.length, 0)} preguntas. Aprende a tu ritmo.`}
      />
      <div className="course-summary">
        <div>
          <span className="eyebrow">TU RECORRIDO COMPLETO</span>
          <h2>Del primer hola a tu día a día</h2>
        </div>
        <span>
          {completed.length} / {lessons.length}
        </span>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Lecciones completadas"
          aria-valuemin={0}
          aria-valuemax={lessons.length}
          aria-valuenow={completed.length}
        >
          <span
            style={{ width: `${(completed.length / lessons.length) * 100}%` }}
          />
        </div>
      </div>
      <UnitPicker value={unitId} onChange={setUnitId} />
      {unitId !== nextLesson.unitId && (
        <button
          className="text-button"
          onClick={() => setUnitId(nextLesson.unitId)}
        >
          Ver mi siguiente paso
          <ArrowRight size={17} />
        </button>
      )}
      <div className="section-heading unit-heading">
        <div>
          <p className="eyebrow">UNIDAD {lessonNumber(unit.id)}</p>
          <h2>{unit.title}</h2>
        </div>
        <span className="count-badge" role="status">
          {finished} / {unitLessons.length}
        </span>
      </div>
      <div className="course-list">
        {unitLessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            completed={completed}
            onStart={onStart}
            expanded
          />
        ))}
      </div>
      <button className="alphabet-banner" onClick={onAlphabet}>
        <span className="alphabet-glyph" lang="kk">
          Ә
        </span>
        <span>
          <span className="eyebrow">ANTES DE EMPEZAR</span>
          <strong>Conoce el alfabeto</strong>
          <small>Las letras que hacen único al kazajo</small>
        </span>
        <ArrowRight size={20} />
      </button>
      <p className="footnote">
        Completa una lección para desbloquear el siguiente paso.
        <br />
        Puedes explorar todos los temas y repetir las lecciones completadas.
      </p>
    </section>
  );
}

function LessonRow({
  lesson,
  completed,
  onStart,
  expanded = false,
}: {
  lesson: Lesson;
  completed: number[];
  onStart: (id: number) => void;
  expanded?: boolean;
}) {
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const done = completed.includes(lesson.id),
    locked = index > 0 && !completed.includes(lessons[index - 1].id);
  return (
    <button
      className={`path-item ${done ? "completed" : locked ? "locked" : "current"} ${expanded ? "expanded" : ""}`}
      disabled={locked}
      onClick={() => onStart(lesson.id)}
    >
      <span className={`path-icon ${lesson.color}`}>
        {done ? (
          <Check size={21} />
        ) : locked ? (
          <LockKeyhole size={19} />
        ) : (
          <span lang="kk">{lesson.glyph}</span>
        )}
      </span>
      <span className="path-copy">
        <span className="path-label">
          LECCIÓN {lessonNumber(lesson.id)}
          {done ? " · COMPLETADA" : !locked ? " · A TU ALCANCE" : ""}
        </span>
        <strong>{lesson.title}</strong>
        {expanded && (
          <span className="path-description">{lesson.description}</span>
        )}
        <small>
          {locked
            ? `Completa la lección ${lessonNumber(lessons[index - 1].id)}`
            : done
              ? "Volver a practicar"
              : "3 min · 3 palabras"}
        </small>
      </span>
      <span className="path-end">
        {locked ? <LockKeyhole size={15} /> : <ChevronRight size={19} />}
      </span>
    </button>
  );
}
function AudioButton({ word }: { word: Word }) {
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );
  const play = () => {
    if (!("speechSynthesis" in window)) {
      setMessage(
        "Este navegador no admite audio de voz. Puedes usar la transliteración.",
      );
      return;
    }
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => /^kk(?:[-_]|$)/i.test(v.lang));
    if (!voice) {
      setMessage(
        "No hay una voz de kazajo instalada en tu dispositivo. Usa la transliteración como apoyo.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.kazakh);
    utterance.voice = voice;
    utterance.lang = "kk-KZ";
    utterance.rate = 0.8;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      setMessage("No se pudo reproducir el audio. Inténtalo de nuevo.");
    };
    setMessage("");
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };
  return (
    <span className="audio-control">
      <button
        className={`sound-button ${playing ? "playing" : ""}`}
        onClick={play}
        aria-label={`Escuchar ${word.kazakh}`}
      >
        <Volume2 size={20} />
      </button>
      {message && (
        <span className="audio-message" role="status">
          {message}
          <button
            onClick={() => setMessage("")}
            aria-label="Cerrar aviso de audio"
          >
            <X size={15} />
          </button>
        </span>
      )}
    </span>
  );
}
function PracticeView({
  completed,
  onStart,
  onLearn,
}: {
  completed: number[];
  onStart: (id: number, practice: boolean) => void;
  onLearn: () => void;
}) {
  const [query, setQuery] = useState("");
  const available = lessons.filter((l) => completed.includes(l.id));
  const availableUnits = units.filter((unit) =>
    available.some((lesson) => lesson.unitId === unit.id),
  );
  const [reviewUnitId, setReviewUnitId] = useState(availableUnits[0]?.id || 1);
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const words = available
    .flatMap((l) => l.words)
    .filter((w) =>
      normalize(`${w.kazakh} ${w.latin} ${w.spanish}`).includes(
        normalize(query),
      ),
    );
  return (
    <section className="screen">
      <PageHeading
        eyebrow="HAZLAS TUYAS"
        title="Palabras que"
        accent="se quedan contigo."
        description="Vuelve a lo aprendido. Recordar también es avanzar."
      />
      {available.length ? (
        <>
          <div className="practice-banner">
            <Layers3 size={27} />
            <div>
              <h2>Un repaso rápido</h2>
              <p>Tres preguntas para refrescar la memoria.</p>
            </div>
          </div>
          {availableUnits.length > 1 && (
            <UnitPicker
              value={reviewUnitId}
              onChange={setReviewUnitId}
              availableUnits={availableUnits}
              label="Tema para repasar"
            />
          )}
          <div className="practice-options">
            {available
              .filter((lesson) => lesson.unitId === reviewUnitId)
              .map((l) => (
                <button
                  className="review-button"
                  key={l.id}
                  onClick={() => onStart(l.id, true)}
                >
                  <RotateCcw size={17} />
                  {l.title}
                  <ArrowRight size={17} />
                </button>
              ))}
          </div>
          <div className="section-heading">
            <h2>Tu vocabulario</h2>
            <span className="count-badge">
              {available.reduce(
                (count, lesson) => count + lesson.words.length,
                0,
              )}{" "}
              entradas
            </span>
          </div>
          <label className="search-field">
            <Search size={19} />
            <input
              type="search"
              placeholder="Busca en español o kazajo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar en tu vocabulario"
            />
          </label>
          <div className="vocabulary-list">
            {words.map((w) => (
              <article className="vocabulary-word" key={w.kazakh}>
                <div>
                  <strong lang="kk">{w.kazakh}</strong>
                  <span>{w.latin}</span>
                </div>
                <p>{w.spanish}</p>
                <AudioButton word={w} />
              </article>
            ))}
          </div>
          {!words.length && (
            <p className="footnote" role="status">
              No hay palabras que coincidan con «{query}».
            </p>
          )}
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-illustration" lang="kk">
            Ә<span>а</span>
          </span>
          <h2>Tu colección empieza con un hola.</h2>
          <p>
            Completa tu primera lección y encontrarás aquí tus palabras para
            repasarlas.
          </p>
          <button className="primary-button" onClick={onLearn}>
            Descubrir mi primera lección
            <ArrowRight size={19} />
          </button>
        </div>
      )}
    </section>
  );
}
function LessonView({
  session,
  onStep,
  onClose,
  onFinish,
}: {
  session: Session;
  onStep: (step: number) => void;
  onClose: () => void;
  onFinish: () => void;
}) {
  const lesson = lessons.find((l) => l.id === session.lessonId)!;
  const quiz = session.step >= lesson.words.length;
  const wordIndex = session.step % lesson.words.length;
  const word = lesson.words[wordIndex];
  const [selected, setSelected] = useState<string | null>(null);
  const [hadError, setHadError] = useState(false);
  const correct = selected === word.spanish;
  const total = session.practice ? 3 : 6;
  const current = session.practice ? session.step - 3 : session.step;
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setSelected(null);
    setHadError(false);
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [session.step]);
  const next = () => {
    if (quiz && !correct) return;
    if (session.step === 5) onFinish();
    else onStep(session.step + 1);
  };
  const choices = useMemo(() => {
    const options = [...lesson.words];
    for (let index = options.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [options[index], options[other]] = [options[other], options[index]];
    }
    return options;
  }, [lesson, wordIndex]);
  return (
    <section className="lesson-screen">
      <div className="lesson-top">
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Salir y guardar la lección"
        >
          <X size={23} />
        </button>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Progreso de la lección"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current}
        >
          <span style={{ width: `${(current / total) * 100}%` }} />
        </div>
        <span>
          {current + 1} <small>/ {total}</small>
        </span>
      </div>
      <div className="lesson-heading">
        <p className="eyebrow">
          {session.practice ? "REPASO" : lesson.title} ·{" "}
          {quiz ? "PONTE A PRUEBA" : "DESCUBRE"}
        </p>
        <h1 ref={titleRef} tabIndex={-1}>
          {quiz
            ? "¿Qué significa?"
            : [
                "Todo empieza con una palabra.",
                "Otra palabra, otra conexión.",
                "Un pequeño paso más.",
              ][wordIndex]}
        </h1>
        <p>
          {quiz
            ? "Elige la traducción correcta."
            : "Lee, repite y tómate tu tiempo."}
        </p>
      </div>
      <div
        className={`word-card ${quiz ? "quiz-card" : ""} ${word.kazakh.length > 10 ? "long-word" : ""}`}
      >
        <span className="word-language">ҚАЗАҚША · KAZAJO</span>
        <strong lang="kk">{word.kazakh}</strong>
        <span className="word-latin">{word.latin}</span>
        {!quiz && <span className="translation">{word.spanish}</span>}
        <AudioButton key={word.kazakh} word={word} />
      </div>
      {!quiz ? (
        <div className="learning-note">
          <Sparkles size={20} />
          <p>{word.note}</p>
        </div>
      ) : (
        <div className="answers">
          {choices.map((choice, i) => (
            <button
              key={choice.spanish}
              disabled={correct}
              className={`answer ${selected === choice.spanish ? (correct ? "correct" : "wrong") : ""}`}
              onClick={() => {
                setSelected(choice.spanish);
                if (choice.spanish !== word.spanish) setHadError(true);
              }}
            >
              <span className="answer-number">{i + 1}</span>
              {choice.spanish}
              {selected === choice.spanish &&
                (correct ? <Check size={21} /> : <X size={21} />)}
            </button>
          ))}
          <div
            className={`feedback ${selected && !correct ? "wrong-feedback" : ""}`}
            role="status"
          >
            {selected ? (
              correct ? (
                <>
                  <Check size={18} />
                  {hadError
                    ? "¡Eso es! Practicando se aprende."
                    : "¡Exacto! Vas por buen camino."}
                </>
              ) : (
                <>
                  <RotateCcw size={18} />
                  Todavía no. Prueba otra opción.
                </>
              )
            ) : (
              "Sin prisa. Aquí se aprende practicando."
            )}
          </div>
        </div>
      )}
      <div className="lesson-action">
        <button
          className="primary-button"
          disabled={quiz && !correct}
          onClick={next}
        >
          {session.step === 5
            ? "Completar lección"
            : session.step === 2
              ? "Vamos a practicar"
              : "Continuar"}
          <ArrowRight size={20} />
        </button>
        {!quiz && <p>Después practicarás estas tres palabras.</p>}
      </div>
    </section>
  );
}
function AlphabetDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="alphabet-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="alphabet-title"
    >
      <div className="dialog-content">
        <div className="dialog-top">
          <span className="eyebrow">UNA PRIMERA MIRADA</span>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Cerrar alfabeto"
          >
            <X size={22} />
          </button>
        </div>
        <span className="dialog-glyph" lang="kk">
          Ә ә
        </span>
        <h2 id="alphabet-title">
          Un alfabeto,
          <br />
          <em>nuevos sonidos.</em>
        </h2>
        <p>
          En estas lecciones usamos el alfabeto cirílico kazajo. Debajo de cada
          palabra encontrarás una transliteración en letras latinas para
          ayudarte a leer.
        </p>
        <div className="alphabet-grid">
          {["Ә ә", "Ғ ғ", "Қ қ", "Ң ң", "Ө ө", "Ұ ұ", "Ү ү", "Һ һ", "І і"].map(
            (letter) => (
              <span key={letter} lang="kk">
                {letter}
              </span>
            ),
          )}
        </div>
        <p>
          Estas nueve letras son características del kazajo frente al alfabeto
          ruso. No hace falta memorizarlas ahora: las irás reconociendo palabra
          a palabra.
        </p>
        <div className="alphabet-example">
          <span lang="kk">Сәлем</span>
          <ArrowRight size={18} />
          <span>Sälem</span>
          <span>Hola</span>
        </div>
        <button className="primary-button" onClick={onClose}>
          Entendido, paso a paso
          <Check size={19} />
        </button>
      </div>
    </dialog>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
export default App;
