// firebase, chart js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, query, limitToLast, onChildAdded } from "firebase/database";
import Chart from "chart.js/auto";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgrcyyM547ICJc6fzbunqWSV64pKlRfZA",
  authDomain: "septic-tank-capacity.firebaseapp.com",
  databaseURL: "https://septic-tank-capacity-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "septic-tank-capacity",
  storageBucket: "septic-tank-capacity.appspot.com",
  messagingSenderId: "445055846573",
  appId: "1:445055846573:web:166f5bcc5e6b8d40e6de24",
  measurementId: "G-M9K3YTLTRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app); 

// CSS
const styles = `
  .capacity-text {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    color: var(--text-color);
    font-weight: 300;
  }

  .status-text {
    color: var(--text-color);
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    font-weight: 300;
  }

  .status {
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 300;
  }

  .time-until-full, .rate-too-low {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    color: var(--secondary-text);
  }
`;
// Fetch tank dimensions from Firebase and update variables
const settingsRef = ref(database, 'septicTankSettings');
onValue(settingsRef, (snapshot) => {
  const settings = snapshot.val();
  const tankHeight = settings.tankHeight || 35;  // cm, default if not set
  const tankLength = settings.tankLength || 45;  // cm
  const tankWidth = settings.tankWidth || 45;    // cm

  // Update septic tank capacity
  const septicTankCapacity = (tankLength * tankWidth * tankHeight) / 1000; // total capacity in liters
  console.log('Tank dimensions updated:', { tankHeight, tankLength, tankWidth, septicTankCapacity });
});

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// variables for the prediction logic
let previousVolume = null;
let previousTimestamp = null;
const tankHeight = 35; // cm
const tankLength = 45; // cm
const tankWidth = 45;  // cm
const septicTankCapacity = (tankLength * tankWidth * tankHeight) / 1000; // total capacity in liters

// Capacity Chart
const ctx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Used', 'Available'],
    datasets: [{
      label: 'Septic Tank Capacity',
      data: [0, 100],  // Initial values: 0% used, 100% available
      backgroundColor: ['#FF5A5F', '#82CFFF'],  // Updated colors
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting legend colors
          },
          font: {
            family: 'Poppins',  // Matching font
            size: 14
          }
        }
      }
    }
  }
});

// Historical Chart
const historicalCtx = document.getElementById('historicalChart').getContext('2d');
const historicalChart = new Chart(historicalCtx, {
  type: 'line',
  data: {
    labels: [],  // Timestamps
    datasets: [{
      label: 'Septic Tank Levels Over Time',
      data: [],  // Capacity percentages over time
      borderColor: '#82CFFF',
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting legend colors
          },
          font: {
            family: 'Poppins',
            size: 14
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time and Date',  // X-axis label
          font: {
            size: 14,
            family: 'Poppins'
          },
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting X-axis label colors
          }
        },
        ticks: {
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting X-axis ticks color
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Septic Tank Capacity (%)',  // Y-axis label
          font: {
            size: 14,
            family: 'Poppins'
          },
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting Y-axis label colors
          }
        },
        ticks: {
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting Y-axis ticks color
          }
        },
        min: 0,  // Start Y-axis from 0
        max: 100 // Maximum value for the Y-axis
      }
    }
  }
});

// update capacity and status
function updateCapacity(capacity) {
  const available = 100 - capacity;
  capacityChart.data.datasets[0].data = [capacity, available];
  capacityChart.update();

  document.getElementById("capacity").innerHTML = `
    <span class="capacity-text">Capacity: ${capacity}%</span>`;

  let status;
  if (capacity < 75) {
    status = 'Normal';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: green;"><strong>${status}</strong></span>`;
  } else if (capacity >= 75 && capacity <= 85) {
    status = 'Above Normal';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: yellow;"><strong>${status}</strong></span>`;
  } else if (capacity >= 86 && capacity <= 95) {
    status = 'Critical';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: orange;"><strong>${status}</strong></span>`;
  } else if (capacity > 95) {
    status = 'Full';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: red;"><strong>${status}</strong></span>`;
  }
}

// update the historical chart
function updateHistoricalChart(capacity, date, timestamp) {
  const label = `${date} ${timestamp}`;  // combine date and timestamp for display
  historicalChart.data.labels.push(label);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// prediction
function calculatePrediction(currentVolume, currentTime) {
  if (previousVolume !== null && previousTimestamp !== null) {
    // difference in volume and time
    const deltaVolume = currentVolume - previousVolume;  // in liters
    const deltaTime = currentTime - previousTimestamp;   // in seconds

    // flow rate (liters per second)
    const flowRate = deltaVolume / deltaTime;

    // remaining volume (in liters)
    const remainingVolume = septicTankCapacity - currentVolume;

    // estimated time to full (in seconds)
    const estimatedTimeToFull = remainingVolume / flowRate;

    if (flowRate > 0) {
      const hoursToFull = (estimatedTimeToFull / 3600).toFixed(2); // convert to hours
      document.getElementById("prediction").innerHTML = 
        `<span class="time-until-full">The Septic Tank will be full in <strong>${hoursToFull} hours</strong></span>`;
    } else {
      document.getElementById("prediction").innerHTML = 
        `<span class="rate-too-low">Flow rate is too low to estimate time.</span>`;
    }
  }

  // Store current values for next calculation
  previousVolume = currentVolume;
  previousTimestamp = currentTime;
}

// node tree
const septicDataRef = ref(database, 'septicTankData');
const limitedDataRef = query(septicDataRef, limitToLast(10)); // limit last 10 entries only(if daghan na kaayo)

// real time update listener
onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;  // capacity
  const date = data.date;  // date 
  const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString(); // timestamp
  const currentVolume = (capacity / 100) * septicTankCapacity;  // calculate current volume based on capacity

  // update capacity chart and historical chart
  updateCapacity(capacity);
  updateHistoricalChart(capacity, date, timestamp);
  
  // prediction
  calculatePrediction(currentVolume, data.timestamp);
});