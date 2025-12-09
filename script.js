// script.js - final: exact algorithms per your specification
const algoSelect = document.getElementById('algoSelect');
const nSelect = document.getElementById('nSelect');
const arrayType = document.getElementById('arrayType');
const pivotContainer = document.getElementById('pivotContainer');
const pivotChoice = document.getElementById('pivotChoice');

const generateBtn = document.getElementById('generateBtn');
const confirmBtn = document.getElementById('confirmBtn');
const resetBtn = document.getElementById('resetBtn');

const visual = document.getElementById('visual');
const indicesRow = document.getElementById('indicesRow');
const finalVisual = document.getElementById('finalVisual');

const selAlgoText = document.getElementById('selAlgoText');
const stepIndex = document.getElementById('stepIndex');
const stepTotal = document.getElementById('stepTotal');
const prevStep = document.getElementById('prevStep');
const nextStep = document.getElementById('nextStep');

const logContainer = document.getElementById('logContainer');
const factsText = document.getElementById('factsText');

let baseArray = [];
let steps = [];      // ordered list of step objects
let curStep = -1;
let visitedMax = -1;
let stepCounter = 0; // global sequential step numbering

// show/hide pivot control
function showPivotControl(){ pivotContainer.style.display = (algoSelect.value === 'quick') ? 'block' : 'none'; }
algoSelect.addEventListener('change', ()=>{
  showPivotControl();
  selAlgoText.textContent = (algoSelect.value === 'merge' ? 'Merge Sort' : 'Quick Sort');
  setFacts();
});
selAlgoText.textContent = (algoSelect.value === 'merge' ? 'Merge Sort' : 'Quick Sort');
showPivotControl();

