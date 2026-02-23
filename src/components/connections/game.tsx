import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WordTile } from "./tile";
import { CategoryReveal } from "./reveal";
import { GameOver } from "./end";

export type CategoryColor = "yellow" | "green" | "blue" | "purple";

type Category = {
  name: string;
  color: CategoryColor;
  words: string[];
};

type Guess = {
  words: string[];
  correct: boolean;
  categoryColor?: CategoryColor;
};

type GameState = {
  categories: Category[];
  remainingWords: string[];
  selectedWords: string[];
  mistakesRemaining: number;
  solvedCategories: Category[];
  gameOver: boolean;
  gameWon: boolean;
  isShuffling: boolean;
  guessHistory: Guess[];
};

const INITIAL_CATEGORIES: Category[] = [
  {
    name: "APPS TO WASTE TIME",
    color: "yellow",
    words: ["NETFLIX", "TIKTOK", "TWITTER", "LINKEDIN"],
  },
  {
    name: "SPORTS ENDING IN -BALL",
    color: "green",
    words: ["PICKLE", "BASE", "DODGE", "VOLLEY"],
  },
  {
    name: "FOOTBALL TERMS",
    color: "blue",
    words: ["HIKE", "RUN", "SNAP", "DRIVE"],
  },
  {
    name: "YUMMY FOODS",
    color: "purple",
    words: ["TURNOVER", "DATE", "APPLE", "JAM"],
  },
];

const STORAGE_KEY = "connectionsGameState1";

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function initializeGame(): GameState {
  return {
    categories: INITIAL_CATEGORIES,
    remainingWords: shuffleArray(INITIAL_CATEGORIES.flatMap((c) => c.words)),
    selectedWords: [],
    mistakesRemaining: 4,
    solvedCategories: [],
    gameOver: false,
    gameWon: false,
    isShuffling: false,
    guessHistory: [],
  };
}

export function ConnectionsGame() {
  const [state, setState] = useState<GameState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initializeGame();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  function selectWord(word: string) {
    if (state.isShuffling) return;
    setState((prev) => {
      if (prev.selectedWords.includes(word)) {
        return { ...prev, selectedWords: prev.selectedWords.filter((w) => w !== word) };
      }
      if (prev.selectedWords.length >= 4) return prev;
      return { ...prev, selectedWords: [...prev.selectedWords, word] };
    });
  }

  function submit() {
    if (state.selectedWords.length !== 4 || state.isShuffling) return;

    const match = state.categories.find((cat) => {
      const sel = new Set(state.selectedWords);
      const cat_ = new Set(cat.words);
      return sel.size === cat_.size && [...sel].every((w) => cat_.has(w));
    });

    if (match) {
      setState((prev) => {
        const remaining = prev.remainingWords.filter((w) => !prev.selectedWords.includes(w));
        const solved = [...prev.solvedCategories, match];
        const won = remaining.length === 0;
        return {
          ...prev,
          remainingWords: remaining,
          selectedWords: [],
          solvedCategories: solved,
          gameOver: won,
          gameWon: won,
          guessHistory: [
            ...prev.guessHistory,
            { words: [...prev.selectedWords], correct: true, categoryColor: match.color },
          ],
        };
      });
    } else {
      // Check "one away"
      const oneAway = state.categories
        .filter((cat) => !state.solvedCategories.some((s) => s.name === cat.name))
        .some((cat) => state.selectedWords.filter((w) => cat.words.includes(w)).length === 3);

      if (oneAway) {
        toast.info(<span className="font-medium">You're one away from a group!</span>, {
          id: "one-away",
          duration: 3000,
        });
      }

      setState((prev) => {
        const mistakes = prev.mistakesRemaining - 1;
        return {
          ...prev,
          selectedWords: [],
          mistakesRemaining: mistakes,
          gameOver: mistakes === 0,
          gameWon: false,
          guessHistory: [
            ...prev.guessHistory,
            { words: [...prev.selectedWords], correct: false },
          ],
        };
      });
    }
  }

  function shuffle() {
    if (state.isShuffling) return;
    setState((prev) => ({ ...prev, isShuffling: true, selectedWords: [] }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, remainingWords: shuffleArray(prev.remainingWords), isShuffling: false }));
    }, 500);
  }

  function deselectAll() {
    if (state.isShuffling) return;
    setState((prev) => ({ ...prev, selectedWords: [] }));
  }

  function reset() {
    const fresh = initializeGame();
    setState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
  }

  if (state.gameOver) {
    return (
      <GameOver
        won={state.gameWon}
        allCategories={state.categories}
        solvedCategories={state.solvedCategories}
        guessHistory={state.guessHistory}
        onReset={reset}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <AnimatePresence>
        {state.solvedCategories.map((cat) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <CategoryReveal category={cat} />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2 mb-6 w-full">
        <AnimatePresence>
          {state.remainingWords.map((word, i) => (
            <motion.div
              key={word}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, delay: i * 0.03 } }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="aspect-square"
            >
              <WordTile
                word={word}
                selected={state.selectedWords.includes(word)}
                onClick={() => selectWord(word)}
                disabled={state.isShuffling}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col w-full gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Mistakes left:</span>
            <div className="flex gap-1">
              {Array.from({ length: state.mistakesRemaining }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary" />
              ))}
              {Array.from({ length: 4 - state.mistakesRemaining }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-muted" />
              ))}
            </div>
          </div>
          <Button
            onClick={submit}
            disabled={state.selectedWords.length !== 4 || state.isShuffling}
            variant={state.selectedWords.length === 4 ? "default" : "outline"}
            className="px-6"
          >
            Submit
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={shuffle} disabled={state.isShuffling} variant="outline" className="flex-1">
            Shuffle
          </Button>
          <Button
            onClick={deselectAll}
            disabled={state.selectedWords.length === 0 || state.isShuffling}
            variant="outline"
            className="flex-1"
          >
            Deselect All
          </Button>
        </div>
      </div>
    </div>
  );
}
