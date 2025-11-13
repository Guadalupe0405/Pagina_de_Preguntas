const PROXY_URL = "https://delicate-feather-9870.hemg050704.workers.dev/";

// FUNCIÓN PARA PEDIR PREGUNTA A GEMINI
async function respuestaAPI() {
  const prompt = `Genera una pregunta de opción múltiple sobre temas de Ingeniería en Computación.
  Incluye temas como arquitectura de computadoras, algoritmos, redes, inteligencia artificial o sistemas operativos.
  Proporciona cuatro opciones (a,b,c,d), indica la respuesta correcta y una breve explicación.
  Devuelve el resultado en formato JSON:
  {
    "question": "¿Cuál es el propósito principal de un sistema operativo?",
    "options": [
      "a) Ejecutar programas de usuario",
      "b) Administrar recursos de hardware y software",
      "c) Diseñar redes de comunicación",
      "d) Controlar periféricos de salida"
    ],
    "correct_answer": "b) Administrar recursos de hardware y software",
    "explanation": "El sistema operativo gestiona los recursos del sistema y permite la interacción entre el hardware y el software."
  }`;

  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    const data = await response.json();
    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResult) throw new Error("No se recibió texto de la API");

    const start = textResult.indexOf("{");
    const end = textResult.lastIndexOf("}");
    const res = JSON.parse(textResult.substring(start, end + 1));

    return { result: 1, response: res };
  } catch (error) {
    console.error("Error API:", error);
    return { result: 0, response: "Error al cargar pregunta" };
  }
}

// MOSTRAR PREGUNTA EN PANTALLA
function desplegar(jsonObj) {
  const questionText = document.getElementById("question-text");
  const options = document.getElementById("options-container");
  const explanation = document.getElementById("explanation-text");
  const nextButton = document.getElementById("next-button");

  questionText.innerHTML = jsonObj.question;
  options.innerHTML = "";
  explanation.innerHTML = "";
  nextButton.style.display = "none";

  jsonObj.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.innerHTML = option;
    btn.classList.add("option-button");

    btn.addEventListener("click", () => {
      document.querySelectorAll(".option-button").forEach((b) => (b.disabled = true));

      if (option === jsonObj.correct_answer) {
        btn.classList.add("correct");
        updateScore("correct");
      } else {
        btn.classList.add("incorrect");
        updateScore("incorrect");
      }

      explanation.innerHTML = jsonObj.explanation;
      nextButton.style.display = "block";
    });

    options.appendChild(btn);
  });
}

// CARGAR NUEVA PREGUNTA
async function loadNewQuestion() {
  document.getElementById("question-text").innerHTML = "🔄 Cargando pregunta...";
  document.getElementById("options-container").innerHTML = "";
  document.getElementById("explanation-text").innerHTML = "";
  document.getElementById("next-button").style.display = "none";

  const data = await respuestaAPI();

  if (data.result === 1) {
    desplegar(data.response);
  } else {
    document.getElementById("question-text").innerHTML = "⚠️ Error al cargar la pregunta";
  }
}

// SISTEMA DE PUNTAJE
function updateScore(type) {
  const correctCount = document.getElementById("correct-count");
  const incorrectCount = document.getElementById("incorrect-count");

  let correct = parseInt(localStorage.getItem("correct") || "0");
  let incorrect = parseInt(localStorage.getItem("incorrect") || "0");

  if (type === "correct") correct++;
  else incorrect++;

  localStorage.setItem("correct", correct);
  localStorage.setItem("incorrect", incorrect);

  correctCount.textContent = correct;
  incorrectCount.textContent = incorrect;
}

function loadScore() {
  document.getElementById("correct-count").textContent = localStorage.getItem("correct") || "0";
  document.getElementById("incorrect-count").textContent = localStorage.getItem("incorrect") || "0";
}

function resetScore() {
  if (confirm("¿Seguro que deseas reiniciar el puntaje?")) {
    localStorage.setItem("correct", "0");
    localStorage.setItem("incorrect", "0");
    loadScore();
  }
}

// INICIALIZACIÓN
loadScore();
loadNewQuestion();
