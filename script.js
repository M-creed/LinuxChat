// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let currentUsername = "";

// 2. Login Logic
function login() {
    const userIn = document.getElementById('usernameInput').value;
    const passIn = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('loginError');

    if (userIn.trim() !== "" && passIn === "1234") {
        currentUsername = userIn.toLowerCase();
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('headerUsername').innerText = `${currentUsername.toUpperCase()}@TERMINAL`;
        
        // تسجيل المستخدم كـ Online
        database.ref('status/' + currentUsername).set(true);
        database.ref('status/' + currentUsername).onDisconnect().remove();

        listenForMessages();
        listenForUsers();
    } else {
        errorMsg.style.display = 'block';
    }
}

// 3. Messaging Logic
function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    
    if (text !== "") {
        database.ref('messages').push({
            sender: currentUsername,
            content: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
        input.value = '';
    }
}

// ارسال بالضغط على Enter
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function listenForMessages() {
    database.ref('messages').limitToLast(50).on('child_added', (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);
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

// 4. Sidebar Logic (Online Users)
function listenForUsers() {
    database.ref('status').on('value', (snapshot) => {
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

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}
