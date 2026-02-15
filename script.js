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

// الربط البرمجي
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginBtn').onclick = login;
    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('clearChatBtn').onclick = () => {
        document.getElementById('chatBox').innerHTML = '';
        console.log("Terminal Cleared.");
    };
    
    document.getElementById('menuToggle').onclick = (e) => {
        e.stopPropagation();
        document.getElementById('sidebar').classList.add('active');
    };
    
    document.getElementById('closeSidebar').onclick = () => {
        document.getElementById('sidebar').classList.remove('active');
    };

    document.getElementById('userInput').onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };
});

function login() {
    const userIn = document.getElementById('usernameInput').value;
    const passIn = document.getElementById('passwordInput').value;
    if (userIn.trim() !== "" && passIn === "1234") {
        currentUsername = userIn.toLowerCase();
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
        renderMessage(snapshot.val());
    });
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

function renderMessage(data) {
    const chatBox = document.getElementById('chatBox');
    const isMe = data.sender === currentUsername;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMe ? 'my-msg' : 'client-msg'}`;
    msgDiv.innerHTML = `<span class="msg-user">${data.sender.toUpperCase()}</span>${data.content}<span class="time">${data.time}</span>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
