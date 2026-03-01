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
    // إصلاح تسجيل الدخول
    document.getElementById('loginBtn').onclick = login;
    
    // ربط الرسائل
    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('userInput').onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    
    // Purge
    document.getElementById('clearChatBtn').onclick = () => {
        if(confirm("Delete all data?")) remove(ref(db, 'messages'));
    };

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); sidebar.classList.add('active'); };
    document.getElementById('closeSidebar').onclick = () => sidebar.classList.remove('active');
    document.body.onclick = () => sidebar.classList.remove('active');
});

function login() {
    const user = document.getElementById('usernameInput').value.trim();
    if (user !== "" && document.getElementById('passwordInput').value === "1234") {
        currentUsername = user.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = `${currentUsername.toUpperCase()}@TERMINAL`;
        
        set(ref(db, 'status/' + currentUsername), true);
        onDisconnect(ref(db, 'status/' + currentUsername)).remove();
        startApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const content = input.value.trim();
    if (content !== "") {
        onValue(ref(db, 'status'), (snapshot) => {
            const onlineCount = Object.keys(snapshot.val() || {}).length;
            push(ref(db, 'messages'), {
                sender: currentUsername,
                content: content,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: onlineCount > 1 ? 'delivered' : 'sent',
                timestamp: serverTimestamp()
            });
        }, { onlyOnce: true });
        input.value = '';
    }
}

function startApp() {
    onChildAdded(ref(db, 'messages'), (snapshot) => {
        const data = snapshot.val();
        renderMessage(data, snapshot.key);
        if (data.sender !== currentUsername) {
            update(ref(db, `messages/${snapshot.key}`), { status: 'seen' });
        }
    });

    onChildChanged(ref(db, 'messages'), (snapshot) => {
        const dot = document.getElementById(`dot-${snapshot.key}`);
        if (dot) dot.className = `status-dot status-${snapshot.val().status}`;
    });

    onValue(ref(db, 'status'), (snapshot) => {
        const list = document.getElementById('usersList');
        list.innerHTML = '';
        Object.keys(snapshot.val() || {}).forEach(u => {
            const li = document.createElement('li'); li.innerText = `● ${u.toUpperCase()}`;
            list.appendChild(li);
        });
    });

    setTimeout(() => { isInitialLoad = false; scrollToBottom(); }, 1000);
}

function renderMessage(data, key) {
    const chatBox = document.getElementById('chatBox');
    const isMe = data.sender === currentUsername;
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'my-msg' : 'client-msg'}`;
    div.innerHTML = `
        <span class="msg-user">${data.sender.toUpperCase()}</span>
        <div>${data.content}</div>
        <div class="time-wrapper">
            <span>${data.time}</span>
            <span class="status-dot status-${data.status}" id="dot-${key}"></span>
        </div>
    `;
    chatBox.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    const chatBox = document.getElementById('chatBox');
    // استخدام التايم أوت لضمان تحميل العنصر في المتصفح
    setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 50);
}