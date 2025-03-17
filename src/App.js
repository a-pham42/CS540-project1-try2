import './App.css';
import React, { useState, useEffect, useMemo } from 'react';
import html2canvas from "html2canvas"; // import html2canvas
import { Bar } from 'react-chartjs-2';  // import chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register( // register chart.js components
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// allow user to set the number of processes (1-9)
function NumberOfProcesses() {
  const [numberInput, setNumberInput] = useState(''); // initial value is empty

  // handle changes in the input field
  function handleInputChange(event) {
    const value = parseInt(event.target.value, 10); // convert user input into an integer
    if (!isNaN(value) && value >= 1 && value <= 9) { // only update state of numberInput if user entered a valid input
      setNumberInput(value);
    } else if (event.target.value === '') { // allow empty input if user clears input
      setNumberInput('');
    }
  }

  return (
    <form>
      <input
        type="text"
        placeholder="Enter number..."
        value={numberInput}
        onChange={handleInputChange}
      />
      <RandomProcessGenerator numOfProcesses={numberInput} />
    </form>
  );
}

// generate random processes & run the scheduling algorithms
function RandomProcessGenerator({ numOfProcesses }) {
  const [randomTimes, setRandomTimes] = useState([]); // initial values are empty
  const [timeQuantum, setTimeQuantum] = useState(50); // add state for timeQuantum, initial value is 50ms

  // function that generates a list of random times from 100ms to 1000ms
  function generateRandomTime(){

    let times = []; // initiallize list "times"
    for(let i = 0; i < numOfProcesses; i++){
      let time = Math.floor(Math.random() * (1000 - 100 + 1)) + 100; // generate random number from 100 to 1000
      times.push(time);
    }
    setRandomTimes(times); // update state of randomTimes
  }

  // only generate times if numOfProcesses > 0
  useEffect(() => {
    if (numOfProcesses > 0) {
      generateRandomTime(); // generate random times
    }
  }, [numOfProcesses]); // re-run whenever numOfProcesses changes

  const namesList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const tableData = useMemo(() => {
    return randomTimes.map((time, index) => ({
      name: namesList[index],
      length: time,
    }));
  }, [randomTimes]);

  return (
    <div>
      <h2>Enter Time Quantum for Round Robin: </h2>
      <TimeQuantumLength setTimeQuantum={setTimeQuantum} />
      <br />
      <ProcessTable processData={tableData} />
      <br />
      <FirstInFirstOut processData={tableData} />
      <br />
      <ShortestJobFirst processData={tableData} />
      <br />
      <ShortestTimeToCompletion processData={tableData} />
      <br />
      <RoundRobin processData={tableData} timeQuantum={timeQuantum} />
      <br />
      <MLFQ processData={tableData} />
    </div>
  );
}


