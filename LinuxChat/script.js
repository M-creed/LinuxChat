// استيراد الدوال من Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onDisconnect, onValue, serverTimestamp } 
       from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// إعدادات Firebase الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyD2pSTc_MFQ0mPuX-fVBM0j2astCDTm5Og",
    authDomain: "mysite-2e341.firebaseapp.com",
    projectId: "mysite-2e341",
    databaseURL: "https://mysite-2e341-default-rtdb.firebaseio.com", 
    storageBucket: "mysite-2e341.firebasestorage.app",
    messagingSenderId: "687955910070",
    appId: "1:687955910070:web:56d888479ca3caef5a3517"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUsername = "";

// دالة تسجيل الدخول
function login() {
    const userIn = document.getElementById('usernameInput').value;
    const passIn = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('loginError');

    if (userIn.trim() !== "" && passIn === "1234") {
        currentUsername = userIn.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = `${currentUsername.toUpperCase()}@TERMINAL`;
        
        // تحديث الحالة لـ Online
        const userStatusRef = ref(db, 'status/' + currentUsername);
        set(userStatusRef, true);
        onDisconnect(userStatusRef).remove();

        startApp();
    } else {
        errorMsg.style.display = 'block';
    }
}

// دالة إرسال الرسالة
function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    
    if (text !== "") {
        const messagesRef = ref(db, 'messages');
        push(messagesRef, {
            sender: currentUsername,
            content: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: serverTimestamp()
        });
        input.value = '';
    }
}

// تشغيل المستمعات (Listeners)
function startApp() {
    const messagesRef = ref(db, 'messages');
    const statusRef = ref(db, 'status');

    // استماع للرسائل الجديدة
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);
    });

    // استماع للمستخدمين المتصلين
    onValue(statusRef, (snapshot) => {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        const users = snapshot.val() || {};
        Object.keys(users).forEach(user => {
            const li = document.createElement('li');
            li.innerText = user;
            usersList.appendChild(li);
        });
    });
}

// عرض الرسائل في الواجهة
function renderMessage(data) {
    const chatBox = document.getElementById('chatBox');
    const isMe = data.sender === currentUsername;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMe ? 'my-msg' : 'client-msg'}`;
    
    msgDiv.innerHTML = `
        <span class="msg-user">${data.sender.toUpperCase()}</span>
        <span class="msg-text">${data.content}</span>
        <span class="time">${data.time}</span>
    `;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ربط الدوال بالـ window لأننا نستخدم Module
document.getElementById('loginBtn').onclick = login;
document.getElementById('sendBtn').onclick = sendMessage;
document.getElementById('menuToggle').onclick = () => {
    document.getElementById('sidebar').classList.toggle('active');
};
document.getElementById('userInput').onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
};