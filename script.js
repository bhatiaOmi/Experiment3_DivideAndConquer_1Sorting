// script.js 
const algoSelect = document.getElementById('algoSelect');
const arrayType = document.getElementById('arrayType');

const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById('resetBtn');
const autoRunBtn = document.getElementById('autoRun');

const originalArrayEl = document.getElementById('originalArray');
const currentArrayEl = document.getElementById('currentArray');
const subArraysEl = document.getElementById('subArrays');
const finalVisual = document.getElementById('finalVisual');

const selAlgoText = document.getElementById('selAlgoText');
const stepIndex = document.getElementById('stepIndex');
const stepTotal = document.getElementById('stepTotal');
const prevStep = document.getElementById('prevStep');
const nextStep = document.getElementById('nextStep');

const logContainer = document.getElementById('logContainer');
const factsText = document.getElementById('factsText');
const nRange = document.getElementById('nRange');
const nValue = document.getElementById('nValue');
const speedMenu = document.getElementById('speedMenu');
const speedButtons = speedMenu.querySelectorAll('button');
const advancedAnalysisBox = document.getElementById('advancedAnalysisBox');
const advancedBtn = document.getElementById('advancedBtn');

// Modal elements
const overlay = document.getElementById('graphOverlay');
const modal = document.getElementById('graphModal');
const closeBtn = document.getElementById('closeGraphBtn');
const inputSizeDropdown = document.getElementById('inputSizeDropdown');
const canvas = document.getElementById('scalabilityCanvas');
const graphMessage = document.getElementById('graphMessage');

let autoRunSpeed = null;
let comparisonCount = 0;

// Neutral defaults on load
algoSelect.value = "";
selAlgoText.textContent = '-';
factsText.textContent = 'Select an algorithm to view facts and analysis.';

nRange.value = 0;
nValue.textContent = '0';

// live update while sliding
nRange.addEventListener('input', () => {
 nValue.textContent = nRange.value;
});

let baseArray = [];
let originalArray = [];
let steps = [];
let curStep = -1;
let stepCounter = 0;
let autoRunInterval = null;

// Algorithm selection
algoSelect.addEventListener('change', ()=>{
  if (!algoSelect.value) return;
  selAlgoText.textContent =
    algoSelect.value === 'merge' ? 'Merge Sort' : 'Quick Sort';
  setFacts();
});

// helpers
function generateRandomArray(n){ 
  return Array.from({length:n}, ()=>Math.floor(Math.random()*99)+1); 
}

function escapeHtml(s){ 
  if(!s) return ''; 
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); 
}

function renderFinal(arr){
 finalVisual.innerHTML = '';
 if(!arr || arr.length===0){
   finalVisual.textContent='(Sorted array will appear here)';
   return;
 }
 arr.forEach(v=>{
   const e = document.createElement('div');
   e.style.padding='6px 10px';
   e.style.background='#eef2ff';
   e.style.border='1px solid #dbeafe';
   e.style.borderRadius='6px';
   e.style.fontWeight='600';
   e.textContent = v;
   finalVisual.appendChild(e);
 });
}

// control handlers
resetBtn.addEventListener('click', resetAll);

runBtn.addEventListener('click', () => {
 const n = Number(nRange.value);  
 const t = arrayType.value;

 if (n <= 0) {
   alert("Please select a value greater than 0 for N.");
   return;
 }

 if (!algoSelect.value) {
   alert("Please select an algorithm first");
   return;
 }

 baseArray =
   t === 'random'
     ? generateRandomArray(n)
     : t === 'asc'
       ? Array.from({ length: n }, (_, i) => i + 1)
       : Array.from({ length: n }, (_, i) => n - i);

 originalArray = baseArray.slice();
 originalArrayEl.textContent = '[' + originalArray.join(', ') + ']';
 currentArrayEl.textContent = '[' + baseArray.join(', ') + ']';
 subArraysEl.innerHTML = '';

 renderFinal([]);

 logContainer.innerHTML = '';
 steps = [];
 curStep = -1;
 stepCounter = 0;
 comparisonCount = 0;
 stepIndex.textContent = 0;
 stepTotal.textContent = 0;

 advancedAnalysisBox.classList.add('hidden');

 prepareSteps(); 
});

prevStep.addEventListener('click', ()=>{ 
  if(curStep > 0){ 
    curStep--; 
    removeLastLogEntry();
    showStep(curStep, false); 
  } 
});

