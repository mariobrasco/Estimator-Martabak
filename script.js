(function(){
  const $ = id => document.getElementById(id);
  const terminal = $('terminal');
  const inputArea = $('inputArea');
  const status = $('status');
  const resultArea = $('resultArea');

  document.getElementById('buildBtn').addEventListener('click', buildTables);
  document.getElementById('fillExample').addEventListener('click', fillExample);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
  document.getElementById('solveBtn').addEventListener('click', onSolve);
  document.getElementById('showMatrixBtn').addEventListener('click', showMatrix);
  document.getElementById('downloadCSV').addEventListener('click', downloadCSV);

  let state = { n:3, m:3, ingredientNames:[], productNames:[], compMatrix: [], stock: [] };

  function log(txt){
    terminal.innerText += txt + '\n';
    terminal.scrollTop = terminal.scrollHeight;
  }
  function clearTerminal(){ terminal.innerText = ''; }

  function buildTables(){
    const n = parseInt($('nProducts').value) || 0;
    const m = parseInt($('nIngredients').value) || 0;
    const ingRaw = $('ingredientNames').value.trim();
    const ingNames = ingRaw ? ingRaw.split(',').map(s=>s.trim()) : [];

    state.n = n; state.m = m; state.ingredientNames = ingNames.slice(0,m);

    const units = ['gr','kg','ml','l','pcs'];

    let html = '<div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 mb-6 shadow-xl border border-gray-200">';
    html += '<div class="flex items-center gap-3 mb-6">';
    html += '<div class="w-10 h-10 bg-linear-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">';
    html += '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>';
    html += '</div><h2 class="text-2xl font-bold text-gray-800">Komposisi Premix Adonan</h2></div>';
    html += '<p class="text-gray-600 mb-4 text-sm">Masukkan komposisi setiap premix dalam <strong>desimal per 1 kg</strong> (misal: 0.60 = 60%)</p>';
    html += '<div class="overflow-x-auto rounded-xl border-2 border-gray-200">';
    html += '<table class="w-full">';
    html += '<thead class="bg-linear-to-br from-indigo-50 to-purple-50"><tr>';
    html += '<th class="px-4 py-4 text-left font-bold text-indigo-700 border-b-2 border-gray-200">Premix</th>';
    for(let j=0;j<m;j++){
      const b = state.ingredientNames[j] || ('Bahan '+(j+1));
      html += `<th class="px-4 py-4 text-left font-bold text-purple-700 border-b-2 border-gray-200">${b} (%/kg)</th>`;
    }
    html += '</tr></thead><tbody class="bg-white">';
    for(let i=0;i<n;i++){
      html += '<tr class="hover:bg-gray-50 transition-colors">';
      html += `<td class="px-4 py-3 border-b border-gray-100"><input class="pname w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium" data-i="${i}" type="text" placeholder="Mix ${String.fromCharCode(65+i)}"></td>`;
      for(let j=0;j<m;j++){
        html += `<td class="px-4 py-3 border-b border-gray-100"><input class="comp w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none font-medium" data-i="${i}" data-j="${j}" type="number" min="0" max="1" step="0.01" placeholder="0.00"></td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';

    html += '<div class="mt-8"><div class="flex items-center gap-3 mb-4">';
    html += '<div class="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">';
    html += '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    html += '</div><h3 class="text-xl font-bold text-gray-800">Target Adonan Final (kg)</h3></div>';
    html += '<p class="text-gray-600 mb-4 text-sm">Masukkan total bahan yang diinginkan dalam adonan akhir (dalam <strong>kilogram</strong>)</p>';
    html += '<div class="overflow-x-auto rounded-xl border-2 border-gray-200">';
    html += '<table class="w-full bg-white"><thead class="bg-linear-to-br from-emerald-50 to-teal-50"><tr>';
    for(let j=0;j<m;j++){
      const b = state.ingredientNames[j] || ('Bahan '+(j+1));
      // html += `<th class="px-4 py-4 text-left font-bold text-emerald-700 border-b-2 border-gray-200">${b} (kg)</th>`;
      html += `<th class="px-4 py-4 text-left font-bold text-emerald-700 border-b-2 border-gray-200">${b}</th>`;

    }
    html += '</tr></thead><tbody><tr class="hover:bg-gray-50 transition-colors">';
    for(let j=0;j<m;j++){
      html += `<td class="px-4 py-3"><input id="stok_${j}" class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none font-medium" type="number" min="0" step="0.01" placeholder="0.00"></td>`;
    }
    html += '</tr></tbody></table></div></div></div>';

    inputArea.innerHTML = html;
    $('actions').classList.remove('hidden');

    clearTerminal();
    log('✓ Form input berhasil dibuat!');
    log('→ Silakan isi komposisi & stok, lalu klik "Jalankan OBE"');
    status.innerHTML = '<span class="text-green-600 font-semibold">✓ Siap input</span>';
    status.className = 'px-4 py-3 bg-green-50 rounded-xl text-green-600 font-medium border-2 border-green-200';
  }

  // function fillExample(){
  //   buildTables();
  //   document.querySelectorAll('.pname').forEach((el, idx)=> 
  //     el.value = ['Mix A','Mix B','Mix C'][idx] || `Mix ${String.fromCharCode(65+idx)}`
  //   );
    
  //   // Komposisi premix (dalam desimal per 1kg): [Tepung, Gula, Telur]
  //   const sample = [
      // [0.60, 0.25, 0.15],  // Mix A: 60% tepung, 25% gula, 15% telur
      // [0.40, 0.40, 0.20],  // Mix B: 40% tepung, 40% gula, 20% telur
      // [0.30, 0.20, 0.50]   // Mix C: 30% tepung, 20% gula, 50% telur
  //   ];
    
  //   document.querySelectorAll('.comp').forEach(el=>{
  //     const i = parseInt(el.dataset.i), j = parseInt(el.dataset.j);
  //     const v = (sample[i] && sample[i][j] !== undefined) ? sample[i][j] : 0;
  //     el.value = v;
  //   });
    
  //   // Target: [2.90 kg tepung, 1.75 kg gula, 1.35 kg telur]
  //   const defaults = [2.90, 1.75, 1.35];
    
  //   for(let j=0;j<state.m;j++){
  //     const s = $(`stok_${j}`);
  //     if (s) s.value = defaults[j] || 0;
  //   }
  //   clearTerminal();
  //   log('✓ Contoh data premix adonan martabak berhasil diisi!');
  //   log('');
  //   log('📦 KOMPOSISI PREMIX (per 1 kg):');
  //   log('  • Mix A: 60% Tepung + 25% Gula + 15% Telur');
  //   log('  • Mix B: 40% Tepung + 40% Gula + 20% Telur');
  //   log('  • Mix C: 30% Tepung + 20% Gula + 50% Telur');
  //   log('');
  //   log('🎯 TARGET ADONAN FINAL:');
  //   log('  • Tepung: 2.90 kg');
  //   log('  • Gula: 1.75 kg');
  //   log('  • Telur: 1.35 kg');
  //   log('');
  //   log('❓ PERTANYAAN:');
  //   log('  Berapa kg Mix A, Mix B, Mix C yang harus dicampur?');
  //   status.innerHTML = '<div class = "flex gap-2"><span> ✓ </span> <span class="text-blue-600 font-semibold"> Contoh terisi</span></div>';
  //   status.className = 'px-4 py-3 bg-blue-50 rounded-xl text-blue-600 font-medium border-2 border-blue-200';
  // }

      function fillExample(){
    buildTables();
    const defaultNames = ['Martabak Manis','Martabak Telur','Martabak Mini'];
    document.querySelectorAll('.pname').forEach((el, idx)=> el.value = defaultNames[idx] || `Martabak ${idx+1}`);

    // Generate random comps between 1 and 1000 for each product-ingredient cell
    const n = state.n || 0, m = state.m || 0;
    const compVals = Array.from({length:n}, ()=> Array(m).fill(0));

     const predefinedComps = [
        [0.60, 0.25, 0.15],
        [0.40, 0.40, 0.20],
        [0.30, 0.20, 0.50]
    ];

    document.querySelectorAll('.comp').forEach(el=>{
      const i = parseInt(el.dataset.i), j = parseInt(el.dataset.j);
      // Use predefined values if available, otherwise use 0
      const v = (predefinedComps[i] && predefinedComps[i][j]) || 0;
      el.value = v;
      compVals[i][j] = v;
      console.log(`Set comp[${i}][${j}] = ${v}`);
    });

    const defaults = [2.90, 1.75, 1.35];
    
    for(let j=0;j<state.m;j++){
      const s = $(`stok_${j}`);
      if (s) s.value = defaults[j] || 0;
    }

    clearTerminal();
    log('✓ Contoh data acak berhasil diisi (komposisi: 1–1000).');
    log('→ Stok diatur berdasar total kebutuhan × faktor acak 1–5.');
    status.innerHTML = '<span class="text-blue-600 font-semibold">✓ Contoh acak terisi</span>';
    status.className = 'px-4 py-3 bg-blue-50 rounded-xl text-blue-600 font-medium border-2 border-blue-200';
  }

  function resetAll(){
    inputArea.innerHTML = '';
    $('actions').classList.add('hidden');
    clearTerminal();
    terminal.innerText = 'Tekan "Buat Form Input" dulu...';
    resultArea.innerText = 'Belum ada hasil.';
    status.innerHTML = 'Belum dijalankan';
    status.className = 'px-4 py-3 bg-gray-100 rounded-xl text-gray-600 mb-3 font-medium border border-gray-200';
  }

  function buildStateFromDOM(){
    state.productNames = Array.from(document.querySelectorAll('.pname')).map(x=>x.value || 'Mix');
    const n = state.n, m = state.m;
    const compRowsByProduct = Array.from({length:n}, ()=>Array(m).fill(0));
    document.querySelectorAll('.comp').forEach(el=>{
      const i = parseInt(el.dataset.i), j = parseInt(el.dataset.j);
      compRowsByProduct[i][j] = parseFloat(el.value) || 0;
    });
    const compMatrix = Array.from({length:m}, (_,r)=> Array.from({length:n}, (_,c)=> compRowsByProduct[c][r] ));
    state.compMatrix = compMatrix;
    state.stock = [];
    for(let j=0;j<m;j++){
      const v = parseFloat($(`stok_${j}`).value) || 0;
      state.stock.push(v);
    }
  }

  function showMatrix(){
    try{ buildStateFromDOM(); } catch(e){ alert('Buat form dulu.'); return; }
    clearTerminal();
    log('📊 MATRIKS A (koefisien) — baris=bahan, kolom=premix:');
    log('═'.repeat(50));
    printMatrix(state.compMatrix);
    log('\n🎯 VEKTOR TARGET B (kg):');
    log('═'.repeat(50));
    state.stock.forEach((v,i)=> {
      const bahanName = state.ingredientNames[i] || `Bahan ${i+1}`;
      log(`B[${i+1}] (${bahanName}) = ${formatInteger(v)} kg`);
    });
  }

  function formatNum(x){
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    console.log("format Num")
    return Number(x).toFixed(6);
    // return Number(x).toFixed(4);
  }

    function formatInteger(x){
    return String(Math.round(x));
  }

  function BuatNilaiMenjadiPositif(arr) {
  return arr.map(v => Math.abs(v));
}


  function printMatrix(mat){
    for(let i=0;i<mat.length;i++){
      const row = mat[i].map(v=> formatNum(v).padStart(10)).join(' ');
      log(row);
    }
  }

  // function onSolve(){
  //   try{ buildStateFromDOM(); } catch(e){ alert('Buat form dulu.'); return; }
  //   clearTerminal();
  //   log('🚀 MEMULAI ELIMINASI GAUSS-JORDAN');
  //   log('   Mencari berapa kg setiap premix yang harus dicampur');
  //   log('═'.repeat(60));
  //   status.innerHTML = '<span class="text-yellow-600 font-semibold animate-pulse">⏳ Menjalankan OBE...</span>';
  //   status.className = 'px-4 py-3 bg-yellow-50 rounded-xl text-yellow-600 font-medium border-2 border-yellow-200';
  //   const m = state.m, n = state.n;
  //   if (m !== n){
  //     status.innerHTML = '<span class="text-red-600 font-semibold">❌ ERROR: m ≠ n</span>';
  //     status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
  //     log(`\n❌ Sistem bukan kuadrat: m=${m}, n=${n}`);
  //     log('Jumlah bahan harus sama dengan jumlah premix');
  //     return;
  //   }

  //   let mat = state.compMatrix.map((r,i)=> r.map(c=> Number(c)));
  //   for(let i=0;i<m;i++) mat[i].push(Number(state.stock[i] || 0));

  //   log('\n📋 MATRIKS AUGMENTED AWAL [A | B]:');
  //   log('   (Komposisi Premix | Target Bahan)');
  //   printAugmented(mat);

  //   const EPS = 1e-12;

  //   for(let col=0; col<n; col++){
  //     log(`\n${'─'.repeat(60)}`);
  //     log(`🔄 PROSES KOLOM ${col+1} (Premix ${state.productNames[col] || 'Mix '+(col+1)}):`);
      
  //     // Cari pivot terbesar (partial pivoting)
  //     let pivotRow = col;
  //     let maxVal = Math.abs(mat[col][col]);
  //     for(let r=col+1; r<n; r++){
  //       const v = Math.abs(mat[r][col]);
  //       if (v > maxVal){ maxVal = v; pivotRow = r; }
  //     }
  //     if (Math.abs(mat[pivotRow][col]) < EPS){
  //       log(`\n⚠️ Pivot ≈ 0 di kolom ${col+1} — sistem singular!`);
  //       log('💡 KEMUNGKINAN: Komposisi premix tidak independen/valid');
  //       status.innerHTML = '<span class="text-red-600 font-semibold">❌ Sistem singular</span>';
  //       status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
  //       resultArea.innerHTML = '<div class="text-red-600 font-semibold">❌ Sistem tidak dapat diselesaikan - Komposisi premix tidak valid.</div>';
  //       return;
  //     }
      
  //     // OBE #1: PERTUKARAN BARIS
  //     if (pivotRow !== col){
  //       [mat[col], mat[pivotRow]] = [mat[pivotRow], mat[col]];
  //       log(`\n📝 OBE #1 - PERTUKARAN BARIS:`);
  //       log(`   Menukar baris ${col+1} dengan baris ${pivotRow+1}`);
  //       log(`   Notasi: R${col+1} ↔ R${pivotRow+1}`);
  //       log(`   Tujuan: Menempatkan pivot terbesar di posisi diagonal`);
  //       printAugmented(mat);
  //     }
      
  //     const pivot = mat[col][col];
      
  //     // OBE #2: PERKALIAN BARIS DENGAN KONSTANTA
  //     if (Math.abs(pivot - 1) > EPS){
  //       for(let k=col; k<=n; k++) mat[col][k] = mat[col][k] / pivot;
  //       log(`\n📝 OBE #2 - PERKALIAN BARIS DENGAN KONSTANTA:`);
  //       log(`   Membagi baris ${col+1} dengan konstanta ${formatNum(pivot)}`);
  //       log(`   Notasi: R${col+1} ← R${col+1} / ${formatNum(pivot)}`);
  //       log(`   Tujuan: Membuat pivot (elemen diagonal) = 1`);
  //       printAugmented(mat);
  //     }
      
  //     // OBE #3: MENAMBAHKAN KELIPATAN SUATU BARIS KE BARIS LAIN
  //     for(let r=0; r<n; r++){
  //       if (r === col) continue;
  //       const factor = mat[r][col];
  //       if (Math.abs(factor) < EPS) continue;
  //       for(let k=col; k<=n; k++){
  //         mat[r][k] = mat[r][k] - factor * mat[col][k];
  //       }
  //       const multiplier = -factor;
  //       log(`\n📝 OBE #3 - MENAMBAHKAN KELIPATAN BARIS KE BARIS LAIN:`);
  //       log(`   Menambahkan ${formatNum(multiplier)} kali baris ${col+1} ke baris ${r+1}`);
  //       log(`   Notasi: R${r+1} ← ${formatNum(multiplier)} × R${col+1} + R${r+1}`);
  //       log(`   Tujuan: Membuat elemen di posisi [${r+1},${col+1}] = 0`);
  //       printAugmented(mat);
  //     }
  //   }

  //   let solvable = true;
  //   for(let i=0;i<n;i++){
  //     for(let j=0;j<n;j++){
  //       if (i===j){
  //         if (Math.abs(mat[i][j] - 1) > 1e-6) solvable = false;
  //       } else {
  //         if (Math.abs(mat[i][j]) > 1e-6) solvable = false;
  //       }
  //     }
  //   }

  //   if (!solvable){
  //     log('\n\n⚠️ PERINGATAN: Matriks tidak tereduksi ke identitas');
  //     log('Sistem mungkin tidak memiliki solusi unik');
  //     status.innerHTML = '<span class="text-red-600 font-semibold">❌ Tidak ada solusi unik</span>';
  //     status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
  //     resultArea.innerText = '❌ Tidak ada solusi unik (periksa input)';
  //     return;
  //   }

  //   const sol = mat.map(r => r[n]);
  //   log('\n\n' + '═'.repeat(60));
  //   log('✨ HASIL PERHITUNGAN CAMPURAN:');
  //   log('═'.repeat(60));
    
  //   let negative = false;
  //   let out = '';
  //   let totalKg = 0;
    
  //   for(let i=0;i<n;i++){

  //     const name = state.productNames[i] || ('Martabak '+(i+1));
  //     const intValue = Math.round(sol[i]);
  //     if(intValue < 0){
  //     log(`📊 x${i+1} (${name}) = ${formatInteger(intValue)}`);
  //     } else{
  //     log(`📊 x${i+1} (${name}) = ${formatInteger(intValue)}`);
  //     }
  //     out += `${name}: ${formatInteger(intValue)} pcs\n`;
  //     if (intValue < 0) negative = true;
  //   }

  //   if (negative){
  //     log('\n❗ Komposisi tidak valid !');
  //     log('Perhitungan menghasilkan nilai negatif pada jumlah salah satu produk, \n yang berarti target bahan yang Anda masukkan tidak dapat dicapai dari ketiga menu dengan komposisi yang tersedia. Silakan:\n• periksa kembali target total bahan, \n• atau revisi komposisi masing-masing menu.');
  //     status.innerHTML = '<span class="text-red-600 font-semibold">❗ Komposisi tidak valid </span>';
  //     status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
  //     resultArea.innerHTML = '<div class="text-red-600 font-semibold">Perhitungan menghasilkan nilai negatif pada jumlah salah satu produk,yang berarti target bahan yang Anda masukkan tidak dapat dicapai dari ketiga menu dengan komposisi yang tersedia. Silakan:<br>• periksa kembali target total bahan, <br>• atau revisi komposisi masing-masing menu.</div>';
      
  //   } else {
  //     log('\n✅ SUKSES! Resep pencampuran:');
  //     log('');
  //     log(`📦 TOTAL ADONAN: ${formatNum(totalKg)} kg`);
  //     log('');
  //     log('💡 CARA MEMBUAT:');
  //     for(let i=0;i<n;i++){
  //       const name = state.productNames[i] || ('Mix '+(i+1));
  //       const val = sol[i];
  //       log(`  ${i+1}. Ambil ${formatNum(val)} kg ${name}`);
  //     }
  //     log('  4. Campur semua premix hingga rata');
  //     log('  5. Adonan siap digunakan!');
      
  //     status.innerHTML = '<div class="flex gap-2"><span>✅</span><span class="text-green-600 font-semibold">Resep berhasil dihitung!</span></div>';
  //     status.className = 'px-4 py-3 bg-green-50 rounded-xl text-green-600 font-medium border-2 border-green-200';
      
  //     resultArea.innerHTML = `
  //       <div class="text-green-600 font-semibold mb-4 text-xl">✅ Resep Pencampuran Premix:</div>
  //       <div class="space-y-1 mb-4">${out}</div>
  //       <div class="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4 text-indigo-900">
  //         <strong>📦 Total Adonan:</strong> ${formatNum(totalKg)} kg<br>
  //         <strong>📝 Instruksi:</strong> Campur semua premix di atas hingga rata, adonan siap digunakan!
  //       </div>
  //     `;
  //   }
  // }

  function onSolve(){
    try{ buildStateFromDOM(); } catch(e){ alert('Buat form dulu.'); return; }
    clearTerminal();
    log('🚀 MEMULAI ELIMINASI GAUSS-JORDAN');
    log('   Mencari berapa kg setiap premix yang harus dicampur');
    log('═'.repeat(60));
    status.innerHTML = '<span class="text-yellow-600 font-semibold animate-pulse">⏳ Menjalankan OBE...</span>';
    status.className = 'px-4 py-3 bg-yellow-50 rounded-xl text-yellow-600 font-medium border-2 border-yellow-200';
    const m = state.m, n = state.n;
    if (m !== n){
      status.innerHTML = '<span class="text-red-600 font-semibold">❌ ERROR: m ≠ n</span>';
      status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
      log(`\n❌ Sistem bukan kuadrat: m=${m}, n=${n}`);
      log('Jumlah bahan harus sama dengan jumlah premix');
      return;
    }

    let mat = state.compMatrix.map((r,i)=> r.map(c=> Number(c)));
    for(let i=0;i<m;i++) mat[i].push(Number(state.stock[i] || 0));

    log('\n📋 MATRIKS AUGMENTED AWAL [A | B]:');
    log('   (Komposisi Premix | Target Bahan)');
    printAugmented(mat);

    const EPS = 1e-12;

    for(let col=0; col<n; col++){
      log(`\n${'─'.repeat(60)}`);
      log(`🔄 PROSES KOLOM ${col+1} (Premix ${state.productNames[col] || 'Mix '+(col+1)}):`);
      
      // Cari pivot terbesar (partial pivoting)
      let pivotRow = col;
      let maxVal = Math.abs(mat[col][col]);
      for(let r=col+1; r<n; r++){
        const v = Math.abs(mat[r][col]);
        if (v > maxVal){ maxVal = v; pivotRow = r; }
      }
      if (Math.abs(mat[pivotRow][col]) < EPS){
        log(`\n⚠️ Pivot ≈ 0 di kolom ${col+1} — sistem singular!`);
        log('💡 KEMUNGKINAN: Komposisi premix tidak independen/valid');
        status.innerHTML = '<span class="text-red-600 font-semibold">❌ Sistem singular</span>';
        status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
        resultArea.innerHTML = '<div class="text-red-600 font-semibold">❌ Sistem tidak dapat diselesaikan - Komposisi premix tidak valid.</div>';
        return;
      }
      
      // OBE #1: PERTUKARAN BARIS
      if (pivotRow !== col){
        [mat[col], mat[pivotRow]] = [mat[pivotRow], mat[col]];
        log(`\n📝 OBE #1 - PERTUKARAN BARIS:`);
        log(`   Menukar baris ${col+1} dengan baris ${pivotRow+1}`);
        log(`   Notasi: R${col+1} ↔ R${pivotRow+1}`);
        log(`   Tujuan: Menempatkan pivot terbesar di posisi diagonal`);
        printAugmented(mat);
      }
      
      const pivot = mat[col][col];
      
      // OBE #2: PERKALIAN BARIS DENGAN KONSTANTA
      if (Math.abs(pivot - 1) > EPS){
        for(let k=col; k<=n; k++) mat[col][k] = mat[col][k] / pivot;
        log(`\n📝 OBE #2 - PERKALIAN BARIS DENGAN KONSTANTA:`);
        log(`   Membagi baris ${col+1} dengan konstanta ${formatNum(pivot)}`);
        log(`   Notasi: R${col+1} ← R${col+1} / ${formatNum(pivot)}`);
        log(`   Tujuan: Membuat pivot (elemen diagonal) = 1`);
        printAugmented(mat);
      }
      
      // OBE #3: MENAMBAHKAN KELIPATAN SUATU BARIS KE BARIS LAIN
      for(let r=0; r<n; r++){
        if (r === col) continue;
        const factor = mat[r][col];
        if (Math.abs(factor) < EPS) continue;
        for(let k=col; k<=n; k++){
          mat[r][k] = mat[r][k] - factor * mat[col][k];
        }
        const multiplier = -factor;
        log(`\n📝 OBE #3 - MENAMBAHKAN KELIPATAN BARIS KE BARIS LAIN:`);
        log(`   Menambahkan ${formatNum(multiplier)} kali baris ${col+1} ke baris ${r+1}`);
        log(`   Notasi: R${r+1} ← ${formatNum(multiplier)} × R${col+1} + R${r+1}`);
        log(`   Tujuan: Membuat elemen di posisi [${r+1},${col+1}] = 0`);
        printAugmented(mat);
      }
    }

    let solvable = true;
    for(let i=0;i<n;i++){
      for(let j=0;j<n;j++){
        if (i===j){
          if (Math.abs(mat[i][j] - 1) > 1e-6) solvable = false;
        } else {
          if (Math.abs(mat[i][j]) > 1e-6) solvable = false;
        }
      }
    }

    if (!solvable){
      log('\n\n⚠️ PERINGATAN: Matriks tidak tereduksi ke identitas');
      log('Sistem mungkin tidak memiliki solusi unik');
      status.innerHTML = '<span class="text-red-600 font-semibold">❌ Tidak ada solusi unik</span>';
      status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
      resultArea.innerText = '❌ Tidak ada solusi unik (periksa input)';
      return;
    }

    const sol = mat.map(r => r[n]);
    log('\n\n' + '═'.repeat(60));
    log('✨ HASIL PERHITUNGAN CAMPURAN:');
    log('═'.repeat(60));
    
    let negative = false;
    let out = '';
    let totalKg = 0;
    
    for(let i=0;i<n;i++){
      const name = state.productNames[i] || ('Mix '+(i+1));
      const val = sol[i];
      totalKg += val;
      
      if (val < -1e-9) negative = true;
      
      log(`📊 ${name} = ${formatInteger(val)} kg`);
      out += `<div class="flex justify-between items-center py-2 border-b border-gray-200">`;
      out += `<span class="font-semibold text-gray-700">${name}</span>`;
      out += `<span class="text-2xl font-bold text-indigo-600">${formatInteger(val)} kg</span>`;
      out += `</div>`;
    }

    if (negative){
      log('\n❌ HASIL TIDAK VALID: Terdapat nilai negatif!');
      log('');
      log('💡 PENYEBAB:');
      log('  • Target bahan TIDAK MUNGKIN dicapai dengan kombinasi premix ini');
      log('  • Komposisi premix tidak cocok untuk target yang diinginkan');
      log('');
      log('📝 SOLUSI:');
      log('  1. Ubah target bahan agar lebih realistis');
      log('  2. Ubah komposisi premix');
      log('  3. Gunakan tombol "Isi Contoh" untuk data valid');
      
      status.innerHTML = '<span class="text-red-600 font-semibold">❌ Hasil tidak valid (negatif)</span>';
      status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
      resultArea.innerHTML = '<div class="text-red-600 font-semibold mb-3 text-lg">❌ Hasil Tidak Valid</div><div class="text-gray-700 mb-3">Jumlah premix tidak bisa negatif. Target bahan tidak dapat dicapai dengan kombinasi premix ini.</div><div class="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-amber-900 text-sm"><strong>💡 Saran:</strong> Periksa kembali target atau gunakan tombol "Isi Contoh" untuk data yang valid.</div>';
      
      // status.innerHTML = '<span class="text-red-600 font-semibold">❗ Komposisi tidak valid </span>';
      // status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
      // resultArea.innerHTML = '<div class="text-red-600 font-semibold">Perhitungan menghasilkan nilai negatif pada jumlah salah satu produk,yang berarti target bahan yang Anda masukkan tidak dapat dicapai dari ketiga menu dengan komposisi yang tersedia. Silakan:<br>• periksa kembali target total bahan, <br>• atau revisi komposisi masing-masing menu.</div>';
      

    } else {
      log('\n✅ SUKSES! Resep pencampuran:');
      log('');
      log(`📦 TOTAL ADONAN: ${formatInteger(totalKg)} kg`);
      log('');
      log('💡 CARA MEMBUAT:');
      for(let i=0;i<n;i++){
        const name = state.productNames[i] || ('Mix '+(i+1));
        const val = sol[i];
        log(`  ${i+1}. Ambil ${formatInteger(val)} kg ${name}`);
      }
      log('  4. Campur semua premix hingga rata');
      log('  5. Adonan siap digunakan!');
      
      status.innerHTML = '<div class="flex gap-2"><span>✅</span><span class="text-green-600 font-semibold">Resep berhasil dihitung!</span></div>';
      status.className = 'px-4 py-3 bg-green-50 rounded-xl text-green-600 font-medium border-2 border-green-200';
      
      resultArea.innerHTML = `
        <div class="text-green-600 font-semibold mb-4 text-xl">✅ Resep Pencampuran Premix:</div>
        <div class="space-y-1 mb-4">${out}</div>
        <div class="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4 text-indigo-900">
          <strong>📦 Total Adonan:</strong> ${formatInteger(totalKg)} kg<br>
          <strong>📝 Instruksi:</strong> Campur semua premix di atas hingga rata, adonan siap digunakan!
        </div>
      `;
    }
  }

  function printAugmented(mat){
    for(let i=0;i<mat.length;i++){
      const row = mat[i].slice(0, mat[i].length-1).map(v=> formatNum(v).padStart(12)).join(' ');
      const b = formatNum(mat[i][mat[i].length-1]).padStart(12);
      log(`[ ${row} | ${b} ]`);
    }
  }

  function downloadCSV(){
    try{ buildStateFromDOM(); } catch(e){ alert('Buat form dulu.'); return; }
    const n = state.n, m = state.m;
    const headers = ['Premix'].concat(state.ingredientNames);
    let csv = headers.join(',') + '\n';
    for(let i=0;i<n;i++){
      const name = state.productNames[i] || ('Mix '+(i+1));
      const comps = [];
      for(let j=0;j<m;j++) comps.push(state.compMatrix[j][i] || 0);
      csv += [name].concat(comps).join(',') + '\n';
    }
    csv += 'TARGET,' + state.stock.join(',') + '\n';
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'premix_martabak.csv';
    a.click(); URL.revokeObjectURL(url);
  }

})();