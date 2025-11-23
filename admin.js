import { auth, db, storage } from "./firebase-app.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, addDoc, doc, deleteDoc, onSnapshot, setDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const loginEmail = document.getElementById('a_email');
const loginPass = document.getElementById('a_pass');
const btnSignIn = document.getElementById('btnSignIn');
const btnRegister = document.getElementById('btnRegister');
const btnSignOut = document.getElementById('btnSignOut');
const authMsg = document.getElementById('authMsg');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');

const cerpenForm = document.getElementById('cerpenForm');
const f_title = document.getElementById('f_title');
const f_cat = document.getElementById('f_cat');
const f_cover_file = document.getElementById('f_cover_file');
const f_cover_url = document.getElementById('f_cover_url');
const f_content = document.getElementById('f_content');
const f_docid = document.getElementById('f_docid');
const adminList = document.getElementById('adminList');
const btnDelete = document.getElementById('btnDelete');

btnSignIn?.addEventListener('click', async ()=>{
  try{
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPass.value);
    authMsg.textContent = 'Login sukses';
  }catch(e){ authMsg.textContent = 'Login gagal: '+ e.message; }
});
btnRegister?.addEventListener('click', async ()=>{
  try{
    await createUserWithEmailAndPassword(auth, loginEmail.value, loginPass.value);
    authMsg.textContent = 'Akun dibuat. Silakan login.';
  }catch(e){ authMsg.textContent = 'Gagal membuat akun: '+ e.message; }
});
btnSignOut?.addEventListener('click', async ()=>{ await signOut(auth); });

onAuthStateChanged(auth, user=>{
  if(user){ adminPanel.style.display='block'; loginForm.style.display='none'; authMsg.textContent='Masuk sebagai: '+user.email; }
  else{ adminPanel.style.display='none'; loginForm.style.display='block'; authMsg.textContent='Belum masuk'; }
});

const colRef = collection(db, 'cerpen');
const q = query(colRef, orderBy('date','desc'));
onSnapshot(q, snapshot=>{
  adminList.innerHTML='';
  snapshot.forEach(docSnap=>{
    const d = docSnap.data();
    const id = docSnap.id;
    const row = document.createElement('div'); row.className='cerpen-card';
    row.innerHTML = `<h4>${d.title || d.judul}</h4><p class="small">${d.category || d.kategori} • ${d.date}</p>
      <div style="display:flex;gap:8px"><button class="btn" data-id="${id}" onclick="editCerpen('${id}')">Edit</button><button class="btn danger" onclick="deleteCerpen('${id}')">Hapus</button></div>`;
    adminList.appendChild(row);
  });
});

window.editCerpen = async function(id){
  const docRef = doc(db,'cerpen',id);
  const snap = await getDoc(docRef);
  if(!snap.exists()) return alert('Data tidak ditemukan');
  const data = snap.data();
  f_docid.value = snap.id;
  f_title.value = data.title || data.judul;
  f_cat.value = data.category || data.kategori;
  f_cover_url.value = data.coverUrl || data.gambar || '';
  f_content.value = data.content || data.isi || '';
  window.scrollTo({top:0,behavior:'smooth'});
};

window.deleteCerpen = async function(id){
  if(!confirm('Hapus cerpen?')) return;
  await deleteDoc(doc(db,'cerpen',id));
  alert('Terhapus.');
};

cerpenForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  let coverUrl = f_cover_url.value || '';
  if(f_cover_file.files.length>0){
    const file = f_cover_file.files[0];
    const path = 'covers/' + Date.now() + '_' + file.name;
    const r = sRef(storage, path);
    await uploadBytes(r, file);
    coverUrl = await getDownloadURL(r);
  }
  const payload = {
    title: f_title.value,
    category: f_cat.value,
    content: f_content.value,
    coverUrl,
    date: new Date().toLocaleDateString('id-ID')
  };
  if(f_docid.value){
    await setDoc(doc(db,'cerpen',f_docid.value), payload, { merge:true });
    alert('Diupdate');
  } else {
    await addDoc(colRef, payload);
    alert('Tersimpan');
  }
  cerpenForm.reset();
});