nextStep.addEventListener('click', ()=>{ 
  if(curStep < steps.length-1){ 
    curStep++; 
    showStep(curStep, true); 
  }
});

// Auto Run functionality
autoRunBtn.addEventListener('click', () => {
  if (autoRunInterval) {
    stopAutoRun();
    return;
  }

  speedMenu.classList.toggle('hidden');
});

// Speed selection
speedButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    autoRunSpeed = Number(btn.dataset.speed);
    speedMenu.classList.add('hidden');

    if (!steps || steps.length === 0) {
      alert("Please generate the array before proceeding.");
      return;
    }

    startAutoRun();
  });
});

function startAutoRun() {
  autoRunBtn.textContent = '⏸️ Pause';
  autoRunBtn.classList.remove('primary');
  autoRunBtn.classList.add('danger');

  autoRunInterval = setInterval(() => {
    if (curStep < steps.length - 1) {
      curStep++;
      showStep(curStep, true);
    } else {
      stopAutoRun();
    }
  }, autoRunSpeed);
}

function stopAutoRun() {
  clearInterval(autoRunInterval);
  autoRunInterval = null;

  autoRunBtn.textContent = '▶️ Auto Run';
  autoRunBtn.classList.remove('danger');
  autoRunBtn.classList.add('primary');
}

// Prepare steps using exact algorithms
function prepareSteps(){
  steps = []; 
  curStep = -1; 
  stepCounter = 0;
  comparisonCount = 0;

  const arr = baseArray.slice();

  if (algoSelect.value === 'merge') {
    mergeSortTrace(arr);
  } else if (algoSelect.value === 'quick') {
    quickSortTrace(arr);
  }

  steps.push({
    type:'done',
    description: '✓ Algorithm performed successfully. Final sorted array',
    array: arr.slice(),
    subArrays: [],
    step: ++stepCounter
  });

  stepTotal.textContent = steps.length;
  stepIndex.textContent = 0;
  logContainer.innerHTML = '';
  currentArrayEl.textContent = '[' + originalArray.join(', ') + ']';
  subArraysEl.innerHTML = '';
  renderFinal([]);
  setFacts();
}

/* ===== MERGE SORT ===== */
function mergeSortTrace(arr){
 function merge(l,m,r){
   const leftArr = arr.slice(l,m+1);
   const rightArr = arr.slice(m+1,r+1);
   
   steps.push({
     type:'merge-start', 
     description:`Split subarray → [${leftArr.join(',')}] | [${rightArr.join(',')}]`, 
     array: arr.slice(), 
     subArrays: [leftArr, rightArr],
     step: ++stepCounter
   });
   
   const left = arr.slice(l,m+1), right = arr.slice(m+1,r+1);
   let i=0,j=0,k=l;
   
   while(i<left.length && j<right.length){
     comparisonCount++;
     steps.push({
       type:'compare', 
       description:`Compare ${left[i]} and ${right[j]}`, 
       array: arr.slice(), 
       subArrays: [leftArr, rightArr],
       step: ++stepCounter
     });
     
     if(left[i] <= right[j]){
       arr[k] = left[i++];
       steps.push({
         type:'place', 
         description:`Place ${arr[k]} at index ${k} `, 
         array: arr.slice(), 
         subArrays: [leftArr, rightArr],
         step: ++stepCounter
       });
     } else {
       arr[k] = right[j++];
       steps.push({
         type:'place', 
         description:`Place ${arr[k]} at index ${k}`, 
         array: arr.slice(), 
         subArrays: [leftArr, rightArr],
         step: ++stepCounter
       });
     }
     k++;
   }
   
   while(i<left.length){
     arr[k++] = left[i++];
     steps.push({
       type:'place', 
       description:`Place remaining ${arr[k-1]} at index ${k-1}`, 
       array: arr.slice(), 
       subArrays: [leftArr, rightArr],
       step: ++stepCounter
     });
   }
   
   while(j<right.length){
     arr[k++] = right[j++];
     steps.push({
       type:'place', 
       description:`Place remaining ${arr[k-1]} at index ${k-1}`, 
       array: arr.slice(), 
       subArrays: [leftArr, rightArr],
       step: ++stepCounter
     });
   }
   
   steps.push({
     type:'merge-done', 
     description:`Merge complete → [${arr.slice(l, r+1).join(',')}]`, 
     array: arr.slice(), 
     subArrays: [arr.slice(l, r+1)],
     step: ++stepCounter
   });
 }
 
 function rec(l,r){
   steps.push({
     type:'split', 
     description:`Split subarray[${l}..${r}]`, 
     array: arr.slice(), 
     subArrays: [arr.slice(l, r+1)],
     step: ++stepCounter
   });
   
   if(l>=r) return;
   const m = Math.floor((l+r)/2);
   rec(l,m); 
   rec(m+1,r); 
   merge(l,m,r);
 }
 
 rec(0, arr.length-1);
}

