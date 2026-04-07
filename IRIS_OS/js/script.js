let db = JSON.parse(localStorage.getItem('iris_db')) || { entradas: [], saidas: [] };

function saveDB() {
    localStorage.setItem('iris_db', JSON.stringify(db));
    updateSums();
}

function switchPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// TEMA DIA/NOITE
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-text').innerText = isDark ? "Modo Noite" : "Modo Dia";
});

function addRow(type) {
    const newItem = { id: Date.now(), desc: 'Novo...', cat: 'Geral', data: new Date().toISOString().split('T')[0], val: 0, status: 'Pendente' };
    if(type === 'ent') db.entradas.push(newItem); else db.saidas.push(newItem);
    renderTables();
    saveDB();
}

function updateItem(type, id, field, value) {
    const list = type === 'ent' ? db.entradas : db.saidas;
    const item = list.find(i => i.id === id);
    item[field] = field === 'val' ? parseFloat(value) || 0 : value;
    saveDB();
}

function deleteItem(type, id) {
    if(type === 'ent') db.entradas = db.entradas.filter(i => i.id !== id);
    else db.saidas = db.saidas.filter(i => i.id !== id);
    renderTables();
    saveDB();
}

function renderTables() {
    const draw = (list, elId, type) => {
        const body = document.getElementById(elId);
        if(!body) return;
        body.innerHTML = list.map(i => `
            <tr>
                <td><input value="${i.desc}" onchange="updateItem('${type}', ${i.id}, 'desc', this.value)"></td>
                <td><input value="${i.cat}" onchange="updateItem('${type}', ${i.id}, 'cat', this.value)"></td>
                <td><input type="date" value="${i.data}" onchange="updateItem('${type}', ${i.id}, 'data', this.value)"></td>
                <td><input type="number" value="${i.val}" onchange="updateItem('${type}', ${i.id}, 'val', this.value)"></td>
                <td><input value="${i.status}" onchange="updateItem('${type}', ${i.id}, 'status', this.value)"></td>
                <td><button onclick="deleteItem('${type}', ${i.id})" style="color:red; background:none; border:none; cursor:pointer;">&times;</button></td>
            </tr>
        `).join('');
    };
    draw(db.entradas, 'body-ent', 'ent');
    draw(db.saidas, 'body-sai', 'sai');
}

function updateSums() {
    const fmt = (v) => v.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});
    let e_rec = 0, e_tot = 0, s_pago = 0, s_tot = 0;
    db.entradas.forEach(i => { e_tot += i.val; if(i.status.toLowerCase().includes('rec')) e_rec += i.val; });
    db.saidas.forEach(i => { s_tot += i.val; if(i.status.toLowerCase().includes('pago')) s_pago += i.val; });
    document.getElementById('dash-saldo').innerText = fmt(e_rec - s_pago);
    document.getElementById('dash-bruto-dia').innerText = fmt(e_tot);
    document.getElementById('dash-pendencias').innerText = fmt(s_tot - s_pago);
}

window.onload = () => {
    if(localStorage.getItem('theme') === 'light') document.body.classList.remove('dark-mode');
    renderTables();
    updateSums();
};