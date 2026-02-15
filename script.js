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
// طلب إذن التنبيهات عند تحميل الصفحة
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}
// 3. تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUsername = "";

// 4. دالة تسجيل الدخول
const login = () => {
    const userIn = document.getElementById('usernameInput').value;
    const passIn = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('loginError');

    console.log("Attempting login..."); // لمراقبة الحالة في الـ Console

    if (userIn.trim() !== "" && passIn === "1234") {
        currentUsername = userIn.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = `${currentUsername.toUpperCase()}@TERMINAL`;
        
        // تسجيل المستخدم كـ Online في الـ Database
        const userStatusRef = ref(db, 'status/' + currentUsername);
        set(userStatusRef, true);
        onDisconnect(userStatusRef).remove();

        function startApp() {
    const messagesRef = ref(db, 'messages');
    
    // متغير عشان نتجنب التنبيهات للرسائل القديمة أول ما نفتح
    let isInitialLoad = true;
    
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);

        // إرسال تنبيه فقط لو:
        // 1. التحميل الأولي خلص (عشان ما يجيلكش 100 نوتفكيشن أول ما تفتح)
        // 2. اللي باعت الرسالة مش "أنا"
        // 3. المستخدم مش فاتح التاب حالياً (أو حتى لو فاتحها وعايز تنبيه)
        if (!isInitialLoad && data.sender !== currentUsername) {
            showNotification(data.sender, data.content);
        }
    });

    // بعد ثانيتين نعتبر إن التحميل الأولي خلص
    setTimeout(() => { isInitialLoad = false; }, 2000);
    
    // ... باقي كود الـ onValue للمستخدمين أونلاين ...
}

// دالة إظهار التنبيه
function showNotification(sender, message) {
       document.title = `(*) رسالة جديدة - Terminal`;
// ونرجع العنوان الأصلي لما يضغط على الشات
window.onfocus = () => { document.title = `Linux Terminal Chat`; };
    if (Notification.permission === "granted") {
        const notification = new Notification(`رسالة جديدة من ${sender.toUpperCase()}`, {
            body: message,
            icon: "https://cdn-icons-png.flaticon.com/512/906/906206.png" // يمكنك تغيير الأيقونة
        });

        notification.onclick = () => {
            window.focus(); // يفتح التاب لما تدوس على التنبيه
        };
    }
}
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

// 6. تشغيل المهام بعد الدخول الناجح
function startApp() {
    const messagesRef = ref(db, 'messages');
    const statusRef = ref(db, 'status');

    // استلام الرسائل وعرضها
    onChildAdded(messagesRef, (snapshot) => {
        renderMessage(snapshot.val());
    });

    // تحديث قائمة المستخدمين أونلاين
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

// 7. رسم الرسالة في الشاشة (يمين أو شمال)
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

// 8. الربط البرمجي (لحل مشكلة Login is not defined)
document.addEventListener('DOMContentLoaded', () => {
    console.log("Terminal Script Ready...");

    // ربط زر الدخول
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.onclick = login;

    // ربط زر الإرسال
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.onclick = sendMessage;

    // ربط زر القائمة الجانبية للموبايل
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.onclick = () => {
            document.getElementById('sidebar').classList.toggle('active');
        };
    }

    // السماح بالإرسال عند ضغط Enter
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
    }
});

