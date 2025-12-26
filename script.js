// script.js - Enhanced with proper median-of-three QuickSort
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
   alert("Please choose N > 0");
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
 stepIndex.textContent = 0;
 stepTotal.textContent = 0;

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
    // Stop auto run
    clearInterval(autoRunInterval);
    autoRunInterval = null;
    autoRunBtn.textContent = '▶️ Auto';
    autoRunBtn.classList.remove('danger');
    autoRunBtn.classList.add('primary');
  } else {
    // Start auto run
    if (steps.length === 0) {
      alert("Please generate an array first");
      return;
    }
    autoRunBtn.textContent = '⏸️ Pause';
    autoRunBtn.classList.remove('primary');
    autoRunBtn.classList.add('danger');
    
    autoRunInterval = setInterval(() => {
      if (curStep < steps.length - 1) {
        curStep++;
        showStep(curStep, true);
      } else {
        clearInterval(autoRunInterval);
        autoRunInterval = null;
        autoRunBtn.textContent = '▶️ Auto';
        autoRunBtn.classList.remove('danger');
        autoRunBtn.classList.add('primary');
      }
    }, 800); // 800ms delay between steps
  }
});

// Prepare steps using exact algorithms
function prepareSteps(){
  steps = []; 
  curStep = -1; 
  stepCounter = 0;

  const arr = baseArray.slice();

  if (algoSelect.value === 'merge') {
    mergeSortTrace(arr);
  } else if (algoSelect.value === 'quick') {
    quickSortTrace(arr);
  }

  steps.push({
    type:'done',
    description: '✓ Algorithm finished. Final sorted array.',
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
      description: `QuickSort on index range [${l}..${r}]: [${arr.slice(l, r+1).join(',')}]`,
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

 // Final stage: show final array
 if(s.type === 'done'){
   renderFinal(s.array || []);
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
    autoRunBtn.textContent = '▶️ Auto';
    autoRunBtn.classList.remove('danger');
    autoRunBtn.classList.add('primary');
  }

  // reset data
  baseArray = [];
  originalArray = [];
  steps = [];
  curStep = -1;
  stepCounter = 0;

  // reset visuals
  originalArrayEl.textContent = '-';
  currentArrayEl.textContent = '-';
  subArraysEl.innerHTML = '';
  finalVisual.innerHTML = '(Sorted array will appear here)';
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

  // reset facts
  factsText.textContent = 'Select an algorithm to view facts and analysis.';
}

function setFacts(){
  if (!algoSelect.value) {
    factsText.textContent = 'Select an algorithm to view facts and analysis.';
    return;
  }

  if (algoSelect.value === 'quick') {
  factsText.innerHTML = `
    <strong>Quick Sort (Median-of-Three Pivot):</strong>
    <ul style="margin:8px 0; padding-left: 20px;">
      <li><strong>Pivot Selection:</strong> Median of three elements: first, middle, and last.</li>
      <li><strong>Arrange Three Elements:</strong> These three elements are arranged so that left ≤ middle ≤ right.</li>
      <li><strong>Pivot Placement:</strong> The median is moved to position right-1 and used as the pivot.</li>
      <li><strong>Partitioning:</strong> Two pointers move inward, swapping elements that are on the wrong side of the pivot.</li>
      <li><strong>Final Pivot Position:</strong> The pivot is placed in its correct sorted position.</li>
      <li><strong>Time Complexity:</strong> Average O(n log n), Worst O(n²) (when maximum (or minimum) element is chosen as the pivot).</li>
      <li><strong>Space Complexity:</strong> O(log n) due to recursion (in-place sorting).</li>
    </ul>
  `;
} 
else if (algoSelect.value === 'merge') {
  factsText.innerHTML = `
    <strong>Merge Sort:</strong>
    <ul style="margin:8px 0; padding-left: 20px;">
      <li><strong>Divide:</strong> The array is recursively divided into two equal halves until each subarray has one element.</li>
      <li><strong>Conquer:</strong> Single-element subarrays are already sorted.</li>
      <li><strong>Merge:</strong> Sorted subarrays are merged by comparing elements from each half.</li>
      <li><strong>Stability:</strong> Merge Sort preserves the order of equal elements.</li>
      <li><strong>Time Complexity:</strong> O(n log n) in all cases.</li>
      <li><strong>Space Complexity:</strong> O(n) due to extra temporary arrays.</li>
      <li><strong>Predictability:</strong> Performance remains the same for all input types.</li>
    </ul>
  `;
}

}