// create table of processes
function ProcessTable({ processData }) {
  return (
    <div>
      <h2>Process Information</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Process</th>
            {processData.map((process) => (
              <td key={process.name}>{process.name}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Process Length (ms)</th>
            {processData.map((process) => (
              <td key={process.name}>{process.length}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}


// allow user to set length of time quantum (for round robin)
function TimeQuantumLength({ setTimeQuantum }) {
  const [value, setValue] = useState(50); // initial value is 50

  // handle the change event when the slider is adjusted
  const handleSliderChange = (event) => {
    const newValue = Number(event.target.value); // convert the value to a number
    setValue(newValue); // update local state for display
    setTimeQuantum(newValue); // update the parent state (RandomProcessGenerator)
  };

  // label positions based on slider min/max values
  const labelPositions = [50, 60, 70, 80, 90, 100];

  return (
    <div>
      <div style={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <input
          type="range"
          min="50"        // min value
          max="100"       // max value
          step="10"       // step value (increments of 10)
          value={value}   // current slider value
          onChange={handleSliderChange}  // event handler for slider change
          style={{
            width: '100%', // make the slider take up 100% of the container's width (which is 20% of the screen)
            display: 'block',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {labelPositions.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
      <p> Time Quantum Length: {value} ms</p>
    </div>
  );  
}


// FIFO algorithm
function FirstInFirstOut({ processData }) {
  const [barData, setBarData] = useState([]); // initial values are empty

  // generate dataset for stacked bar chart
  useEffect(() => {
    const chartData = processData.map((process) => ({
      label: 'Process ' + process.name,
      data: [process.length],
      backgroundColor: getColor(process.name),
      barThickness: 30,
      borderColor: 'darkgray',
      borderWidth: 2,
    }));
    setBarData(chartData);
  }, [processData]); // re-run whenever processData changes

  // options for the stacked bar chart
  const options = {
    responsive: true,
    maintainAspectRatio: false, // allows chart to be resized freely
    indexAxis: 'y', // makes the chart horizontal
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // custom legend order
          generateLabels: (chart) => {
            const originalLabels = chart.data.datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              datasetIndex: index,
            }));
  
            // define the custom order based on the process labels
            const customOrder = [
              'Process A',
              'Process B',
              'Process C',
              'Process D',
              'Process E',
              'Process F',
              'Process G',
              'Process H',
              'Process I',
            ];
  
            // sort the labels according to the custom order
            return originalLabels.sort((a, b) => {
              return customOrder.indexOf(a.text) - customOrder.indexOf(b.text);
            });
          },
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true, // start x-axis from 0
        stacked: true, // enable stacking on the x-axis (horizontal axis)
        title: {
          display: true,
          text: 'Time (ms)',
        },
      },
      y: { stacked: true }, // enable stacking on the y-axis (verical axis)
    },
  };

  return (
    <div style={{ width: '75%', height: '150px' }}>
      <h2>FIFO Algorithm</h2>
      <Bar data={{ labels: ['FIFO'], datasets: barData }} options={options} />
    </div>
  );
}


// SJF algorithm
function ShortestJobFirst({ processData }) {
  const [barData, setBarData] = useState([]); // initial values are empty

  useEffect(() => {
    // sort processes from shortest to longest
    const sortedData = [...processData].sort((a, b) => a.length - b.length);
    // generate dataset for stacked bar chart
    const chartData = sortedData.map((process) => ({
      label: 'Process ' + process.name,
      data: [process.length],
      backgroundColor: getColor(process.name),
      barThickness: 30,
      borderColor: 'darkgray',
      borderWidth: 2,
    }));
    setBarData(chartData);
  }, [processData]); // re-run whenever processData changes

  // options for stacked bar chart
  const options = {
    responsive: true,
    maintainAspectRatio: false, // allows chart to be resized freely
    indexAxis: 'y', // makes the chart horizontal
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // custom legend order
          generateLabels: (chart) => {
            const originalLabels = chart.data.datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              datasetIndex: index,
            }));
  
            // define the custom order based on the process labels
            const customOrder = [
              'Process A',
              'Process B',
              'Process C',
              'Process D',
              'Process E',
              'Process F',
              'Process G',
              'Process H',
              'Process I',
            ];
  
            // sort the labels according to the custom order
            return originalLabels.sort((a, b) => {
              return customOrder.indexOf(a.text) - customOrder.indexOf(b.text);
            });
          },
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true, // start x-axis form 0
        stacked: true, // enable stacking on the x-axis (horizontal axis)
        title: {
          display: true,
          text: 'Time (ms)',
        },
      },
      y: { stacked: true }, // enable stacking on the y-axis (vertical axis)
    },
  };

  return (
    <div style={{ width: '75%', height: '150px' }}>
      <h2>SJF Algorithm</h2>
      <Bar data={{ labels: ['SJF'], datasets: barData }} options={options} />
    </div>
  );
}


// STCF algorithm
function ShortestTimeToCompletion({ processData }) {
  const [barData, setBarData] = useState([]); // initial values are empty

  useEffect(() => {

    const processList = [...processData];
    let currentList = [];
    let STCFList = [];

    let index = 0;

    // processes are still being received
    for (let i = 0; i < processList.length; i++){
      currentList.push({name: processList[i]['name'], length: processList[i]['length']}); // receive next process
      currentList.sort((a, b) => a.length - b.length); // sort list from shortest to longest process

      if (currentList[index]['length'] >= 50){ // if the shortest process is at least 50ms
        STCFList.push({name: currentList[index]['name'], length: 50}); // simulate running shortest process for 50ms
        currentList[index]['length'] = currentList[index]['length'] - 50; // subtract 50ms from shortest process
      } else { // if the shortest process is less than 50ms
        STCFList.push({name: currentList[index]['name'], length: currentList[index]['length']}); // simulate running shortest process
        currentList[index]['length'] = 0; // process has 0ms
        index++; // increment index so the process isn't counted again
      }
    };
    // all processes have been received
    currentList.sort((a, b) => a.length - b.length);
    for (let i = 0; i < processList.length; i++){
      STCFList.push({name: currentList[i]['name'], length: currentList[i]['length']});
    };
    
    // generate dataset for stacked bar chart
    const chartData = STCFList.map((process) => ({
      label: 'Process ' + process.name,
      data: [process.length],
      backgroundColor: getColor(process.name),
      barThickness: 30,
      borderColor: 'darkgray',
      borderWidth: 2,
    }));
    setBarData(chartData);
  }, [processData]); // re-run whenever processData changes

  // options for stacked bar chart
  const options = {
    responsive: true,
    maintainAspectRatio: false, // allows chart to be resized freely
    indexAxis: 'y', // makes the chart horizontal
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // custom legend order
          generateLabels: (chart) => {
            const originalLabels = chart.data.datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              datasetIndex: index,
            }));
  
            // remove duplicate labels based on label and color
            const uniqueLabels = [];
            originalLabels.forEach((label) => {
              // only add label if it's not already added to the uniqueLabels array
              if (!uniqueLabels.some((unique) => unique.text === label.text && unique.fillStyle === label.fillStyle)) {
                uniqueLabels.push(label);
              }
            });

            // define the custom order based on the process labels
            const customOrder = [
              'Process A',
              'Process B',
              'Process C',
              'Process D',
              'Process E',
              'Process F',
              'Process G',
              'Process H',
              'Process I',
            ];
  
            // sort the labels according to the custom order
            return uniqueLabels.sort((a, b) => {
              return customOrder.indexOf(a.text) - customOrder.indexOf(b.text);
            });
          },
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true, // start x-axis form 0
        stacked: true, // enable stacking on the x-axis (horizontal axis)
        title: {
          display: true,
          text: 'Time (ms)',
        },
      },
      y: { stacked: true }, // enable stacking on the y-axis (vertical axis)
    },
  };
  
  return (
    <div style={{ width: '75%', height: '150px' }}>
      <h2>STCF Algorithm</h2>
      <Bar data={{ labels: ['STCF'], datasets: barData }} options={options} />
    </div>
  );
}