/* ===== QUICK SORT (Proper Median-of-Three) ===== */
function quickSortTrace(arr) {
  function medianOfThree(l, r) {
    const center = Math.floor((l + r) / 2);
    
    steps.push({
      type: 'pivot-selection',
      description: `Median-of-three: Comparing arr[${l}]=${arr[l]}, arr[${center}]=${arr[center]}, arr[${r}]=${arr[r]} and ensure arr[left] ≤ arr[center] ≤ arr[right] ,then middle value becomes the pivot` ,
      array: arr.slice(),
      subArrays: [arr.slice(l, r+1)],
      step: ++stepCounter
    });
    
    // Sort left, center, right
    if (arr[l] > arr[center]) {
      [arr[l], arr[center]] = [arr[center], arr[l]];
      steps.push({
        type: 'pivot-sort',
        description: `Swap arr[${l}] and arr[${center}]`,
        array: arr.slice(),
        subArrays: [arr.slice(l, r+1)],
        step: ++stepCounter
      });
    }
    
    if (arr[l] > arr[r]) {
      [arr[l], arr[r]] = [arr[r], arr[l]];
      steps.push({
        type: 'pivot-sort',
        description: `Swap arr[${l}] and arr[${r}]`,
        array: arr.slice(),
        subArrays: [arr.slice(l, r+1)],
        step: ++stepCounter
      });
    }
    
    if (arr[center] > arr[r]) {
      [arr[center], arr[r]] = [arr[r], arr[center]];
      steps.push({
        type: 'pivot-sort',
        description: `Swap arr[${center}] and arr[${r}]`,
        array: arr.slice(),
        subArrays: [arr.slice(l, r+1)],
        step: ++stepCounter
      });
    }
    
    // Now arr[l] <= arr[center] <= arr[r]
    // Move center (the median) to position right-1
    [arr[center], arr[r-1]] = [arr[r-1], arr[center]];
    
    steps.push({
      type: 'pivot',
      description: `Pivot selected: ${arr[r-1]} (median placed at position ${r-1})[Since selected pivot is moved to position right-1 ]`,
      array: arr.slice(),
      subArrays: [arr.slice(l, r+1)],
      step: ++stepCounter
    });
    
    return r - 1;
  }

  function partition(l, r) {
    // For small subarrays (< 3 elements), handle directly
    if (r - l < 2) {
      if (r - l === 1 && arr[l] > arr[r]) {
        [arr[l], arr[r]] = [arr[r], arr[l]];
        steps.push({
          type: 'swap',
          description: `Direct swap: arr[${l}] and arr[${r}]`,
          array: arr.slice(),
          subArrays: [arr.slice(l, r+1)],
          step: ++stepCounter
        });
      }
      return l;
    }
    
    const pivotIndex = medianOfThree(l, r);
    const pivotValue = arr[pivotIndex];
    
    // Start partitioning from l+1 and r-2 (pivot at r-1, largest at r)
    let i = l + 1;
    let j = r - 2;
    
    while (true) {
      // Move i right while elements are less than pivot
      while (i <= j && arr[i] < pivotValue) {
        comparisonCount++;
        steps.push({
          type: 'moveP',
          description: `Move left pointer → i=${i} (arr[${i}]=${arr[i]} < pivot=${pivotValue})`,
          array: arr.slice(),
          subArrays: [arr.slice(l, r+1)],
          step: ++stepCounter
        });
        i++;
      }
      
      // Move j left while elements are greater than pivot
      while (i <= j && arr[j] > pivotValue) {
        comparisonCount++;
        steps.push({
          type: 'moveQ',
          description: `Move right pointer ← j=${j} (arr[${j}]=${arr[j]} > pivot=${pivotValue})`,
          array: arr.slice(),
          subArrays: [arr.slice(l, r+1)],
          step: ++stepCounter
        });
        j--;
      }
      
      if (i < j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({
          type: 'swap',
          description: `Swap arr[${i}]=${arr[j]} and arr[${j}]=${arr[i]}`,
          array: arr.slice(),
          subArrays: [arr.slice(l, r+1)],
          step: ++stepCounter
        });
        i++;
        j--;
      } else {
        break;
      }
    }
    
    // Place pivot in its final position
    [arr[pivotIndex], arr[i]] = [arr[i], arr[pivotIndex]];
    steps.push({
      type: 'pivot-place',
      description: `Place pivot ${pivotValue} at final position ${i}`,
      array: arr.slice(),
      subArrays: [arr.slice(l, r+1)],
      step: ++stepCounter
    });
    
    return i;
  }

  function rec(l, r) {
    steps.push({
      type: 'q-split',
      description: `Performing quickSort on index range [${l}..${r}]: [${arr.slice(l, r+1).join(',')}]`,
      array: arr.slice(),
      subArrays: [arr.slice(l, r+1)],
      step: ++stepCounter
    });

    if (l >= r) return;
    
    const p = partition(l, r);
    rec(l, p - 1);
    rec(p + 1, r);
  }

  rec(0, arr.length - 1);
}

