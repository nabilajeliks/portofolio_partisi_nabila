/**
 * PORTOFOLIO TEMA LAUTAN (OCEANIC DEEP SEA)
 * Script interaktivitas, animasi gelembung, suara ombak ambient, filter, modal & formulir
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. DYNAMIC RISING BUBBLES GENERATOR
     ========================================================================== */
  const bubblesContainer = document.getElementById('bubblesContainer');

  function createBubble() {
    if (!bubblesContainer) return;
    const bubble = document.createElement('div');
    bubble.classList.add('ocean-bubble');

    // Randomize properties
    const size = Math.random() * 24 + 8; // 8px to 32px
    const leftPos = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 9 + 6; // 6s to 15s
    const wobbleDuration = Math.random() * 3 + 2; // 2s to 5s
    const opacity = Math.random() * 0.5 + 0.35; // 0.35 to 0.85

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${leftPos}%`;
    bubble.style.opacity = opacity;
    bubble.style.animationDuration = `${duration}s, ${wobbleDuration}s`;

    bubblesContainer.appendChild(bubble);

    // Remove after animation completes to avoid memory leak
    setTimeout(() => {
      bubble.remove();
    }, duration * 1000);
  }

  // Initial batch of bubbles
  for (let i = 0; i < 20; i++) {
    setTimeout(createBubble, i * 350);
  }
  // Continuous generation
  setInterval(createBubble, 700);


  /* ==========================================================================
     2. UNDERWATER AMBIENT SOUND SYNTHESIZER (Web Audio API)
     Tanpa file audio eksternal, menghasilkan desiran ombak lautan yang menenangkan
     ========================================================================== */
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  let audioCtx = null;
  let isSoundPlaying = false;
  let gainNode = null;
  let noiseNode = null;
  let filterNode = null;
  let lfoNode = null;

  function initOceanSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      // Create pink/white noise buffer for oceanic wave sound
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise filter algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      // Lowpass Filter for underwater depth
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(320, audioCtx.currentTime);

      // Low Frequency Oscillator for wave swell effect
      lfoNode = audioCtx.createOscillator();
      lfoNode.frequency.setValueAtTime(0.12, audioCtx.currentTime); // 8-second wave period

      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(220, audioCtx.currentTime);
      lfoNode.connect(filterNode.frequency);

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);

      noiseNode.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      noiseNode.start(0);
      lfoNode.start(0);
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (!audioCtx) {
        initOceanSound();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (!isSoundPlaying) {
        // Fade in
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.28, audioCtx.currentTime + 1.5);
        isSoundPlaying = true;
        soundToggle.classList.add('playing');
        soundIcon.className = 'fa-solid fa-volume-high';
        soundToggle.querySelector('.sound-label').textContent = 'Laut Aktif';
      } else {
        // Fade out
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
        isSoundPlaying = false;
        soundToggle.classList.remove('playing');
        soundIcon.className = 'fa-solid fa-volume-xmark';
        soundToggle.querySelector('.sound-label').textContent = 'Suasana Laut';
      }
    });
  }


  /* ==========================================================================
     3. NAVBAR SCROLL & MOBILE MENU
     ========================================================================== */
  const mainHeader = document.getElementById('mainHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenuBtn.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  }


  /* ==========================================================================
     4. SCROLLSPY (ACTIVE LINK HIGHLIGHTING)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');
      const targetNav = document.querySelector(`.nav-links a[href*="${sectionId}"]`);

      if (targetNav) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navItems.forEach(item => item.classList.remove('active'));
          targetNav.classList.add('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);


  /* ==========================================================================
     5. SKILL BARS PROGRESS ANIMATION
     ========================================================================== */
  const progressBars = document.querySelectorAll('.progress-bar');
  const skillsCard = document.querySelector('.skills-card');

  if (skillsCard) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          progressBars.forEach(bar => {
            const width = bar.style.getPropertyValue('--skill-w');
            bar.style.width = width;
          });
          skillsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    skillsObserver.observe(skillsCard);
  }


  /* ==========================================================================
     7. PORTFOLIO FILTER
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      portfolioCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCategory === filterCategory) {
          card.classList.remove('hide-card');
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.classList.add('hide-card');
        }
      });
    });
  });


  /* ==========================================================================
     9. PROJECT DETAIL MODAL DATA & CONTROLLER
     ========================================================================== */
  const projectDatabase = {
    1: {
      title: 'OceanPulse - Monitoring Terumbu Karang',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
      description: 'OceanPulse adalah platform pemantauan ekosistem laut terintegrasi. Dirancang untuk membantu peneliti kelautan dan relawan dalam mencatat data suhu air, pH, tutupan karang, serta tren pemutihan karang (coral bleaching) secara berkala.',
      features: [
        'Dashboard visualisasi metrik sensor air real-time dengan grafik interaktif Chart.js',
        'Sistem geolokasi titik observasi terumbu karang di berbagai perairan Indonesia',
        'Manajemen laporan survei biota laut berbasis status approval relawan',
        'Penyajian data responsif dan optimal untuk desktop maupun tablet lapangan'
      ],
      tech: ['HTML5', 'Tailwind CSS', 'JavaScript (ES6)', 'Chart.js', 'Leaflet Map API'],
      liveDemo: '#contact',
      githubLink: 'https://github.com'
    },
    2: {
      title: 'AquaLearn - Platform Edukasi Bahari Interaktif',
      category: 'UI/UX Design',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      description: 'AquaLearn adalah studi kasus komprehensif desain antarmuka mobile untuk memupuk literasi kelautan generasi muda sejak dini. Berfokus pada kemudahan navigasi anak, visual yang ceria namun edukatif, dan gamifikasi kuis laut.',
      features: [
        'Eksplorasi zona kedalaman laut: Sunlight, Twilight, Midnight, hingga Abyss Zone',
        'Ensiklopedia 50+ spesies laut Indonesia dengan audio pelafalan dan model visual',
        'Kuis interaktif kuis trivia & kartu pencapaian (ocean badges)',
        'Design System menyeluruh di Figma: Colors, Typography, Components & Micro-interactions'
      ],
      tech: ['Figma', 'User Research', 'Information Architecture', 'Prototyping', 'Design System'],
      liveDemo: '#contact',
      githubLink: 'https://figma.com'
    },
    3: {
      title: 'MarinaCare - Reservasi Ekowisata Pesisir',
      category: 'UI/UX Design',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      description: 'Sebuah solusi digital untuk mempermudah wisatawan memesan paket tur bahari terverifikasi sekaligus berkontribusi langsung pada program donasi bibit terumbu karang lokal.',
      features: [
        'Alur pemesanan tiket terintegrasi kalkulator jejak karbon perjalanan',
        'Fitur verifikasi lisensi penyelaman (PADI/SSI) otomatis bagi pemesan scuba diving',
        'Halaman profil instruktur lokal dan ulasan komunitas',
        'Pengujian kegunaan (Usability Testing) menghasilkan skor SUS 84.5 (Kategori Excellent)'
      ],
      tech: ['Figma Pro', 'Miro', 'Usability Testing', 'Wireframing', 'Journey Mapping'],
      liveDemo: '#contact',
      githubLink: 'https://figma.com'
    },
    4: {
      title: 'SeaEcho - Portal Informasi Akademik & Kemahasiswaan',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
      description: 'Sistem portal web internal yang mengorganisir jadwal kuliah, pengumuman organisasi himpunan, dan sistem voting daring pemilihan ketua divisi secara transparan dan aman.',
      features: [
        'Autentikasi sesi ganda mahasiswa dan administrator kampus',
        'Kalender interaktif agenda kegiatan akademik dan pengumpulan berkas',
        'Modul rekapitulasi data pendaftar workshop terintegrasi ekspor CSV/Excel',
        'Desain ramah mobile dengan palet sejuk bahari yang nyaman di mata'
      ],
      tech: ['PHP Native', 'MySQL Database', 'JavaScript DOM', 'Bootstrap 5', 'CSS Grid'],
      liveDemo: '#contact',
      githubLink: 'https://github.com'
    },
    5: {
      title: 'CoralLife - Toko Online Produk Ramah Lingkungan',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      description: 'Aplikasi e-commerce frontend yang berfokus pada produk zero-waste dan ramah ekosistem laut (seperti tabir surya aman karang / reef-safe sunscreen, tumbler bambu, dan tas belanja daur ulang).',
      features: [
        'Daftar katalog dengan filter kategori, harga, dan rating',
        'Keranjang belanja dinamis berbasis Browser LocalStorage (data tersimpan tanpa reload)',
        'Simulasi proses checkout dengan kalkulasi diskon kupon promo bahari',
        'Tampilan adaptif dan performa tinggi dengan skor PageSpeed 95+'
      ],
      tech: ['HTML5', 'Vanilla JavaScript', 'CSS Flexbox/Grid', 'LocalStorage API'],
      liveDemo: '#contact',
      githubLink: 'https://github.com'
    },
    6: {
      title: 'DeepSea - Identitas Visual & Media Kit',
      category: 'Desain & Branding',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      description: 'Proyek perancangan brand guidelines dan media kampanye sosial untuk gerakan kepedulian sampah laut. Menyusun elemen visual holistik mulai dari logo, palet warna bahari, tipografi, hingga template konten media sosial.',
      features: [
        'Filosofi logo gabungan gelombang laut, penyu, dan simpul keberlanjutan',
        'Pedoman palet warna resmi (Hex, RGB, CMYK) dan panduan hierarki tipografi',
        'Paket 15 template feed Instagram dan reels cover siap pakai di Canva',
        'Aset infografis fakta plastik laut untuk materi presentasi sekolah'
      ],
      tech: ['Canva Pro', 'Adobe Illustrator', 'Brand Identity', 'Social Media Design'],
      liveDemo: '#contact',
      githubLink: 'https://behance.net'
    },
    7: {
      title: 'Juara 1 Lomba Kaligrafi',
      category: 'Sertifikat',
      image: 'assets/sertifikat-juara-1-kaligrafi.jpeg',
      description: 'Sertifikat penghargaan diberikan kepada Nabila Nia Febrianti atas prestasinya sebagai Juara 1 lomba kaligrafi pada 23 Februari 2024.',
      features: [
        'Pencapaian: Juara 1 lomba kaligrafi',
        'Tanggal: 23 Februari 2024',
        'Penerima: Nabila Nia Febrianti'
      ],
      tech: ['Sertifikat', 'Prestasi', 'Landscape'],
      actions: false
    },
    8: {
      title: 'Sertifikat Prestasi - Potret',
      category: 'Sertifikat',
      image: '',
      description: 'Tempat untuk menambahkan sertifikat berorientasi potret.',
      features: [
        'Format sertifikat vertikal',
        'Tambahkan foto atau scan sertifikat',
        'Lengkapi dengan nama lomba, penyelenggara, dan tahun'
      ],
      tech: ['Sertifikat', 'Prestasi', 'Potret'],
      actions: false
    },
    9: {
      title: 'Poster Hari Guru',
      category: 'Desain Perlombaan',
      image: 'assets/desain-lomba-penghijauan.png',
      description: 'Poster bertema Hari Guru yang menggambarkan suasana kebersamaan antara guru dan siswa. Desainnya dibuat dengan warna cerah dan ilustrasi yang menggambarkan berbagai momen serta kenangan selama di sekolah.',
      actions: false
    },
    10: {
      title: "Poster Meneladani Hikmah Isra Mi'raj",
      category: 'Desain Perlombaan',
      image: 'assets/desain-lomba-isra-miraj.png',
      description: "Poster edukasi tentang hikmah Isra Mi'raj dan penerapannya dalam kehidupan sehari-hari.",
      actions: false
    }
  };

  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');
  const viewDetailBtns = document.querySelectorAll('.view-detail-btn');
  document.querySelectorAll('.achievement-arrow').forEach(button => {
    button.addEventListener('click', () => {
      const achievementTrack = document.getElementById(button.dataset.scrollTarget);
      if (!achievementTrack) return;
      const card = achievementTrack.querySelector('.achievement-card');
      const scrollDistance = card ? card.offsetWidth + 16 : 320;
      achievementTrack.scrollBy({
        left: scrollDistance * Number(button.dataset.direction),
        behavior: 'smooth'
      });
    });
  });

  function openProjectModal(id) {
    const data = projectDatabase[id];
    if (!data || !modalBody) return;

    modalBody.innerHTML = `
      ${data.image ? `
        <div class="modal-img-wrap${data.category === 'Desain Perlombaan' ? ' design-modal-img' : ''}">
          <img src="${data.image}" alt="${data.title}">
        </div>
      ` : `
        <div class="modal-img-wrap achievement-placeholder">
          <i class="fa-solid ${id === '9' ? 'fa-palette' : 'fa-award'}"></i>
          <span>${data.category}</span>
        </div>
      `}
      <span class="modal-category-tag">${data.category}</span>
      <h3 class="modal-title">${data.title}</h3>
      <p class="modal-desc-full">${data.description}</p>
      
      ${data.features && data.features.length ? `
        <h4 class="modal-section-h4"><i class="fa-solid fa-list-check"></i> Fitur &amp; Karakteristik Utama:</h4>
        <ul style="list-style: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; color: var(--ocean-mist);">
          ${data.features.map(f => `<li style="margin-bottom: 0.45rem;">${f}</li>`).join('')}
        </ul>
      ` : ''}

      ${data.tech && data.tech.length ? `
        <h4 class="modal-section-h4"><i class="fa-solid fa-screwdriver-wrench"></i> Teknologi &amp; Alat yang Digunakan:</h4>
        <div class="tech-stack-pills" style="margin-bottom: 1.5rem;">
          ${data.tech.map(t => `<span>${t}</span>`).join('')}
        </div>
      ` : ''}

      ${data.actions !== false ? `<div class="modal-actions">
        <a href="${data.liveDemo}" class="btn btn-primary" onclick="closeProjectModal()">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Hubungi untuk Kolaborasi
        </a>
        <a href="${data.githubLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          <i class="fa-brands fa-github"></i> Kunjungi Repositori
        </a>
      </div>` : ''}
    `;

    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  viewDetailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openProjectModal(id);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeProjectModal();
      }
    });
  }


  /* ==========================================================================
     11. BACK TO TOP BUTTON
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  /* ==========================================================================
     12. BLOG MATERI MODAL
     ========================================================================== */
  const blogDatabase = {
    web: {
      title: 'Ringkasan PARTISI 1',
      category: 'PENGKADERAN & ORGANISASI',
      description: 'Ringkasan materi PARTISI 1 yang membahas pengenalan dan organisasi HMSI, budaya kampus dan etika mahasiswa, serta esensi pengkaderan mahasiswa Sistem Informasi',
      icon: 'fa-users-gear',
      materials: [
        {
          title: 'MATERI 1: Mengenal Organisasi HMSI FMIPA UNTAN',
          presenter: 'Nabil Nur Fauzan',
          description: 'Himpunan Mahasiswa Sistem Informasi (HMSI) merupakan organisasi kemahasiswaan yang menjadi wadah bagi mahasiswa Sistem Informasi untuk mengembangkan potensi, kreativitas, dan kemampuan berorganisasi. HMSI didirikan pada 23 Juli 2016 dan diresmikan pada 22 September 2016.\n\nHMSI memiliki visi membentuk mahasiswa Sistem Informasi yang kreatif, inovatif, dan adaptif, serta misi menyediakan wadah untuk mengembangkan minat dan bakat mahasiswa.\n\nDalam menjalankan organisasinya, HMSI memiliki beberapa bagian, yaitu Badan Pengawas, Ketua Umum, Sekretaris, Bendahara Umum, Staff Divisi, dan Dewan Pembimbing.\n\nMelalui HMSI, mahasiswa dapat belajar bekerja sama, berkomunikasi, bertanggung jawab, serta mengembangkan jiwa kepemimpinan sebagai bekal di masa depan.'
        },
        {
          title: 'MATERI 2: Budaya Kampus, Etika, dan Tanggung Jawab Akademik',
          presenter: "Syukri Ma'ram",
          description: 'Budaya kampus merupakan hal penting dalam membentuk karakter mahasiswa, seperti kedisiplinan, sopan santun, etika, dan tanggung jawab akademik.\n\nSistem Informasi merupakan perpaduan antara manusia, data, teknologi, dan prosedur yang saling berhubungan untuk menghasilkan informasi yang bermanfaat dalam pengambilan keputusan.\nSebagai mahasiswa Sistem Informasi, kita perlu memahami pentingnya etika, terutama dalam penggunaan dan pengelolaan data.\n\nBeberapa prinsip yang harus diterapkan yaitu menghindari tindakan yang merugikan, bersikap jujur, menghormati privasi, dan menjaga kerahasiaan informasi.\n\nPenerapan etika dapat dimulai dari hal sederhana, seperti menghindari plagiarisme, menghargai pendapat orang lain, menjaga data pribadi, serta menggunakan teknologi secara bijak dan bertanggung jawab.'
        },
        {
          title: 'MATERI 3: Esensi Pengkaderan Mahasiswa Sistem Informasi',
          presenter: 'Devi Gusmita S.,Kom., M.Kom',
          description: 'Kaderisasi PARTISI memiliki beberapa tujuan, yaitu memberikan pengarahan dan pengenalan lingkungan kampus, menjadi wadah untuk mengembangkan potensi diri, serta menjaga nilai-nilai dan budaya organisasi agar tetap diteruskan kepada generasi berikutnya. Selain itu, kaderisasi juga memiliki landasan pedoman yang menjadi acuan dalam proses pembinaan mahasiswa.\n\nDalam pelaksanaannya, kaderisasi PARTISI terdiri dari empat tahapan, yaitu orientasi, pembinaan, evaluasi, dan pengukuhan. Setiap tahapan memiliki peran penting dalam membentuk mahasiswa agar lebih mengenal organisasi, meningkatkan pengetahuan, serta memahami nilai-nilai yang perlu diterapkan.\n\nMelalui proses kaderisasi ini, mahasiswa tidak hanya mendapatkan pengalaman dalam berorganisasi, tetapi juga belajar menjadi pribadi yang disiplin, bertanggung jawab, mampu bekerja sama, dan memiliki rasa kebersamaan. Kaderisasi menjadi salah satu langkah awal untuk mengembangkan diri selama menjalani kehidupan perkuliahan.'
        }
      ]
    },
    uiux: {
      title: 'Ringkasan PARTISI 2',
      category: 'PUBLIC SPEAKING & KESEHATAN MENTAL',
      description: 'Pembahasan teknik public speaking, komunikasi efektif, pengembangan diri, pengenalan potensi, serta pentingnya menjaga kesehatan mental bagi mahasiswa',
      icon: 'fa-comments',
      materials: [
        {
          title: 'MATERI 1: Public Speaking dan Teknik Komunikasi yang Efektif',
          description: 'Public speaking merupakan kemampuan berbicara di depan umum untuk menyampaikan informasi, ide, dan pendapat dengan jelas. Kemampuan ini penting bagi mahasiswa, baik dalam perkuliahan maupun organisasi.\n\nBeberapa teknik dasar public speaking meliputi pelafalan kata yang jelas, penggunaan mikrofon yang tepat, intonasi suara yang tidak monoton, serta gestur tubuh dan kontak mata yang baik. Dengan menguasai teknik tersebut, mahasiswa dapat meningkatkan rasa percaya diri dan berkomunikasi secara efektif.'
        },
        {
          title: 'MATERI 2: Pengembangan Diri, Pengenalan Potensi, dan Kesehatan Mental',
          description: 'Pengembangan diri merupakan proses mengenali dan meningkatkan potensi serta kemampuan yang dimiliki. Salah satu caranya adalah melalui refleksi diri atau kompas diri untuk memahami kelebihan, kekurangan, ketakutan, dan hambatan pribadi.\n\nMengenali kondisi diri sendiri penting agar mahasiswa mampu mengelola rasa tidak percaya diri, menghadapi tantangan, serta memahami potensi yang dimiliki. Dengan begitu, mahasiswa dapat membangun kepercayaan diri, menjaga kesehatan mental, dan mengembangkan diri menjadi pribadi yang lebih baik.'
        }
      ]
    }
  };

  const blogModal = document.getElementById('blogModal');
  const blogModalBody = document.getElementById('blogModalBody');
  const blogModalCloseBtn = document.getElementById('blogModalCloseBtn');
  const blogOpenButtons = document.querySelectorAll('.blog-open-btn');

  function openBlogModal(blogId) {
    const data = blogDatabase[blogId];
    if (!data || !blogModalBody) return;

    blogModalBody.innerHTML = `
      <div class="blog-modal-header">
        <span class="modal-category-tag">${data.category}</span>
        <h3 class="modal-title"><i class="fa-solid ${data.icon}" style="color: var(--glow-cyan);"></i> ${data.title}</h3>
        <p class="modal-desc-full">${data.description}</p>
      </div>
      <div class="blog-material-list">
        ${data.materials.map((material, index) => `
          <article class="blog-material-item">
            <div class="blog-material-number">${String(index + 1).padStart(2, '0')}</div>
            <div>
              <h4>${material.title}</h4>
              ${material.presenter ? `<p class="blog-material-presenter">Pemateri: ${material.presenter}</p>` : ''}
              <p>${material.description.replace(/\n/g, ' ')}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    blogModal.classList.add('active');
    blogModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeBlogModal() {
    if (!blogModal) return;
    blogModal.classList.remove('active');
    blogModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  blogOpenButtons.forEach(button => {
    button.addEventListener('click', () => openBlogModal(button.dataset.blog));
  });

  if (blogModalCloseBtn) {
    blogModalCloseBtn.addEventListener('click', closeBlogModal);
  }

  if (blogModal) {
    blogModal.addEventListener('click', (event) => {
      if (event.target === blogModal) closeBlogModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && blogModal && blogModal.classList.contains('active')) {
      closeBlogModal();
    }
  });


  /* ==========================================================================
     13. PROFILE IMAGE ENHANCEMENT (FALLBACK HANDLER)
     ========================================================================== */
  const profileImg = document.getElementById('profileImage');
  if (profileImg) {
    profileImg.addEventListener('error', () => {
      // Elegant SVG Ocean Avatar Fallback if offline
      profileImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230284c7"/><circle cx="200" cy="160" r="70" fill="%23e0f2fe"/><path d="M90 340 C110 260 290 260 310 340 Z" fill="%23e0f2fe"/><text x="200" y="380" font-family="sans-serif" font-size="24" fill="%23ffffff" text-anchor="middle" font-weight="bold">Nabila</text></svg>';
    });
  }

  console.log('%c🌊 Portofolio Bahari Nabila siap diarungi! 🐬', 'color: #00b4d8; font-size: 16px; font-weight: bold;');
});
