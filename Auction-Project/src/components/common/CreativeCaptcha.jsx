import { useState, useCallback } from "react";
import "./CreativeCaptcha.css";

// Fun pools of interactive visual challenges
const CHALLENGES = [
  {
    id: "animal-lion",
    question: "Select the Lion 🦁",
    target: "🦁",
    options: [
      { emoji: "🦁", label: "Lion" },
      { emoji: "🐘", label: "Elephant" },
      { emoji: "🐼", label: "Panda" },
      { emoji: "🦊", label: "Fox" },
    ],
  },
  {
    id: "cricket-bat",
    question: "Select the Cricket Bat 🏏",
    target: "🏏",
    options: [
      { emoji: "⚽", label: "Football" },
      { emoji: "🏏", label: "Cricket Bat" },
      { emoji: "🏀", label: "Basketball" },
      { emoji: "🎾", label: "Tennis" },
    ],
  },
  {
    id: "trophy-star",
    question: "Select the Winner Trophy 🏆",
    target: "🏆",
    options: [
      { emoji: "🥇", label: "Medal" },
      { emoji: "🎯", label: "Target" },
      { emoji: "🏆", label: "Trophy" },
      { emoji: "👑", label: "Crown" },
    ],
  },
  {
    id: "animal-cat",
    question: "Select the Cute Cat 🐱",
    target: "🐱",
    options: [
      { emoji: "🐶", label: "Dog" },
      { emoji: "🐱", label: "Cat" },
      { emoji: "🐰", label: "Rabbit" },
      { emoji: "🐹", label: "Hamster" },
    ],
  },
  {
    id: "nature-fire",
    question: "Select the Flame 🔥",
    target: "🔥",
    options: [
      { emoji: "💧", label: "Water" },
      { emoji: "⚡", label: "Lightning" },
      { emoji: "🔥", label: "Fire" },
      { emoji: "❄️", label: "Snowflake" },
    ],
  },
  {
    id: "animal-butterfly",
    question: "Select the Butterfly 🦋",
    target: "🦋",
    options: [
      { emoji: "🐝", label: "Honeybee" },
      { emoji: "🦋", label: "Butterfly" },
      { emoji: "🐞", label: "Ladybug" },
      { emoji: "🕊️", label: "Dove" },
    ],
  },
];

const randomIndex = () => Math.floor(Math.random() * CHALLENGES.length);
const shuffleOptions = (options) => [...options].sort(() => Math.random() - 0.5);

const CreativeCaptcha = ({ onVerify }) => {
  const [challengeIndex, setChallengeIndex] = useState(randomIndex);
  const [shuffledOptions, setShuffledOptions] = useState(() => shuffleOptions(CHALLENGES[randomIndex()].options));
  const [verified, setVerified] = useState(false);
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [captchaId, setCaptchaId] = useState("");

  const currentChallenge = CHALLENGES[challengeIndex];

  const loadChallenge = useCallback((index = null) => {
    const nextIdx = index !== null ? index : randomIndex();
    setChallengeIndex(nextIdx);
    setShuffledOptions(shuffleOptions(CHALLENGES[nextIdx].options));
    setVerified(false);
    setShake(false);
    setFeedback("");
    setCaptchaId(`fun-captcha-${Date.now()}`);
  }, []);

  const handleSelectOption = useCallback((option) => {
    if (verified) return;

    if (option.emoji === currentChallenge.target) {
      setVerified(true);
      setFeedback("Awesome! Verification Complete ✓");
      if (onVerify) {
        onVerify("verified", captchaId);
      }
    } else {
      setShake(true);
      setFeedback("Oops! Wrong pick. Try this new challenge 👇");
      setTimeout(() => {
        setShake(false);
        let newIdx = randomIndex();
        if (newIdx === challengeIndex) {
          newIdx = (challengeIndex + 1) % CHALLENGES.length;
        }
        loadChallenge(newIdx);
      }, 700);
    }
  }, [verified, currentChallenge, captchaId, onVerify, challengeIndex, loadChallenge]);

  return (
    <div className={`creative-captcha-box ${shake ? "captcha-shake" : ""} ${verified ? "captcha-verified" : ""}`}>
      <div className="captcha-header">
        <div className="captcha-title-wrap">
          <span className="captcha-shield-icon">🛡️</span>
          <span className="captcha-title">Human Verification</span>
        </div>

        {!verified && (
          <button
            type="button"
            className="captcha-refresh-btn"
            onClick={() => loadChallenge()}
            title="Try another challenge"
          >
            🔄 Refresh
          </button>
        )}
      </div>

      {!verified ? (
        <div className="captcha-body">
          <p className="captcha-instruction">
            Prompt: <strong>{currentChallenge.question}</strong>
          </p>

          <div className="captcha-options-grid">
            {shuffledOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                className="captcha-card-item"
                onClick={() => handleSelectOption(opt)}
              >
                <span className="captcha-emoji">{opt.emoji}</span>
                <span className="captcha-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="captcha-success-banner">
          <div className="success-checkmark">✓</div>
          <span className="success-text">You're verified! Human confirmed.</span>
        </div>
      )}

      {feedback && !verified && <p className="captcha-feedback-msg">{feedback}</p>}
    </div>
  );
};

export default CreativeCaptcha;
