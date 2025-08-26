let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let userId = null;

async function startGame() {
  const nom = document.getElementById("username").value;
  if (!nom) {
    alert("Veuillez entrer un nom !");
    return;
  }

  // Appel backend pour créer l’utilisateur
  const res = await fetch("/api/start", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nom: nom})
  });
  const data = await res.json();
  userId = data.user_id;

  console.log("Utilisateur créé:", data);

  // Affiche le quiz
  document.getElementById("quiz-container").style.display = "block";

  // Charge les questions
  loadQuestions();
}

async function loadQuestions() {
  const res = await fetch("/api/questions/question1"); // niveau 1
  questions = await res.json();
  currentQuestionIndex = 0;
  score = 0;
  displayQuestion();
}

function displayQuestion() {
  const q = questions[currentQuestionIndex];
  document.getElementById("question-number").textContent = `${currentQuestionIndex+1}-`;
  document.getElementById("question-text").textContent = q.question;
  const box = document.getElementById("options-container");
  box.innerHTML = "";
  selectedAnswer = null;
  document.getElementById("validate-button").disabled = true;

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, opt);
    box.appendChild(btn);
  });
}

function selectAnswer(el, answer) {
  document.querySelectorAll(".option").forEach(b => b.classList.remove("selected"));
  el.classList.add("selected");
  selectedAnswer = answer;
  document.getElementById("validate-button").disabled = false;
}

function validateAnswer() {
  if (!selectedAnswer) return;
  const correct = questions[currentQuestionIndex].answer;
  if (selectedAnswer.startsWith(correct)) {
    score++;
  }
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    setTimeout(displayQuestion, 250);
  } else {
    finishQuiz();
  }
}

async function finishQuiz() {
  document.getElementById("final-message").textContent = "Quiz terminé !";
  document.getElementById("final-score").textContent = `Votre score est ${score}/${questions.length}`;
  document.getElementById("completion-message").style.display = "block";

  // Enregistrer score dans la base
  await fetch("/api/score", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({user_id: userId, score: score})
  });
  console.log("✅ Score enregistré:", score);
}

function restartQuiz() {
  document.getElementById("completion-message").style.display = "none";
  loadQuestions();
}

function goBack() {
  console.log("Retour");
}