// RR algorithm
function RoundRobin({ processData, timeQuantum }) {
  const [barData, setBarData] = useState([]); // initial values are empty

  useEffect(() => {

    let processList = JSON.parse(JSON.stringify(processData)); // create deep copy of processData
    let RRList = [];
    
    let indexList = processList.map((_, index) => index); // create list of indexes of processList
    let indexPointer = 0; // pointer to current index in indexList

    while (indexList.length > 0) {
      let index = indexList[indexPointer]; // get the current process index
      let currentProcess = processList[index]; // get the current process object

      if (currentProcess['length'] >= timeQuantum) { // if current process is at least as long as timeQuantum
        RRList.push({ name: currentProcess['name'], length: timeQuantum }); // simulate running the process for timeQuantum
        processList[index]['length'] -= timeQuantum; // subtract timeQuantum from current process length
        indexPointer = (indexPointer === (indexList.length - 1) ? 0 : indexPointer + 1); // update indexPointer
      } else { // if current process is shorter than timeQuantum
        RRList.push({ name: currentProcess['name'], length: currentProcess['length'] }); // simulate running the rest of the current process
        indexList.splice(indexPointer, 1); // remove the process from the index list
        indexPointer = (indexPointer === (indexList.length) ? 0 : indexPointer); // update indexPointer
      }
    };

    // generate dataset for stacked bar chart
    const chartData = RRList.map((process) => ({
      label: 'Process ' + process.name,
      data: [process.length],
      backgroundColor: getColor(process.name),
      barThickness: 30,
      borderColor: 'darkgray',
      borderWidth: 2,
    }));
    setBarData(chartData);
  }, [processData, timeQuantum]); // re-run whenever processData changes

  // options for stacked bar chart
  const options = {
    responsive: true,
    maintainAspectRatio: false, // allows chart to be resized freely
    indexAxis: 'y', // makes the chart horizontal
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // custom legend order
          generateLabels: (chart) => {
            const originalLabels = chart.data.datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              datasetIndex: index,
            }));
  
            // remove duplicate labels based on label and color
            const uniqueLabels = [];
            originalLabels.forEach((label) => {
              // only add label if it's not already added to the uniqueLabels array
              if (!uniqueLabels.some((unique) => unique.text === label.text && unique.fillStyle === label.fillStyle)) {
                uniqueLabels.push(label);
              }
            });

            // define the custom order based on the process labels
            const customOrder = [
              'Process A',
              'Process B',
              'Process C',
              'Process D',
              'Process E',
              'Process F',
              'Process G',
              'Process H',
              'Process I',
            ];
  
            // sort the labels according to the custom order
            return uniqueLabels.sort((a, b) => {
              return customOrder.indexOf(a.text) - customOrder.indexOf(b.text);
            });
          },
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true, // start x-axis form 0
        stacked: true, // enable stacking on the x-axis (horizontal axis)
        title: {
          display: true,
          text: 'Time (ms)',
        },
      },
      y: { stacked: true }, // enable stacking on the y-axis (vertical axis)
    },
  };

  return (
    <div style={{ width: '75%', height: '150px' }}>
      <h2>RR Algorithm</h2>
      <Bar data={{ labels: ['RR'], datasets: barData }} options={options} />
    </div>
  );
}


