import React, { useState, useEffect, useMemo } from 'react';
import { Award, ChevronRight, Users, Music, Star, MapPin, Coffee, BookOpen } from 'lucide-react';

// --- Types & Interfaces ---

enum Screen {
  START,
  INTRO,
  PREP,
  QUIZ,
  RANKING
}

enum Category {
  GEOGRAPHY = 'Géographie',
  CULTURE = 'Culture & Tradition',
  ARCHITECTURE = 'Architecture',
  FOOD = 'Gastronomie',
  HISTORY = 'Histoire',
  PEOPLE = 'Célébrités',
  GENERAL = 'Général',
  NATURE = 'Nature'
}

interface Question {
  id: number;
  category: Category;
  text: string;
  options?: string[]; // If undefined, it's an open question
  correctIndices?: number[]; // Indices of correct options
  correctText?: string; // For open questions
  imageUrl?: string;
  imageShowTiming?: 'question' | 'answer';
  explanation?: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

// --- Data ---

const INITIAL_PLAYERS = ["Romain", "Alice", "Quentin", "Luc", "Charlotte", "Pablo", "Isabelle"];

// LOCAL IMAGES CONFIGURATION
const IMAGES = {
  q1_answer: "./images/respuesta_pregunta_1.jpg",
  q2_question: "./images/pregunta_2.jpg",
  q3_answer: "./images/respuesta_pregunta_3.jpg",
  q5_answer: "./images/respuesta_pregunta_5.jpg",
  q6_question: "./images/pregunta_6.jpg",
  q7_answer: "./images/respuesta_pregunta_7.jpg",
  q9_answer: "./images/respuesta_pregunta_9.jpg",
  q13_answer: "./images/respuesta_pregunta_13.jpg",
  q15_answer: "./images/respuesta_pregunta_15.jpg",
  q16_answer: "./images/respuesta_pregunta_16.jpg",
  q19_question: "./images/pregunta_19.jpg",
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: Category.GEOGRAPHY,
    text: "Combien d’îles trouve-t-on à HK ?",
    options: ["12", "65", "123", "261"],
    correctIndices: [3],
    imageUrl: IMAGES.q1_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 2,
    category: Category.ARCHITECTURE,
    text: "Pourquoi certains gratte-ciels de Hong Kong ont-ils un énorme trou vide en plein milieu du bâtiment ?",
    options: ["Pour les séismes", "Pour les dragons", "Pour Xi Jin Ping", "Pour le fromage, en hommage au gruyère"],
    correctIndices: [1],
    imageUrl: IMAGES.q2_question,
    imageShowTiming: 'question'
  },
  {
    id: 3,
    category: Category.ARCHITECTURE,
    text: "Sachant que HK détient le record du plus grand nombre de gratte-ciel au monde, combien y a-t-il de bâtiment qui dépasse 150 mètres d’hauteur ?",
    options: ["Environ 350", "Environ 7 000", "Environ 12 000", "Environ 28 000"],
    correctIndices: [1],
    imageUrl: IMAGES.q3_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 4,
    category: Category.CULTURE,
    text: "Quel chiffre est souvent absent des boutons d'ascenseurs dans les immeubles de Hong Kong ?",
    correctText: "4",
  },
  {
    id: 5,
    category: Category.ARCHITECTURE,
    text: "Quel matériau est utilisé pour construire les échafaudages des gratte-ciels les plus hauts de la ville ?",
    options: ["Acier", "Bambou", "Bois", "Fibre de carbone"],
    correctIndices: [1],
    imageUrl: IMAGES.q5_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 6,
    category: Category.FOOD,
    text: "Que signifie littéralement le terme 'Dim Sum' (les célèbres petits paniers vapeur) ?",
    options: ["Rompre le jeûne", "Toucher le cœur", "Partager en famille", "Ravioli fourré"],
    correctIndices: [1],
    imageUrl: IMAGES.q6_question,
    imageShowTiming: 'question'
  },
  {
    id: 7,
    category: Category.ARCHITECTURE,
    text: "L’escalator le plus long du monde se trouve dans le quartier « Central », combien mesure-t-il ?",
    options: ["300m", "800m", "1500m", "5000m"],
    correctIndices: [1],
    imageUrl: IMAGES.q7_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 8,
    category: Category.GENERAL,
    text: "Hong Kong détient le record du monde du plus grand nombre de voitures d'une marque de luxe spécifique par habitant. Laquelle?",
    options: ["Ferrari", "Bentley", "Lamborghini", "Rolls Royce"],
    correctIndices: [3]
  },
  {
    id: 9,
    category: Category.CULTURE,
    text: "Pouvez-vous estimer à 2 m près, la taille du Boudha (assis) en bronze de l’île de Lantau, qui est le 2ème plus grand du monde.",
    correctText: "34m",
    imageUrl: IMAGES.q9_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 10,
    category: Category.HISTORY,
    text: "À son origine HK était…",
    options: ["Une prison", "Un port de pirates", "Des montagnes sacrés interdites", "Un terrain de chasse du Commonwealth"],
    correctIndices: [1]
  },
  {
    id: 11,
    category: Category.HISTORY,
    text: "Que signifie Hong Kong?",
    options: ["Port parfumé", "Iles aux pirates", "Tanière du dragon", "Le cousin de Donkey Kong"],
    correctIndices: [0]
  },
  {
    id: 12,
    category: Category.HISTORY,
    text: "Dans quel année HK va réintégrer le régime de la RPC ?",
    correctText: "2047"
  },
  {
    id: 13,
    category: Category.NATURE,
    text: "De quelle couleur sont les dauphins sauvages que l'on peut apercevoir au large de Tai O, à l’île de Lantau?",
    correctText: "ROSE",
    imageUrl: IMAGES.q13_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 14,
    category: Category.CULTURE,
    text: "Pour proteger le feng shui de leur habitation, qu’utilisent les voisins de l’immeuble qui porte malheur ?",
    options: ["Poisson pourri", "Encens", "Pierres de jade", "Mirroirs"],
    correctIndices: [3]
  },
  {
    id: 15,
    category: Category.NATURE,
    text: "Quelle fleur symbolise la ville ?",
    options: ["Bauhinia", "Rose", "Oiseau de paradis", "Hibiscus"],
    correctIndices: [0],
    imageUrl: IMAGES.q15_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 16,
    category: Category.PEOPLE,
    text: "Lequel de ces acteurs est né à HK ?",
    options: ["Jackie Chan", "Hu Jun", "Jet Li", "Bruce Lee"],
    correctIndices: [0],
    imageUrl: IMAGES.q16_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 17,
    category: Category.CULTURE,
    text: "HK est célèbre pour la pratique de la stégophilie. Mais qu’est-c que c’est la stégophilie ?",
    options: ["La plongée en apnée", "L’art de la toiture des temples", "Les concours de gros mangeurs", "L’escalade à mains nues et sans protection des toits des immeubles"],
    correctIndices: [3]
  },
  {
    id: 18,
    category: Category.GEOGRAPHY,
    text: "Comment s’appelle le point culminant à HK qui permet une vue splendide sur la ville ?",
    options: ["Victoria Peak", "Hanna Peak", "Elisabeth Peak", "Margaret Peak"],
    correctIndices: [0]
  },
  {
    id: 19,
    category: Category.CULTURE,
    text: "Dans les célèbres minibus rouges de Hong Kong, il n'y a souvent pas d'arrêts fixes. Comment fait-on pour descendre ?",
    options: ["Saisir l’opportunité d’un stop ou un feu rouge", "Appuyer sur le bouton de stop", "Crier sur le chauffeur", "Sauter par la fenêtre"],
    correctIndices: [2],
    imageUrl: IMAGES.q19_question,
    imageShowTiming: 'question'
  },
  {
    id: 20,
    category: Category.CULTURE,
    text: "Pourquoi est-il considéré comme impoli de laisser ses baguettes plantées verticalement dans son bol de riz ?",
    options: ["Le riz est un aliment sacré", "Parce que cela ressemble à des bâtons d'encens brûlés lors des funérailles", "Parce que cela signifie que vous avez encore faim.", "Parce que cela inviter les esprits et les fantômes à venir partager ton repas"],
    correctIndices: [1, 3] // B and D
  }
];

