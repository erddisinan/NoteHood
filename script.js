// ----------------------------------------------------
// SCROLLING AND NAVIGATION
// ----------------------------------------------------

// Function for CTA button to scroll
function scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// ----------------------------------------------------
// 1. NOTES SECTION LOGIC
// ----------------------------------------------------

function addNote() {
    const noteInput = document.getElementById('note-input');
    const noteList = document.getElementById('note-list');
    const noteText = noteInput.value.trim();

    if (noteText === "") {
        console.error("Please write a reminder before adding it!");
        return;
    }

    // 1. Create the new note element
    const newNote = document.createElement('div');
    newNote.className = 'sample-note';
    
    // Add a delete button (❌)
    newNote.innerHTML = `
        <span>${noteText}</span>
        <button class="delete-btn" onclick="this.parentElement.remove()">❌ Delete</button>
    `;
    
    // Set note style for layout
    newNote.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

    // 2. Add the new note to the list
    noteList.prepend(newNote); // Put newest note on top

    // 3. Clear the input field
    noteInput.value = '';
}


// ----------------------------------------------------
// 2. QUESTIONS SECTION LOGIC
// ----------------------------------------------------

function addQuestion() {
    const topicInput = document.getElementById('topic-input');
    const countInput = document.getElementById('count-input');
    const toSolveList = document.getElementById('to-solve-list');

    const topic = topicInput.value.trim();
    const count = parseInt(countInput.value.trim());

    if (topic === "" || isNaN(count) || count <= 0) {
        console.error("Please enter a valid topic and a positive number of questions.");
        return;
    }

    // 1. Create the new list item
    const newQuestion = document.createElement('li');
    newQuestion.setAttribute('data-topic', topic);
    newQuestion.setAttribute('data-count', count);
    newQuestion.style.borderLeftColor = '#f6ad55'; // Warning color for to-solve
    
    newQuestion.innerHTML = `
        <span class="checkbox">⏳</span> 
        ${topic} (${count} Q's)
        <button class="solve-btn" onclick="markSolved(this.parentElement)">Solve</button>
    `;
    
    // 2. Add to the 'To Solve' list
    toSolveList.appendChild(newQuestion); 

    // 3. Clear the inputs
    topicInput.value = '';
    countInput.value = '';
}

function markSolved(listItem) {
    const solvedList = document.getElementById('solved-list');
    
    // 1. Get data from the list item
    const topic = listItem.getAttribute('data-topic');
    const count = listItem.getAttribute('data-count');

    // 2. Create the solved list item
    const solvedItem = document.createElement('li');
    solvedItem.setAttribute('data-topic', topic);
    solvedItem.setAttribute('data-count', count);
    solvedItem.style.borderLeftColor = '#48bb78'; // Success color for solved
    
    // Added a Delete button for solved missions
    solvedItem.innerHTML = `
        <span class="checkbox">✅</span> 
        ${topic} (${count} Q's)
        <button class="delete-btn" onclick="this.parentElement.remove()">❌ Delete</button>
    `;
    
    // 3. Add to the 'Solved Missions' list
    solvedList.prepend(solvedItem);

    // 4. Remove the item from its current list
    listItem.remove();
}


// ----------------------------------------------------
// 3. DYNAMIC STARFIELD ANIMATION
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for fixed nav links
    document.querySelectorAll('nav ul li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const header = document.querySelector('header');
    const numStars = 50; 

    for (let i = 0; i < numStars; i++) {
        let star = document.createElement('div');
        star.className = 'star';
        star.style.width = star.style.height = `${Math.random() * 2 + 0.5}px`; 
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 6 + 4}s`; 
        star.style.animationDelay = `${Math.random() * 6}s`; 
        header.appendChild(star);
    }
});