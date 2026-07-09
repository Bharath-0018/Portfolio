document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Current Year in Footer
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // --- Dark/Light Mode Theme Toggle ---
  const themeToggleBtn = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;

  // Retrieve saved theme or check system preferences
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
  } else {
    htmlElement.setAttribute('data-theme', 'light');
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // --- Mobile Hamburger Menu ---
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMenu = () => {
    hamburgerBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
  };

  const closeMenu = () => {
    hamburgerBtn.classList.remove('active');
    navMenu.classList.remove('active');
  };

  hamburgerBtn.addEventListener('click', toggleMenu);
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  // --- Scroll-to-Top Button Visibility ---
  const scrollToTopBtn = document.querySelector('.scroll-to-top');
  
  const checkScroll = () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.style.opacity = '1';
      scrollToTopBtn.style.pointerEvents = 'all';
    } else {
      scrollToTopBtn.style.opacity = '0';
      scrollToTopBtn.style.pointerEvents = 'none';
    }
  };

  window.addEventListener('scroll', checkScroll);
  // Initial check in case page starts scrolled
  checkScroll();

  // --- Intersection Observer for Scroll Animations ---
  const scrollElements = document.querySelectorAll('.scroll-reveal');

  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
  };

  const displayScrollElement = (element) => {
    element.classList.add('revealed');
  };

  const hideScrollElement = (element) => {
    element.classList.remove('revealed');
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.15)) {
        displayScrollElement(el);
      }
    });
  };

  window.addEventListener('scroll', () => {
    handleScrollAnimation();
  });
  
  // Trigger once on load to reveal elements in view instantly
  setTimeout(handleScrollAnimation, 150);

  // --- Scroll Spy: Highlight Nav Menu Links on Scroll ---
  const sections = document.querySelectorAll('section[id]');
  
  const scrollSpy = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 150; // offset for nav bar
      const sectionId = current.getAttribute('id');
      const activeLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

      if (activeLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
          activeLink.classList.add('active');
        }
      }
    });
  };

  window.addEventListener('scroll', scrollSpy);

  // --- Contact Form Submission Handler ---
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  function showFormSuccess() {
    contactForm.style.opacity = '0';
    contactForm.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      contactForm.classList.add('hidden');
      formFeedback.classList.remove('hidden');
      setTimeout(() => {
        formFeedback.classList.add('show');
      }, 50);
    }, 300);
    contactForm.reset();
  }

  function resetFormBtn(btn, originalHTML) {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // HTML5 client-side validation
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const action = contactForm.getAttribute('action');
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Sending...';
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      // Use FormData (multipart) — most reliable with Formsubmit.co
      const formData = new FormData(contactForm);

      fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      })
      .then(response => {
        // Treat any HTTP 2xx as success
        if (response.ok) {
          return response.json().then(data => {
            console.log('Formspree response:', data);
            showFormSuccess();
          }).catch(() => {
            // Even if JSON parse fails but status was OK, treat as success
            showFormSuccess();
          });
        }
        // Non-2xx status
        return response.text().then(text => {
          console.error('Formspree error response:', text);
          throw new Error('Server responded with status ' + response.status);
        });
      })
      .catch(error => {
        console.error('Form submission error:', error);
        alert('Could not send your message. Please email me directly at bharathperumal09@gmail.com');
        resetFormBtn(submitBtn, originalBtnHTML);
      });
    });
  }

  // --- Certificate Modal Logic ---
  const certModal = document.getElementById('certModal');
  const certIframe = document.getElementById('certIframe');
  const certImageContainer = document.getElementById('certImageContainer');
  const certImage = document.getElementById('certImage');
  const certDownloadLink = document.getElementById('certDownloadLink');
  const certCloseBtn = document.getElementById('certCloseBtn');
  const modalBackdrop = certModal ? certModal.querySelector('.cert-modal-backdrop') : null;
  const viewCertBtns = document.querySelectorAll('.open-cert-modal');

  const openCertModal = (certUrl) => {
    if (!certModal) return;
    
    // Check if the certificate URL is an image
    const isImage = certUrl.match(/\.(png|jpe?g|gif|webp)$/i);
    
    if (isImage) {
      if (certIframe) certIframe.classList.add('hidden');
      if (certImageContainer && certImage) {
        certImage.src = certUrl;
        certImageContainer.classList.remove('hidden');
      }
    } else {
      if (certImageContainer) certImageContainer.classList.add('hidden');
      if (certIframe) {
        certIframe.src = certUrl;
        certIframe.classList.remove('hidden');
      }
    }
    
    if (certDownloadLink) {
      certDownloadLink.href = certUrl;
    }
    certModal.classList.add('active');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  };

  const closeCertModal = () => {
    if (!certModal) return;
    certModal.classList.remove('active');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // restore background scrolling
    
    // Clear sources and hide elements to stop background active work
    setTimeout(() => {
      if (certIframe) {
        certIframe.src = '';
        certIframe.classList.add('hidden');
      }
      if (certImage) {
        certImage.src = '';
      }
      if (certImageContainer) {
        certImageContainer.classList.add('hidden');
      }
    }, 300);
  };

  if (viewCertBtns.length > 0) {
    viewCertBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const certUrl = btn.getAttribute('data-cert');
        if (certUrl) {
          openCertModal(certUrl);
        }
      });
    });
  }

  if (certCloseBtn) {
    certCloseBtn.addEventListener('click', closeCertModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeCertModal);
  }

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal && certModal.classList.contains('active')) {
      closeCertModal();
    }
  });
});
