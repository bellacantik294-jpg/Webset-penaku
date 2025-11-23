import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, query, where, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {"apiKey": "AIzaSyD2-BRqOnFX6o4WDl-ZmYs3M6uuk7srYaM", "authDomain": "tintaku-58bcf.firebaseapp.com", "projectId": "tintaku-58bcf", "storageBucket": "tintaku-58bcf.firebasestorage.app", "messagingSenderId": "597580314120", "appId": "1:597580314120:web:0a3f9ef923d3df22b183bd", "measurementId": "G-TVFEBKGMD0"};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getAllCerpenRandom(){
  const col = collection(db,"cerpen");
  const snap = await getDocs(col);
  const arr = [];
  snap.forEach(s=>arr.push({id:s.id, ...s.data()}));
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

export async function getCerpenById(id){
  const dRef = doc(db,"cerpen",id);
  const d = await getDoc(dRef);
  if(!d.exists()) return null;
  return {id:d.id, ...d.data()};
}

export async function getByCategory(cat){
  const col = collection(db,"cerpen");
  const q = query(col, where("category","==",cat));
  const snap = await getDocs(q);
  const arr = [];
  snap.forEach(s=>arr.push({id:s.id,...s.data()}));
  return arr;
}