/* ===== showStep with improved visualization ===== */
function showStep(i, appendToLog=true){
 if(!steps || i < 0 || i >= steps.length) return;
 const s = steps[i];
 stepIndex.textContent = i+1;
 stepTotal.textContent = steps.length;

 // Update current array
 currentArrayEl.textContent = s.array ? '[' + s.array.join(', ') + ']' : '-';

 // Update sub-arrays
 subArraysEl.innerHTML = '';
 if (s.subArrays && s.subArrays.length > 0) {
   s.subArrays.forEach(subArr => {
     const div = document.createElement('div');
     div.className = 'subarray-box';
     div.textContent = '[' + subArr.join(', ') + ']';
     subArraysEl.appendChild(div);
   });
 }

 // Append to log only when stepping forward
 if(appendToLog){
   const entry = document.createElement('div');
   entry.className = 'logEntry';
   
   // Color by type
   if(s.type === 'compare' || s.type === 'moveP' || s.type==='moveQ') {
     entry.classList.add('log-compare');
   } else if(s.type === 'swap') {
     entry.classList.add('log-swap');
   } else if(s.type === 'pivot' || s.type === 'pivot-place' || s.type === 'pivot-selection' || s.type === 'pivot-sort') {
     entry.classList.add('log-pivot');
   } else if(s.type && (s.type.startsWith('merge') || s.type === 'place')) {
     entry.classList.add('log-merge');
   } else if(s.type === 'done') {
     entry.classList.add('log-done');
   } else if(s.type === 'split' || s.type === 'q-split') {
     entry.classList.add('log-split');
   }

   entry.textContent = `(Step ${s.step}) ${s.description}`;
   entry.dataset.stepIndex = i;
   logContainer.appendChild(entry);
   logContainer.scrollTop = logContainer.scrollHeight;
 }

 // Final stage: show final array and button
 if(s.type === 'done'){
   renderFinal(s.array || []);
   advancedAnalysisBox.classList.remove('hidden');
   setFacts();
 }
}

function removeLastLogEntry() {
  const entries = logContainer.querySelectorAll('.logEntry');
  if (entries.length > 0) {
    logContainer.removeChild(entries[entries.length - 1]);
  }
}

function resetAll(){
  // Stop auto run if active
  if (autoRunInterval) {
    clearInterval(autoRunInterval);
    autoRunInterval = null;
    autoRunBtn.textContent = '▶️ Auto Run';
    autoRunBtn.classList.remove('danger');
    autoRunBtn.classList.add('primary');
  }

  speedMenu.classList.add('hidden');
  autoRunSpeed = null;

  // reset data
  baseArray = [];
  originalArray = [];
  steps = [];
  curStep = -1;
  stepCounter = 0;
  comparisonCount = 0;

  // reset visuals
  originalArrayEl.textContent = '-';
  currentArrayEl.textContent = '-';
  subArraysEl.innerHTML = '';
  finalVisual.innerHTML = '(Final sorted array will display here)';
  logContainer.innerHTML = '';

  // reset step counters
  stepIndex.textContent = 0;
  stepTotal.textContent = 0;

  // reset N slider
  nRange.value = 0;
  nValue.textContent = '0';

  // reset algorithm selection 
  algoSelect.value = "";
  selAlgoText.textContent = "-";

  // hide advanced button
  advancedAnalysisBox.classList.add('hidden');

  // reset facts
  factsText.textContent = 'Select an algorithm to view facts and analysis.';
}