// --- Helper Components ---

const NeonButton: React.FC<{ onClick: () => void; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger'; className?: string }> = ({ onClick, children, variant = 'primary', className = '' }) => {
  const baseStyle = "px-8 py-3 rounded-sm font-serif font-bold tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 relative overflow-hidden group";
  
  const variants = {
    primary: "border-hk-neonBlue text-hk-neonBlue hover:bg-hk-neonBlue hover:text-black shadow-[0_0_15px_rgba(0,255,255,0.7)] bg-black/50",
    secondary: "border-hk-gold text-hk-gold hover:bg-hk-gold hover:text-black shadow-[0_0_15px_rgba(255,215,0,0.7)] bg-black/50",
    danger: "border-hk-red text-hk-red hover:bg-hk-red hover:text-white shadow-[0_0_15px_rgba(255,0,0,0.7)] bg-black/50"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
    </button>
  );
};

// Container with Chinese corners
const NeonCard: React.FC<{ children: React.ReactNode; className?: string; borderColor?: string }> = ({ children, className = '', borderColor = 'border-hk-gold' }) => {
  return (
    <div className={`chinese-border bg-black/60 backdrop-blur-md p-6 relative ${className}`}>
      {/* Decorative Corners */}
      <div className="chinese-corner top-left"></div>
      <div className="chinese-corner top-right"></div>
      <div className="chinese-corner bottom-left"></div>
      <div className="chinese-corner bottom-right"></div>
      {children}
    </div>
  );
};

