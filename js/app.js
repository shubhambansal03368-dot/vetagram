/**
 * VETAGRAM - MODERN ANDROID HOMEPAGE ENGINE
 * Handles feed interactions, double-tap heart animations, story viewer,
 * bottom navigation tabs, audio synthesis, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // AUDIO FEEDBACK SYNTHESIZER (Web Audio API)
  // Clean, zero-dependency tactile sound effects
  // =========================================================================
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'like') {
        // High bubbly pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'tap') {
        // Subtle click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'send') {
        // Smooth chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'tab') {
        // Subtle soft blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      console.warn('Audio effect failed', e);
    }
  }

  // Sound Toggle Button in Global Header
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundIcon.textContent = '🔊';
        soundLabel.textContent = 'Sound On';
        playSound('send');
        showToast('Sound effects enabled 🔊');
      } else {
        soundIcon.textContent = '🔇';
        soundLabel.textContent = 'Muted';
        showToast('Sound effects muted 🔇');
      }
    });
  }

  // =========================================================================
  // TOAST NOTIFICATION UTILITY
  // =========================================================================
  const toastEl = document.getElementById('vetagramToast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  window.triggerToast = function(msg, icon = '🐾') {
    showToast(msg, icon);
  };

  function showToast(msg, icon = '🐾') {
    if (!toastEl) return;
    toastIcon.textContent = icon;
    toastMessage.textContent = msg;
    toastEl.classList.add('show');
    playSound('tap');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // =========================================================================
  // ANDROID STATUS BAR CLOCK
  // =========================================================================
  const statusClock = document.getElementById('statusClock');
  function updateClock() {
    if (!statusClock) return;
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    statusClock.textContent = `${hours}:${formattedMinutes}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // =========================================================================
  // DEVICE SHOWCASE MODE SWITCHER (Phone Mockup vs Expanded View)
  // =========================================================================
  const showcaseStage = document.getElementById('showcaseStage');
  const modePhoneBtn = document.getElementById('modePhoneBtn');
  const modeFullBtn = document.getElementById('modeFullBtn');

  if (modePhoneBtn && modeFullBtn && showcaseStage) {
    modePhoneBtn.addEventListener('click', () => {
      modePhoneBtn.classList.add('active');
      modeFullBtn.classList.remove('active');
      showcaseStage.classList.remove('mode-fullscreen');
      playSound('tap');
      showToast('Switched to Android Flagship Frame 📱');
    });

    modeFullBtn.addEventListener('click', () => {
      modeFullBtn.classList.add('active');
      modePhoneBtn.classList.remove('active');
      showcaseStage.classList.add('mode-fullscreen');
      playSound('tap');
      showToast('Expanded View Activated 🖥️');
    });
  }

  // Emergency SOS Button in Header
  const emergencyBtn = document.getElementById('emergencyTriageBtn');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', () => {
      switchTab('microscope');
      showToast('24/7 Vet SOS Diagnostic Activated! 🚨', '🚨');
    });
  }

  // Logo text click returns to top of feed
  const logoText = document.getElementById('logoText');
  const appScreenBody = document.getElementById('appScreenBody');
  if (logoText && appScreenBody) {
    logoText.addEventListener('click', () => {
      switchTab('home');
      appScreenBody.scrollTo({ top: 0, behavior: 'smooth' });
      playSound('tap');
    });
  }

  // =========================================================================
  // FEED POST INTERACTIONS
  // 1. Double Tap on Square Photo -> Pop Heart + Like
  // 2. Like Button -> Toggle + Increment Count
  // 3. Comment Button -> Open Drawer
  // 4. Share Button -> Copy Link
  // 5. Repost Button -> Toggle Repost
  // 6. Save Button -> Bookmark Collection
  // =========================================================================

  function setupPostInteractions(postId) {
    const photoWrap = document.getElementById(`squarePhotoWrap-${postId}`);
    const doubleHeart = document.getElementById(`doubleTapHeart-${postId}`);
    const likeBtn = document.getElementById(`likeBtn-${postId}`);
    const repostBtn = document.getElementById(`repostBtn-${postId}`);
    const saveBtn = document.getElementById(`saveBtn-${postId}`);
    const commentBtn = document.getElementById(`commentBtn-${postId}`);
    const commentsLink = document.getElementById(`openCommentsLink-${postId}`);
    const likesCount = document.getElementById(`likesCount-${postId}`);
    const followTag = document.getElementById(`followTag-${postId}`);
    const quickInput = document.getElementById(`quickCommentInput-${postId}`);

    let isLiked = false;
    let baseLikes = postId === 1 ? 14230 : (postId === 2 ? 8914 : 19450);

    // Double-tap on square photo
    let lastTap = 0;
    if (photoWrap && doubleHeart) {
      photoWrap.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 320 && tapLength > 0) {
          // Double Tap Triggered!
          e.preventDefault();
          triggerDoubleTapLike();
        }
        lastTap = currentTime;
      });
    }

    function triggerDoubleTapLike() {
      if (doubleHeart) {
        doubleHeart.classList.remove('animate');
        void doubleHeart.offsetWidth; // trigger reflow
        doubleHeart.classList.add('animate');
      }
      playSound('like');

      if (!isLiked) {
        isLiked = true;
        likeBtn?.classList.add('liked');
        baseLikes += 1;
        if (likesCount) {
          likesCount.textContent = `${baseLikes.toLocaleString()} likes`;
        }
        showToast('Liked Bruno’s recovery story! ❤️', '❤️');
      }
    }

    // Like Button Click
    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        isLiked = !isLiked;
        if (isLiked) {
          likeBtn.classList.add('liked');
          baseLikes += 1;
          playSound('like');
          showToast('Added to liked stories! ❤️', '❤️');
        } else {
          likeBtn.classList.remove('liked');
          baseLikes -= 1;
          playSound('tap');
        }
        if (likesCount) {
          likesCount.textContent = `${baseLikes.toLocaleString()} likes`;
        }
      });
    }

    // Repost Button Click
    if (repostBtn) {
      let isReposted = false;
      repostBtn.addEventListener('click', () => {
        isReposted = !isReposted;
        if (isReposted) {
          repostBtn.classList.add('reposted');
          playSound('send');
          showToast('Reposted to your Vetagram feed! 🔁', '🔁');
        } else {
          repostBtn.classList.remove('reposted');
          playSound('tap');
          showToast('Removed repost from profile', 'ℹ️');
        }
      });
    }

    // Save Button Click
    if (saveBtn) {
      let isSaved = false;
      saveBtn.addEventListener('click', () => {
        isSaved = !isSaved;
        if (isSaved) {
          saveBtn.classList.add('saved');
          playSound('send');
          showToast('Saved to "Veterinary Health & Recovery" collection 🔖', '🔖');
        } else {
          saveBtn.classList.remove('saved');
          playSound('tap');
          showToast('Removed from saved collection', 'ℹ️');
        }
      });
    }

    // Comment Buttons -> Open Comments Drawer
    if (commentBtn) {
      commentBtn.addEventListener('click', () => openCommentsModal());
    }
    if (commentsLink) {
      commentsLink.addEventListener('click', () => openCommentsModal());
    }

    // Follow Tag Toggle
    if (followTag) {
      let isFollowing = false;
      followTag.addEventListener('click', () => {
        isFollowing = !isFollowing;
        if (isFollowing) {
          followTag.textContent = '• Following';
          followTag.classList.add('following');
          playSound('send');
          showToast('Now following clinical updates! 🐾', '🐾');
        } else {
          followTag.textContent = '• Follow';
          followTag.classList.remove('following');
          playSound('tap');
        }
      });
    }

    // Quick Comment Input (press enter to submit)
    if (quickInput) {
      quickInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && quickInput.value.trim() !== '') {
          appendUserComment(quickInput.value.trim());
          quickInput.value = '';
          playSound('send');
          showToast('Comment posted to feed! 💬', '💬');
        }
      });
    }
  }

  // Initialize for all 3 posts
  setupPostInteractions(1);
  setupPostInteractions(2);
  setupPostInteractions(3);

  // Quick Emoji Clickers in post 1
  document.querySelectorAll('.quick-emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.textContent;
      const input = document.getElementById('quickCommentInput-1');
      if (input) {
        input.value += emoji + ' ';
        input.focus();
        playSound('tap');
      }
    });
  });

  // =========================================================================
  // COMMENTS MODAL DRAWER
  // =========================================================================
  const commentsModalBackdrop = document.getElementById('commentsModalBackdrop');
  const commentsCloseBtn = document.getElementById('commentsCloseBtn');
  const modalCommentInput = document.getElementById('modalCommentInput');
  const modalCommentPostBtn = document.getElementById('modalCommentPostBtn');
  const commentsListBody = document.getElementById('commentsListBody');

  function openCommentsModal() {
    if (commentsModalBackdrop) {
      commentsModalBackdrop.classList.add('active');
      playSound('tap');
      setTimeout(() => modalCommentInput?.focus(), 300);
    }
  }

  function closeCommentsModal() {
    if (commentsModalBackdrop) {
      commentsModalBackdrop.classList.remove('active');
      playSound('tap');
    }
  }

  if (commentsCloseBtn) {
    commentsCloseBtn.addEventListener('click', closeCommentsModal);
  }
  if (commentsModalBackdrop) {
    commentsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === commentsModalBackdrop) closeCommentsModal();
    });
  }

  function appendUserComment(text) {
    if (!commentsListBody) return;
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    commentItem.style.animation = 'fadeInView 0.3s ease';
    commentItem.innerHTML = `
      <img class="comment-avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" alt="Dr. Alex">
      <div class="comment-bubble">
        <div class="comment-user-line">
          <span>Dr. Alex Rivers</span>
          <span class="comment-time">Just now</span>
        </div>
        <p class="comment-text">${escapeHtml(text)}</p>
      </div>
    `;
    commentsListBody.prepend(commentItem);

    // Also update feed preview on post 1
    const latestBox = document.getElementById('latestCommentBox-1');
    if (latestBox) {
      latestBox.innerHTML = `
        <span class="commentor">Dr. Alex Rivers</span>
        <span>${escapeHtml(text)}</span>
      `;
    }
  }

  if (modalCommentPostBtn && modalCommentInput) {
    modalCommentPostBtn.addEventListener('click', () => {
      const text = modalCommentInput.value.trim();
      if (text) {
        appendUserComment(text);
        modalCommentInput.value = '';
        playSound('send');
        showToast('Comment posted! 💬', '💬');
      }
    });
    modalCommentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        modalCommentPostBtn.click();
      }
    });
  }

  // =========================================================================
  // CREATE POST MODAL (Triggered by Top Left Plus Icon)
  // =========================================================================
  const openCreatePostBtn = document.getElementById('openCreatePostBtn');
  const createPostModalBackdrop = document.getElementById('createPostModalBackdrop');
  const createPostCloseBtn = document.getElementById('createPostCloseBtn');
  const submitCreatePostBtn = document.getElementById('submitCreatePostBtn');
  const newPostCaptionInput = document.getElementById('newPostCaptionInput');

  if (openCreatePostBtn && createPostModalBackdrop) {
    openCreatePostBtn.addEventListener('click', () => {
      createPostModalBackdrop.classList.add('active');
      playSound('tap');
    });
  }

  if (createPostCloseBtn && createPostModalBackdrop) {
    createPostCloseBtn.addEventListener('click', () => {
      createPostModalBackdrop.classList.remove('active');
      playSound('tap');
    });
  }

  // Photo thumbnail choice
  let selectedNewPhoto = 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80';
  document.querySelectorAll('.new-post-photo-choice').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.new-post-photo-choice').forEach(t => t.style.borderColor = 'transparent');
      thumb.style.borderColor = '#00b4d8';
      selectedNewPhoto = thumb.src.replace('w=200', 'w=800');
      playSound('tap');
    });
  });

  if (submitCreatePostBtn && createPostModalBackdrop) {
    submitCreatePostBtn.addEventListener('click', () => {
      const caption = newPostCaptionInput?.value.trim() || 'New patient checkup completed today! Great vitals and happy wagging tail 🐾✨ #Vetagram';
      
      // Prepend newly created post to feed
      const newPostId = Date.now();
      const feedStream = document.getElementById('feedStream');
      if (feedStream) {
        const postCard = document.createElement('article');
        postCard.className = 'feed-post-card';
        postCard.id = `post-${newPostId}`;
        postCard.style.animation = 'fadeInView 0.4s ease';
        postCard.innerHTML = `
          <header class="post-header">
            <div class="post-author-info">
              <div class="post-avatar-ring">
                <img class="post-avatar-img" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" alt="Dr. Alex">
              </div>
              <div class="post-author-text">
                <div class="post-author-row">
                  <span class="post-username">dr_alex_dvm</span>
                  <span class="verified-badge">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </span>
                  <span class="post-follow-tag">• You</span>
                </div>
                <span class="post-location">Vetagram Emergency Center</span>
              </div>
            </div>
            <button class="post-more-btn"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg></button>
          </header>

          <div class="post-square-photo-wrap" id="squarePhotoWrap-${newPostId}">
            <img class="post-square-photo" src="${selectedNewPhoto}" alt="New Pet Post">
            <div class="double-tap-heart" id="doubleTapHeart-${newPostId}">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
          </div>

          <div class="post-action-bar">
            <div class="action-buttons-left">
              <button class="feed-icon-btn like-btn" id="likeBtn-${newPostId}"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
              <button class="feed-icon-btn comment-btn"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>
              <button class="feed-icon-btn share-btn"><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
              <button class="feed-icon-btn repost-btn"><svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button>
            </div>
            <div class="action-buttons-right">
              <button class="feed-icon-btn save-btn"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
            </div>
          </div>

          <div class="post-details">
            <span class="post-likes-count" id="likesCount-${newPostId}">1 like</span>
            <p class="post-caption"><span class="caption-author">dr_alex_dvm</span> ${escapeHtml(caption)}</p>
            <span class="post-timestamp">JUST NOW</span>
          </div>
        `;
        feedStream.prepend(postCard);
        setupPostInteractions(newPostId);
      }

      createPostModalBackdrop.classList.remove('active');
      if (newPostCaptionInput) newPostCaptionInput.value = '';
      playSound('send');
      showToast('Published new post to Vetagram! 🚀', '🚀');
      
      // Scroll to top
      appScreenBody?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // STORIES FULL-SCREEN VIEWER
  // Tapping any circle in the stories tray opens story viewer with progress bar
  // =========================================================================
  const storyViewerModal = document.getElementById('storyViewerModal');
  const storyViewerCloseBtn = document.getElementById('storyViewerCloseBtn');
  const storyViewerName = document.getElementById('storyViewerName');
  const storyViewerAvatar = document.getElementById('storyViewerAvatar');
  const storyViewerMediaImg = document.getElementById('storyViewerMediaImg');
  const storyProgressFill = document.getElementById('storyProgressFill');
  const storyTapLeft = document.getElementById('storyTapLeft');
  const storyTapRight = document.getElementById('storyTapRight');
  const storyHeartBtn = document.getElementById('storyHeartBtn');
  const storyReplyInput = document.getElementById('storyReplyInput');

  let currentStoryIndex = 0;
  let storyInterval = null;
  let storyProgress = 0;

  const storiesData = [
    {
      name: 'dr.oliver_vet',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      media: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      time: '1h ago • Surgery Unit'
    },
    {
      name: 'golden.cooper',
      avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80',
      media: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
      time: '3h ago • Central Park'
    },
    {
      name: 'dr.whiskers',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
      media: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80',
      time: '4h ago • Dental Suite'
    },
    {
      name: 'wildlife_maya',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      media: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      time: '5h ago • Aviary ICU'
    },
    {
      name: 'luna_kitten',
      avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80',
      media: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      time: '6h ago • Cozy Blanket'
    }
  ];

  function openStoryViewer(index = 0) {
    if (!storyViewerModal) return;
    currentStoryIndex = index % storiesData.length;
    storyViewerModal.classList.add('active');
    loadStorySlide(currentStoryIndex);
    playSound('tab');
  }

  function closeStoryViewer() {
    if (!storyViewerModal) return;
    storyViewerModal.classList.remove('active');
    if (storyInterval) clearInterval(storyInterval);
    playSound('tap');
  }

  function loadStorySlide(idx) {
    const s = storiesData[idx];
    if (!s) return;
    if (storyViewerName) storyViewerName.textContent = s.name;
    if (storyViewerAvatar) storyViewerAvatar.src = s.avatar;
    if (storyViewerMediaImg) storyViewerMediaImg.src = s.media;
    const timeEl = document.getElementById('storyViewerTime');
    if (timeEl) timeEl.textContent = s.time;

    // Reset progress
    storyProgress = 0;
    if (storyProgressFill) storyProgressFill.style.width = '0%';
    if (storyInterval) clearInterval(storyInterval);

    storyInterval = setInterval(() => {
      storyProgress += 2;
      if (storyProgressFill) storyProgressFill.style.width = `${storyProgress}%`;
      if (storyProgress >= 100) {
        clearInterval(storyInterval);
        // Advance to next story
        if (currentStoryIndex < storiesData.length - 1) {
          currentStoryIndex++;
          loadStorySlide(currentStoryIndex);
        } else {
          closeStoryViewer();
        }
      }
    }, 100);
  }

  // Attach story click handlers to each circle item in the carousel
  document.querySelectorAll('.story-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index || '0', 10);
      if (item.classList.contains('your-story')) {
        // Your Story -> Open Create Post
        createPostModalBackdrop?.classList.add('active');
        playSound('tap');
      } else {
        openStoryViewer(idx > 0 ? idx - 1 : 0);
      }
    });
  });

  if (storyViewerCloseBtn) {
    storyViewerCloseBtn.addEventListener('click', closeStoryViewer);
  }

  if (storyTapLeft) {
    storyTapLeft.addEventListener('click', () => {
      if (currentStoryIndex > 0) {
        currentStoryIndex--;
        loadStorySlide(currentStoryIndex);
        playSound('tab');
      }
    });
  }

  if (storyTapRight) {
    storyTapRight.addEventListener('click', () => {
      if (currentStoryIndex < storiesData.length - 1) {
        currentStoryIndex++;
        loadStorySlide(currentStoryIndex);
        playSound('tab');
      } else {
        closeStoryViewer();
      }
    });
  }

  if (storyHeartBtn) {
    storyHeartBtn.addEventListener('click', () => {
      playSound('like');
      showToast(`Sent ❤️ reaction to ${storiesData[currentStoryIndex]?.name}!`, '❤️');
    });
  }

  if (storyReplyInput) {
    storyReplyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && storyReplyInput.value.trim() !== '') {
        showToast(`Sent message: "${storyReplyInput.value.trim()}"`, '💌');
        storyReplyInput.value = '';
        playSound('send');
      }
    });
  }

  // =========================================================================
  // BOTTOM NAVIGATION BAR (Exact 5 Icons Switcher)
  // 1. Home shape
  // 2. Square inside triangle (Reels)
  // 3. Send icon (plane)
  // 4. Search icon (microscope)
  // 5. Account icon (circle inside person)
  // =========================================================================

  const navHomeBtn = document.getElementById('navHomeBtn');
  const navReelsBtn = document.getElementById('navReelsBtn');
  const navSendBtn = document.getElementById('navSendBtn');
  const navMicroscopeBtn = document.getElementById('navMicroscopeBtn');
  const navAccountBtn = document.getElementById('navAccountBtn');

  const tabHomeView = document.getElementById('tabHomeView');
  const tabReelsView = document.getElementById('tabReelsView');
  const tabMessagesView = document.getElementById('tabMessagesView');
  const tabMicroscopeView = document.getElementById('tabMicroscopeView');
  const tabAccountView = document.getElementById('tabAccountView');

  const allNavBtns = [navHomeBtn, navReelsBtn, navSendBtn, navMicroscopeBtn, navAccountBtn];
  const allViews = [tabHomeView, tabReelsView, tabMessagesView, tabMicroscopeView, tabAccountView];

  function switchTab(tabName) {
    allNavBtns.forEach(b => b?.classList.remove('active'));
    allViews.forEach(v => v?.classList.remove('active'));

    playSound('tab');

    if (tabName === 'home') {
      navHomeBtn?.classList.add('active');
      tabHomeView?.classList.add('active');
    } else if (tabName === 'reels') {
      navReelsBtn?.classList.add('active');
      tabReelsView?.classList.add('active');
      showToast('Vetagram Pet Shorts & Reels ▶️', '▶️');
    } else if (tabName === 'send') {
      navSendBtn?.classList.add('active');
      tabMessagesView?.classList.add('active');
      showToast('Direct Encrypted Vet Messages ✈️', '✈️');
    } else if (tabName === 'microscope') {
      navMicroscopeBtn?.classList.add('active');
      tabMicroscopeView?.classList.add('active');
      showToast('Microscope AI Symptom Diagnostic 🔬', '🔬');
    } else if (tabName === 'account') {
      navAccountBtn?.classList.add('active');
      tabAccountView?.classList.add('active');
      showToast('Dr. Alex Rivers Profile & Pet Passport 👤', '👤');
    }
  }

  navHomeBtn?.addEventListener('click', () => switchTab('home'));
  navReelsBtn?.addEventListener('click', () => switchTab('reels'));
  navSendBtn?.addEventListener('click', () => switchTab('send'));
  navMicroscopeBtn?.addEventListener('click', () => switchTab('microscope'));
  navAccountBtn?.addEventListener('click', () => switchTab('account'));

  // Top Right Heart Message Icon triggers the Send / Messages Tab
  const openMessagesBtn = document.getElementById('openMessagesBtn');
  if (openMessagesBtn) {
    openMessagesBtn.addEventListener('click', () => switchTab('send'));
  }

  // Like Reel Button in Reels view
  document.querySelectorAll('.like-reel-btn').forEach(b => {
    let likedReel = false;
    b.addEventListener('click', () => {
      likedReel = !likedReel;
      if (likedReel) {
        b.querySelector('svg').setAttribute('fill', '#ff0055');
        b.querySelector('svg').setAttribute('stroke', '#ff0055');
        playSound('like');
        showToast('Liked Therapy Dog Reel! ❤️', '❤️');
      } else {
        b.querySelector('svg').setAttribute('fill', 'none');
        b.querySelector('svg').setAttribute('stroke', '#ffffff');
      }
    });
  });

  // Microscope Search Filter
  const microscopeSearchInput = document.getElementById('microscopeSearchInput');
  if (microscopeSearchInput) {
    microscopeSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.clinic-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(q) || q === '') {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Symptom Tags Filter
  document.querySelectorAll('.symptom-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const symptom = tag.textContent;
      if (microscopeSearchInput) {
        microscopeSearchInput.value = symptom.replace(/[^a-zA-Z ]/g, '').trim();
      }
      playSound('tap');
      showToast(`Triage Search: ${symptom} analyzed 🔬`, '🔬');
    });
  });

  // Simulated Chat Dialog opener
  window.openChatDialog = function(name, role) {
    showToast(`Opening secure consult with ${name} (${role}) 💬`, '💬');
    playSound('send');
  };

  // Helper escape
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Welcome Toast on initial load
  setTimeout(() => {
    showToast('Welcome to Vetagram! The #1 Pet & Vet Care Network 🐾', '✨');
  }, 900);

});