// MLFQ algorithm
function MLFQ({ processData }){
  const [barData, setBarData] = useState([]); // initial values are empty

  useEffect(() => {

    let processList = JSON.parse(JSON.stringify(processData)); // create deep copy of processData
    let MLFQList = [];
    
    let indexList = processList.map((_, index) => index); // create list of indexes of processList
    let indexPointer = 0; // pointer to current index in indexList

    const priority1time = 50;
    const priority2time = 100;
    const priority3time = 200;
    let priorities = new Array(indexList.length).fill(1); // create list of priorities, where each process has an initial priority of 1
    let timeAllotment = new Array(indexList.length).fill(2 * priority1time); // create list of time allotments, where each process has an initial allotment of 100ms

    while (indexList.length > 0) {
      let index = indexList[indexPointer]; // get the current process index
      let currentProcess = processList[index]; // get the current process object
      let currentPriority = priorities[index]; // get the current process priority

      // set timeQuantum based on queue priority
      let timeQuantum = 1000;
      if (currentPriority === 1) {
        timeQuantum = priority1time;
      } else if (currentPriority === 2) {
        timeQuantum = priority2time;
      } else if (currentPriority === 3) {
        timeQuantum = priority3time;
      }

      
      if (currentProcess['length'] >= timeQuantum) { // if current process is at least as long as timeQuantum
        MLFQList.push({ name: currentProcess['name'], length: timeQuantum}); // simulate running the process for timeQuantum
        processList[index]['length'] -= timeQuantum; // subtract timeQuantum from current process length
        timeAllotment[index] -= timeQuantum; // update time allotment 
        indexPointer = (indexPointer === (indexList.length - 1) ? 0 : indexPointer + 1); // update indexPointer
        if (timeAllotment[index] <= 0){ // check if process priority should be changed
          timeAllotment[index] = (priorities[index] === (3) ? (2 * priority1time) : (4 * timeQuantum)); // update time allotment
          priorities[index] = priorities[index] === 3 ? 1 : Math.min(3, Math.max(1, priorities[index] + 1)); // update priority
        }
      } else { // if current process is shorter than timeQuantum
        MLFQList.push({name: currentProcess['name'], length: currentProcess['length'] }); // simulate running the rest of the current process
        indexList.splice(indexPointer, 1); // remove the process from the index list
        indexPointer = (indexPointer === (indexList.length) ? 0 : indexPointer); // update indexPointer
      }
    };

    // generate dataset for stacked bar chart
    const chartData = MLFQList.map((process) => ({
      label: 'Process ' + process.name,
      data: [process.length],
      backgroundColor: getColor(process.name),
      barThickness: 30,
      borderColor: 'darkgray',
      borderWidth: 2,
    }));
    setBarData(chartData);
  }, [processData]); // re-run whenever processData changes

  // options for stacked bar chart
  const options = {
    responsive: true,
    maintainAspectRatio: false, // allows chart to be resized freely
    indexAxis: 'y', // makes the chart horizontal
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // custom legend order
          generateLabels: (chart) => {
            const originalLabels = chart.data.datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              datasetIndex: index,
            }));
  
            // remove duplicate labels based on label and color
            const uniqueLabels = [];
            originalLabels.forEach((label) => {
              // only add label if it's not already added to the uniqueLabels array
              if (!uniqueLabels.some((unique) => unique.text === label.text && unique.fillStyle === label.fillStyle)) {
                uniqueLabels.push(label);
              }
            });

            // define the custom order based on the process labels
            const customOrder = [
              'Process A',
              'Process B',
              'Process C',
              'Process D',
              'Process E',
              'Process F',
              'Process G',
              'Process H',
              'Process I',
            ];
  
            // sort the labels according to the custom order
            return uniqueLabels.sort((a, b) => {
              return customOrder.indexOf(a.text) - customOrder.indexOf(b.text);
            });
          },
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true, // start x-axis form 0
        stacked: true, // enable stacking on the x-axis (horizontal axis)
        title: {
          display: true,
          text: 'Time (ms)',
        },
      },
      y: { stacked: true }, // enable stacking on the y-axis (vertical axis)
    },
  };

  return (
    <div style={{ width: '75%', height: '150px' }}>
      <h2>MLFQ Algorithm</h2>
      <Bar data={{ labels: ['MLFQ'], datasets: barData }} options={options} />
    </div>
  );
}


