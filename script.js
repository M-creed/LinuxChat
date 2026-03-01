import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set, onDisconnect, onValue, serverTimestamp, remove, update } 
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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginBtn').onclick = login;
    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('clearChatBtn').onclick = purgeData;
    
    const sidebar = document.getElementById('sidebar');
    document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); sidebar.classList.add('active'); };
    document.getElementById('closeSidebar').onclick = () => sidebar.classList.remove('active');
    document.body.onclick = () => sidebar.classList.remove('active');
    
    document.getElementById('userInput').onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
});

function login() {
    const user = document.getElementById('usernameInput').value.trim();
    if (user !== "" && document.getElementById('passwordInput').value === "1234") {
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
    const content = input.value.trim();
    if (content !== "") {
        // فحص عدد المستخدمين Online لتحديد الحالة الابتدائية (Sent أو Delivered)
        onValue(ref(db, 'status'), (snapshot) => {
            const onlineCount = Object.keys(snapshot.val() || {}).length;
            const initialStatus = onlineCount > 1 ? 'delivered' : 'sent';

            push(ref(db, 'messages'), {
                sender: currentUsername,
                content: content,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: initialStatus,
                timestamp: serverTimestamp()
            });
        }, { onlyOnce: true });

        input.value = '';
        input.focus();
    }
}

function startApp() {
    const chatBox = document.getElementById('chatBox');

    // استلام الرسائل
    onChildAdded(ref(db, 'messages'), (snapshot) => {
        const data = snapshot.val();
        const msgKey = snapshot.key;
        renderMessage(data, msgKey);

        // إذا كانت الرسالة من طرف آخر، نحولها لـ seen
        if (data.sender !== currentUsername && data.status !== 'seen') {
            update(ref(db, `messages/${msgKey}`), { status: 'seen' });
        }
    });

    // تحديث الحالة فوراً عند تغييرها في السيرفر (من Delivered لـ Seen مثلاً)
    onChildChanged(ref(db, 'messages'), (snapshot) => {
        const data = snapshot.val();
        const dot = document.getElementById(`dot-${snapshot.key}`);
        if (dot) {
            dot.className = `status-dot status-${data.status}`;
        }
    });

    setTimeout(() => { isInitialLoad = false; scrollToBottom(); }, 2000);

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

function renderMessage(data, key) {
    const chatBox = document.getElementById('chatBox');
    const isMe = data.sender === currentUsername;
    const div = document.createElement('div');
    div.id = `msg-${key}`;
    div.className = `message ${isMe ? 'my-msg' : 'client-msg'}`;
    
    div.innerHTML = `
        <span class="msg-user">${data.sender.toUpperCase()}</span>
        <div class="msg-content">${data.content}</div>
        <div class="time-wrapper">
            <span class="time">${data.time}</span>
            <span class="status-dot status-${data.status || 'sent'}" id="dot-${key}"></span>
        </div>
    `;
    chatBox.appendChild(div);
    scrollToBottom();
}

function purgeData() {
    if (confirm("!! PERMANENT PURGE !!\nErase all server records?")) {
        remove(ref(db, 'messages')).then(() => {
            document.getElementById('chatBox').innerHTML = '';
        });
    }
}

function scrollToBottom() {
    const chatBox = document.getElementById('chatBox');
    setTimeout(() => { chatBox.scrollTop = chatBox.scrollHeight; }, 50);
}

window.onfocus = () => { document.title = `Cyber Terminal v2.0`; };
