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
const INITIAL_WORDS = INITIAL_CATEGORIES.flatMap((category) => category.words);

function isCategoryColor(value: unknown): value is CategoryColor {
  return value === "yellow" || value === "green" || value === "blue" || value === "purple";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Category>;
  return (
    typeof candidate.name === "string" &&
    isCategoryColor(candidate.color) &&
    isStringArray(candidate.words)
  );
}

function isGuess(value: unknown): value is Guess {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Guess>;
  return (
    isStringArray(candidate.words) &&
    typeof candidate.correct === "boolean" &&
    (candidate.categoryColor === undefined || isCategoryColor(candidate.categoryColor))
  );
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GameState>;
  return (
    Array.isArray(candidate.categories) &&
    candidate.categories.every(isCategory) &&
    isStringArray(candidate.remainingWords) &&
    isStringArray(candidate.selectedWords) &&
    typeof candidate.mistakesRemaining === "number" &&
    Array.isArray(candidate.solvedCategories) &&
    candidate.solvedCategories.every(isCategory) &&
    typeof candidate.gameOver === "boolean" &&
    typeof candidate.gameWon === "boolean" &&
    typeof candidate.isShuffling === "boolean" &&
    Array.isArray(candidate.guessHistory) &&
    candidate.guessHistory.every(isGuess)
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function initializeGame({ shuffleWords = true }: { shuffleWords?: boolean } = {}): GameState {
  return {
    categories: INITIAL_CATEGORIES,
    remainingWords: shuffleWords ? shuffleArray(INITIAL_WORDS) : INITIAL_WORDS,
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
  const [state, setState] = useState<GameState>(() => initializeGame({ shuffleWords: false }));
  const [hasHydratedState, setHasHydratedState] = useState(false);

  useEffect(() => {
    let nextState = initializeGame();

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isGameState(parsed)) {
          nextState = parsed;
        }
      }
    } catch {}

    setState(nextState);
    setHasHydratedState(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedState) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [hasHydratedState, state]);

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

    const selected = new Set(state.selectedWords);
    const match = state.categories.find((cat) => cat.words.every((w) => selected.has(w)));

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
      <p id="connections-instructions" className="sr-only">
        Select 4 words, then submit your guess. Selected tiles are announced as pressed.
      </p>
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

      <div
        className="grid grid-cols-4 gap-2 mb-6 w-full"
        role="group"
        aria-describedby="connections-instructions"
        aria-label="Connections board"
      >
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
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < state.mistakesRemaining ? "bg-primary" : "bg-muted"}`}
                />
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