// --- Sub-Screens ---

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-12 animate-fade-in px-4 relative">
    {/* Decorative vertical text (fictional aesthetic) */}
    <div className="absolute left-4 top-10 bottom-10 flex flex-col justify-center space-y-8 opacity-50 hidden md:flex">
      <div className="w-12 border-2 border-hk-red p-2 text-hk-red font-serif font-bold text-2xl shadow-[0_0_10px_red]">香<br/>港</div>
      <div className="w-12 border-2 border-hk-neonBlue p-2 text-hk-neonBlue font-serif font-bold text-2xl shadow-[0_0_10px_cyan]">夜<br/>晚</div>
    </div>
    <div className="absolute right-4 top-10 bottom-10 flex flex-col justify-center space-y-8 opacity-50 hidden md:flex">
      <div className="w-12 border-2 border-hk-neonGreen p-2 text-hk-neonGreen font-serif font-bold text-2xl shadow-[0_0_10px_lime]">友<br/>谊</div>
      <div className="w-12 border-2 border-hk-gold p-2 text-hk-gold font-serif font-bold text-2xl shadow-[0_0_10px_gold]">游<br/>戏</div>
    </div>

    <div className="relative z-10">
       <div className="absolute -inset-10 bg-hk-red rounded-full opacity-10 blur-3xl animate-pulse"></div>
       <NeonCard className="p-12">
          <h1 className="text-6xl md:text-8xl font-serif text-white mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            PREGUNTAS
          </h1>
          <div className="flex items-center justify-center space-x-4">
             <span className="h-1 w-12 bg-hk-gold shadow-[0_0_10px_gold]"></span>
             <h2 className="text-3xl md:text-5xl font-serif text-hk-gold italic neon-text-gold">EN AMIGUIS</h2>
             <span className="h-1 w-12 bg-hk-gold shadow-[0_0_10px_gold]"></span>
          </div>
          <div className="mt-8 border border-hk-neonBlue p-2 inline-block shadow-[0_0_10px_cyan]">
            <p className="text-hk-neonBlue tracking-[0.3em] font-bold text-sm md:text-lg uppercase">Hong Kong Edition</p>
          </div>
       </NeonCard>
    </div>
    
    <NeonButton onClick={onStart} variant="primary" className="text-2xl px-12 py-4 animate-bounce-slow">
      COMENZAR
    </NeonButton>
  </div>
);

