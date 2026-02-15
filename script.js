// 1. استيراد المكتبات من Firebase (Modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onDisconnect, onValue, serverTimestamp } 
       from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 2. إعدادات Firebase الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyD2pSTc_MFQ0mPuX-fVBM0j2astCDTm5Og",
    authDomain: "mysite-2e341.firebaseapp.com",
    projectId: "mysite-2e341",
    databaseURL: "https://mysite-2e341-default-rtdb.firebaseio.com", 
    storageBucket: "mysite-2e341.firebasestorage.app",
    messagingSenderId: "687955910070",
    appId: "1:687955910070:web:56d888479ca3caef5a3517"
};

// 3. تشغيل Firebase والطلبات الأولية
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let currentUsername = "";
let isInitialLoad = true; // لمنع تنبيهات الرسايل القديمة

// طلب إذن التنبيهات
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

// 4. دالة تسجيل الدخول
const login = () => {
    const userIn = document.getElementById('usernameInput').value;
    const passIn = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('loginError');

    if (userIn.trim() !== "" && passIn === "1234") {
        currentUsername = userIn.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = `${currentUsername.toUpperCase()}@TERMINAL`;
        
        // تسجيل المستخدم أونلاين
        const userStatusRef = ref(db, 'status/' + currentUsername);
        set(userStatusRef, true);
        onDisconnect(userStatusRef).remove();

        startApp(); 
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

// 6. تشغيل المهام (استلام الرسايل والمستخدمين)
function startApp() {
    const messagesRef = ref(db, 'messages');
    const statusRef = ref(db, 'status');

    // استلام الرسايل
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);

        // إرسال تنبيه لو مش أنا اللي باعت والتحميل الأولي خلص
        if (!isInitialLoad && data.sender !== currentUsername) {
            showNotification(data.sender, data.content);
        }
    });

    // تحميل الرسايل القديمة بياخد وقت بسيط، بعدها نفعل التنبيهات
    setTimeout(() => { isInitialLoad = false; }, 2000);

    // تحديث قائمة المتصلين
    onValue(statusRef, (snapshot) => {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        usersList.innerHTML = '';
        const users = snapshot.val() || {};
        Object.keys(users).forEach(user => {
            const li = document.createElement('li');
            li.innerText = user;
            usersList.appendChild(li);
        });
    });
}

// 7. إظهار التنبيه وتغيير العنوان
function showNotification(sender, message) {
    // تغيير عنوان التاب
    document.title = `(*) رسالة جديدة من ${sender}`;
    
    if (Notification.permission === "granted") {
        const notification = new Notification(`Secure Terminal`, {
            body: `${sender.toUpperCase()}: ${message}`,
            icon: "https://cdn-icons-png.flaticon.com/512/906/906206.png"
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
}

// رجوع العنوان للأصلي عند الدخول للصفحة
window.onfocus = () => { 
    document.title = `Linux Terminal Chat`; 
};

// 8. رسم الرسايل
function renderMessage(data) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

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

// 9. ربط الأزرار برمجياً
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.onclick = login;

    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.onclick = sendMessage;

    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.onclick = () => {
            document.getElementById('sidebar').classList.toggle('active');
        };
    }

    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
    }
});
