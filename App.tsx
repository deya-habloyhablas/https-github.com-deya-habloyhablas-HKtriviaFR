import React, { useState, useEffect, useMemo } from 'react';
import { Award, ChevronRight, Users, Music, Star, MapPin, Coffee, BookOpen, ArrowRight } from 'lucide-react';

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
  points?: number; // Added points support
}

interface Player {
  id: string;
  name: string;
  score: number;
}

// --- Data ---

const INITIAL_PLAYERS = ["Romain", "Alice", "Quentin", "Luc", "Charlotte", "Pablo", "Isabelle"];

// IMAGES CONFIGURATION
const IMAGES = {
  // PREGUNTA 1: Discover HK (Islands)
  q1_answer: "https://www.discoverhongkong.com/content/dam/dhk/gohk/2022/tai-lam-country-park/hero-image/hero-960x720.jpg",
  // PREGUNTA 2: Repulse Bay (The Hole)
  q2_question: "https://upload.wikimedia.org/wikipedia/commons/6/6c/The_Repulse_Bay_Overview_201501.jpg",
  // RESPUESTA 3: Skyscrapers Density
  q3_answer: "https://i.redd.it/lw8kw5hso8af1.jpeg",
  // RESPUESTA 5: Bamboo Scaffolding
  q5_answer: "https://www.shutterstock.com/image-photo/bamboo-scaffolding-construction-site-260nw-74588047.jpg",
  // PREGUNTA 6: Dim Sum
  q6_question: "https://s.dash.co/2019/06/14/030601/header2.jpg",
  // RESPUESTA 7: Escalator
  q7_answer: "https://media.timeout.com/images/105637372/image.jpg",
  // PREGUNTA 9: Big Buddha
  q9_answer: "https://hongkongcheapo.com/wp-content/uploads/sites/7/2019/01/Hong-Kong-Big-Buddha-iStock-1149065884.jpg",
  // RESPUESTA 13: Pink Dolphin
  q13_answer: "https://expatliving.net/hong-kong/wp-content/uploads/sites/4/2020/03/Pinkdolphin.jpg",
  // PREGUNTA 14: Feng Shui / Bagua Mirror
  q14_answer: "https://media.timeout.com/images/105385306/750/562/image.jpg",
  // RESPUESTA 15: Flag/Bauhinia
  q15_answer: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/2560px-Flag_of_Hong_Kong.svg.png",
  // Q16: Jackie Chan (Alternative reliable source since user didn't provide specific URL but requested image)
  q16_answer: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Jackie_Chan_July_2016.jpg/640px-Jackie_Chan_July_2016.jpg",
  // PREGUNTA 18: Victoria Peak View
  q18_answer: "https://res.klook.com/image/upload/w_1265,h_791,c_fill,q_85/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/ifm3ngwvqoxifp49etyf.webp",
  // PREGUNTA 19: Red Minibus
  q19_question: "https://cdn.i-scmp.com/sites/default/files/d8/images/canvas/2021/06/18/74728f48-603a-4c15-adbf-c3c1061c638d_758971e5.jpg",
  // RESPUESTA 20: Chopsticks etiquette
  q20_answer: "https://img.static-kl.com/transform/8f544c53-5ae4-42c3-b973-85fbd43194dc/",
  // PREGUNTA 21: Pawn Shop Symbol
  q21_question: "https://www.polyu.edu.hk/cpa/milestones/filemanager/common/201803/images/img_technology_7b_large.jpg",
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: Category.GEOGRAPHY,
    text: "Combien d’îles trouve-t-on à HK ?",
    options: ["12", "65", "123", "261"],
    correctIndices: [3],
    imageUrl: IMAGES.q1_answer,
    imageShowTiming: 'answer' // Corrected: Image shows on Answer
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
    imageShowTiming: 'question' // Kept as question to help estimation
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
    correctIndices: [3],
    imageUrl: IMAGES.q14_answer,
    imageShowTiming: 'question' // Changed to show during question
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
    correctIndices: [0],
    imageUrl: IMAGES.q18_answer,
    imageShowTiming: 'question'
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
    correctIndices: [1, 3], // B and D
    imageUrl: IMAGES.q20_answer,
    imageShowTiming: 'answer'
  },
  {
    id: 21,
    category: Category.CULTURE,
    text: "BONUS (2 Points) : Que représente la forme du symbole des 'Pawn Shops' (prêteurs sur gages) ?",
    options: ["Une main avec des baguettes qui prennent un dim sum", "Une chauve-souris", "Une coiffe traditionelle", "Une couronne"],
    correctIndices: [1],
    imageUrl: IMAGES.q21_question,
    imageShowTiming: 'question',
    points: 2
  }
];