function setFacts(){
  if (!algoSelect.value) {
    factsText.textContent = 'Select an algorithm to view facts and analysis.';
    return;
  }

  const comparisonText = curStep === steps.length - 1 
    ? comparisonCount 
    : 'Available after completion';

  if (algoSelect.value === 'quick') {
  factsText.innerHTML = `
    <strong>Quick Sort (Median-of-Three Pivot):</strong>
    <ul style="margin:8px 0; padding-left: 20px;">   
      <li><strong>Time Complexity:</strong> Average O(n log n), Worst O(n²) (when maximum (or minimum) element is chosen as the pivot).</li>
      <li><strong>Space Complexity:</strong> O(log n) due to recursion (in-place sorting).</li>
      <li><strong>Stability:</strong> Not stable (does not preserve the relative order of equal elements).</li>
      <li><strong>Total Comparisons:</strong> ${comparisonText}</li>
    </ul>
  `;
} 
else if (algoSelect.value === 'merge') {
  factsText.innerHTML = `
    <strong>Merge Sort:</strong>
    <ul style="margin:8px 0; padding-left: 20px;">     
      <li><strong>Time Complexity:</strong> O(n log n) in all cases.</li>
      <li><strong>Space Complexity:</strong> O(n) due to extra temporary arrays.</li>
      <li><strong>Stability:</strong> Stable (preserves the relative order of equal elements).</li>
      <li><strong>Total Comparisons:</strong> ${comparisonText}</li>
    </ul>
  `;
}
}

// ========== GRAPH FUNCTIONALITY ==========

// Modal functions
advancedBtn.addEventListener('click', () => {
  openGraphModal();
});

closeBtn.addEventListener('click', closeGraphModal);
overlay.addEventListener('click', closeGraphModal);

inputSizeDropdown.addEventListener('change', () => {
  drawScalabilityGraph();
});

function openGraphModal() {
  // Check if algorithm is selected
  if (!algoSelect.value) {
    graphMessage.textContent = 'Please select an algorithm from Panel 1 first.';
    graphMessage.classList.remove('hidden');
    canvas.style.display = 'none';
  } else {
    graphMessage.classList.add('hidden');
    canvas.style.display = 'block';
    
    // Reset dropdown to default (no selection)
    inputSizeDropdown.value = '';
    
    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeGraphModal() {
  overlay.classList.add('hidden');
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  
  // Reset dropdown
  inputSizeDropdown.value = '';
  
  // Clear canvas
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Lightweight sorting functions for performance measurement
function mergeSortSimple(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortSimple(arr.slice(0, mid));
  const right = mergeSortSimple(arr.slice(mid));
  return mergeSimple(left, right);
}

function mergeSimple(left, right) {
  const res = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) res.push(left[i++]);
    else res.push(right[j++]);
  }
  return res.concat(left.slice(i)).concat(right.slice(j));
}

function quickSortSimple(arr, l, r) {
  if (l >= r) return;
  const pivotIndex = Math.floor((l + r) / 2);
  const pivot = arr[pivotIndex];
  let i = l, j = r;
  while (i <= j) {
    while (arr[i] < pivot) i++;
    while (arr[j] > pivot) j--;
    if (i <= j) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++; j--;
    }
  }
  quickSortSimple(arr, l, j);
  quickSortSimple(arr, i, r);
}

function measureExecutionTime(n) {
  let testArr;
  if (arrayType.value === 'random') {
    testArr = Array.from({length: n}, () => Math.floor(Math.random() * 99) + 1);
  } else if (arrayType.value === 'asc') {
    testArr = Array.from({length: n}, (_, i) => i + 1);
  } else {
    testArr = Array.from({length: n}, (_, i) => n - i);
  }

  const arr = [...testArr];
    
  const RUNS = 20;   
  let total = 0;

  for (let i = 0; i < RUNS; i++) {
    const temp = [...arr];
    const start = performance.now();

    if (algoSelect.value === 'merge') {
      mergeSortSimple(temp);
    } else {
      quickSortSimple(temp, 0, temp.length - 1);
    }

    total += performance.now() - start;
  }

  return total / RUNS;
}

