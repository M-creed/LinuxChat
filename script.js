// بيانات فايربيس الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyD2pSTc_MFQ0mPuX-fVBM0j2astCDTm5Og",
    authDomain: "mysite-2e341.firebaseapp.com",
    projectId: "mysite-2e341",
    databaseURL: "https://mysite-2e341-default-rtdb.firebaseio.com", 
    storageBucket: "mysite-2e341.firebasestorage.app",
    messagingSenderId: "687955910070",
    appId: "1:687955910070:web:56d888479ca3caef5a3517"
};

// تهيئة فايربيس
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
let currentUsername = "";

// ربط العناصر
const loginBtn = document.getElementById('loginBtn');
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const menuToggle = document.getElementById('menuToggle');

// تسجيل الدخول
loginBtn.addEventListener('click', () => {
    const userIn = document.getElementById('usernameInput').value.trim();
    const passIn = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('loginError');

    if (userIn !== "" && passIn === "1234") {
        currentUsername = userIn.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = currentUsername.toUpperCase() + "@TERMINAL";
        
        // تحديث حالة الأونلاين
        const statusRef = database.ref('status/' + currentUsername);
        statusRef.set(true);
        statusRef.onDisconnect().remove();

        startApp();
    } else {
        errorMsg.style.display = 'block';
    }
});

function startApp() {
    listenForMessages();
    listenForUsers();
}

// إرسال الرسالة
function performSend() {
    const text = userInput.value.trim();
    if (text !== "") {
        database.ref('messages').push({
            sender: currentUsername,
            content: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
        userInput.value = '';
    }
}

sendBtn.addEventListener('click', performSend);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSend(); });

// استقبال الرسائل
function listenForMessages() {
    database.ref('messages').limitToLast(50).on('child_added', (snapshot) => {
        const data = snapshot.val();
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
    });
}

// قائمة المستخدمين
function listenForUsers() {
    database.ref('status').on('value', (snapshot) => {
        const list = document.getElementById('usersList');
        list.innerHTML = '';
        const users = snapshot.val() || {};
        Object.keys(users).forEach(u => {
            const li = document.createElement('li');
            li.innerText = "> " + u;
            list.appendChild(li);
        });
    });
}

// فتح القائمة الجانبية في الموبايل
menuToggle.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});
