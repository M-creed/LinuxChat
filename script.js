import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onDisconnect, onValue, serverTimestamp } 
       from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD2pSTc_MFQ0mPuX-fVBM0j2astCDTm5Og",
    authDomain: "mysite-2e341.firebaseapp.com",
    projectId: "mysite-2e341",
    databaseURL: "https://mysite-2e341-default-rtdb.firebaseio.com", 
    storageBucket: "mysite-2e341.firebasestorage.app",
    messagingSenderId: "687955910070",
    appId: "1:687955910070:web:56d888479ca3caef5a3517"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let currentUsername = "";
let isInitialLoad = true;

if (Notification.permission !== "granted") Notification.requestPermission();

// ربط الأزرار
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginBtn').onclick = login;
    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('clearChatBtn').onclick = () => document.getElementById('chatBox').innerHTML = '';
    
    const sidebar = document.getElementById('sidebar');
    document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); sidebar.classList.add('active'); };
    document.getElementById('closeSidebar').onclick = () => sidebar.classList.remove('active');
    document.body.onclick = () => sidebar.classList.remove('active');
    sidebar.onclick = (e) => e.stopPropagation();

    document.getElementById('userInput').onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
});

function login() {
    const user = document.getElementById('usernameInput').value.trim();
    const pass = document.getElementById('passwordInput').value;
    if (user !== "" && pass === "1234") {
        currentUsername = user.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = `${currentUsername.toUpperCase()}@TERMINAL`;
        
        const statusRef = ref(db, 'status/' + currentUsername);
        set(statusRef, true);
        onDisconnect(statusRef).remove();
        startApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function sendMessage() {
    const input = document.getElementById('userInput');
    if (input.value.trim() !== "") {
        push(ref(db, 'messages'), {
            sender: currentUsername,
            content: input.value,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: serverTimestamp()
        });
        input.value = '';
    }
}

function startApp() {
    onChildAdded(ref(db, 'messages'), (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);
        if (!isInitialLoad && data.sender !== currentUsername) {
            new Notification(`Secure Msg`, { body: `${data.sender}: ${data.content}` });
            document.title = `(*) New Message`;
        }
    });
    setTimeout(() => { isInitialLoad = false; }, 2000);

    onValue(ref(db, 'status'), (snapshot) => {
        const list = document.getElementById('usersList');
        list.innerHTML = '';
        Object.keys(snapshot.val() || {}).forEach(u => {
            const li = document.createElement('li');
            li.innerText = `● ${u.toUpperCase()}`;
            list.appendChild(li);
        });
    });
}

function renderMessage(data) {
    const chatBox = document.getElementById('chatBox');
    const isMe = data.sender === currentUsername;
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'my-msg' : 'client-msg'}`;
    div.innerHTML = `<span class="msg-user">${data.sender.toUpperCase()}</span>${data.content}<span class="time">${data.time}</span>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

window.onfocus = () => document.title = `Cyber Terminal v2.0`;
