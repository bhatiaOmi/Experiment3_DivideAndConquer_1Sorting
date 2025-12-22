// script.js - final: exact algorithms per your specification
const algoSelect = document.getElementById('algoSelect');
const arrayType = document.getElementById('arrayType');

const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById('resetBtn');

const visual = document.getElementById('visual');
//const indicesRow = document.getElementById('indicesRow');
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

// ===== Neutral defaults on load =====
algoSelect.value = "";    // No algorithm selected
selAlgoText.textContent = '-';
factsText.textContent = 'Select an algorithm to view facts and analysis.';


nRange.value = 0;
nValue.textContent = '0';

// live update while sliding
nRange.addEventListener('input', () => {
 nValue.textContent = nRange.value;
});

let baseArray = [];
let steps = [];      // ordered list of step objects
let curStep = -1;
let visitedMax = -1;
let stepCounter = 0; // global sequential step numbering

// show/hide pivot control

algoSelect.addEventListener('change', ()=>{
  if (!algoSelect.value) return;

 selAlgoText.textContent =
   algoSelect.value === 'merge' ? 'Merge Sort' : 'Quick Sort';


   
   setFacts();
});


 // Neutral defaults on load
algoSelect.selectedIndex = -1;     // no algorithm selected
selAlgoText.textContent = '-';
factsText.textContent = 'Select an algorithm to view facts and analysis.';


// helpers
function generateRandomArray(n){ return Array.from({length:n}, ()=>Math.floor(Math.random()*99)+1); }
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// rendering
function renderArrayBoxes(arr, highlight = {}) {
 visual.innerHTML = '';
 const small = arr.length > 12;

 
 /* ---------- ARRAY + INDEX ---------- */
 const arrayRow = document.createElement('div');
 arrayRow.className = 'arrayRow';

 arr.forEach((v, i) => {
   const item = document.createElement('div');
   item.className = 'arrayItem';

   const box = document.createElement('div');
   box.className = 'arrayBox' + (small ? ' small' : '');
   box.textContent = v;

   if (highlight.compare?.includes(i)) box.style.borderColor = 'var(--log-compare)';
   if (highlight.swap?.includes(i)) box.style.borderColor = 'var(--log-swap)';
   if (highlight.pivot === i) box.style.borderColor = 'var(--log-pivot)';

   const idx = document.createElement('div');
   idx.className = 'arrayIndex' + (small ? ' small' : '');
   idx.textContent = i;

   item.appendChild(box);
   item.appendChild(idx);
   arrayRow.appendChild(item);
 });

 visual.appendChild(arrayRow);
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

 baseArray =
   t === 'random'
     ? generateRandomArray(n)
     : t === 'asc'
       ? Array.from({ length: n }, (_, i) => i + 1)
       : Array.from({ length: n }, (_, i) => n - i);

 renderArrayBoxes(baseArray);
 renderFinal([]);

 logContainer.innerHTML = '';
 steps = [];
 curStep = -1;
 visitedMax = -1;
 stepCounter = 0;
 stepIndex.textContent = 0;
 stepTotal.textContent = 0;

 if(!baseArray.length){
       alert('Generate an array first');
       return; } prepareSteps(); 

});



prevStep.addEventListener('click', ()=>{ if(curStep>0){ curStep--; showStep(curStep,false); } });
nextStep.addEventListener('click', ()=>{ if(curStep < steps.length-1){ curStep++; const append = curStep>visitedMax; showStep(curStep, append); if(append) visitedMax = curStep; }});

// Prepare steps using exact algorithms requested
function prepareSteps(){
  steps = []; 
  curStep = -1; 
  visitedMax = -1; 
  stepCounter = 0;

  const arr = baseArray.slice();

  if (algoSelect.value === 'merge') {
    mergeSortTrace(arr);
  } else if (algoSelect.value === 'quick') {
    quickSortTrace(arr);
  }

  steps.push({
    type:'done',
    description: 'Algorithm finished. Final sorted array.',
    array: arr.slice(),
    step: ++stepCounter
  });

  stepTotal.textContent = steps.length;
  stepIndex.textContent = 0;
  logContainer.innerHTML = '';
  renderArrayBoxes(baseArray);
  renderFinal([]);
  setFacts();
}