const IntroScreen: React.FC<{ players: Player[], onNext: () => void }> = ({ players, onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full">
      <div className="bg-hk-red/10 p-4 w-full max-w-4xl border-y-4 border-hk-red mb-8 text-center">
        <h2 className="text-4xl md:text-5xl font-serif text-hk-white neon-text-red">
          LOS JUGADORES
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 w-full max-w-4xl">
        {players.map((p, idx) => (
          <div 
            key={p.id} 
            className="bg-black/70 border-2 border-hk-neonBlue p-6 rounded-none text-center transform transition-all hover:scale-105 hover:border-hk-neonPink hover:shadow-[0_0_20px_#FF1493] relative group"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white"></div>

            <div className="text-hk-neonPink mb-2 text-3xl font-serif drop-shadow-[0_0_5px_rgba(255,20,147,0.8)]">
              {p.name.charAt(0)}
            </div>
            <div className="text-white text-xl font-sans font-bold tracking-wide group-hover:text-hk-gold transition-colors">
              {p.name.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <NeonButton onClick={onNext} variant="secondary">
        SIGUIENTE <ChevronRight className="inline ml-2" size={20} />
      </NeonButton>
    </div>
  );
};

const PrepScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500); // Auto advance after animation
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black/95">
      <div className="border-4 border-hk-neonPink p-12 shadow-[0_0_50px_rgba(255,20,147,0.5)] bg-black">
        <h1 className="text-6xl md:text-9xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-hk-neonPink to-purple-500 animate-pulse text-center leading-tight">
          ¿LISTAS?
        </h1>
      </div>
      <div className="mt-12 flex space-x-4">
        <div className="w-4 h-4 bg-hk-gold rounded-full animate-bounce shadow-[0_0_10px_gold]" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 bg-hk-red rounded-full animate-bounce shadow-[0_0_10px_red]" style={{ animationDelay: '150ms' }}></div>
        <div className="w-4 h-4 bg-hk-neonBlue rounded-full animate-bounce shadow-[0_0_10px_cyan]" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

const RankingScreen: React.FC<{ players: Player[], onRestart: () => void }> = ({ players, onRestart }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 max-w-5xl mx-auto w-full">
      <div className="relative mb-12 animate-bounce-slow">
        <div className="absolute -inset-10 bg-hk-gold opacity-20 blur-3xl rounded-full"></div>
        <Award size={140} className="text-hk-gold drop-shadow-[0_0_25px_rgba(255,215,0,1)] relative z-10" />
        <div className="absolute inset-0 flex items-center justify-center pt-4 z-20">
           {/* Uses Q15 answer image which is the flower, or fallbacks if missing */}
           <img src={IMAGES.q15_answer} alt="HK Flower" className="w-16 h-16 flower-spin opacity-90 mix-blend-screen rounded-full border-2 border-white" />
        </div>
      </div>

      <h1 className="text-5xl font-serif text-white mb-2 tracking-[0.5em] text-center">GANADOR</h1>
      <h2 className="text-7xl md:text-8xl font-bold text-hk-red mb-12 neon-text-red text-center">{winner.name}</h2>
      
      <NeonCard className="w-full mb-8">
        <h3 className="text-3xl font-serif text-hk-gold mb-6 border-b-2 border-hk-gold pb-4 text-center tracking-widest">CLASIFICACIÓN</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedPlayers.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between p-4 border border-white/10 hover:bg-white/5 transition-colors bg-black/40">
              <div className="flex items-center space-x-6">
                <span className={`font-serif text-3xl font-bold w-12 text-right ${idx === 0 ? 'text-hk-gold drop-shadow-[0_0_8px_gold]' : 'text-gray-500'}`}>
                  #{idx + 1}
                </span>
                <span className={`text-2xl font-sans ${idx === 0 ? 'text-white font-bold' : 'text-gray-300'}`}>{p.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-hk-neonBlue drop-shadow-[0_0_5px_cyan]">{p.score}</span>
                <span className="text-sm text-gray-400 uppercase tracking-wider">pts</span>
              </div>
            </div>
          ))}
        </div>
      </NeonCard>

      <NeonButton onClick={onRestart} variant="secondary">
        VOLVER A JUGAR
      </NeonButton>
    </div>
  );
};

