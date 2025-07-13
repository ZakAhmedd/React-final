import React from "react";
import { clsx } from "clsx";
import { languages } from "./languages";
import { getFarewellText, getRandomWord } from "./utils";
import Confetti from "react-confetti"

export default function AssemblyEndgame() {
  // state values
  const [currentWord, setCurrentWord] = React.useState(() => getRandomWord());
  const [guessedLetters, setGuessedLetters] = React.useState([]);

  // derived values
  const numGuessesLeft = languages.length - 1
  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  ).length;
  const isGameWon = currentWord
    .split("")
    .every((letter) => guessedLetters.includes(letter));
  const isGameLost = wrongGuessCount >= languages.length - 1;
  const isGameOver = isGameWon || isGameLost;
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessedIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  // static values
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount;
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color,
    };
    const className = clsx("language", isLanguageLost && "lost");
    return (
      <span className={className} style={styles} key={lang.name}>
        {lang.name}
      </span>
    );
  });

  const letterElements = currentWord
    .split("")
    .map((letter, index) => {
        const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
        const letterClassName = clsx(
            isGameLost && !guessedLetters.includes(letter) && "missed-letter"
        )
        return (
            <span key={index} className={letterClassName}>
                {shouldRevealLetter ? letter.toUpperCase() : ""}
            </span>
        )
    });

  const keyboardElements = alphabet.split("").map((letter) => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });

    return (
      <button
        className={className}
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter {letter}`}
        onClick={() => userGuess(letter)}
        key={letter}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  function userGuess(letter) {
    setGuessedLetters((prevLetters) =>
      prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
    );
  }

  function startNewGame() {
    setCurrentWord(getRandomWord())
    setGuessedLetters([])
  }

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessedIncorrect,
  });

  function renderGameStatus() {
    if (!isGameOver && isLastGuessedIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessCount - 1].name)}
        </p>
      );
    }
    if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      );
    }
    if (isGameLost) {
      return (
        <>
          <h2>Game Over!</h2>
          <p> You Lose 🙁</p>
        </>
      );
    }
    return null;
  }

  return (
    <main>
        {
            isGameWon && 
                <Confetti 
                    recycle={false}
                    numberOfPieces={1000}
                />
        }
      <header>
        <h1>Assembly: Endgame</h1>
        <p>
          Guess the word within 8 attempts to keep the programming world safe
          from Assembly!
        </p>
      </header>
      <section aria-live="polite" className={gameStatusClass}>
        {renderGameStatus()}
      </section>
      <section className="languages-container">{languageElements}</section>
      <section className="word">{letterElements}</section>
      {/* Combined visually-hidden aria-live reigon for status updates*/}
      <section className="sr-only" aria-live="polite" role="status">
        <p>
            {currentWord.includes(lastGuessedLetter) ? 
            `Correct! The letter ${lastGuessedLetter} is in the word!` :
            `Sorry, the letter ${lastGuessedLetter} is not in the word!`}
            You have {numGuessesLeft} attempts left.
        </p>
        <p>
          Current word:
          {currentWord
            .split("")
            .map((letter) =>
              guessedLetters.includes(letter) ? letter + "." : "blank."
            )
            .join(" ")}
        </p>
      </section>
      <section className="keyboard">{keyboardElements}</section>
      {isGameOver && <button onClick={startNewGame} className="new-game">New Game</button>}
    </main>
  );
}