// helpers
function generateRandomArray(n){ return Array.from({length:n}, ()=>Math.floor(Math.random()*99)+1); }
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// rendering
function renderArrayBoxes(arr, highlight = {}) {
  visual.innerHTML = ''; 
  indicesRow.innerHTML = '';
  
  const small = arr.length > 12;
  
  arr.forEach((v,i)=>{
    const b = document.createElement('div');
    b.className = 'arrayBox' + (small ? ' small' : '');
    b.textContent = v;
    
    if(highlight.compare && highlight.compare.includes(i)) b.style.borderColor = 'var(--log-compare)';
    if(highlight.swap && highlight.swap.includes(i)) b.style.borderColor = 'var(--log-swap)';
    if(highlight.pivot === i) b.style.borderColor = 'var(--log-pivot)';
    if(highlight.merge && i>=highlight.merge[0] && i<=highlight.merge[1]) b.style.borderColor = 'var(--log-merge)';
    visual.appendChild(b);
    });

  // ---- INDEX ROW ADDED HERE ----
  arr.forEach((_, i) => {
    let idx = document.createElement("div");
    idx.className = "arrayIndex" + (small ? ' small' : '');
    idx.textContent = i;
    indicesRow.appendChild(idx);
  });
  // --------------------------------
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
generateBtn.addEventListener('click', ()=>{
  const n = Number(nSelect.value);
  const t = arrayType.value;
  
  baseArray = (t==='random') ? generateRandomArray(n) : (t==='asc' ? Array.from({length:n}, (_,i)=>i+1) : Array.from({length:n}, (_,i)=>n-i));
  renderArrayBoxes(baseArray);
  renderFinal([]);
  logContainer.innerHTML = '';
  steps = []; curStep = -1; visitedMax = -1; stepCounter = 0;
  stepIndex.textContent = 0; stepTotal.textContent = 0;
});
confirmBtn.addEventListener('click', ()=>{ 
    if(!baseArray.length){ 
        alert('Generate an array first'); 
        return; } prepareSteps(); });

prevStep.addEventListener('click', ()=>{ if(curStep>0){ curStep--; showStep(curStep,false); } });
nextStep.addEventListener('click', ()=>{ if(curStep < steps.length-1){ curStep++; const append = curStep>visitedMax; showStep(curStep, append); if(append) visitedMax = curStep; }});

// Prepare steps using exact algorithms requested
function prepareSteps(){
  steps = []; curStep = -1; visitedMax = -1; stepCounter = 0;
  const arr = baseArray.slice();
  if(algoSelect.value === 'merge') mergeSortTrace(arr);
  else quickSortTrace(arr, pivotChoice.value);
  steps.push({type:'done', description: 'Algorithm finished. Final sorted array.', array: arr.slice(), step: ++stepCounter});
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

/* ===== QUICK SORT with P & Q pointers as you specified =====
   Pivot: first / middle / end
   P starts at left+1, Q at right
   Move P right until array[P] > pivot
   Move Q left until array[Q] <= pivot
   If P < Q -> swap array[P], array[Q] and continue
   If P >= Q -> swap pivot (at pivotIndex) with array[Q]; pivot final at Q
*/
function quickSortTrace(arr, pivotChoiceVal='first'){
  function getPivotIndex(l,r){
    if(pivotChoiceVal === 'first') return l;
    if(pivotChoiceVal === 'middle') return Math.floor((l+r)/2);
    if(pivotChoiceVal === 'end') return r;
    return l;
  }

  function partition(l,r){
    const pivotIndex = getPivotIndex(l,r);
    const pivotValue = arr[pivotIndex];
    steps.push({type:'pivot', description:`(Step ${++stepCounter}) Pivot chosen at index ${pivotIndex} with value ${pivotValue}`, array: arr.slice(), highlight:{pivot:pivotIndex}, step: stepCounter});

    // if pivot not at left, swap it to left (so algorithm expects pivot at left)
    if(pivotIndex !== l){
      [arr[l], arr[pivotIndex]] = [arr[pivotIndex], arr[l]];
      steps.push({type:'swap', description:`(Step ${++stepCounter}) Move pivot to left by swapping indices ${l} and ${pivotIndex}`, array: arr.slice(), highlight:{swap:[l,pivotIndex]}, step: stepCounter});
    }

    // sentinel-like bounds are handled by bounds checks
    let P = l + 1;
    let Q = r;

    while(true){
      // Move P right until array[P] > pivot OR P > r
      while(P <= r && arr[P] <= arr[l]){
        steps.push({type:'moveP', description:`(Step ${++stepCounter}) Move Pointer_1(P) right to ${P} because ${arr[P]} <= pivot(${arr[l]})`, array: arr.slice(), highlight:{compare:[P,l]}, step: stepCounter});
        P++;
      }
      // Move Q left until array[Q] <= pivot OR Q < l+1
      while(Q >= l+1 && arr[Q] > arr[l]){
        steps.push({type:'moveQ', description:`(Step ${++stepCounter}) Move Pointer_2(Q) left to ${Q} because ${arr[Q]} > pivot(${arr[l]})`, array: arr.slice(), highlight:{compare:[Q,l]}, step: stepCounter});
        Q--;
      }

      // check crossing
      if(P < Q){
        // swap arr[P] and arr[Q]
        [arr[P], arr[Q]] = [arr[Q], arr[P]];
        steps.push({type:'swap', description:`(Step ${++stepCounter}) Pointer_1(P)(${P}) < Pointer_2(Q)(${Q}) → swap values ${arr[Q]} and ${arr[P]} at indices ${P} & ${Q}`, array: arr.slice(), highlight:{swap:[P,Q]}, step: stepCounter});
        P++; Q--;
      } else {
        // P >= Q: swap pivot (at l) with arr[Q]; pivot final at Q
        [arr[l], arr[Q]] = [arr[Q], arr[l]];
        steps.push({type:'pivot-place', description:`(Step ${++stepCounter}) Pointer_1(P)(${P}) ≥ Pointer_2(Q)(${Q}) → swap pivot at index ${l} with index ${Q}. Pivot final at ${Q}`, array: arr.slice(), highlight:{pivot:Q}, step: stepCounter});
        return Q;
      }
    }
  }

  function rec(l,r){
    steps.push({type:'q-split', description:`(Step ${++stepCounter}) QuickSort on [${l}..${r}]`, array: arr.slice(), step: stepCounter});
    if(l >= r) return;
    const p = partition(l,r);
    rec(l, p-1);
    rec(p+1, r);
  }

  rec(0, arr.length-1);
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
  baseArray = []; steps = []; curStep = -1; visitedMax = -1; stepCounter = 0;
  visual.innerHTML = ''; indicesRow.innerHTML = ''; finalVisual.innerHTML = '(Sorted array will appear here)';
  logContainer.innerHTML = ''; stepIndex.textContent = 0; stepTotal.textContent = 0; factsText.textContent = 'Choose algorithm and run to see facts relevant to the run.';
}

function setFacts(){
  if(algoSelect.value === 'quick'){
    const p = pivotChoice.value;
    let html = `<strong>QuickSort (pivot = ${p}):</strong><ul style="margin:8px 0 8px 18px">`;
    html += `<li>Average: O(n log n). Worst-case: O(n²).</li>`;
    if(p==='first') html += `<li>Pivot = first: already-sorted ascending arrays produce worst-case (unbalanced partitions).</li>`;
    if(p==='end') html += `<li>Pivot = end: reverse-sorted arrays produce worst-case.</li>`;
    if(p==='middle') html += `<li>Pivot = middle: reduces chance of worst-case on sorted inputs; more balanced partitions.</li>`;
    html += `<li>Algorithm uses pointers P (left→right) and Q (right→left) per design: swap P & Q until they cross; then place pivot at Q.</li></ul>`;
    factsText.innerHTML = html;
  } else {
    factsText.innerHTML = `<strong>MergeSort:</strong><ul style="margin:8px 0 8px 18px">
      <li>Divide recursively until subarrays of size 1.</li>
      <li>Merge pairs by comparing heads and placing the smaller element first.</li>
      <li>Time complexity: O(n log n) in all cases; requires O(n) extra space for merging.</li>
    </ul>`;
  }
}

// initialize
resetAll();
setFacts();
