// ==UserScript==
// @name         Runup.fun Auto-Play Trapper
// @namespace    https://runup.fun/game
// @match        https://runup.fun/game
// @grant        none
// @version      1.0
// @author       Grok (برای تو)
// ==/UserScript==

(function() {
    'use strict';

    let gameRunning = false;
    let keyInterval = null;
    let checkInterval = null;
    let keys = { ArrowLeft: false, ArrowRight: false };

    console.log('%c🚀 Runup Auto-Play Trapper شروع شد! تله‌ها رو می‌زنه، کلاه ویف رو می‌زنه 🚀', 'color: lime; font-size: 16px');

    // ====================== کلیدها (steer) ======================
    function press(key, down = true) {
        const eventType = down ? 'keydown' : 'keyup';
        const e = new KeyboardEvent(eventType, {
            key: key,
            code: key === 'ArrowLeft' ? 'ArrowLeft' : 'ArrowRight',
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(e);
    }

    // ====================== تشخیص لیدربرد ======================
    function getLeaderboard() {
        const lb = document.querySelector('.leaderboard, .score, .altitude, #leaderboard, .personal-best');
        if (lb && lb.textContent.includes('0 m') || lb && lb.textContent.includes('Best')) {
            return true;
        }
        // fallback با موقعیت
        const dog = document.querySelector('.dog, .character, [style*="position"]');
        if (dog) {
            const rect = dog.getBoundingClientRect();
            if (rect.top < 200) return true; // بالا رفته
        }
        return false;
    }

    // ====================== تشخیص تله و حرکت ======================
    function isLedge(element) {
        return element && (element.className.includes('ledge') || element.className.includes('platform') || element.textContent.includes('ledge'));
    }

    function isCracked(element) {
        return element && (element.className.includes('cracked') || element.style.background.includes('crack') || element.style.transform.includes('rotate'));
    }

    function isCandle(element) {
        return element && (element.className.includes('candle') || element.className.includes('fire') || element.style.color === 'red' || element.style.backgroundColor === 'red');
    }

    function checkTrape() {
        if (!gameRunning) return;
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
            if (isLedge(el)) {
                const rect = el.getBoundingClientRect();
                const dogRect = document.querySelector('.dog, .character')?.getBoundingClientRect();
                if (dogRect && Math.abs(dogRect.left - rect.left) < 150 && Math.abs(dogRect.right - rect.right) < 150) {
                    // حرکت ledges رو تشخیص بده
                    const currentX = parseFloat(el.style.left || el.style.transform?.split('translateX(')[1]?.split('px')[0] || 0);
                    const targetX = currentX + (Math.random() > 0.5 ? 80 : -80); // حرکت جانبی
                    el.style.transform = `translateX(${targetX}px)`;
                    return; // بعد از حرکت چک کن
                }
            }
            if (isCandle(el) || isCracked(el)) {
                const dogRect = document.querySelector('.dog, .character')?.getBoundingClientRect();
                const candleRect = el.getBoundingClientRect();
                if (dogRect && candleRect && Math.abs(dogRect.top - candleRect.top) < 120) {
                    press('Space', true);
                    setTimeout(() => press('Space', false), 80); // space boost
                    return;
                }
            }
        }
    }

    // ====================== تشخیص کلاه ویف و تله ======================
    function isCapHat(element) {
        return element && (element.className.includes('cap') || element.className.includes('hat') || element.className.includes('skull') || element.textContent.includes('cap'));
    }

    function isHazard(element) {
        return element && (element.className.includes('hazard') || element.className.includes('trap') || element.style.border.includes('red'));
    }

    function checkHazard() {
        const dog = document.querySelector('.dog, .character');
        if (!dog) return;
        const dogRect = dog.getBoundingClientRect();
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
            if (isCapHat(el) || isHazard(el)) {
                const rect = el.getBoundingClientRect();
                if (rect.top - dogRect.top < 150 && rect.left < dogRect.right && rect.right > dogRect.left) {
                    press('Space', true);
                    setTimeout(() => press('Space', false), 50);
                    return;
                }
            }
        }
    }

    // ====================== کنترل اصلی ======================
    function startAutoPlay() {
        if (gameRunning) return;

        // ۱. اول به لیدربرد برو
        if (getLeaderboard()) {
            console.log('%c✅ به لیدربرد رسیدم، بازی شروع شد!', 'color: green');
            gameRunning = true;
        } else {
            press('Space'); // اگر هنوز پایین هست jump بزن
        }

        // ۲. هر ۱۵ میلی‌ثانیه چک کن
        checkInterval = setInterval(() => {
            checkHazard();           // کلاه ویف و تله
            checkTrape();            // حرکت ledges
        }, 15);

        // ۳. steer رو به صورت تصادفی هوشمند نگه دار (تا تله پیدا کنه)
        keyInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                const dir = Math.random() > 0.5 ? 'ArrowLeft' : 'ArrowRight';
                press(dir, true);
                setTimeout(() => press(dir, false), 120 + Math.random() * 150);
            }
        }, 80);

        console.log('%c🎮 اسکریپت فعال شد! حالا خودش بازی رو ادامه می‌ده و تله‌ها رو می‌زنه 🚀', 'color: lime');
    }

    // ====================== شروع ======================
    // صفحه لود بشه
    setTimeout(() => {
        startAutoPlay();
    }, 800);

    // اگر دوباره لود شد
    const observer = new MutationObserver(() => {
        if (!gameRunning) startAutoPlay();
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
