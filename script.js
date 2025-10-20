document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // ELEMENT SELECTORS
    // ----------------------------------------------------
    const launchBtn = document.getElementById('launch-btn');
    
    // Notes
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteList = document.getElementById('note-list');

    // Missions
    const topicInput = document.getElementById('topic-input');
    const countInput = document.getElementById('count-input');
    const addMissionBtn = document.getElementById('add-mission-btn');
    const toSolveList = document.getElementById('to-solve-list');
    const solvedList = document.getElementById('solved-list');

    // Image Bank & Favorites
    const imageUploadGrid = document.getElementById('image-upload-grid');
    const favoriteList = document.getElementById('favorite-list');

    // YKS Tracker (Simplified)
    const calculateScoreBtn = document.getElementById('calculate-score-btn');
    const tytTotalNetDisplay = document.getElementById('tyt-total-net-display');
    const aytTotalNetDisplay = document.getElementById('ayt-total-net-display');
    const totalRawScoreDisplay = document.getElementById('total-raw-score-display');
    
    // YKS Coefficients
    const COEFFS = {
        TYT: { TUR: 1.32, SOC: 1.36, MAT: 1.32, SCI: 1.36 },
        AYT: { MAT: 3.0, PHY: 2.85, CHE: 3.07, BIO: 3.07 }
    };


    // ----------------------------------------------------
    // 1. DATA PERSISTENCE (LOCAL STORAGE)
    // ----------------------------------------------------

    function saveMainData() {
        localStorage.setItem('notesList', noteList.innerHTML);
        localStorage.setItem('toSolveList', toSolveList.innerHTML);
        localStorage.setItem('solvedList', solvedList.innerHTML);
        console.log("Notes & Missions data saved!");
    }

    function loadMainData() {
        const savedNotes = localStorage.getItem('notesList');
        if (savedNotes) {
            noteList.innerHTML = savedNotes;
        } else {
            noteList.innerHTML = `
                <div class="sample-note">
                    <span>Initial Setup: Remember to define your weekly goals!</span>
                    <button class="delete-btn">❌ Delete</button>
                </div>`;
        }
        
        toSolveList.innerHTML = localStorage.getItem('toSolveList') || '';
        solvedList.innerHTML = localStorage.getItem('solvedList') || '';

        const favs = JSON.parse(localStorage.getItem('favorites')) || [];
        for (let i = 1; i <= 10; i++) {
            const imgData = localStorage.getItem(`image-slot-${i}`);
            const slot = document.querySelector(`.image-slot[data-slot-id="${i}"]`);
            if (imgData && slot) {
                const preview = slot.querySelector('.image-preview');
                preview.src = imgData;
                slot.classList.add('has-image');
                if (favs.includes(String(i))) {
                    slot.querySelector('.fav-btn').classList.add('favorited');
                }
            }
        }
        renderFavorites();
        console.log("Main data loaded!");
    }
    

    // ----------------------------------------------------
    // 2. SCROLLING AND NAVIGATION
    // ----------------------------------------------------
    
    launchBtn.addEventListener('click', () => scrollToSection('notes'));

    document.querySelectorAll('nav ul li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });

    function scrollToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    // ----------------------------------------------------
    // 3. NOTES SECTION LOGIC
    // ----------------------------------------------------

    function addNote() {
        const noteText = noteInput.value.trim();
        if (noteText === "") return;
        
        const newNote = document.createElement('div');
        newNote.className = 'sample-note';
        newNote.innerHTML = `
            <span>${noteText}</span>
            <button class="delete-btn">❌ Delete</button>
        `;
        noteList.prepend(newNote);
        noteInput.value = '';
        saveMainData();
    }

    noteList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            e.target.parentElement.remove();
            saveMainData();
        }
    });
    addNoteBtn.addEventListener('click', addNote);


    // ----------------------------------------------------
    // 4. QUESTIONS SECTION LOGIC
    // ----------------------------------------------------

    function addQuestion() {
        const topic = topicInput.value.trim();
        const count = parseInt(countInput.value.trim());
        if (topic === "" || isNaN(count) || count <= 0) return;

        const newQuestion = document.createElement('li');
        newQuestion.setAttribute('data-topic', topic);
        newQuestion.setAttribute('data-count', count);
        newQuestion.innerHTML = `
            <div>
                <span class="checkbox">⏳</span> 
                ${topic} (${count} Q's)
            </div>
            <button class="solve-btn">Solve</button>
        `;
        toSolveList.appendChild(newQuestion); 
        topicInput.value = '';
        countInput.value = '';
        saveMainData();
    }

    function markSolved(listItem) {
        const topic = listItem.getAttribute('data-topic');
        const count = listItem.getAttribute('data-count');
        const solvedItem = document.createElement('li');
        solvedItem.setAttribute('data-topic', topic);
        solvedItem.setAttribute('data-count', count);
        solvedItem.innerHTML = `
            <div>
                <span class="checkbox">✅</span> 
                ${topic} (${count} Q's)
            </div>
            <button class="delete-btn">❌ Delete</button>
        `;
        solvedList.prepend(solvedItem);
        listItem.remove();
        saveMainData();
    }

    toSolveList.addEventListener('click', (e) => {
        if (e.target.classList.contains('solve-btn')) {
            markSolved(e.target.parentElement);
        }
    });

    solvedList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            e.target.parentElement.parentElement.remove();
            saveMainData();
        }
    });
    addMissionBtn.addEventListener('click', addQuestion);


    // ----------------------------------------------------
    // 5. IMAGE BANK & FAVORITES LOGIC
    // ----------------------------------------------------

    imageUploadGrid.addEventListener('change', (e) => {
        if (e.target.classList.contains('image-input')) {
            const file = e.target.files[0];
            if (!file) return;

            const slot = e.target.closest('.image-slot');
            const slotId = slot.dataset.slotId;
            const preview = slot.querySelector('.image-preview');

            const reader = new FileReader();
            reader.onload = (event) => {
                const imgData = event.target.result;
                localStorage.setItem(`image-slot-${slotId}`, imgData);
                preview.src = imgData;
                slot.classList.add('has-image');
                renderFavorites(); 
            }
            reader.readAsDataURL(file);
        }
    });

    imageUploadGrid.addEventListener('click', (e) => {
        const slot = e.target.closest('.image-slot');
        if (!slot) return;
        const slotId = slot.dataset.slotId;

        if (e.target.classList.contains('delete-image-btn')) {
            localStorage.removeItem(`image-slot-${slotId}`);
            slot.querySelector('.image-preview').src = "";
            slot.classList.remove('has-image');
            toggleFavorite(slotId, slot.querySelector('.fav-btn'), true);
        }
        if (e.target.classList.contains('fav-btn')) {
            toggleFavorite(slotId, e.target);
        }
    });

    function toggleFavorite(slotId, btnElement, forceRemove = false) {
        let favs = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorited = favs.includes(slotId);

        if (forceRemove) {
            if (isFavorited) {
                favs = favs.filter(id => id !== slotId);
                btnElement.classList.remove('favorited');
            }
        } else {
            if (isFavorited) {
                favs = favs.filter(id => id !== slotId);
                btnElement.classList.remove('favorited');
            } else {
                favs.push(slotId);
                btnElement.classList.add('favorited');
            }
        }
        localStorage.setItem('favorites', JSON.stringify(favs));
        renderFavorites();
    }

    function renderFavorites() {
        favoriteList.innerHTML = '';
        const favs = JSON.parse(localStorage.getItem('favorites')) || [];
        
        for (const slotId of favs) {
            const imgData = localStorage.getItem(`image-slot-${slotId}`);
            if (imgData) {
                const favItem = document.createElement('div');
                favItem.className = 'favorite-item';
                favItem.innerHTML = `<img src="${imgData}" alt="Favorite Mission ${slotId}">`;
                favoriteList.appendChild(favItem);
            }
        }
    }
    
    
    // ----------------------------------------------------
    // 6. YKS TRACKER LOGIC (SIMPLIFIED)
    // ----------------------------------------------------

    function getNet(correctId, incorrectId) {
        const correct = parseFloat(document.getElementById(correctId).value) || 0;
        const incorrect = parseFloat(document.getElementById(incorrectId).value) || 0;
        return correct - (incorrect * 0.25);
    }

    function calculateScore() {
        const nets = {
            tyt_tur: getNet('tyt-tur-c', 'tyt-tur-i'), tyt_soc: getNet('tyt-soc-c', 'tyt-soc-i'),
            tyt_mat: getNet('tyt-mat-c', 'tyt-mat-i'), tyt_sci: getNet('tyt-sci-c', 'tyt-sci-i'),
            ayt_mat: getNet('ayt-mat-c', 'ayt-mat-i'), ayt_phy: getNet('ayt-phy-c', 'ayt-phy-i'),
            ayt_che: getNet('ayt-che-c', 'ayt-che-i'), ayt_bio: getNet('ayt-bio-c', 'ayt-bio-i'),
        };

        const tytTotalNet = nets.tyt_tur + nets.tyt_soc + nets.tyt_mat + nets.tyt_sci;
        const aytTotalNet = nets.ayt_mat + nets.ayt_phy + nets.ayt_che + nets.ayt_bio;

        const rawTytScore = (nets.tyt_tur * COEFFS.TYT.TUR) + (nets.tyt_soc * COEFFS.TYT.SOC) + 
                            (nets.tyt_mat * COEFFS.TYT.MAT) + (nets.tyt_sci * COEFFS.TYT.SCI);
        const rawAytScore = (nets.ayt_mat * COEFFS.AYT.MAT) + (nets.ayt_phy * COEFFS.AYT.PHY) + 
                            (nets.ayt_che * COEFFS.AYT.CHE) + (nets.ayt_bio * COEFFS.AYT.BIO);
        const totalRawScore = rawTytScore + rawAytScore;

        tytTotalNetDisplay.textContent = tytTotalNet.toFixed(2);
        aytTotalNetDisplay.textContent = aytTotalNet.toFixed(2);
        totalRawScoreDisplay.textContent = totalRawScore.toFixed(2);
    }

    // YKS Event Listeners
    calculateScoreBtn.addEventListener('click', calculateScore);


    // ----------------------------------------------------
    // 7. DYNAMIC STARFIELD ANIMATION
    // ----------------------------------------------------
    
    const header = document.querySelector('header');
    const numStars = 50; 

    for (let i = 0; i < numStars; i++) {
        let star = document.createElement('div');
        star.className = 'star';
        star.style.width = star.style.height = `${Math.random() * 2 + 0.5}px`; 
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random()* 6 + 4}s`; 
        star.style.animationDelay = `${Math.random() * 6}s`; 
        header.appendChild(star);
    }

    // ----------------------------------------------------
    // INITIAL LOAD
    // ----------------------------------------------------
    loadMainData();

});
