// 1. استيراد المكتبات من Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onDisconnect, onValue, serverTimestamp } 
       from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 2. إعدادات Firebase (ضع بياناتك هنا)
const firebaseConfig = {
    apiKey: "AIzaSyD2pSTc_MFQ0mPuX-fVBM0j2astCDTm5Og",
    authDomain: "mysite-2e341.firebaseapp.com",
    projectId: "mysite-2e341",
    databaseURL: "https://mysite-2e341-default-rtdb.firebaseio.com", 
    storageBucket: "mysite-2e341.firebasestorage.app",
    messagingSenderId: "687955910070",
    appId: "1:687955910070:web:56d888479ca3caef5a3517"
};

// 3. تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUsername = "";

// 4. دالة تسجيل الدخول
const login = () => {
    const userIn = document.getElementById('usernameInput').value;
    const passIn = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('loginError');

    console.log("Attempting login..."); // للتأكد في الـ Console أن الدالة تعمل

    if (userIn.trim() !== "" && passIn === "1234") {
        currentUsername = userIn.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = `${currentUsername.toUpperCase()}@TERMINAL`;
        
        // تحديث الحالة لـ Online في القاعدة
        const userStatusRef = ref(db, 'status/' + currentUsername);
        set(userStatusRef, true);
        onDisconnect(userStatusRef).remove();

        startApp(); // تشغيل استماع الرسائل
    } else {
        errorMsg.style.display = 'block';
    }
};

// 5. دالة إرسال الرسالة
const sendMessage = () => {
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
};

// 6. تشغيل المستمعات بعد الدخول
function startApp() {
    const messagesRef = ref(db, 'messages');
    const statusRef = ref(db, 'status');

    onChildAdded(messagesRef, (snapshot) => {
        renderMessage(snapshot.val());
    });

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

// 7. الربط اليدوي بالأزرار (لأننا نستخدم Module)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginBtn').onclick = login;
    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('menuToggle').onclick = () => {
        document.getElementById('sidebar').classList.toggle('active');
    };
    document.getElementById('userInput').onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };
});
