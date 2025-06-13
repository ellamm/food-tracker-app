import { capitalize, calculateCalories } from "./helpers.js";
import snackbar from "snackbar";
import AppData from "./app-data.js";
import "snackbar/dist/snackbar.min.css";
import Chart from "chart.js/auto";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import app from "./initialize-firebase.js";

const appData = new AppData();

const list = document.querySelector("#food-list");
const form = document.querySelector("#create-form");
const nameInput = document.querySelector("#create-name");
const carbsInput = document.querySelector("#create-carbs");
const proteinInput = document.querySelector("#create-protein");
const fatInput = document.querySelector("#create-fat");

const displayEntry = (name, carbs, protein, fat) => {
  appData.addFood(carbs, protein, fat);
  list.insertAdjacentHTML(
    "beforeend",
    `<li class="card">
        <div>
          <h3 class="name">${capitalize(name)}</h3>
          <div class="calories">${calculateCalories(
            carbs,
            protein,
            fat
          )} calories</div>
          <ul class="macros">
            <li class="carbs"><div>Carbs</div><div class="value">${carbs}g</div></li>
            <li class="protein"><div>Protein</div><div class="value">${protein}g</div></li>
            <li class="fat"><div>Fat</div><div class="value">${fat}g</div></li>
          </ul>
        </div>
      </li>`
  );
};

const db = getFirestore(app);
const foodCollectionRef = collection(db, "foodEntries");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const nameValue = nameInput.value;
  const carbsValue = parseInt(carbsInput.value);
  const proteinValue = parseInt(proteinInput.value);
  const fatValue = parseInt(fatInput.value);

  if (!nameValue || !carbsValue || !proteinValue || !fatValue) {
    snackbar.show("Please fill in all fields.");
    return;
  }

  addDoc(foodCollectionRef, {
    name: nameValue,
    carbs: carbsValue,
    protein: proteinValue,
    fat: fatValue,
    timestamp: new Date(),
  })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      snackbar.show("Food added successfully.");

      displayEntry(nameValue, carbsValue, proteinValue, fatValue);
      render();

      nameInput.value = "";
      carbsInput.value = "";
      proteinInput.value = "";
      fatInput.value = "";
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      snackbar.show("Error adding food.");
    });
});

const init = () => {
  getDocs(foodCollectionRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const foodData = doc.data();

        displayEntry(
          foodData.name,
          foodData.carbs,
          foodData.protein,
          foodData.fat
        );
      });
      render();
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });
};

let chartInstance = null;
const renderChart = () => {
  chartInstance?.destroy();
  const context = document.querySelector("#app-chart").getContext("2d");

  chartInstance = new Chart(context, {
    type: "bar",
    data: {
      labels: ["Carbs", "Protein", "Fat"],
      datasets: [
        {
          label: "Macronutrients",
          data: [
            appData.getTotalCarbs(),
            appData.getTotalProtein(),
            appData.getTotalFat(),
          ],
          backgroundColor: ["#25AEEE", "#FECD52", "#57D269"],
          borderWidth: 3,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

const totalCalories = document.querySelector("#total-calories");

const updateTotalCalories = () => {
  totalCalories.textContent = appData.getTotalCalories();
};

const render = () => {
  renderChart();
  updateTotalCalories();
};
init();
