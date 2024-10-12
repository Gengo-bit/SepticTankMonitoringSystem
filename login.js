// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyCgrcyyM547ICJc6fzbunqWSV64pKlRfZA",
    authDomain: "septic-tank-capacity.firebaseapp.com",
    projectId: "septic-tank-capacity",
    appId: "1:445055846573:web:166f5bcc5e6b8d40e6de24"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  document.addEventListener('DOMContentLoaded', () => {
      const loginForm = document.getElementById('login-modal');
      const errorMessage = document.getElementById('error-message');
  
      loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
  
          firebase.auth().signInWithEmailAndPassword(email, password)
              .then((userCredential) => {
                  // Redirect to home page after successful login
                  window.location.href = 'home.html';
              })
              .catch((error) => {
                  // Handle errors
                  errorMessage.textContent = error.message;
              });
      });
  });  
    // Modal Toggle Functionality
    const loginToggleBtn = document.getElementById('login-toggle-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.getElementById('close-modal');

    // Show modal when login button is clicked
    loginToggleBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    // Close modal when 'X' button is clicked
    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    // Close modal when clicking outside of modal content
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
   
// JavaScript for Smooth Scrolling 
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.full-screen');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
});

    // Smooth scroll when clicking internal links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
            });
        });
    });