/* ===== MERGE SORT (top-down) with stepwise clear messages ===== */
function mergeSortTrace(arr){
 function merge(l,m,r){
   steps.push({type:'merge-start', description:`(Step ${++stepCounter}) Start merging ranges [${l}..${m}] and [${m+1}..${r}]`, array: arr.slice(), highlight:{merge:[l,r]}, step: stepCounter});
   const left = arr.slice(l,m+1), right = arr.slice(m+1,r+1);
   let i=0,j=0,k=l;
   while(i<left.length && j<right.length){
     steps.push({type:'compare', description:`(Step ${++stepCounter}) Compare left[${i}]=${left[i]} and right[${j}]=${right[j]}`, array: arr.slice(), highlight:{compare:[k,m+1+j]}, step: stepCounter});
     if(left[i] <= right[j]){
       arr[k] = left[i++];
       steps.push({type:'place', description:`(Step ${++stepCounter}) Place ${arr[k]} at index ${k} from left`, array: arr.slice(), highlight:{merge:[l,r]}, step: stepCounter});
     } else {
       arr[k] = right[j++];
       steps.push({type:'place', description:`(Step ${++stepCounter}) Place ${arr[k]} at index ${k} from right`, array: arr.slice(), highlight:{merge:[l,r]}, step: stepCounter});
     }
     k++;
   }
   while(i<left.length){
     arr[k++] = left[i++];
     steps.push({type:'place', description:`(Step ${++stepCounter}) Place remaining ${arr[k-1]} at index ${k-1}`, array: arr.slice(), highlight:{merge:[l,r]}, step: stepCounter});
   }
   while(j<right.length){
     arr[k++] = right[j++];
     steps.push({type:'place', description:`(Step ${++stepCounter}) Place remaining ${arr[k-1]} at index ${k-1}`, array: arr.slice(), highlight:{merge:[l,r]}, step: stepCounter});
   }
   steps.push({type:'merge-done', description:`(Step ${++stepCounter}) Merged to [${l}..${r}]`, array: arr.slice(), highlight:{merge:[l,r]}, step: stepCounter});
 }
 function rec(l,r){
   steps.push({type:'split', description:`(Step ${++stepCounter}) Split [${l}..${r}]`, array: arr.slice(), step: stepCounter});
   if(l>=r) return;
   const m = Math.floor((l+r)/2);
   rec(l,m); rec(m+1,r); merge(l,m,r);
 }
 rec(0, arr.length-1);
}

/* ===== QUICK SORT (Median-of-Three Pivot, P & Q pointers) =====
   - Pivot is chosen as median of first, middle, last elements
   - Partitioning uses P & Q pointers (Hoare-style)
   - Only pivot selection is optimized
*/

function quickSortTrace(arr) {

  // -------- MEDIAN OF THREE PIVOT SELECTION --------
  function medianOfThree(l, r) {
    const m = Math.floor((l + r) / 2);

    if (arr[l] > arr[m]) [arr[l], arr[m]] = [arr[m], arr[l]];
    if (arr[l] > arr[r]) [arr[l], arr[r]] = [arr[r], arr[l]];
    if (arr[m] > arr[r]) [arr[m], arr[r]] = [arr[r], arr[m]];

    return m; // index of median element
  }

  function partition(l, r) {

    // ----- MEDIAN-OF-THREE PIVOT -----
    const pivotIndex = medianOfThree(l, r);
    const pivotValue = arr[pivotIndex];

    // move pivot to left (algorithm expects pivot at l)
    [arr[l], arr[pivotIndex]] = [arr[pivotIndex], arr[l]];

    let P = l + 1;
    let Q = r;

    while (true) {

      // Move P right while element <= pivot
      while (P <= r && arr[P] <= arr[l]) {
        steps.push({
          type: 'moveP',
          description: `(Step ${++stepCounter}) Move Pointer_1 (P) → ${P}`,
          array: arr.slice(),
          step: stepCounter
        });
        P++;
      }

      // Move Q left while element > pivot
      while (Q >= l + 1 && arr[Q] > arr[l]) {
        steps.push({
          type: 'moveQ',
          description: `(Step ${++stepCounter}) Move Pointer_2 (Q) ← ${Q}`,
          array: arr.slice(),
          step: stepCounter
        });
        Q--;
      }

      // Swap or place pivot
      if (P < Q) {
        [arr[P], arr[Q]] = [arr[Q], arr[P]];
        steps.push({
          type: 'swap',
          description: `(Step ${++stepCounter}) Swap indices ${P} and ${Q}`,
          array: arr.slice(),
          step: stepCounter
        });
      } else {
        // Place pivot at correct position
        [arr[l], arr[Q]] = [arr[Q], arr[l]];
        steps.push({
          type: 'pivot-place',
          description: `(Step ${++stepCounter}) Place pivot at index ${Q}`,
          array: arr.slice(),
          step: stepCounter
        });
        return Q;
      }
    }
  }

  function rec(l, r) {
    steps.push({
      type: 'q-split',
      description: `(Step ${++stepCounter}) QuickSort on range [${l}..${r}]`,
      array: arr.slice(),
      step: stepCounter
    });

    if (l >= r) return;

    const p = partition(l, r);
    rec(l, p - 1);
    rec(p + 1, r);
  }

  rec(0, arr.length - 1);
}

