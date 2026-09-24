import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BookOpen, Check, ChevronRight, Flame, Headphones, Home, LockKeyhole, Play, RotateCcw, Sparkles, Trophy, Volume2 } from 'lucide-react'
import './styles.css'

type Tab = 'home' | 'learn' | 'progress'
type Lesson = { id: number; title: string; subtitle: string; duration: string; status: 'done' | 'current' | 'locked'; color: string }

type Word = { kazakh: string; latin: string; spanish: string; hint: string }

const lessons: Lesson[] = [
  { id: 1, title: 'Saludos esenciales', subtitle: 'Сәлеметсіз бе · Рахмет', duration: '5 min', status: 'current', color: 'coral' },
  { id: 2, title: 'Presentarte', subtitle: 'Менің атым · Кездескенше', duration: '7 min', status: 'locked', color: 'blue' },
  { id: 3, title: 'Los números', subtitle: 'Бір · Екі · Үш', duration: '6 min', status: 'locked', color: 'mustard' },
]

const words: Word[] = [
  { kazakh: 'Сәлем', latin: 'Sälem', spanish: 'Hola', hint: 'Suena como: “sa-lem”' },
  { kazakh: 'Рахмет', latin: 'Raqmet', spanish: 'Gracias', hint: 'Suena como: “raj-met”' },
  { kazakh: 'Иә', latin: 'Iä', spanish: 'Sí', hint: 'Una afirmación corta' },
]

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('qadam-streak') || 4))
  const [completed, setCompleted] = useState(() => Number(localStorage.getItem('qadam-completed') || 3))
  const [lessonOpen, setLessonOpen] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [quizDone, setQuizDone] = useState(false)

  useEffect(() => {
    localStorage.setItem('qadam-streak', String(streak))
    localStorage.setItem('qadam-completed', String(completed))
  }, [streak, completed])

  const currentWord = words[wordIndex]
  const chooseAnswer = (answer: string) => {
    setSelected(answer)
    if (answer === 'Hola') setQuizDone(true)
  }
  const finishLesson = () => {
    setCompleted((value) => Math.max(value, 4))
    setStreak((value) => Math.max(value, 5))
    setLessonOpen(false)
    setTab('progress')
  }

  return (
    <main className="app-shell">
      <div className="app-frame">
        <header className="topbar">
          <div className="brand-mark"><span>Q</span><div><strong>qadam</strong><small>paso a paso</small></div></div>
          <button className="streak-pill" onClick={() => setTab('progress')} aria-label="Ver tu racha"><Flame size={17} fill="currentColor" /> {streak}<span>días</span></button>
        </header>

        {!lessonOpen && tab === 'home' && <HomeView completed={completed} onStart={() => setLessonOpen(true)} onLearn={() => setTab('learn')} />}
        {!lessonOpen && tab === 'learn' && <LearnView onStart={() => setLessonOpen(true)} />}
        {!lessonOpen && tab === 'progress' && <ProgressView completed={completed} streak={streak} />}
        {lessonOpen && <LessonView word={currentWord} index={wordIndex} selected={selected} quizDone={quizDone} onSelect={chooseAnswer} onNext={() => { setWordIndex((wordIndex + 1) % words.length); setSelected(null); setQuizDone(false) }} onFinish={finishLesson} onClose={() => setLessonOpen(false)} />}

        {!lessonOpen && <nav className="bottom-nav" aria-label="Navegación principal">
          <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><Home size={20} /><span>Inicio</span></button>
          <button className={tab === 'learn' ? 'active' : ''} onClick={() => setTab('learn')}><BookOpen size={20} /><span>Aprender</span></button>
          <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}><Trophy size={20} /><span>Progreso</span></button>
        </nav>}
      </div>
    </main>
  )
}

function HomeView({ completed, onStart, onLearn }: { completed: number; onStart: () => void; onLearn: () => void }) {
  return <section className="screen home-screen">
    <div className="welcome reveal"><p className="eyebrow">Martes, 24 de septiembre</p><h1>Tu próximo paso<br /><em>empieza aquí.</em></h1><p className="intro">Un poco de kazajo cada día. Sin prisa, sin ruido.</p></div>
    <section className="hero-lesson reveal delay-1"><div className="hero-orbit">ә</div><div className="lesson-kicker"><span className="lesson-dot" /> LECCIÓN 01</div><h2>Saludos<br />esenciales</h2><p>Aprende tus primeras tres palabras y empieza a conversar.</p><div className="lesson-meta"><span><Headphones size={15} /> 5 min</span><span><Sparkles size={15} /> Principiante</span></div><button className="primary-button" onClick={onStart}>Empezar lección <ChevronRight size={18} /></button></section>
    <section className="daily-row reveal delay-2"><div><span className="mini-label">TU RITMO</span><strong><Flame size={16} fill="currentColor" /> 4 días seguidos</strong></div><div className="mini-progress"><div className="progress-track"><span style={{ width: '57%' }} /></div><small>3 de 7 esta semana</small></div></section>
    <section className="section-heading reveal delay-3"><div><span className="mini-label">TU CAMINO</span><h3>Primeros pasos</h3></div><button className="text-button" onClick={onLearn}>Ver todo <ChevronRight size={16} /></button></section>
    <div className="path-list reveal delay-3">{lessons.map((lesson, i) => <div className={`path-item ${lesson.status}`} key={lesson.id}><div className={`path-icon ${lesson.color}`}>{lesson.status === 'done' ? <Check size={17} /> : lesson.status === 'locked' ? <LockKeyhole size={16} /> : <span>0{i + 1}</span>}</div><div className="path-copy"><strong>{lesson.title}</strong><small>{lesson.subtitle}</small></div><span className="path-duration">{lesson.duration}</span></div>)}</div>
    <p className="quote reveal delay-3">“La paciencia es la llave del conocimiento.”<span>— Proverbio kazajo</span></p>
  </section>
}

