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

// طلب إذن التنبيهات
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
};

// دالة تسجيل الدخول
const login = () => {
    const userIn = document.getElementById('usernameInput').value;
    const passIn = document.getElementById('passwordInput').value;
    if (userIn.trim() !== "" && passIn === "1234") {
        currentUsername = userIn.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = `${currentUsername.toUpperCase()}@TERMINAL`;
        
        const userStatusRef = ref(db, 'status/' + currentUsername);
        set(userStatusRef, true);
        onDisconnect(userStatusRef).remove();
        startApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
};

// إرسال الرسالة
const sendMessage = () => {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (text !== "") {
        push(ref(db, 'messages'), {
            sender: currentUsername,
            content: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: serverTimestamp()
        });
        input.value = '';
    }
};

// تشغيل المستمعات
function startApp() {
    onChildAdded(ref(db, 'messages'), (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);
        if (!isInitialLoad && data.sender !== currentUsername) {
            showNotification(data.sender, data.content);
        }
    });
    setTimeout(() => { isInitialLoad = false; }, 2000);

    onValue(ref(db, 'status'), (snapshot) => {
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

function showNotification(sender, message) {
    document.title = `(*) رسالة من ${sender}`;
    if (Notification.permission === "granted") {
        new Notification(`Terminal Message`, { body: `${sender}: ${message}` });
    }
}

window.onfocus = () => { document.title = `Linux Terminal Chat`; };

function renderMessage(data) {
    const chatBox = document.getElementById('chatBox');
    const isMe = data.sender === currentUsername;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMe ? 'my-msg' : 'client-msg'}`;
    msgDiv.innerHTML = `<span class="msg-user">${data.sender.toUpperCase()}</span>${data.content}<span class="time">${data.time}</span>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// الربط البرمجي للأزرار
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginBtn').onclick = login;
    document.getElementById('sendBtn').onclick = sendMessage;
    
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle) {
        menuToggle.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        };
    }

    // إغلاق القائمة عند الضغط على الشات في الموبايل
    document.getElementById('chatBox').onclick = () => {
        sidebar.classList.remove('active');
    };

    document.getElementById('userInput').onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };
});