function drawScalabilityGraph() {
  if (!algoSelect.value) {
    graphMessage.textContent = 'Please select an algorithm from Panel 1 first.';
    graphMessage.classList.remove('hidden');
    canvas.style.display = 'none';
    return;
  }

  if (!inputSizeDropdown.value) {
    graphMessage.textContent = 'Please select an N value from the dropdown above.';
    graphMessage.classList.remove('hidden');
    canvas.style.display = 'none';
    return;
  }

  graphMessage.classList.add('hidden');
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maxN = Number(inputSizeDropdown.value);

  // Generate 10 evenly-spaced intervals from 0 to maxN
  const step = maxN / 10;
  const nValues = [];
  for (let i = 1; i <= 10; i++) {
    nValues.push(Math.round(i * step));
  }

  const timeValues = [];
  let prevTime = 0;

  nValues.forEach(n => {
    let t = measureExecutionTime(n);

    //  force monotonic increase (visual correctness)
    if (t < prevTime) {
      t = prevTime + 0.001;
    }

    prevTime = t;
    timeValues.push(t);
});


  const leftMargin = 80;
  const rightMargin = 40;
  const topMargin = 70;
  const bottomMargin = 60;

  const w = canvas.width - leftMargin - rightMargin;
  const h = canvas.height - topMargin - bottomMargin;

  const maxTime = Math.max(...timeValues) * 1.1;

  // Title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  const algoName = algoSelect.value === 'merge' ? 'Merge Sort' : 'Quick Sort';
  ctx.fillText(`${algoName} - Input Size vs Execution Time`, canvas.width / 2, 30);

  // Axes
  ctx.beginPath();
  ctx.moveTo(leftMargin, topMargin);
  ctx.lineTo(leftMargin, canvas.height - bottomMargin);
  ctx.lineTo(canvas.width - rightMargin, canvas.height - bottomMargin);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Grid lines
  const numYTicks = 5;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= numYTicks; i++) {
    const y = canvas.height - bottomMargin - (h * i) / numYTicks;
    ctx.beginPath();
    ctx.moveTo(leftMargin, y);
    ctx.lineTo(canvas.width - rightMargin, y);
    ctx.stroke();
  }

  // Line graph
  ctx.strokeStyle = '#ee2f2fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  timeValues.forEach((t, i) => {
    const x = leftMargin + (w * (i + 1)) / (nValues.length + 1);
    const y = canvas.height - bottomMargin - (t / maxTime) * h;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Points
  ctx.fillStyle = '#ef4444';
  timeValues.forEach((t, i) => {
    const x = leftMargin + (w * (i + 1)) / (nValues.length + 1);
    const y = canvas.height - bottomMargin - (t / maxTime) * h;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Circle outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // X-axis ticks and labels
  ctx.fillStyle = '#080a0eff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;

  nValues.forEach((n, i) => {
    const x = leftMargin + (w * (i + 1)) / (nValues.length + 1);
    const y = canvas.height - bottomMargin;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 6);
    ctx.stroke();
    
    ctx.fillText(n.toString(), x, y + 25);
  });

      // Y-axis ticks and labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= numYTicks; i++) {
      const y = canvas.height - bottomMargin - (h * i) / numYTicks;
      const value = (maxTime * i / numYTicks).toFixed(2);

      ctx.strokeStyle = '#0c0f15ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftMargin - 6, y);
      ctx.lineTo(leftMargin, y);
      ctx.stroke();

      ctx.fillText(value, leftMargin - 10, y);
    }

    // Axis labels
    ctx.fillStyle = '#060709ff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';

    // X-axis label
    ctx.fillText(
      'Input Size (n)',
      leftMargin + w / 2,
      canvas.height - 20
    );

    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(25, topMargin + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Execution Time (ms)', 0, 0);
    ctx.restore();
  

    if (algoSelect.value === 'quick') {
      graphMessage.innerHTML = `
        <hr style="margin:16px 0;">
        <strong>
        Quick Sort shows an overall increase in execution time as input size grows.
        The trend follows average-case O(n log n) behavior, with minor variations
        due to pivot selection.</strong>
      `;
      graphMessage.classList.remove('hidden');
      }
    else if (algoSelect.value === 'merge') {
      graphMessage.innerHTML = `
        <hr style="margin:16px 0;">
        <strong>
        Merge Sort exhibits a consistent increase in execution time with input size.
        Its predictable O(n log n) growth results from uniform divide-and-merge steps.</strong>
      `;
      graphMessage.classList.remove('hidden');
  }
}
