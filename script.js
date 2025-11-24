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
    html += '</div><h2 class="text-2xl font-bold text-gray-800">Daftar Produk & Komposisi</h2></div>';
    html += '<div class="overflow-x-auto rounded-xl border-2 border-gray-200">';
    html += '<table class="w-full">';
    html += '<thead class="bg-linear-to-br from-indigo-50 to-purple-50"><tr>';
    html += '<th class="px-4 py-4 text-left font-bold text-indigo-700 border-b-2 border-gray-200">Produk</th>';
    for(let j=0;j<m;j++){
      const b = state.ingredientNames[j] || ('Bahan '+(j+1));
      let opts = '';
      for(const u of units) opts += `<option value="${u}">${u}</option>`;
      html += `<th class="px-4 py-4 text-left font-bold text-purple-700 border-b-2 border-gray-200"><div class="flex items-center gap-2"><span class="font-medium">${b}</span><select id="unit_${j}" class="unit-select px-2 py-1 text-sm border rounded-md bg-white">${opts}</select></div></th>`;
    }
    html += '</tr></thead><tbody class="bg-white">';
    for(let i=0;i<n;i++){
      html += '<tr class="hover:bg-gray-50 transition-colors">';
      html += `<td class="px-4 py-3 border-b border-gray-100"><input class="pname w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium" data-i="${i}" type="text" placeholder="Nama Produk ${i+1}"></td>`;
      for(let j=0;j<m;j++){
        html += `<td class="px-4 py-3 border-b border-gray-100"><input class="comp w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none font-medium" data-i="${i}" data-j="${j}" type="number" min="0" step="any"></td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';

    html += '<div class="mt-8"><div class="flex items-center gap-3 mb-4">';
    html += '<div class="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">';
    html += '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
    html += '</div><h3 class="text-xl font-bold text-gray-800">Stok Gudang</h3></div>';
    html += '<div class="overflow-x-auto rounded-xl border-2 border-gray-200">';
    html += '<table class="w-full bg-white"><thead class="bg-linear-to-br from-emerald-50 to-teal-50"><tr>';
    for(let j=0;j<m;j++){
      const b = state.ingredientNames[j] || ('Bahan '+(j+1));
      html += `<th class="px-4 py-4 text-left font-bold text-emerald-700 border-b-2 border-gray-200">${b}</th>`;
    }
    html += '</tr></thead><tbody><tr class="hover:bg-gray-50 transition-colors">';
    for(let j=0;j<m;j++){
      let opts = '';
      for(const u of units) opts += `<option value="${u}">${u}</option>`;
      html += `<td class="px-4 py-3"><div class="flex gap-2"><input id="stok_${j}" class="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none font-medium" type="number" min="0" step="any"><select id="unit_stock_${j}" class="text-emerald-500 w-24 px-2 py-1 text-sm border rounded-md bg-white">${opts}</select></div></td>`;
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

  function fillExample(){
    buildTables();
    const defaultNames = ['Martabak Manis','Martabak Telur','Martabak Mini'];
    document.querySelectorAll('.pname').forEach((el, idx)=> el.value = defaultNames[idx] || `Martabak ${idx+1}`);

    // Generate random comps between 1 and 1000 for each product-ingredient cell
    const n = state.n || 0, m = state.m || 0;
    const compVals = Array.from({length:n}, ()=> Array(m).fill(0));
    document.querySelectorAll('.comp').forEach(el=>{
      const i = parseInt(el.dataset.i), j = parseInt(el.dataset.j);
      const v = Math.floor(Math.random()*1000) + 1; // 1..1000
      el.value = v;
      compVals[i][j] = v;
    });

    // For each ingredient, compute a logical stok based on total needed across products
    const unitList = ['gr','kg','ml','l','pcs'];
    for(let j=0;j<m;j++){
      // total needed if produce 1 unit of each product
      let totalNeeded = 0;
      for(let i=0;i<n;i++) totalNeeded += (compVals[i][j] || 0);
      // choose multiplier 1..5 so stock is a multiple of totalNeeded (makes sense)
      const mult = Math.floor(Math.random()*5) + 1;
      const stokVal = Math.max(1, Math.floor(totalNeeded * mult));
      const s = $(`stok_${j}`);
      if (s) s.value = stokVal;

      // pick a random unit for both header and stock select (keeps consistent)
      const randUnit = unitList[Math.floor(Math.random()*unitList.length)];
      const usel = $(`unit_${j}`);
      if (usel) usel.value = randUnit;
      const uselStock = $(`unit_stock_${j}`);
      if (uselStock) uselStock.value = randUnit;
    }

    clearTerminal();
    log('✓ Contoh data acak berhasil diisi (komposisi: 1–1000).');
    log('→ Stok diatur berdasar total kebutuhan × faktor acak 1–5.');
    status.innerHTML = '<div class = "flex gap-2"><span> ✓ </span> <span class="text-blue-600 font-semibold"> Contoh acak terisi</span></div>';
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
    state.productNames = Array.from(document.querySelectorAll('.pname')).map(x=>x.value || 'Produk');
    const n = state.n, m = state.m;
    const compRowsByProduct = Array.from({length:n}, ()=>Array(m).fill(0));
    document.querySelectorAll('.comp').forEach(el=>{
      const i = parseInt(el.dataset.i), j = parseInt(el.dataset.j);
      compRowsByProduct[i][j] = parseFloat(el.value) || 0;
    });
    const compMatrix = Array.from({length:m}, (_,r)=> Array.from({length:n}, (_,c)=> compRowsByProduct[c][r] ));
    state.compMatrix = compMatrix;
    state.stock = [];
    state.units = [];
    state.stockUnits = [];
    for(let j=0;j<m;j++){
      const v = parseFloat($(`stok_${j}`).value) || 0;
      state.stock.push(v);
      const u = (document.getElementById(`unit_${j}`) && document.getElementById(`unit_${j}`).value) || '';
      const us = (document.getElementById(`unit_stock_${j}`) && document.getElementById(`unit_stock_${j}`).value) || u || '';
      state.units.push(u);
      state.stockUnits.push(us);
    }
  }

  function showMatrix(){
    try{ buildStateFromDOM(); } catch(e){ alert('Buat form dulu.'); return; }
    clearTerminal();
    log('📊 MATRIKS A (koefisien) — baris=bahan, kolom=produk:');
    log('═'.repeat(50));
    printMatrix(state.compMatrix);
    log('\n📦 VEKTOR STOK B:');
    log('═'.repeat(50));
    state.stock.forEach((v,i)=> log(`B[${i+1}] = ${formatNum(v)}`));
  }

  function formatNum(x){
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    return Number(x).toFixed(6);
  }

  function printMatrix(mat){
    for(let i=0;i<mat.length;i++){
      const row = mat[i].map(v=> formatNum(v).padStart(10)).join(' ');
      log(row);
    }
  }

  function onSolve(){
    try{ buildStateFromDOM(); } catch(e){ alert('Buat form dulu.'); return; }
    clearTerminal();
    log('🚀 MEMULAI ELIMINASI GAUSS-JORDAN');
    log('═'.repeat(60));
    status.innerHTML = '<span class="text-yellow-600 font-semibold animate-pulse">⏳ Menjalankan OBE...</span>';
    status.className = 'px-4 py-3 bg-yellow-50 rounded-xl text-yellow-600 font-medium border-2 border-yellow-200';
    const m = state.m, n = state.n;
    if (m !== n){
      status.innerHTML = '<span class="text-red-600 font-semibold">❌ ERROR: m ≠ n</span>';
      status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
      log(`\n❌ Sistem bukan kuadrat: m=${m}, n=${n}`);
      log('Sistem harus memiliki jumlah bahan = jumlah produk');
      return;
    }

    let mat = state.compMatrix.map((r,i)=> r.map(c=> Number(c)));
    for(let i=0;i<m;i++) mat[i].push(Number(state.stock[i] || 0));

    log('\n📋 MATRIKS AUGMENTED AWAL [A | B]:');
    printAugmented(mat);

    const EPS = 1e-12;

    for(let col=0; col<n; col++){
      log(`\n${'─'.repeat(60)}`);
      log(`🔄 PROSES KOLOM ${col+1}:`);
      
      // Cari pivot terbesar (partial pivoting)
      let pivotRow = col;
      let maxVal = Math.abs(mat[col][col]);
      for(let r=col+1; r<n; r++){
        const v = Math.abs(mat[r][col]);
        if (v > maxVal){ maxVal = v; pivotRow = r; }
      }
      if (Math.abs(mat[pivotRow][col]) < EPS){
        log(`\n⚠️ Pivot ≈ 0 di kolom ${col+1} — sistem singular!`);
        status.innerHTML = '<span class="text-red-600 font-semibold">❌ Sistem singular</span>';
        status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
        break;
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
    log('✨ SOLUSI SISTEM PERSAMAAN LINEAR:');
    log('═'.repeat(60));
    let negative = false;
    let out = '';
    for(let i=0;i<n;i++){
      const name = state.productNames[i] || ('Martabak '+(i+1));
      log(`📊 x${i+1} (${name}) = ${formatNum(sol[i])}`);
      out += `${name}: ${formatNum(sol[i])} unit\n`;
      if (sol[i] < -1e-9) negative = true;
    }

    if (negative){
      log('\n⚠️ PERHATIAN: Solusi mengandung nilai negatif!');
      log('Periksa kembali komposisi dan stok yang diinput');
      status.innerHTML = '<div class = "flex gap-2"><span> ⚠️ </span> <span class="text-red-600 font-semibold"> Solusi negatif</span></div>';
      status.className = 'px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium border-2 border-red-200';
      resultArea.innerHTML = '<div class="text-red-600 font-semibold">⚠️ Solusi mengandung nilai negatif. Periksa input Anda.</div>';
    } else {
      log('\n✅ SUKSES! Solusi valid ditemukan');
      status.innerHTML = '<div class = "flex gap-2"><span> ✅ </span> <span class="text-green-600 font-semibold"> Sukses: solusi valid</span></div>';
      status.className = 'px-4 py-3 bg-green-50 rounded-xl text-green-600 font-medium border-2 border-green-200';
      resultArea.innerHTML = '<div class="text-green-600 font-semibold mb-3 text-lg">✅ Solusi Valid:</div><div class="text-gray-800 text-lg space-y-1 font-medium">' + out.replace(/\n/g, '<br>') + '</div>';
    }
  }

  function printAugmented(mat){
    for(let i=0;i<mat.length;i++){
      const row = mat[i].slice(0, mat[i].length-1).map(v=> formatNum(v).padStart(10)).join(' ');
      const b = formatNum(mat[i][mat[i].length-1]).padStart(10);
      log(`[ ${row} | ${b} ]`);
    }
  }

  function downloadCSV(){
    try{ buildStateFromDOM(); } catch(e){ alert('Buat form dulu.'); return; }
    const n = state.n, m = state.m;
    const headers = ['Produk'].concat(state.ingredientNames);
    let csv = headers.join(',') + '\n';
    for(let i=0;i<n;i++){
      const name = state.productNames[i] || ('Martabak '+(i+1));
      const comps = [];
      for(let j=0;j<m;j++) comps.push(state.compMatrix[j][i] || 0);
      csv += [name].concat(comps).join(',') + '\n';
    }
    csv += 'STOK,' + state.stock.join(',') + '\n';
    if (state.units && state.units.length) csv += 'UNITS,' + state.units.join(',') + '\n';
    if (state.stockUnits && state.stockUnits.length) csv += 'STOCK_UNITS,' + state.stockUnits.join(',') + '\n';
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'input_martabak.csv';
    a.click(); URL.revokeObjectURL(url);
  }

})();