function LearnView({ onStart }: { onStart: () => void }) {
  return <section className="screen"><div className="page-heading"><p className="eyebrow">Tu biblioteca</p><h1>Aprender</h1><p>Pequeñas lecciones. Grandes conversaciones.</p></div><div className="filter-row"><button className="filter active">Todo</button><button className="filter">Vocabulario</button><button className="filter">Cultura</button></div><section className="lesson-grid">{lessons.map((lesson, i) => <article className={`lesson-card ${lesson.status}`} key={lesson.id}><div className={`card-number ${lesson.color}`}>0{i + 1}</div><div><span className="card-status">{lesson.status === 'current' ? 'SIGUIENTE' : lesson.status === 'locked' ? 'PRÓXIMAMENTE' : 'COMPLETADA'}</span><h3>{lesson.title}</h3><p>{lesson.subtitle}</p><button className="small-button" disabled={lesson.status === 'locked'} onClick={lesson.status === 'current' ? onStart : undefined}>{lesson.status === 'locked' ? <LockKeyhole size={14} /> : <Play size={14} fill="currentColor" />} {lesson.status === 'locked' ? 'Bloqueada' : 'Continuar'}</button></div></article>)}</section><div className="alphabet-banner"><span className="alphabet-glyph">Қ</span><div><span className="mini-label">EXTRA DE HOY</span><strong>Conoce el alfabeto kazajo</strong><small>42 letras · 3 min de lectura</small></div><ChevronRight size={19} /></div></section>
}

function ProgressView({ completed, streak }: { completed: number; streak: number }) {
  return <section className="screen"><div className="page-heading"><p className="eyebrow">Tu viaje</p><h1>Progreso</h1><p>Cada palabra cuenta. Mira cuánto has avanzado.</p></div><div className="stats-grid"><div className="stat-card warm"><Flame size={19} /><strong>{streak}</strong><span>días seguidos</span></div><div className="stat-card cool"><Check size={19} /><strong>{completed}</strong><span>lecciones hechas</span></div><div className="stat-card yellow"><Sparkles size={19} /><strong>18</strong><span>palabras nuevas</span></div></div><section className="week-card"><div className="section-heading"><div><span className="mini-label">ESTA SEMANA</span><h3>Tu constancia</h3></div><span className="week-total">3 / 7</span></div><div className="week-bars">{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => <div className="day-bar" key={day}><div className={index < 3 ? 'bar filled' : 'bar'} style={{ height: `${index < 3 ? [64, 88, 48][index] : 16}px` }} /> <span>{day}</span></div>)}</div></section><div className="milestone"><div className="milestone-icon"><Trophy size={22} /></div><div><span className="mini-label">PRÓXIMO HITO</span><strong>Racha de 7 días</strong><p>Te faltan 2 días para conseguirlo.</p></div><div className="tiny-ring">71%</div></div></section>
}

function LessonView({ word, index, selected, quizDone, onSelect, onNext, onFinish, onClose }: { word: Word; index: number; selected: string | null; quizDone: boolean; onSelect: (value: string) => void; onNext: () => void; onFinish: () => void; onClose: () => void }) {
  const isLast = index === words.length - 1
  const playWord = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word.latin)
      utterance.lang = 'kk-KZ'
      utterance.rate = 0.78
      window.speechSynthesis.speak(utterance)
    }
  }
  return <section className="lesson-screen"><div className="lesson-top"><button className="icon-button" onClick={onClose} aria-label="Cerrar lección"><RotateCcw size={18} /></button><div className="lesson-progress"><span style={{ width: `${((index + 1) / words.length) * 100}%` }} /></div><span className="step-count">{index + 1}/{words.length}</span></div><div className="lesson-content"><p className="eyebrow">PALABRA {String(index + 1).padStart(2, '0')}</p><h1>Di hola en<br /><em>kazajo.</em></h1><p className="lesson-instruction">Escucha, repite y descubre una palabra nueva.</p><div className="word-card"><div className="word-top"><span className="sound-label">PRONUNCIACIÓN</span><button className="sound-button" onClick={playWord} aria-label="Escuchar pronunciación"><Volume2 size={20} /></button></div><strong>{word.kazakh}</strong><span className="latin">{word.latin}</span><span className="translation">{word.spanish}</span><div className="wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><small>{word.hint}</small></div><div className="question-block"><span className="mini-label">COMPRUEBA LO QUE APRENDISTE</span><h2>¿Qué significa <b>{word.kazakh}</b>?</h2><div className="answers"><button className={selected === 'Hola' ? 'answer correct' : 'answer'} onClick={() => onSelect('Hola')}>Hola {selected === 'Hola' && <Check size={17} />}</button><button className={selected === 'Adiós' ? 'answer wrong' : 'answer'} onClick={() => onSelect('Adiós')}>Adiós {selected === 'Adiós' && <span>×</span>}</button><button className="answer" onClick={() => onSelect('Por favor')}>Por favor</button></div>{selected === 'Adiós' && <p className="feedback wrong-text">Casi. Escucha una vez más y prueba otra opción.</p>}{quizDone && <p className="feedback">¡Muy bien! Ya tienes tu primer saludo.</p>}</div></div><button className="bottom-action" disabled={!quizDone} onClick={isLast ? onFinish : onNext}>{isLast ? 'Terminar lección' : 'Siguiente palabra'} <ChevronRight size={19} /></button></section>
}

createRoot(document.getElementById('root')!).render(<App />)

export default App