/* ===== showStep & logging behavior ===== */
function showStep(i, appendToLog=true){
 if(!steps || i < 0 || i >= steps.length) return;
 const s = steps[i];
 stepIndex.textContent = i+1;
 stepTotal.textContent = steps.length;

 // render snapshot and highlights
 renderArrayBoxes(s.array || baseArray, s.highlight || {});

 // append to log only when stepping forward (appendToLog true)
 if(appendToLog){
   const entry = document.createElement('div');
   entry.className = 'logEntry';
   // color by type
   if(s.type === 'compare' || s.type === 'moveP' || s.type==='moveQ') entry.classList.add('log-compare');
   else if(s.type === 'swap') entry.classList.add('log-swap');
   else if(s.type === 'pivot' || s.type === 'pivot-place') entry.classList.add('log-pivot');
   else if(s.type && s.type.startsWith('merge')) entry.classList.add('log-merge');
   else if(s.type === 'done') entry.classList.add('log-done');

   // human-friendly description (already stored in description)
   entry.innerHTML = `<strong>${escapeHtml(s.description)}</strong><div style="font-size:12px;color:#444;margin-top:6px">Array: ${s.array ? '['+s.array.join(', ')+']' : '-'}</div>`;
   entry.dataset.stepIndex = i;
   logContainer.appendChild(entry);
   logContainer.scrollTop = logContainer.scrollHeight;
   highlightLogEntry(i);
 } else {
   highlightLogEntry(i);
 }

 // final stage: show final array
 if(s.type === 'done'){
   renderFinal(s.array || []);
 }
}

function highlightLogEntry(index){
 Array.from(logContainer.querySelectorAll('.logEntry')).forEach(e=> e.classList.remove('log-highlight'));
 const el = logContainer.querySelector(`.logEntry[data-step-index="${index}"]`);
 if(el) el.classList.add('log-highlight');
}

function resetAll(){
  // reset data
  baseArray = [];
  steps = [];
  curStep = -1;
  visitedMax = -1;
  stepCounter = 0;

  // reset visuals
  visual.innerHTML = '';
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
      <strong>Quick Sort (Median-of-Three Pivot Selection):</strong>
      <ul style="margin:8px 0; padding-left: 10px;">
        <li>The pivot is chosen as the <strong>median of the first, middle, and last </strong>elements.</li>
        <li>This strategy reduces the probability of worst-case behavior for sorted or reverse-sorted inputs.</li>
        <li>Partitioning is performed using two inward-moving pointers (P and Q).</li>
        <li>Elements less than or equal to the pivot are placed to the left; greater elements to the right.</li>
        <li>Average time complexity: <strong>O(n log n)</strong>.</li>
        <li>Worst-case time complexity: <strong>O(n²)</strong>, occurs when maximum (or minimum) element is chosen as the pivot.</li>
        <li>The algorithm is in-place and requires no additional auxiliary memory.</li>
      </ul>
    `;
  } 
  else if (algoSelect.value === 'merge') {
    factsText.innerHTML = `
      <strong>Merge Sort:</strong>
      <ul style="margin:8px 0; padding-left: 10px;">
        <li>Merge Sort divides the array deterministically into equal halves.</li>
        <li>Each subarray is sorted and merged to produce the final sorted array.</li>
        <li>Time complexity is consistently <strong>O(n log n)</strong> for all cases.</li>
        <li>Requires additional memory proportional to the array size.</li>
        <li>Merge Sort is a stable sorting algorithm.</li>
      </ul>
    `;
  }
}