// save webpage as a PDF
function SaveAsPDF() {
  const handleSavePDF = async () => {
    // capture full webpage
    const canvas = await html2canvas(document.documentElement, {
      scale: 2, // higher quality
      useCORS: true, // ensure images load correctly
      backgroundColor: null, // preserve transparency and colors
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    // open image in a new tab with forced color printing
    const newTab = window.open();
    newTab.document.write(`
      <html>
        <head>
          <title>Save as PDF</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body style="margin:0;">
          <img src="${imgData}" style="width:100%;" onload="window.print();">
        </body>
      </html>
    `);
    newTab.document.close();
  };

  return (
    <button onClick={handleSavePDF} style={{ margin: "10px", padding: "10px" }}>
      Save Webpage as PDF
    </button>
  );
}


// helper function to return color based on process name
function getColor(name) {
  const colors = {
    A: 'pink',
    B: 'salmon',
    C: 'sandybrown',
    D: 'palegoldenrod',
    E: 'lightgreen',
    F: 'mediumseagreen',
    G: 'turquoise',
    H: 'royalblue',
    I: 'mediumpurple',
  };
  return colors[name] || 'gray';
}


export default function MyApp() {
  return (
    <div>
      <h1>Welcome to the Process Scheduling Algorithm Simulator</h1>
      <br />
      <h2>How This Simulator Works:</h2>
      <ul>
        <li>Choose the number of processes to be run (from 1-9)</li>
        <li>The runtime of each process is randomly generated (from 100ms-1000ms)</li>
        <li>Choose the time quantum for the RR algorithm (from 50ms-100ms)</li>
        <li>The final timeline of each process scheduling algorithm will be displayed below</li>
        
        <li>For <strong>STCF</strong>:
            <ul class="indent">
                <li>Assume processes arrive 50ms from each other</li>
                <li>(Ex: Process A arrives at 0ms, Process B arrives at 50ms, etc.)</li>
            </ul>
        </li>
        
        <li>For <strong>MLFQ</strong>:
            <ul class="indent">
                <li>There are three queues: top, middle, and bottom</li>
                <ul class="indent">
                    <li>Top priority has a time quantum of 50ms</li>
                    <li>Middle priority has a time quantum of 100ms</li>
                    <li>Bottom priority has a time quantum of 200ms</li>
                </ul>
                <li>Time allotment for each priority is (2 × time quantum of that priority)</li>
                <li>Processes get a priority boost when they run twice in each priority</li>
            </ul>
        </li>

        <li>A PDF of all of the timeline results can be saved by pressing the button at the bottom of the webpage</li>
      </ul>
      <br />
      <h2>Enter Number of Processes (1-9):</h2>
      <NumberOfProcesses />
      <br />
      <SaveAsPDF />
    </div>
  );
}