const QuizScreen: React.FC<{ 
  players: Player[]; 
  question: Question; 
  totalQuestions: number;
  currentNumber: number;
  onNext: (scorers: string[]) => void;
}> = ({ players, question, totalQuestions, currentNumber, onNext }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState<Set<string>>(new Set());

  // Reset state when question changes
  useEffect(() => {
    setShowAnswer(false);
    setSelectedWinners(new Set());
  }, [question]);

  const toggleWinner = (playerId: string) => {
    const newSet = new Set(selectedWinners);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    setSelectedWinners(newSet);
  };

  const categoryColorMap: Record<Category, string> = {
    [Category.GEOGRAPHY]: 'border-hk-neonBlue text-hk-neonBlue shadow-[0_0_10px_cyan]',
    [Category.CULTURE]: 'border-hk-purple text-hk-purple shadow-[0_0_10px_purple]',
    [Category.ARCHITECTURE]: 'border-slate-300 text-slate-200 shadow-[0_0_10px_white]',
    [Category.FOOD]: 'border-orange-500 text-orange-400 shadow-[0_0_10px_orange]',
    [Category.HISTORY]: 'border-hk-red text-hk-red shadow-[0_0_10px_red]',
    [Category.PEOPLE]: 'border-hk-neonPink text-hk-neonPink shadow-[0_0_10px_hotpink]',
    [Category.GENERAL]: 'border-hk-gold text-hk-gold shadow-[0_0_10px_gold]',
    [Category.NATURE]: 'border-hk-neonGreen text-hk-neonGreen shadow-[0_0_10px_lime]',
  };
  
  // Logic to determine if image should be shown
  const showImage = question.imageUrl && (question.imageShowTiming === 'question' || (question.imageShowTiming === 'answer' && showAnswer));

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-6 w-full max-w-6xl mx-auto">
      {/* Decorative Header Bar */}
      <div className="w-full flex justify-between items-end mb-6 border-b border-white/20 pb-2">
        <div className="text-gray-400 font-serif text-lg">
            <span className="text-hk-red text-2xl mr-2">No.</span> 
            {currentNumber} <span className="text-xs">/ {totalQuestions}</span>
        </div>
        <div className={`px-6 py-2 border-2 text-sm font-bold uppercase tracking-widest ${categoryColorMap[question.category]}`}>
          {question.category}
        </div>
      </div>

      {/* Question Card using NeonCard */}
      <NeonCard className="w-full mb-8">
        <div className="mb-8 relative">
            {/* Neon Sign Effect for Question Text */}
            <h2 className="text-3xl md:text-5xl text-white font-serif font-bold text-center leading-relaxed drop-shadow-[0_0_2px_black]">
                {question.text}
            </h2>
        </div>

        {/* Image Area */}
        <div className={`transition-all duration-700 ease-in-out overflow-hidden ${showImage ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
          {question.imageUrl && (
             <div className="flex justify-center p-4 bg-black/50 border border-white/10">
                <img src={question.imageUrl} alt="Imagen" className="max-h-[400px] object-contain shadow-[0_0_20px_rgba(0,0,0,0.8)]" />
             </div>
          )}
        </div>

        {/* Options / Answer Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {question.options ? (
            question.options.map((opt, idx) => {
              const isCorrect = showAnswer && question.correctIndices?.includes(idx);
              const isWrong = showAnswer && !question.correctIndices?.includes(idx);
              
              return (
                <div 
                  key={idx}
                  className={`
                    p-6 border-2 text-xl font-sans transition-all duration-500 flex items-center bg-black/80
                    ${!showAnswer ? 'border-gray-700 hover:border-hk-gold hover:text-hk-gold text-gray-300 cursor-pointer' : ''}
                    ${isCorrect ? 'border-hk-neonGreen bg-hk-neonGreen/20 text-white shadow-[0_0_20px_lime] z-10 font-bold scale-105' : ''}
                    ${isWrong ? 'border-red-900/50 text-gray-600 opacity-40' : ''}
                  `}
                >
                  <span className={`w-10 h-10 flex items-center justify-center rounded-sm mr-4 border-2 font-serif ${isCorrect ? 'border-hk-neonGreen text-hk-neonGreen' : 'border-gray-600 text-gray-500'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </div>
              );
            })
          ) : (
             <div className="col-span-2 text-center py-12 border-2 border-dashed border-white/10 bg-black/40">
                {/* FIX: Using conditional rendering instead of opacity to prevent text flashing */}
                {!showAnswer ? (
                  <div className="text-hk-neonBlue/70 italic animate-pulse text-xl">
                    Thinking... (Pregunta abierta)
                  </div>
                ) : (
                   <div className="animate-fade-in">
                      <div className="text-hk-gold text-sm uppercase tracking-[0.3em] mb-4">Respuesta Correcta</div>
                      <div className="text-4xl md:text-6xl font-serif text-hk-neonGreen neon-text-green">{question.correctText}</div>
                   </div>
                )}
             </div>
          )}
        </div>
      </NeonCard>

      {/* Controls Area */}
      <div className="w-full max-w-4xl bg-black/80 p-6 border-t-2 border-hk-red backdrop-blur-md">
        {!showAnswer ? (
          <div className="flex justify-center">
            <NeonButton onClick={() => setShowAnswer(true)} variant="secondary" className="text-xl px-12">
              VER RESPUESTA
            </NeonButton>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h3 className="text-center text-white font-serif mb-6 uppercase tracking-widest text-lg border-b border-white/20 pb-2 inline-block w-full">
                ¿Quién ha acertado? (+1 Punto)
            </h3>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {players.map(p => {
                 const isSelected = selectedWinners.has(p.id);
                 return (
                  <button
                    key={p.id}
                    onClick={() => toggleWinner(p.id)}
                    className={`
                      px-6 py-3 rounded-sm border-2 transition-all duration-200 font-sans tracking-wide
                      ${isSelected 
                        ? 'bg-hk-neonBlue border-hk-neonBlue text-black font-bold shadow-[0_0_15px_cyan] transform -translate-y-1' 
                        : 'bg-transparent border-gray-600 text-gray-400 hover:border-white hover:text-white'}
                    `}
                  >
                    {p.name}
                  </button>
                 );
              })}
              <button 
                onClick={() => setSelectedWinners(new Set())}
                className="px-6 py-3 rounded-sm border-2 border-red-900 text-red-700 hover:text-red-500 hover:border-red-500 text-xs uppercase"
              >
                Nadie
              </button>
            </div>
            
            <div className="flex justify-center">
              <NeonButton onClick={() => onNext(Array.from(selectedWinners))} variant="primary" className="text-lg">
                {currentNumber === totalQuestions ? "VER RANKING FINAL" : "SIGUIENTE PREGUNTA"}
              </NeonButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.START);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [players, setPlayers] = useState<Player[]>(
    INITIAL_PLAYERS.map(name => ({ id: name, name, score: 0 }))
  );

  const handleStart = () => setScreen(Screen.INTRO);
  const handleIntroNext = () => setScreen(Screen.PREP);
  const handlePrepComplete = () => setScreen(Screen.QUIZ);
  
  const handleNextQuestion = (winnerIds: string[]) => {
    // Update scores
    if (winnerIds.length > 0) {
      setPlayers(prev => prev.map(p => 
        winnerIds.includes(p.id) ? { ...p, score: p.score + 1 } : p
      ));
    }

    // Advance
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setScreen(Screen.RANKING);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setPlayers(INITIAL_PLAYERS.map(name => ({ id: name, name, score: 0 })));
    setScreen(Screen.START);
  };

  // Background style: Dark Red gradient pattern
  const bgStyle = {
    background: `
      linear-gradient(to bottom, rgba(20,0,0,0.9), rgba(10,0,20,0.95)),
      radial-gradient(circle at 50% 50%, #4a0000 0%, #000000 100%)
    `,
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden transition-all duration-500 bg-pattern" style={bgStyle}>
       {/* Global Atmosphere - Neon Glows */}
       <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-hk-red/10 to-transparent pointer-events-none z-0"></div>
       <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-hk-neonBlue/10 to-transparent pointer-events-none z-0"></div>
       
       <div className="relative z-10 w-full">
         {screen === Screen.START && <StartScreen onStart={handleStart} />}
         {screen === Screen.INTRO && <IntroScreen players={players} onNext={handleIntroNext} />}
         {screen === Screen.PREP && <PrepScreen onComplete={handlePrepComplete} />}
         {screen === Screen.QUIZ && (
           <QuizScreen 
              players={players}
              question={QUESTIONS[currentQuestionIndex]}
              totalQuestions={QUESTIONS.length}
              currentNumber={currentQuestionIndex + 1}
              onNext={handleNextQuestion}
           />
         )}
         {screen === Screen.RANKING && <RankingScreen players={players} onRestart={handleRestart} />}
       </div>
    </div>
  );
};

export default App;