// --- Helper Components ---

const NeonButton: React.FC<{ onClick: () => void; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger'; className?: string }> = ({ onClick, children, variant = 'primary', className = '' }) => {
  const baseStyle = "px-6 py-2 md:px-8 md:py-3 rounded-sm font-serif font-bold tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 relative overflow-hidden group";
  
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

// Container with Chinese corners - made more flexible for layout
const NeonCard: React.FC<{ children: React.ReactNode; className?: string; borderColor?: string }> = ({ children, className = '', borderColor = 'border-hk-gold' }) => {
  return (
    <div className={`chinese-border bg-black/60 backdrop-blur-md relative ${className}`}>
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
  <div className="flex flex-col items-center justify-center h-screen text-center space-y-12 animate-fade-in px-4 relative overflow-hidden">
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
    <div className="flex flex-col items-center justify-center h-screen px-4 w-full overflow-hidden">
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
    <div className="flex flex-col items-center justify-center h-screen bg-black/95">
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
    <div className="flex flex-col items-center justify-center h-screen px-4 py-8 max-w-5xl mx-auto w-full overflow-hidden">
      <div className="relative mb-6 animate-bounce-slow scale-75 md:scale-100">
        <div className="absolute -inset-10 bg-hk-gold opacity-20 blur-3xl rounded-full"></div>
        <Award size={140} className="text-hk-gold drop-shadow-[0_0_25px_rgba(255,215,0,1)] relative z-10" />
        <div className="absolute inset-0 flex items-center justify-center pt-4 z-20">
           {/* Uses Q15 answer image which is the flower, or fallbacks if missing */}
           <img src={IMAGES.q15_answer} alt="HK Flower" className="w-16 h-16 flower-spin opacity-90 mix-blend-screen rounded-full border-2 border-white" />
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-serif text-white mb-2 tracking-[0.5em] text-center">GANADOR</h1>
      <h2 className="text-5xl md:text-7xl font-bold text-hk-red mb-6 neon-text-red text-center">{winner.name}</h2>
      
      <NeonCard className="w-full mb-8 flex-1 min-h-0 flex flex-col">
        <h3 className="text-3xl font-serif text-hk-gold mb-4 border-b-2 border-hk-gold pb-2 text-center tracking-widest shrink-0">CLASIFICACIÓN</h3>
        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {sortedPlayers.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between p-3 border border-white/10 hover:bg-white/5 transition-colors bg-black/40">
              <div className="flex items-center space-x-6">
                <span className={`font-serif text-2xl font-bold w-12 text-right ${idx === 0 ? 'text-hk-gold drop-shadow-[0_0_8px_gold]' : 'text-gray-500'}`}>
                  #{idx + 1}
                </span>
                <span className={`text-xl font-sans ${idx === 0 ? 'text-white font-bold' : 'text-gray-300'}`}>{p.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-hk-neonBlue drop-shadow-[0_0_5px_cyan]">{p.score}</span>
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

  // Points handling
  const points = question.points || 1;

  // Options Colors - Fixed Neon palette for answers
  const optionColors = [
    { border: 'border-hk-neonBlue', text: 'text-hk-neonBlue', shadow: 'shadow-[0_0_10px_rgba(0,255,255,0.3)]', hover: 'hover:bg-hk-neonBlue/10 hover:shadow-[0_0_20px_cyan]' },
    { border: 'border-hk-neonPink', text: 'text-hk-neonPink', shadow: 'shadow-[0_0_10px_rgba(255,20,147,0.3)]', hover: 'hover:bg-hk-neonPink/10 hover:shadow-[0_0_20px_deeppink]' },
    { border: 'border-hk-purple', text: 'text-hk-purple', shadow: 'shadow-[0_0_10px_rgba(157,0,255,0.3)]', hover: 'hover:bg-hk-purple/10 hover:shadow-[0_0_20px_purple]' },
    { border: 'border-hk-gold', text: 'text-hk-gold', shadow: 'shadow-[0_0_10px_rgba(255,215,0,0.3)]', hover: 'hover:bg-hk-gold/10 hover:shadow-[0_0_20px_gold]' },
  ];

  return (
    <div className="flex flex-col h-screen w-full max-w-7xl mx-auto px-4 py-4 relative overflow-hidden">
      {/* Decorative Header Bar - Compact */}
      <div className="flex-none w-full flex justify-between items-end mb-4 border-b border-white/20 pb-2">
        <div className="text-gray-400 font-serif text-lg">
            <span className="text-hk-red text-2xl mr-2">No.</span> 
            {currentNumber} <span className="text-xs">/ {totalQuestions}</span>
        </div>
        <div className={`px-4 py-1 border-2 text-xs md:text-sm font-bold uppercase tracking-widest ${categoryColorMap[question.category]}`}>
          {question.category}
        </div>
      </div>

      {/* Main Content Area - Flexbox to fill available space */}
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-4 md:gap-6 relative">
          
          <div className="flex-none">
             {/* Neon Sign Effect for Question Text - Adjusted for responsiveness */}
            <h2 className="text-2xl md:text-4xl lg:text-5xl text-white font-serif font-bold text-center leading-relaxed tracking-widest drop-shadow-[0_0_2px_black] px-2 md:px-12">
                {question.text}
            </h2>
            {points > 1 && (
               <div className="flex justify-center mt-2">
                 <span className="text-hk-neonPink font-bold text-lg md:text-xl animate-pulse border border-hk-neonPink px-3 py-1 rounded">
                    BONUS x{points}
                 </span>
               </div>
            )}
          </div>

          {/* Image Area - Responsive Flex Item */}
          {showImage && question.imageUrl && (
             <div className="flex-1 min-h-0 flex justify-center items-center py-2">
                 <img 
                    src={question.imageUrl} 
                    alt="Imagen" 
                    className="max-h-full max-w-full object-contain shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-white/10 p-2 bg-black/50" 
                 />
             </div>
          )}

          {/* Options / Answer Display - Grid */}
          <div className={`flex-none grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${showImage ? 'mt-2' : 'mt-8'}`}>
            {question.options ? (
              question.options.map((opt, idx) => {
                const isCorrect = showAnswer && question.correctIndices?.includes(idx);
                const isWrong = showAnswer && !question.correctIndices?.includes(idx);
                const theme = optionColors[idx % optionColors.length];
                
                return (
                  <div 
                    key={idx}
                    className={`
                      p-3 md:p-5 border-2 text-lg md:text-xl font-sans transition-all duration-500 flex items-center bg-black/80 tracking-wide
                      ${!showAnswer 
                          ? `${theme.border} ${theme.text} ${theme.shadow} ${theme.hover} cursor-pointer` 
                          : ''}
                      ${isCorrect ? 'border-hk-neonGreen bg-hk-neonGreen/20 text-white shadow-[0_0_20px_lime] z-10 font-bold scale-105' : ''}
                      ${isWrong ? 'border-red-900/50 text-gray-600 opacity-40' : ''}
                    `}
                  >
                    <span className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-sm mr-3 md:mr-4 border-2 font-serif text-sm md:text-base 
                      ${!showAnswer ? `${theme.border} ${theme.text}` : ''}
                      ${isCorrect ? 'border-hk-neonGreen text-hk-neonGreen' : ''}
                      ${isWrong ? 'border-gray-600 text-gray-600' : ''}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </div>
                );
              })
            ) : (
               <div className="col-span-2 text-center py-8 border-2 border-dashed border-white/10 bg-black/40">
                  {!showAnswer ? (
                    <div className="text-hk-neonBlue/70 italic animate-pulse text-lg md:text-xl">
                      Thinking... (Pregunta abierta)
                    </div>
                  ) : (
                     <div className="animate-fade-in">
                        <div className="text-hk-gold text-xs uppercase tracking-[0.3em] mb-2">Respuesta Correcta</div>
                        <div className="text-3xl md:text-5xl font-serif text-hk-neonGreen neon-text-green">{question.correctText}</div>
                     </div>
                  )}
               </div>
            )}
          </div>
      </div>

      {/* Controls Area - Compact Bottom Bar */}
      <div className="flex-none pt-4 pb-2 z-20">
        {!showAnswer ? (
          <div className="flex justify-center">
            <NeonButton onClick={() => setShowAnswer(true)} variant="secondary" className="text-lg px-8">
              VER RESPUESTA
            </NeonButton>
          </div>
        ) : (
          <>
            {/* Bottom Player Selection Bar */}
            <div className="animate-fade-in w-full bg-black/80 border-t border-hk-gold/30 p-2 backdrop-blur-md flex flex-col items-center justify-center gap-4 rounded-t-xl relative z-20">
               <div className="flex items-center gap-4">
                   <h3 className="text-white font-serif uppercase text-sm md:text-base tracking-widest whitespace-nowrap">
                      Puntos (+{points}):
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {players.map(p => {
                       const isSelected = selectedWinners.has(p.id);
                       return (
                        <button
                          key={p.id}
                          onClick={() => toggleWinner(p.id)}
                          className={`
                            px-3 py-1 rounded-sm border transition-all duration-200 font-sans text-sm
                            ${isSelected 
                              ? 'bg-hk-neonBlue border-hk-neonBlue text-black font-bold shadow-[0_0_10px_cyan]' 
                              : 'bg-transparent border-gray-600 text-gray-400 hover:border-white hover:text-white'}
                          `}
                        >
                          {p.name}
                        </button>
                       );
                    })}
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    <button 
                      onClick={() => setSelectedWinners(new Set())}
                      className="px-3 py-1 rounded-sm border border-red-900 text-red-700 hover:text-red-500 hover:border-red-500 text-xs uppercase"
                    >
                      Reset
                    </button>
                  </div>
               </div>
            </div>

            {/* FIXED CENTER-RIGHT NEXT ARROW - HOLLOW NEON STYLE */}
            <button 
               onClick={() => onNext(Array.from(selectedWinners))}
               className="fixed right-10 top-1/2 -translate-y-1/2 z-50 group hover:scale-105 transition-transform duration-300"
            >
               {/* Neon Circle Container */}
               <div className="w-24 h-24 rounded-full border-4 border-hk-neonGreen shadow-[0_0_20px_#39FF14,inset_0_0_10px_#39FF14] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-neon-flicker">
                   {/* Hollow Arrow Icon */}
                   <ChevronRight size={64} className="text-hk-neonGreen drop-shadow-[0_0_10px_#39FF14]" strokeWidth={3} />
               </div>
               {/* Label */}
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-center">
                   <span className="text-hk-neonGreen font-serif text-sm tracking-[0.2em] font-bold drop-shadow-[0_0_5px_#39FF14] whitespace-nowrap">
                       {currentNumber === totalQuestions ? "RANKING" : "NEXT"}
                   </span>
               </div>
            </button>
          </>
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
    // Points logic
    const currentQ = QUESTIONS[currentQuestionIndex];
    const pointsToAdd = currentQ.points || 1;

    // Update scores
    if (winnerIds.length > 0) {
      setPlayers(prev => prev.map(p => 
        winnerIds.includes(p.id) ? { ...p, score: p.score + pointsToAdd } : p
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
    <div className="h-screen text-white font-sans overflow-hidden transition-all duration-500 bg-pattern" style={bgStyle}>
       {/* Global Atmosphere - Neon Glows */}
       <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-hk-red/10 to-transparent pointer-events-none z-0"></div>
       <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-hk-neonBlue/10 to-transparent pointer-events-none z-0"></div>
       
       <div className="relative z-10 w-full h-full">
         {screen === Screen.START && <StartScreen onStart={handleStart} />}
         {screen === Screen.INTRO && <IntroScreen players={players} onNext={handleIntroNext} />}
         {screen === Screen.PREP && <PrepScreen onComplete={handlePrepComplete} />}
         {screen === Screen.QUIZ && (
           <QuizScreen 
              key={currentQuestionIndex} 
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