// ===========================================
// TYNWALD — page navigation
// Each sidebar button has data-page="feed" / "communities" / "research" / "profile" / etc.
// Each section has id="page-feed" / "page-communities" / etc.
// The URL hash (e.g. index.html#research) keeps the active tab in sync,
// so links like <a href="index.html#research"> from other pages work,
// and refreshing/bookmarking keeps you on the same tab.
// ===========================================

document.addEventListener("DOMContentLoaded", () => {
  // Guard: index.html is the logged-in app shell. If there's no token,
  // send people to the auth page instead of showing a broken "logged in" UI.
  if (!localStorage.getItem("tynwald_token")) {
    window.location.href = "auth.html";
    return;
  }

  // ===================== NIGHT OPS (DARK MODE) =====================
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("tynwald_theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("tynwald_theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("tynwald_theme", "dark");
      }
    });
  }

  // ===================== SIDEBAR COLLAPSE =====================
  const sidebarCollapseToggle = document.getElementById("sidebarCollapseToggle");
  const sidebarEl = document.querySelector(".sidebar");
  const savedSidebarState = localStorage.getItem("tynwald_sidebar");
  if (savedSidebarState === "collapsed" && sidebarEl) {
    sidebarEl.classList.add("collapsed");
  }

  if (sidebarCollapseToggle && sidebarEl) {
    sidebarCollapseToggle.addEventListener("click", () => {
      const isCollapsed = sidebarEl.classList.toggle("collapsed");
      localStorage.setItem("tynwald_sidebar", isCollapsed ? "collapsed" : "expanded");
      sidebarCollapseToggle.setAttribute(
        "aria-label",
        isCollapsed ? "Expand sidebar" : "Collapse sidebar"
      );
      sidebarCollapseToggle.setAttribute("title", isCollapsed ? "Expand sidebar" : "Collapse sidebar");
    });
  }

  // ===================== LOGOUT =====================
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("tynwald_token");
      localStorage.removeItem("tynwald_user");
      window.location.href = "auth.html";
    });
  }

  // ===================== FUTURISTIC LOADING STATES =====================
  // Upgrades every static "Loading X..." placeholder already in the HTML
  // into a scanning-bar loader, matching the dossier/HUD theme. Runs once,
  // immediately, before any of the page's fetches have a chance to
  // resolve and replace these elements' contents.
  document.querySelectorAll(".empty-state").forEach((el) => {
    const text = el.textContent.trim();
    if (!/^Loading/i.test(text)) return;
    const label = text.replace(/\.\.\.$/, "");
    el.innerHTML = `<div class="loader-scan"><div class="loader-scan-bar"></div><span class="loader-scan-label">${label}</span></div>`;
  });

  // ===================== LIKE BUTTON ICON =====================
  // A real heart glyph (outline when not liked, filled when liked) instead
  // of the ♡/♥ text characters, so it reads like a standard social-media
  // like button rather than a typographic symbol.
  function heartIcon(liked) {
    return `<svg class="like-icon" viewBox="0 0 24 24" width="15" height="15" fill="${liked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.7-10.2-9.1C.2 9.1 1 5.4 4.4 4c2.5-1 5.1 0 6.7 2.1L12 7.2l.9-1.1C14.5 4 17.1 3 19.6 4c3.4 1.4 4.2 5.1 2.6 7.9C19.5 16.3 12 21 12 21z"/></svg>`;
  }

  function likeButtonHTML(liked, count) {
    return `${heartIcon(liked)}<span class="like-count">${count}</span>`;
  }

  // ===================== READ RECEIPT ICONS =====================
  // Single check = sent, double gold check = seen — replaces the old
  // "· seen" text label with a standard messaging-app style receipt.
  function checkIcon(double, seen) {
    const color = seen ? "var(--gold-bright)" : "currentColor";
    if (double) {
      return `<svg class="read-receipt" viewBox="0 0 20 12" width="16" height="10" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6l3 3 5-7"/><path d="M7 6l3 3 8-9"/></svg>`;
    }
    return `<svg class="read-receipt" viewBox="0 0 14 12" width="13" height="10" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6l4 4 8-9"/></svg>`;
  }

  // ===================== VERIFIED-ROLE AVATAR RINGS =====================
  const ROLE_RING_COLORS = {
    "Law Enforcement": "#B8935A",
    "Lecturer": "#41506B",
    "Researcher": "#6B7894",
    "Cybersecurity Specialist": "#3F7A5C",
    "Legal Practitioner": "#8A4A3F",
    "Military Personnel": "#5C6B3F",
    "Student": "#9A9184",
    "Community Member": "#9A9184",
  };

  function applyRoleRing(el, role) {
    if (!el) return;
    const color = ROLE_RING_COLORS[role] || "var(--line)";
    el.style.setProperty("--role-ring", color);
    el.classList.add("has-role-ring");
    if (role) el.title = role;
  }

  // ===================== BOOKMARK ICON =====================
  function bookmarkIcon(saved) {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="${saved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
  }


  // The standard three-node "share" glyph used across most social apps,
  // in place of the plain "↗" character.
  function shareIcon() {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"></line></svg>`;
  }

  // Copies a shareable link to the clipboard with a toast confirmation.
  // (Deliberately not using the native Web Share API here — it was
  // opening an "Aw, Snap!" crash page in testing, likely because this
  // is being tested over a non-standard origin/context it doesn't like.
  // Clipboard-copy is simpler and works everywhere.)
  async function sharePost(postId, title) {
    const shareUrl = new URL(`post.html?id=${postId}`, window.location.href).href;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for http:// or file:// contexts where the Clipboard
        // API isn't available: a temporary offscreen textarea + the
        // older execCommand copy method.
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      showToast("Link copied to clipboard.", "success");
    } catch (err) {
      console.error("Copy link failed:", err);
      showToast("Could not copy the link.", "error");
    }
  }


  // Replaces alert() with a dismissible, auto-expiring toast in the
  // bottom-right corner, styled to match the dossier/case-file theme.
  const toastStack = document.getElementById("toastStack");

  function showToast(message, type = "info", duration = 4500) {
    if (!toastStack) {
      // Fallback if a page somehow doesn't have the toast container
      console.warn("Toast:", message);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.textContent = type === "error" ? "⚠" : type === "success" ? "✓" : "•";

    const text = document.createElement("span");
    text.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.textContent = "×";
    closeBtn.setAttribute("aria-label", "Dismiss");

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(closeBtn);
    toastStack.appendChild(toast);

    function dismiss() {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 200);
    }

    closeBtn.addEventListener("click", dismiss);
    const timer = setTimeout(dismiss, duration);
    toast.addEventListener("mouseenter", () => clearTimeout(timer));
  }

  const navButtons = document.querySelectorAll(".nav-item[data-page]");
  const pages = document.querySelectorAll(".page");
  const sidebar = document.querySelector(".sidebar");
  const menuToggle = document.getElementById("mobileMenuToggle");

  // Declared here (not next to the polling functions further down) so it's
  // already initialized before showPage's first call can reference it.
  let threadPollInterval = null;

  function showPage(targetPage) {
    // Fall back to "feed" if the hash doesn't match any known page
    const matchingButton = document.querySelector(`.nav-item[data-page="${targetPage}"]`);
    const resolvedPage = matchingButton ? targetPage : "feed";

    // Update active nav button
    navButtons.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-page") === resolvedPage);
    });

    // Show the matching page, hide the rest
    pages.forEach((page) => {
      page.classList.toggle("hidden", page.id !== `page-${resolvedPage}`);
    });

    // Live message polling should only run while Messages is the active tab
    if (resolvedPage !== "messages") {
      stopThreadPolling();
    }
  }

  // Like showPage(), but for pages that deliberately have no sidebar nav
  // button (e.g. viewing someone else's profile) — showPage() falls back
  // to "feed" when it can't find a matching nav button, so this bypasses
  // that check.
  function navigateToPage(pageId) {
    navButtons.forEach((b) => b.classList.remove("active"));
    pages.forEach((page) => {
      page.classList.toggle("hidden", page.id !== pageId);
    });
    stopThreadPolling();
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetPage = btn.getAttribute("data-page");
      window.location.hash = targetPage;
      showPage(targetPage);

      // On mobile, close the nav menu after picking a page
      if (sidebar) {
        sidebar.classList.remove("nav-open");
      }
    });
  });

  // Mobile hamburger toggle: shows/hides the nav + user card
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("nav-open");
    });

    // Tapping the dimmed backdrop (i.e. anywhere in the sidebar that
    // isn't the nav drawer or the brand/toggle bar) closes the drawer.
    sidebar.addEventListener("click", (event) => {
      if (event.target === sidebar) {
        sidebar.classList.remove("nav-open");
      }
    });
  }

  // On load: check the URL hash (e.g. "#research") and jump straight there
  const initialPage = window.location.hash.replace("#", "");
  if (initialPage) {
    showPage(initialPage);
  }

  // Support browser back/forward buttons changing the hash
  window.addEventListener("hashchange", () => {
    const page = window.location.hash.replace("#", "");
    showPage(page);
  });

  // ===================== VIEW ANOTHER USER'S PROFILE =====================
  async function openUserProfile(userId) {
    navigateToPage("page-user-profile");

    const loadingEl = document.getElementById("userProfileLoading");
    const viewEl = document.getElementById("userProfileView");
    if (viewEl) viewEl.classList.add("hidden");
    if (loadingEl) {
      loadingEl.classList.remove("hidden");
      loadingEl.innerHTML = `<div class="loader-scan"><div class="loader-scan-bar"></div><span class="loader-scan-label">Loading profile</span></div>`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const user = await safeJson(response);
      if (!response.ok) throw new Error(user.message || "Could not load this profile.");

      if (loadingEl) loadingEl.classList.add("hidden");
      if (viewEl) viewEl.classList.remove("hidden");

      document.getElementById("userProfileName").textContent = user.name;
      document.getElementById("userProfileSubtitle").textContent =
        [user.role, user.institution].filter(Boolean).join(" · ");
      document.getElementById("userProfileBio").textContent = user.bio || "No bio yet.";

      const avatar = document.getElementById("userProfileAvatar");
      avatar.textContent = getInitials(user.name);
      applyRoleRing(avatar, user.role);

      renderChips(document.getElementById("userProfileResearchAreas"), user.researchAreas, "None listed yet.");
      renderChips(document.getElementById("userProfileSkills"), user.skills, "None listed yet.");

      const messageBtn = document.getElementById("userProfileMessageBtn");
      if (messageBtn) {
        const currentUser = getStoredUser();
        const isOwnProfile = currentUser && currentUser.id === userId;
        messageBtn.classList.toggle("hidden", isOwnProfile);
        messageBtn.onclick = () => {
          showPage("messages");
          window.location.hash = "messages";
          const corrRef = generateCorrRef();
          loadMessageThread(userId, user.name, corrRef);
        };
      }
    } catch (err) {
      console.error("Load user profile failed:", err);
      if (loadingEl) {
        loadingEl.classList.remove("hidden");
        loadingEl.textContent = "Could not load this profile.";
      }
    }
  }

  const userProfileBack = document.getElementById("userProfileBack");
  if (userProfileBack) {
    userProfileBack.addEventListener("click", (event) => {
      event.preventDefault();
      showPage("feed");
      window.location.hash = "feed";
    });
  }

  // If we arrived here via a "?viewUser=<id>" link (from post.html or
  // community-detail.html, which don't have this page built in),
  // jump straight to that profile once everything above is wired up.
  const viewUserParam = new URLSearchParams(window.location.search).get("viewUser");
  if (viewUserParam) {
    openUserProfile(viewUserParam);
  }


  // Every page that needs to know "who is logged in" reads from here.
  function getToken() {
    return localStorage.getItem('tynwald_token');
  }

  function getStoredUser() {
    const raw = localStorage.getItem('tynwald_user');
    return raw ? JSON.parse(raw) : null;
  }

  function requireLoginOrRedirect() {
    if (!getToken()) {
      window.location.href = 'auth.html';
      return false;
    }
    return true;
  }

  // Fill the sidebar with the real logged-in user's name/role/initials
  const currentUser = getStoredUser();
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserRole = document.getElementById("sidebarUserRole");
  const sidebarAvatar = document.getElementById("sidebarAvatar");

  if (currentUser && sidebarUserName && sidebarUserRole && sidebarAvatar) {
    sidebarUserName.textContent = currentUser.name;
    sidebarUserRole.textContent = currentUser.role;
    const initials = currentUser.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    sidebarAvatar.textContent = initials;
    applyRoleRing(sidebarAvatar, currentUser.role);
  }

  // Feed composer avatar — same logged-in user, same role ring
  const composerAvatarEl = document.getElementById("composerAvatar");
  if (currentUser && composerAvatarEl) {
    composerAvatarEl.textContent = getInitials(currentUser.name);
    applyRoleRing(composerAvatarEl, currentUser.role);
  }

  // ===================== FEED: LOAD REAL POSTS =====================
  const composerSubmit = document.getElementById("composerSubmit");
  const composerTitle = document.getElementById("composerTitle");
  const composerBody = document.getElementById("composerBody");
  const composerTag = document.getElementById("composerTag");
  const feedPosts = document.getElementById("feed-posts");
  const feedLoading = document.getElementById("feedLoading");

  // Turns "2026-06-25T14:01:51.784Z" into something like "2h ago"
  function formatRelativeTime(isoString) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // Builds one post card from a real post object returned by the API.
  // Mirrors the exact HTML structure the CSS already expects.
  function renderPostCard(post) {
    const article = document.createElement("article");
    article.className = "post-card";
    article.dataset.postId = post._id;

    const liked = post.likedByMe === true;
    const likeCount = post.likes ? post.likes.length : 0;

    article.innerHTML = `
      <div class="post-top">
        <span class="case-stamp"></span>
        <span class="tag tag-outline"></span>
      </div>
      <div class="post-meta">
        <a href="#" class="post-author"></a>
        <span class="post-inst"></span>
        <span class="dot">·</span>
        <span class="post-time"></span>
      </div>
      <h3 class="post-title"></h3>
      ${post.imageUrl ? `<img class="post-image" src="${post.imageUrl}" alt="" />` : ""}
      <p class="post-body"></p>
      <div class="post-footer">
        <button class="like-btn feed-like-btn" data-liked="${liked}" data-count="${likeCount}">${likeButtonHTML(liked, likeCount)}</button>
        <button type="button" class="share-btn" title="Share">${shareIcon()}</button>
        <button type="button" class="bookmark-btn" data-saved="${post.savedByMe === true}" title="Save">${bookmarkIcon(post.savedByMe === true)}</button>
        <span class="tag tag-outline"></span>
        <span class="meta-text"></span>
        <a href="post.html?id=${post._id}" class="link-text">Open file →</a>
      </div>
    `;

    article.querySelector(".case-stamp").textContent = post.caseId;
    article.querySelector(".post-top .tag").textContent = post.status;
    article.querySelector(".post-author").textContent = post.author?.name || "Unknown";
    if (post.author?._id) {
      article.querySelector(".post-author").dataset.userId = post.author._id;
    }
    article.querySelector(".post-inst").textContent = post.author?.institution || "";
    article.querySelector(".post-time").textContent = formatRelativeTime(post.createdAt);
    article.querySelector(".post-title").textContent = post.title;
    article.querySelector(".post-body").textContent = post.body;
    article.querySelector(".post-footer .tag").textContent = post.tag;
    article.querySelector(".meta-text").textContent = "View comments";

    return article;
  }

  let feedPage = 1;
  let feedHasMore = false;
  let feedIsLoading = false;
  let feedSearchTerm = "";
  const feedLoadingMore = document.getElementById("feedLoadingMore");
  const feedScrollSentinel = document.getElementById("feedScrollSentinel");

  async function loadFeed(page = 1, append = false) {
    if (!feedPosts || feedIsLoading) return;
    feedIsLoading = true;

    if (append && feedLoadingMore) {
      feedLoadingMore.classList.remove("hidden");
      feedLoadingMore.innerHTML = `<div class="loader-scan"><div class="loader-scan-bar"></div><span class="loader-scan-label">Loading more</span></div>`;
    }

    try {
      const searchParam = feedSearchTerm ? `&search=${encodeURIComponent(feedSearchTerm)}` : "";
      const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=15${searchParam}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load the feed.");
      }

      if (!append) feedPosts.innerHTML = "";
      data.items.forEach((post) => {
        feedPosts.appendChild(renderPostCard(post));
      });

      feedPage = data.page;
      feedHasMore = data.hasMore;

      if (feedLoadingMore) feedLoadingMore.classList.add("hidden");
      if (feedLoading) feedLoading.classList.add("hidden");
      applyFeedFilters();
    } catch (err) {
      console.error("Failed to load feed:", err);
      if (append && feedLoadingMore) {
        feedLoadingMore.classList.remove("hidden");
        feedLoadingMore.textContent = "Could not load more posts.";
      } else if (feedLoading) {
        feedLoading.classList.remove("hidden");
        feedLoading.textContent = "Could not load the feed. Is the backend running?";
      }
    } finally {
      feedIsLoading = false;
    }
  }

  // Infinite scroll: once the sentinel below the feed list scrolls into
  // view, load the next page automatically — no button to click.
  if (feedScrollSentinel && "IntersectionObserver" in window) {
    const feedObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && feedHasMore && !feedIsLoading) {
          loadFeed(feedPage + 1, true);
        }
      },
      { rootMargin: "300px" } // start loading a bit before it's actually on screen
    );
    feedObserver.observe(feedScrollSentinel);
  }

  // Only load the feed if we're actually on a page that has it
  if (feedPosts) {
    loadFeed();
  }

  // ===================== COMPOSER IMAGE ATTACHMENT =====================
  const composerImageInput = document.getElementById("composerImageInput");
  const composerAttachBtn = document.getElementById("composerAttachBtn");
  const composerImagePreviewWrap = document.getElementById("composerImagePreviewWrap");
  const composerImagePreview = document.getElementById("composerImagePreview");
  const composerRemoveImage = document.getElementById("composerRemoveImage");
  let pendingImageUrl = null;

  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Image upload failed.");
    return data.secure_url;
  }

  if (composerAttachBtn && composerImageInput) {
    composerAttachBtn.addEventListener("click", () => composerImageInput.click());

    composerImageInput.addEventListener("change", async () => {
      const file = composerImageInput.files[0];
      if (!file) return;

      composerAttachBtn.classList.add("uploading");
      composerAttachBtn.textContent = "Uploading...";

      try {
        pendingImageUrl = await uploadToCloudinary(file);
        composerImagePreview.src = pendingImageUrl;
        composerImagePreviewWrap.classList.remove("hidden");
      } catch (err) {
        console.error("Composer image upload failed:", err);
        showToast(err.message || "Could not upload the image.", "error");
        pendingImageUrl = null;
      } finally {
        composerAttachBtn.classList.remove("uploading");
        composerAttachBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg> Attach image`;
        composerImageInput.value = "";
      }
    });
  }

  if (composerRemoveImage) {
    composerRemoveImage.addEventListener("click", () => {
      pendingImageUrl = null;
      composerImagePreviewWrap.classList.add("hidden");
      composerImagePreview.src = "";
    });
  }

  // ===================== FEED: REAL POST COMPOSER =====================
  if (composerSubmit && feedPosts) {
    composerSubmit.addEventListener("click", async () => {
      if (!requireLoginOrRedirect()) return;

      const title = composerTitle.value.trim();
      const body = composerBody.value.trim();
      const tag = composerTag.value;

      if (!title || !body) {
        composerTitle.focus();
        return;
      }

      composerSubmit.disabled = true;
      composerSubmit.textContent = "Filing...";

      try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ title, body, tag, imageUrl: pendingImageUrl || undefined }),
        });

        const newPost = await response.json();

        if (!response.ok) {
          throw new Error(newPost.message || "Could not create the post.");
        }

        const newCard = renderPostCard(newPost);
        newCard.classList.add("just-added");
        feedPosts.insertBefore(newCard, feedPosts.firstChild);

        composerTitle.value = "";
        composerBody.value = "";
        pendingImageUrl = null;
        if (composerImagePreviewWrap) composerImagePreviewWrap.classList.add("hidden");
        if (composerImagePreview) composerImagePreview.src = "";

        setTimeout(() => newCard.classList.remove("just-added"), 1500);
        applyFeedFilters();
      } catch (err) {
        console.error("Create post failed:", err);
        showToast(err.message || "Something went wrong posting this.", "error");
      } finally {
        composerSubmit.disabled = false;
        composerSubmit.textContent = "File post";
      }
    });
  }

  // ===================== FEED SEARCH + FILTER =====================
  const feedSearch = document.getElementById("feedSearch");
  const feedFilters = document.getElementById("feedFilters");
  const feedEmptyState = document.getElementById("feedEmptyState");
  let activeFeedFilter = "All";

  // Reads a post card's tag from its footer (the small tag right before "responses")
  function getPostTag(card) {
    const footerTag = card.querySelector(".post-footer .tag");
    return footerTag ? footerTag.textContent.trim() : "";
  }

  function applyFeedFilters() {
    if (!feedPosts) return;
    const cards = feedPosts.querySelectorAll(".post-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const tag = getPostTag(card);
      const visible = activeFeedFilter === "All" || tag === activeFeedFilter;
      card.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });

    if (feedEmptyState) {
      feedEmptyState.classList.toggle("hidden", visibleCount !== 0);
    }
  }

  if (feedFilters) {
    feedFilters.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        feedFilters.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeFeedFilter = chip.getAttribute("data-filter");
        applyFeedFilters();
      });
    });
  }

  let feedSearchDebounce = null;
  if (feedSearch) {
    feedSearch.addEventListener("input", () => {
      clearTimeout(feedSearchDebounce);
      feedSearchDebounce = setTimeout(() => {
        feedSearchTerm = feedSearch.value.trim();
        feedPage = 1;
        loadFeed(1, false);
      }, 350);
    });
  }

  // Safely parses a fetch Response as JSON. If the backend route doesn't
  // exist or throws before reaching res.json(...), Express/the browser
  // returns plain text or an HTML error page — calling .json() on that
  // throws a confusing "Unexpected token" error. This turns that into a
  // clear message instead.
  async function safeJson(response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("Non-JSON response from server:", text.slice(0, 200));
      throw new Error(
        response.status === 404
          ? "That feature isn't available on the server yet."
          : "The server sent back something unexpected."
      );
    }
  }

  // ===================== POST AUTHOR NAME → PROFILE =====================
  document.body.addEventListener("click", (event) => {
    const authorLink = event.target.closest(".post-author[data-user-id]");
    if (!authorLink) return;
    event.preventDefault();
    openUserProfile(authorLink.dataset.userId);
  });

  // ===================== BOOKMARK / SAVE BUTTONS =====================
  document.body.addEventListener("click", async (event) => {
    const bookmarkBtn = event.target.closest(".bookmark-btn");
    if (!bookmarkBtn) return;
    event.preventDefault();

    const postCard = bookmarkBtn.closest(".post-card[data-post-id]");
    const postId = postCard ? postCard.dataset.postId : new URLSearchParams(window.location.search).get("id");
    if (!postId) return;

    if (!requireLoginOrRedirect()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || "Could not update saved posts.");

      bookmarkBtn.setAttribute("data-saved", data.saved ? "true" : "false");
      bookmarkBtn.innerHTML = bookmarkBtn.id === "threadBookmarkBtn"
        ? `${bookmarkIcon(data.saved)} Save`
        : bookmarkIcon(data.saved);
      bookmarkBtn.classList.toggle("saved", data.saved);
      showToast(data.saved ? "Saved to your profile." : "Removed from saved.", "success");
    } catch (err) {
      console.error("Save toggle failed:", err);
      showToast(err.message || "Something went wrong.", "error");
    }
  });

  // ===================== SHARE BUTTONS =====================
  document.body.addEventListener("click", (event) => {
    const shareBtn = event.target.closest(".share-btn");
    if (!shareBtn) return;
    event.preventDefault();

    const postCard = shareBtn.closest(".post-card[data-post-id]");
    if (postCard) {
      const title = postCard.querySelector(".post-title")?.textContent || "";
      sharePost(postCard.dataset.postId, title);
      return;
    }

    if (shareBtn.id === "threadShareBtn") {
      const postId = new URLSearchParams(window.location.search).get("id");
      const title = document.getElementById("threadTitle")?.textContent || "";
      if (postId) sharePost(postId, title);
    }
  });

  // ===================== LIKE BUTTONS =====================
  // Uses event delegation on document.body so it works for:
  // - like buttons already in the page
  // - like buttons on posts/comments that get loaded/added after the page loads
  //
  // All three contexts now talk to the real API:
  // - feed post cards (.post-card[data-post-id])
  // - the thread page's main post (#threadLikeBtn, dataset.postId set after load)
  // - individual comments (.comment[data-comment-id])
  document.body.addEventListener("click", async (event) => {
    const btn = event.target.closest(".like-btn");
    if (!btn) return;

    const postCard = btn.closest(".post-card[data-post-id]");
    const isThreadPostLike = btn.id === "threadLikeBtn";
    const commentDiv = btn.closest(".comment[data-comment-id]");

    let endpoint = null;
    if (postCard) {
      endpoint = `${API_BASE_URL}/posts/${postCard.dataset.postId}/like`;
    } else if (isThreadPostLike && btn.dataset.postId) {
      endpoint = `${API_BASE_URL}/posts/${btn.dataset.postId}/like`;
    } else if (commentDiv) {
      endpoint = `${API_BASE_URL}/comments/${commentDiv.dataset.commentId}/like`;
    }

    if (endpoint) {
      if (!requireLoginOrRedirect()) return;
      btn.disabled = true;

      try {
        const response = await fetch(endpoint, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not update the like.");
        }

        btn.setAttribute("data-liked", data.liked ? "true" : "false");
        btn.setAttribute("data-count", data.likesCount);
        btn.classList.toggle("liked", data.liked);
        btn.innerHTML = likeButtonHTML(data.liked, data.likesCount);
      } catch (err) {
        console.error("Like failed:", err);
        showToast(err.message || "Something went wrong liking this.", "error");
      } finally {
        btn.disabled = false;
      }
      return;
    }

    // Fallback: visual-only toggle, for anywhere not yet connected to the API
    const isLiked = btn.getAttribute("data-liked") === "true";
    let count = parseInt(btn.getAttribute("data-count"), 10) || 0;

    count = isLiked ? count - 1 : count + 1;

    btn.setAttribute("data-liked", isLiked ? "false" : "true");
    btn.setAttribute("data-count", count);
    btn.classList.toggle("liked", !isLiked);
    btn.innerHTML = likeButtonHTML(!isLiked, count);
  });

  // ===================== THREAD PAGE: LOAD REAL POST + COMMENTS =====================
  const threadPost = document.getElementById("threadPost");
  const threadLoading = document.getElementById("threadLoading");
  const replyComposer = document.getElementById("replyComposer");
  const commentThreadWrap = document.getElementById("commentThreadWrap");
  const replySubmit = document.getElementById("replySubmit");
  const replyInput = document.getElementById("replyInput");
  const commentList = document.getElementById("commentList");
  const commentCountLabel = document.getElementById("commentCountLabel");

  function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }

  // Builds one comment <div>, optionally nested, from a real comment object.
  // isReply controls whether it gets the indented "nested" styling.
  function renderComment(comment, isReply) {
    const div = document.createElement("div");
    div.className = isReply ? "comment nested" : "comment";
    div.dataset.commentId = comment._id;

    const liked = comment.likedByMe === true;
    const likeCount = comment.likes ? comment.likes.length : 0;
    const authorName = comment.isDeleted ? "" : (comment.author?.name || "Unknown");
    const authorInst = comment.isDeleted ? "" : (comment.author?.institution || "");

    div.innerHTML = `
      <div class="thread-avatar small"></div>
      <div class="comment-body">
        <div class="comment-meta">
          <span class="comment-author"></span>
          <span class="comment-inst"></span>
          <span class="dot">·</span>
          <span class="post-time"></span>
        </div>
        <p class="comment-text"></p>
        <div class="comment-actions">
          <button class="comment-action like-btn" data-liked="${liked}" data-count="${likeCount}">${likeButtonHTML(liked, likeCount)}</button>
          <span class="comment-action reply-trigger">Reply</span>
        </div>
      </div>
    `;

    div.querySelector(".thread-avatar").textContent = comment.isDeleted ? "—" : getInitials(authorName);
    if (!comment.isDeleted) {
      applyRoleRing(div.querySelector(".thread-avatar"), comment.author?.role);
    }
    div.querySelector(".comment-author").textContent = comment.isDeleted ? "[deleted]" : authorName;
    div.querySelector(".comment-inst").textContent = authorInst;
    div.querySelector(".post-time").textContent = formatRelativeTime(comment.createdAt);
    div.querySelector(".comment-text").textContent = comment.text;

    // The reply-trigger lets people reply to THIS comment specifically,
    // by pre-filling which comment the next submission should nest under.
    div.querySelector(".reply-trigger").addEventListener("click", () => {
      if (!requireLoginOrRedirect()) return;
      replyInput.dataset.parentComment = comment._id;
      replyInput.placeholder = `Replying to ${authorName}...`;
      replyInput.focus();
    });

    return div;
  }

  // Comments come back from the API as a flat list. This arranges them
  // into top-level comments with their replies nested visually underneath,
  // matching how the CSS expects .comment.nested to be placed.
  function renderCommentTree(comments) {
    commentList.innerHTML = "";
    const byParent = {};

    comments.forEach((comment) => {
      const key = comment.parentComment || "root";
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(comment);
    });

    (byParent.root || []).forEach((topComment) => {
      const topDiv = renderComment(topComment, false);
      (byParent[topComment._id] || []).forEach((reply) => {
        topDiv.querySelector(".comment-body").appendChild(renderComment(reply, true));
      });
      commentList.appendChild(topDiv);
    });

    if (commentCountLabel) {
      commentCountLabel.textContent = `${comments.length} repl${comments.length === 1 ? "y" : "ies"}`;
    }
    const threadReplyCount = document.getElementById("threadReplyCount");
    if (threadReplyCount) {
      threadReplyCount.textContent = `💬 ${comments.length} replies`;
    }
  }

  async function loadComments(contextType, contextId) {
    const endpoint = contextType === "caseStudy"
      ? `${API_BASE_URL}/comments/case-study/${contextId}`
      : `${API_BASE_URL}/comments/post/${contextId}`;

    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const comments = await response.json();
    if (!response.ok) {
      throw new Error(comments.message || "Could not load comments.");
    }
    renderCommentTree(comments);
  }

  async function loadThread() {
    if (!threadPost) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    if (!postId) {
      if (threadLoading) threadLoading.textContent = "No post specified.";
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const post = await response.json();

      if (!response.ok) {
        throw new Error(post.message || "Could not load this post.");
      }

      document.getElementById("threadCaseId").textContent = post.caseId;
      document.getElementById("threadStatus").textContent = post.status;
      document.getElementById("threadAvatar").textContent = getInitials(post.author?.name);
      applyRoleRing(document.getElementById("threadAvatar"), post.author?.role);
      document.getElementById("threadAuthor").textContent = post.author?.name || "Unknown";
      if (post.author?._id) {
        document.getElementById("threadAuthor").href = `index.html?viewUser=${post.author._id}`;
      }
      document.getElementById("threadAuthorInst").textContent = post.author?.institution || "";
      document.getElementById("threadTime").textContent = formatRelativeTime(post.createdAt);
      document.getElementById("threadTitle").textContent = post.title;
      document.getElementById("threadTag").textContent = post.tag;

      const bodyEl = document.getElementById("threadBody");
      bodyEl.innerHTML = "";
      if (post.imageUrl) {
        const img = document.createElement("img");
        img.className = "post-image";
        img.src = post.imageUrl;
        img.alt = "";
        bodyEl.appendChild(img);
      }
      const p = document.createElement("p");
      p.textContent = post.body;
      bodyEl.appendChild(p);

      const liked = post.likedByMe === true;
      const likeCount = post.likes ? post.likes.length : 0;
      const likeBtn = document.getElementById("threadLikeBtn");
      likeBtn.dataset.postId = post._id;
      likeBtn.setAttribute("data-liked", liked ? "true" : "false");
      likeBtn.setAttribute("data-count", likeCount);
      likeBtn.innerHTML = likeButtonHTML(liked, likeCount);

      const bookmarkBtn = document.getElementById("threadBookmarkBtn");
      if (bookmarkBtn) {
        const saved = post.savedByMe === true;
        bookmarkBtn.setAttribute("data-saved", saved ? "true" : "false");
        bookmarkBtn.innerHTML = `${bookmarkIcon(saved)} Save`;
      }

      await loadComments("post", post._id);

      if (threadLoading) threadLoading.classList.add("hidden");
      threadPost.classList.remove("hidden");
      if (replyComposer) replyComposer.classList.remove("hidden");
      if (commentThreadWrap) commentThreadWrap.classList.remove("hidden");

      // Fill the reply composer's avatar with the real logged-in user's initials
      const currentUser = getStoredUser();
      const replyAvatar = document.getElementById("replyComposerAvatar");
      if (currentUser && replyAvatar) {
        replyAvatar.textContent = getInitials(currentUser.name);
        applyRoleRing(replyAvatar, currentUser.role);
      }

      if (replyInput) {
        replyInput.dataset.contextType = "post";
        replyInput.dataset.contextId = post._id;
      }
    } catch (err) {
      console.error("Failed to load thread:", err);
      if (threadLoading) {
        threadLoading.textContent = "Could not load this post. Is the backend running?";
      }
    }
  }

  if (threadPost) {
    loadThread();
  }

  // ===================== CASE STUDY DETAIL PAGE =====================
  // Mirrors loadThread() above, but for a case study instead of a post.
  // Shares the same comment-thread elements/IDs (commentList, replyInput,
  // replyComposer, etc.) via the generalized loadComments()/reply-submit
  // logic, so nesting, likes, and soft-delete all just work here too.
  const caseStudyDetail = document.getElementById("caseStudyDetail");
  const caseStudyDetailLoading = document.getElementById("caseStudyDetailLoading");

  async function loadCaseStudyThread() {
    if (!caseStudyDetail) return;

    const urlParams = new URLSearchParams(window.location.search);
    const caseStudyId = urlParams.get("id");

    if (!caseStudyId) {
      if (caseStudyDetailLoading) caseStudyDetailLoading.textContent = "No case study specified.";
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/case-studies/${caseStudyId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const caseStudy = await safeJson(response);

      if (!response.ok) {
        throw new Error(caseStudy.message || "Could not load this case study.");
      }

      document.getElementById("csCaseId").textContent = caseStudy.caseId;

      const categoryTag = document.getElementById("csCategory");
      categoryTag.textContent = caseStudy.category;
      categoryTag.className = `tag ${tagToneForCategory(caseStudy.category)}`;

      document.getElementById("csTitle").textContent = caseStudy.title;
      document.getElementById("csDescription").textContent = caseStudy.description;

      const locationYear = [caseStudy.jurisdiction, caseStudy.year].filter(Boolean).join(" · ");
      document.getElementById("csMeta").textContent = locationYear || "—";

      await loadComments("caseStudy", caseStudy._id);

      if (caseStudyDetailLoading) caseStudyDetailLoading.classList.add("hidden");
      caseStudyDetail.classList.remove("hidden");
      if (replyComposer) replyComposer.classList.remove("hidden");
      if (commentThreadWrap) commentThreadWrap.classList.remove("hidden");

      const currentUser = getStoredUser();
      const replyAvatar = document.getElementById("replyComposerAvatar");
      if (currentUser && replyAvatar) {
        replyAvatar.textContent = getInitials(currentUser.name);
        applyRoleRing(replyAvatar, currentUser.role);
      }

      if (replyInput) {
        replyInput.dataset.contextType = "caseStudy";
        replyInput.dataset.contextId = caseStudy._id;
      }
    } catch (err) {
      console.error("Failed to load case study:", err);
      if (caseStudyDetailLoading) {
        caseStudyDetailLoading.classList.remove("hidden");
        caseStudyDetailLoading.textContent = "Could not load this case study. Is the backend running?";
      }
    }
  }

  if (caseStudyDetail) {
    loadCaseStudyThread();
  }

  if (replySubmit && replyInput && commentList) {
    replySubmit.addEventListener("click", async () => {
      if (!requireLoginOrRedirect()) return;

      const text = replyInput.value.trim();
      if (!text) {
        replyInput.focus();
        return;
      }

      const contextType = replyInput.dataset.contextType || "post";
      const contextId = replyInput.dataset.contextId;
      const parentComment = replyInput.dataset.parentComment || null;

      replySubmit.disabled = true;
      replySubmit.textContent = "Posting...";

      try {
        const response = await fetch(`${API_BASE_URL}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ [contextType]: contextId, text, parentComment }),
        });

        const newComment = await response.json();

        if (!response.ok) {
          throw new Error(newComment.message || "Could not post this reply.");
        }

        // Simplest correct way to reflect new nesting: reload the whole thread
        await loadComments(contextType, contextId);

        replyInput.value = "";
        delete replyInput.dataset.parentComment;
        replyInput.placeholder = "Add to the discussion...";
      } catch (err) {
        console.error("Post comment failed:", err);
        showToast(err.message || "Something went wrong posting this reply.", "error");
      } finally {
        replySubmit.disabled = false;
        replySubmit.textContent = "Post reply";
      }
    });
  }

  // ===================== COMMUNITIES: LOAD REAL DATA =====================
  const toggleCreateCommunity = document.getElementById("toggleCreateCommunity");
  const createCommunityForm = document.getElementById("createCommunityForm");
  const cancelCreateCommunity = document.getElementById("cancelCreateCommunity");
  const submitCreateCommunity = document.getElementById("submitCreateCommunity");
  const newCommunityName = document.getElementById("newCommunityName");
  const newCommunityDesc = document.getElementById("newCommunityDesc");
  const communityGrid = document.getElementById("communityGrid");
  const communitiesLoading = document.getElementById("communitiesLoading");

  function closeCreateCommunityForm() {
    if (!createCommunityForm) return;
    createCommunityForm.classList.add("hidden");
    newCommunityName.value = "";
    newCommunityDesc.value = "";
  }

  if (toggleCreateCommunity && createCommunityForm) {
    toggleCreateCommunity.addEventListener("click", () => {
      if (!requireLoginOrRedirect()) return;
      createCommunityForm.classList.toggle("hidden");
      if (!createCommunityForm.classList.contains("hidden")) {
        newCommunityName.focus();
      }
    });
  }

  if (cancelCreateCommunity) {
    cancelCreateCommunity.addEventListener("click", closeCreateCommunityForm);
  }

  // Builds one community card from a real community object returned by the API
  function renderCommunityCard(community) {
    const card = document.createElement("div");
    card.className = "community-card";
    card.innerHTML = `
      <div class="community-id"></div>
      <h3></h3>
      <p></p>
      <div class="divider"></div>
      <div class="community-footer">
        <span class="meta-text"></span>
        <a class="link-text">View folder →</a>
      </div>
    `;
    card.querySelector(".community-id").textContent = community.communityId;
    card.querySelector("h3").textContent = community.name;
    card.querySelector("p").textContent = community.description || "No description provided yet.";
    card.querySelector(".meta-text").textContent = `${community.members.length} member${community.members.length === 1 ? "" : "s"}`;
    card.querySelector(".link-text").href = `community-detail.html?id=${community._id}`;
    return card;
  }

  async function loadCommunities() {
    if (!communityGrid) return;

    try {
      const response = await fetch(`${API_BASE_URL}/communities`);
      const communities = await response.json();

      if (!response.ok) {
        throw new Error(communities.message || "Failed to load communities.");
      }

      communityGrid.innerHTML = "";
      communities.forEach((community) => {
        communityGrid.appendChild(renderCommunityCard(community));
      });

      if (communitiesLoading) communitiesLoading.classList.add("hidden");
    } catch (err) {
      console.error("Failed to load communities:", err);
      if (communitiesLoading) {
        communitiesLoading.textContent = "Could not load communities. Is the backend running?";
      }
    }
  }

  if (communityGrid) {
    loadCommunities();
  }

  if (submitCreateCommunity && communityGrid) {
    submitCreateCommunity.addEventListener("click", async () => {
      if (!requireLoginOrRedirect()) return;

      const name = newCommunityName.value.trim();
      const description = newCommunityDesc.value.trim();

      if (!name) {
        newCommunityName.focus();
        return;
      }

      submitCreateCommunity.disabled = true;
      submitCreateCommunity.textContent = "Creating...";

      try {
        const response = await fetch(`${API_BASE_URL}/communities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ name, description }),
        });

        const newCommunity = await response.json();

        if (!response.ok) {
          throw new Error(newCommunity.message || "Could not create the community.");
        }

        const newCard = renderCommunityCard(newCommunity);
        newCard.classList.add("just-added");
        communityGrid.insertBefore(newCard, communityGrid.firstChild);

        closeCreateCommunityForm();
        newCard.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => newCard.classList.remove("just-added"), 1500);
      } catch (err) {
        console.error("Create community failed:", err);
        showToast(err.message || "Something went wrong creating this community.", "error");
      } finally {
        submitCreateCommunity.disabled = false;
        submitCreateCommunity.textContent = "Create folder";
      }
    });
  }

  // ===================== COMMUNITY DETAIL PAGE =====================
  // Only runs on community-detail.html, since these elements only exist there.
  const folderHeader = document.getElementById("folderHeader");
  const communityLoading = document.getElementById("communityLoading");
  const communityLayoutBody = document.getElementById("communityLayoutBody");
  const joinBtn = document.getElementById("joinBtn");

  if (folderHeader) {
    // Reads ?id=... from the URL, e.g. community-detail.html?id=abc123
    const urlParams = new URLSearchParams(window.location.search);
    const communityId = urlParams.get("id");

    async function loadCommunityDetail() {
      if (!communityId) {
        if (communityLoading) {
          communityLoading.textContent = "No community specified.";
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/communities/${communityId}`);
        const community = await response.json();

        if (!response.ok) {
          throw new Error(community.message || "Could not load this community.");
        }

        document.getElementById("folderTab").textContent = community.communityId;
        document.getElementById("folderTitle").textContent = community.name;
        document.getElementById("folderDesc").textContent = community.description || "No description provided yet.";
        document.getElementById("folderMemberCount").textContent = community.members.length;
        document.getElementById("folderEstablished").textContent = new Date(community.createdAt).getFullYear();

        const currentUserId = getStoredUser()?.id;
        const isMember = currentUserId && community.members.includes(currentUserId);

        if (joinBtn) {
          joinBtn.dataset.communityId = community._id;
          joinBtn.setAttribute("data-joined", isMember ? "true" : "false");
          joinBtn.textContent = isMember ? "✓ Joined" : "+ Join Community";
          joinBtn.classList.toggle("joined", isMember);
        }

        // Real moderators list (community.moderators comes populated
        // with name/institution from the backend's .populate() call)
        const moderatorsList = document.getElementById("moderatorsList");
        if (moderatorsList) {
          moderatorsList.innerHTML = "";
          if (!community.moderators || community.moderators.length === 0) {
            moderatorsList.innerHTML = '<p class="meta-text">No moderators yet.</p>';
          } else {
            community.moderators.forEach((mod) => {
              const row = document.createElement("div");
              row.className = "mod-row";
              row.innerHTML = `
                <div class="thread-avatar small"></div>
                <span class="comment-author"></span>
              `;
              row.querySelector(".thread-avatar").textContent = getInitials(mod.name);
              applyRoleRing(row.querySelector(".thread-avatar"), mod.role);
              row.querySelector(".comment-author").textContent = mod.name;
              moderatorsList.appendChild(row);
            });
          }
        }

        if (communityLoading) communityLoading.classList.add("hidden");
        folderHeader.classList.remove("hidden");
        if (communityLayoutBody) communityLayoutBody.classList.remove("hidden");

        // Load this community's real posts now that we have its ID
        loadCommunityPosts(community._id);
      } catch (err) {
        console.error("Failed to load community:", err);
        if (communityLoading) {
          communityLoading.textContent = "Could not load this community. Is the backend running?";
        }
      }
    }

    // Loads posts scoped to this specific community, reusing the same
    // renderPostCard() function the Feed uses, so styling stays identical.
    const communityPostsList = document.getElementById("communityPostsList");
    const communityPostsLoading = document.getElementById("communityPostsLoading");

    async function loadCommunityPosts(commId) {
      if (!communityPostsList) return;

      try {
        const response = await fetch(`${API_BASE_URL}/posts?community=${commId}&limit=50`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await safeJson(response);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load posts.");
        }

        const posts = data.items;

        communityPostsList.innerHTML = "";

        if (posts.length === 0) {
          communityPostsList.innerHTML = '<p class="empty-state">No posts in this community yet. Be the first to start a discussion.</p>';
        } else {
          posts.forEach((post) => {
            communityPostsList.appendChild(renderPostCard(post));
          });
        }

        if (communityPostsLoading) communityPostsLoading.classList.add("hidden");
      } catch (err) {
        console.error("Failed to load community posts:", err);
        if (communityPostsLoading) {
          communityPostsLoading.textContent = "Could not load posts for this community.";
        }
      }
    }

    // Mini composer: posts directly into this community
    const communityPostTitle = document.getElementById("communityPostTitle");
    const communityPostBody = document.getElementById("communityPostBody");
    const communityPostTag = document.getElementById("communityPostTag");
    const communityPostSubmit = document.getElementById("communityPostSubmit");

    if (communityPostSubmit) {
      communityPostSubmit.addEventListener("click", async () => {
        if (!requireLoginOrRedirect()) return;

        const title = communityPostTitle.value.trim();
        const body = communityPostBody.value.trim();
        const tag = communityPostTag.value;

        if (!title || !body) {
          communityPostTitle.focus();
          return;
        }

        communityPostSubmit.disabled = true;
        communityPostSubmit.textContent = "Filing...";

        try {
          const response = await fetch(`${API_BASE_URL}/posts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              title,
              body,
              tag,
              community: communityId,
            }),
          });

          const newPost = await response.json();

          if (!response.ok) {
            throw new Error(newPost.message || "Could not create the post.");
          }

          if (communityPostsList) {
            const emptyMsg = communityPostsList.querySelector(".empty-state");
            if (emptyMsg) emptyMsg.remove();

            const newCard = renderPostCard(newPost);
            newCard.classList.add("just-added");
            communityPostsList.insertBefore(newCard, communityPostsList.firstChild);
            setTimeout(() => newCard.classList.remove("just-added"), 1500);
          }

          communityPostTitle.value = "";
          communityPostBody.value = "";
        } catch (err) {
          console.error("Create community post failed:", err);
          showToast(err.message || "Something went wrong posting this.", "error");
        } finally {
          communityPostSubmit.disabled = false;
          communityPostSubmit.textContent = "File post";
        }
      });
    }

    loadCommunityDetail();

    if (joinBtn) {
      joinBtn.addEventListener("click", async () => {
        if (!requireLoginOrRedirect()) return;

        const id = joinBtn.dataset.communityId;
        joinBtn.disabled = true;

        try {
          const response = await fetch(`${API_BASE_URL}/communities/${id}/join`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${getToken()}` },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Could not update membership.");
          }

          joinBtn.setAttribute("data-joined", data.joined ? "true" : "false");
          joinBtn.textContent = data.joined ? "✓ Joined" : "+ Join Community";
          joinBtn.classList.toggle("joined", data.joined);
          document.getElementById("folderMemberCount").textContent = data.memberCount;
        } catch (err) {
          console.error("Join toggle failed:", err);
          showToast(err.message || "Something went wrong updating your membership.", "error");
        } finally {
          joinBtn.disabled = false;
        }
      });
    }
  }

  // ===================== RESEARCH HUB: LOAD REAL DATA =====================
  const toggleUploadResearch = document.getElementById("toggleUploadResearch");
  const uploadResearchForm = document.getElementById("uploadResearchForm");
  const cancelUploadResearch = document.getElementById("cancelUploadResearch");
  const submitUploadResearch = document.getElementById("submitUploadResearch");
  const newResearchTitle = document.getElementById("newResearchTitle");
  const newResearchType = document.getElementById("newResearchType");
  const newResearchUrl = document.getElementById("newResearchUrl");
  const researchList = document.getElementById("researchList");
  const researchLoading = document.getElementById("researchLoading");

  function closeUploadResearchForm() {
    if (!uploadResearchForm) return;
    uploadResearchForm.classList.add("hidden");
    newResearchTitle.value = "";
    newResearchUrl.value = "";
    newResearchType.value = "Paper";
  }

  if (toggleUploadResearch && uploadResearchForm) {
    toggleUploadResearch.addEventListener("click", () => {
      if (!requireLoginOrRedirect()) return;
      uploadResearchForm.classList.toggle("hidden");
      if (!uploadResearchForm.classList.contains("hidden")) {
        newResearchTitle.focus();
      }
    });
  }

  if (cancelUploadResearch) {
    cancelUploadResearch.addEventListener("click", closeUploadResearchForm);
  }

  // Builds one research row from a real research item object returned by the API
  function renderResearchRow(item) {
    const row = document.createElement("div");
    row.className = "research-row";
    row.innerHTML = `
      <div class="research-type"></div>
      <div class="research-main">
        <div class="research-top">
          <span class="case-stamp"></span>
          <span class="tag tag-outline"></span>
        </div>
        <h3 class="research-title"></h3>
        <div class="research-author"></div>
      </div>
      <div class="research-stats">
        <div class="meta-text"></div>
        <div class="link-text">Open →</div>
      </div>
    `;
    row.querySelector(".research-type").textContent = item.type;
    row.querySelector(".case-stamp").textContent = item.researchId;
    row.querySelector(".research-top .tag").textContent = item.status;
    row.querySelector(".research-title").textContent = item.title;
    row.querySelector(".research-author").textContent =
      [item.author?.name, item.author?.institution].filter(Boolean).join(", ") || "Unknown";
    row.querySelector(".research-stats .meta-text").textContent = `${item.downloads} pull${item.downloads === 1 ? "" : "s"}`;

    // "Open" increments the download counter and opens the file link if one exists
    row.querySelector(".link-text").addEventListener("click", async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/research/${item._id}/download`, { method: "PUT" });
        const data = await response.json();
        if (response.ok) {
          row.querySelector(".research-stats .meta-text").textContent = `${data.downloads} pull${data.downloads === 1 ? "" : "s"}`;
        }
      } catch (err) {
        console.error("Download tracking failed:", err);
      }
      if (item.fileUrl) {
        window.open(item.fileUrl, "_blank");
      }
    });

    return row;
  }

  let researchPage = 1;
  let researchHasMore = false;
  let researchSearchTerm = "";
  const researchLoadMoreBtn = document.getElementById("researchLoadMore");

  async function loadResearch(page = 1, append = false) {
    if (!researchList) return;

    try {
      const searchParam = researchSearchTerm ? `&search=${encodeURIComponent(researchSearchTerm)}` : "";
      const response = await fetch(`${API_BASE_URL}/research?page=${page}&limit=15${searchParam}`);
      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load the archive.");
      }

      if (!append) researchList.innerHTML = "";
      data.items.forEach((item) => {
        researchList.appendChild(renderResearchRow(item));
      });

      researchPage = data.page;
      researchHasMore = data.hasMore;

      if (researchLoadMoreBtn) {
        researchLoadMoreBtn.classList.toggle("hidden", !researchHasMore);
        researchLoadMoreBtn.disabled = false;
        researchLoadMoreBtn.textContent = "Load more";
      }

      if (researchLoading) researchLoading.classList.add("hidden");
    } catch (err) {
      console.error("Failed to load research items:", err);
      if (researchLoading) {
        researchLoading.classList.remove("hidden");
        researchLoading.textContent = "Could not load the archive. Is the backend running?";
      }
    }
  }

  if (researchLoadMoreBtn) {
    researchLoadMoreBtn.addEventListener("click", () => {
      researchLoadMoreBtn.disabled = true;
      researchLoadMoreBtn.textContent = "Loading...";
      loadResearch(researchPage + 1, true);
    });
  }

  // ===================== RESEARCH HUB SEARCH =====================
  const researchSearch = document.getElementById("researchSearch");
  let researchSearchDebounce = null;

  if (researchSearch) {
    researchSearch.addEventListener("input", () => {
      clearTimeout(researchSearchDebounce);
      researchSearchDebounce = setTimeout(() => {
        researchSearchTerm = researchSearch.value.trim();
        researchPage = 1;
        loadResearch(1, false);
      }, 350);
    });
  }

  if (researchList) {
    loadResearch();
  }

  if (submitUploadResearch && researchList) {
    submitUploadResearch.addEventListener("click", async () => {
      if (!requireLoginOrRedirect()) return;

      const title = newResearchTitle.value.trim();
      const type = newResearchType.value;
      const fileUrl = newResearchUrl.value.trim();

      if (!title) {
        newResearchTitle.focus();
        return;
      }

      submitUploadResearch.disabled = true;
      submitUploadResearch.textContent = "Adding...";

      try {
        const response = await fetch(`${API_BASE_URL}/research`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ title, type, fileUrl }),
        });

        const newItem = await response.json();

        if (!response.ok) {
          throw new Error(newItem.message || "Could not add this item.");
        }

        const newRow = renderResearchRow(newItem);
        newRow.classList.add("just-added");
        researchList.insertBefore(newRow, researchList.firstChild);

        closeUploadResearchForm();
        newRow.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => newRow.classList.remove("just-added"), 1500);
      } catch (err) {
        console.error("Upload research failed:", err);
        showToast(err.message || "Something went wrong adding this item.", "error");
      } finally {
        submitUploadResearch.disabled = false;
        submitUploadResearch.textContent = "Add to archive";
      }
    });
  }

  // ===================== CASE STUDY LIBRARY: LOAD REAL DATA =====================
  const toggleAddCaseStudy = document.getElementById("toggleAddCaseStudy");
  const addCaseStudyForm = document.getElementById("addCaseStudyForm");
  const cancelAddCaseStudy = document.getElementById("cancelAddCaseStudy");
  const submitAddCaseStudy = document.getElementById("submitAddCaseStudy");
  const newCaseTitle = document.getElementById("newCaseTitle");
  const newCaseDesc = document.getElementById("newCaseDesc");
  const newCaseCategory = document.getElementById("newCaseCategory");
  const newCaseJurisdiction = document.getElementById("newCaseJurisdiction");
  const newCaseYear = document.getElementById("newCaseYear");
  const ledgerList = document.getElementById("ledgerList");
  const caseStudyLoading = document.getElementById("caseStudyLoading");

  // Matches the same tag-tone convention used elsewhere: Landmark Judgment
  // reads as more "settled/significant" (red), Investigation as active
  // process (slate), Prevention Strategy as informational (outline).
  function tagToneForCategory(category) {
    if (category === "Landmark Judgment") return "tag-red";
    if (category === "Investigation") return "tag-slate";
    return "tag-outline";
  }

  function closeAddCaseStudyForm() {
    if (!addCaseStudyForm) return;
    addCaseStudyForm.classList.add("hidden");
    newCaseTitle.value = "";
    newCaseDesc.value = "";
    newCaseJurisdiction.value = "";
    newCaseYear.value = "";
    newCaseCategory.value = "Investigation";
  }

  if (toggleAddCaseStudy && addCaseStudyForm) {
    toggleAddCaseStudy.addEventListener("click", () => {
      if (!requireLoginOrRedirect()) return;
      addCaseStudyForm.classList.toggle("hidden");
      if (!addCaseStudyForm.classList.contains("hidden")) {
        newCaseTitle.focus();
      }
    });
  }

  if (cancelAddCaseStudy) {
    cancelAddCaseStudy.addEventListener("click", closeAddCaseStudyForm);
  }

  // Builds one ledger entry from a real case study object returned by the API
  function renderLedgerEntry(caseStudy) {
    const entry = document.createElement("div");
    entry.className = "ledger-entry";
    entry.innerHTML = `
      <div class="ledger-id"></div>
      <div class="ledger-main">
        <div class="ledger-top">
          <h3 class="ledger-title"></h3>
          <span class="tag"></span>
        </div>
        <p class="ledger-desc"></p>
        <div class="ledger-meta">
          <span class="meta-text location-year"></span>
          <span class="dot">·</span>
          <span class="meta-text discussion-count"></span>
        </div>
      </div>
      <a class="link-text ledger-open" href="case-study.html?id=${caseStudy._id}">Open entry →</a>
    `;

    entry.querySelector(".ledger-id").textContent = caseStudy.caseId;
    entry.querySelector(".ledger-title").textContent = caseStudy.title;

    const tag = entry.querySelector(".ledger-top .tag");
    tag.textContent = caseStudy.category;
    tag.classList.add(tagToneForCategory(caseStudy.category));

    entry.querySelector(".ledger-desc").textContent = caseStudy.description;
    const locationYear = [caseStudy.jurisdiction, caseStudy.year].filter(Boolean).join(" · ");
    entry.querySelector(".location-year").textContent = locationYear || "—";
    entry.querySelector(".discussion-count").textContent =
      `${caseStudy.discussionCount} discussion${caseStudy.discussionCount === 1 ? "" : "s"}`;

    return entry;
  }


  let libraryPage = 1;
  let libraryHasMore = false;
  let librarySearchTerm = "";
  const libraryLoadMoreBtn = document.getElementById("libraryLoadMore");

  async function loadCaseStudies(page = 1, append = false) {
    if (!ledgerList) return;

    try {
      const searchParam = librarySearchTerm ? `&search=${encodeURIComponent(librarySearchTerm)}` : "";
      const response = await fetch(`${API_BASE_URL}/case-studies?page=${page}&limit=15${searchParam}`);
      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load the ledger.");
      }

      if (!append) ledgerList.innerHTML = "";
      data.items.forEach((caseStudy) => {
        ledgerList.appendChild(renderLedgerEntry(caseStudy));
      });

      libraryPage = data.page;
      libraryHasMore = data.hasMore;

      if (libraryLoadMoreBtn) {
        libraryLoadMoreBtn.classList.toggle("hidden", !libraryHasMore);
        libraryLoadMoreBtn.disabled = false;
        libraryLoadMoreBtn.textContent = "Load more";
      }

      if (caseStudyLoading) caseStudyLoading.classList.add("hidden");
    } catch (err) {
      console.error("Failed to load case studies:", err);
      if (caseStudyLoading) {
        caseStudyLoading.classList.remove("hidden");
        caseStudyLoading.textContent = "Could not load the ledger. Is the backend running?";
      }
    }
  }

  if (libraryLoadMoreBtn) {
    libraryLoadMoreBtn.addEventListener("click", () => {
      libraryLoadMoreBtn.disabled = true;
      libraryLoadMoreBtn.textContent = "Loading...";
      loadCaseStudies(libraryPage + 1, true);
    });
  }

  if (ledgerList) {
    loadCaseStudies();
  }

  // ===================== CASE STUDY LIBRARY SEARCH =====================
  const librarySearch = document.getElementById("librarySearch");
  let librarySearchDebounce = null;

  if (librarySearch) {
    librarySearch.addEventListener("input", () => {
      clearTimeout(librarySearchDebounce);
      librarySearchDebounce = setTimeout(() => {
        librarySearchTerm = librarySearch.value.trim();
        libraryPage = 1;
        loadCaseStudies(1, false);
      }, 350);
    });
  }

  if (submitAddCaseStudy && ledgerList) {
    submitAddCaseStudy.addEventListener("click", async () => {
      if (!requireLoginOrRedirect()) return;

      const title = newCaseTitle.value.trim();
      const description = newCaseDesc.value.trim();
      const category = newCaseCategory.value;
      const jurisdiction = newCaseJurisdiction.value.trim();
      const year = newCaseYear.value.trim();

      if (!title || !description) {
        newCaseTitle.focus();
        return;
      }

      submitAddCaseStudy.disabled = true;
      submitAddCaseStudy.textContent = "Adding...";

      try {
        const response = await fetch(`${API_BASE_URL}/case-studies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ title, description, category, jurisdiction, year }),
        });

        const newCaseStudy = await response.json();

        if (!response.ok) {
          throw new Error(newCaseStudy.message || "Could not add this entry.");
        }

        const newEntry = renderLedgerEntry(newCaseStudy);
        newEntry.classList.add("just-added");
        ledgerList.insertBefore(newEntry, ledgerList.firstChild);

        closeAddCaseStudyForm();
        newEntry.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => newEntry.classList.remove("just-added"), 1500);
      } catch (err) {
        console.error("Add case study failed:", err);
        showToast(err.message || "Something went wrong adding this entry.", "error");
      } finally {
        submitAddCaseStudy.disabled = false;
        submitAddCaseStudy.textContent = "Add entry";
      }
    });
  }

  // ===================== NOTIFICATIONS: LOAD REAL DATA =====================
  const notifList = document.getElementById("notifList");
  const notifLoading = document.getElementById("notifLoading");
  const markAllReadBtn = document.getElementById("markAllReadBtn");

  // Matches notification "type" (from the schema) to the icon set
  // already designed for this page.
  const NOTIF_ICONS = {
    reply: { icon: "💬", className: "notif-icon-reply" },
    like: { icon: "♡", className: "notif-icon-like" },
    join: { icon: "👥", className: "notif-icon-join" },
    badge: { icon: "🏷", className: "notif-icon-badge" },
    mention: { icon: "💬", className: "notif-icon-reply" },
    alert: { icon: "⚠", className: "notif-icon-alert" },
  };

  function renderNotification(notification) {
    const entry = document.createElement("div");
    entry.className = notification.read ? "notif-entry" : "notif-entry unread";
    entry.dataset.notificationId = notification._id;

    const iconInfo = NOTIF_ICONS[notification.type] || { icon: "•", className: "" };

    entry.innerHTML = `
      <div class="notif-icon ${iconInfo.className}">${iconInfo.icon}</div>
      <div class="notif-body">
        <p class="notif-text"></p>
        <span class="notif-time"></span>
      </div>
      ${notification.read ? "" : '<span class="unread-dot static"></span>'}
    `;

    entry.querySelector(".notif-text").textContent = notification.message;
    entry.querySelector(".notif-time").textContent = formatRelativeTime(notification.createdAt);

    // Clicking any notification (read or unread) marks it read if needed,
    // then takes you to whatever it's actually about.
    entry.style.cursor = "pointer";
    entry.addEventListener("click", async () => {
      if (!notification.read) {
        try {
          const response = await fetch(`${API_BASE_URL}/notifications/${notification._id}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (response.ok) {
            entry.classList.remove("unread");
            const dot = entry.querySelector(".unread-dot");
            if (dot) dot.remove();
            refreshNotifBadge();
          }
        } catch (err) {
          console.error("Mark as read failed:", err);
        }
      }

      // "X joined your community" → their profile (with a Message button),
      // per how this notification type is meant to be used here.
      if (notification.type === "join" && notification.triggeredBy?._id) {
        openUserProfile(notification.triggeredBy._id);
        return;
      }

      // A comment on a case study you added → that case study's discussion
      if (notification.type === "reply" && notification.relatedCaseStudy?._id) {
        window.location.href = `case-study.html?id=${notification.relatedCaseStudy._id}`;
        return;
      }

      // Reply/mention/like notifications → the post they're about
      if (["reply", "mention", "like"].includes(notification.type) && notification.relatedPost?._id) {
        window.location.href = `post.html?id=${notification.relatedPost._id}`;
        return;
      }

      // "badge" and "alert" notifications don't have a specific
      // destination in the current schema — marking read is all they do.
    });

    return entry;
  }

  async function loadNotifications() {
    if (!notifList) return;
    if (!requireLoginOrRedirect()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const notifications = await response.json();

      if (!response.ok) {
        throw new Error(notifications.message || "Failed to load notifications.");
      }

      notifList.innerHTML = "";

      if (notifications.length === 0) {
        notifList.innerHTML = '<p class="empty-state">No notifications yet.</p>';
      } else {
        notifications.forEach((notification) => {
          notifList.appendChild(renderNotification(notification));
        });
      }

      if (notifLoading) notifLoading.classList.add("hidden");
    } catch (err) {
      console.error("Failed to load notifications:", err);
      if (notifLoading) {
        notifLoading.textContent = "Could not load notifications. Is the backend running?";
      }
    }
  }

  if (notifList) {
    loadNotifications();
  }

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", async () => {
      if (!requireLoginOrRedirect()) return;

      try {
        const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Could not mark notifications as read.");
        }

        document.querySelectorAll(".notif-entry.unread").forEach((entry) => {
          entry.classList.remove("unread");
          const dot = entry.querySelector(".unread-dot");
          if (dot) dot.remove();
        });

        refreshNotifBadge();
      } catch (err) {
        console.error("Mark all read failed:", err);
        showToast(err.message || "Something went wrong.", "error");
      }
    });
  }

  // ===================== DIRECT MESSAGES =====================
  const conversationList = document.getElementById("conversationList");
  const conversationsLoading = document.getElementById("conversationsLoading");
  const conversationSearch = document.getElementById("conversationSearch");
  const threadEmpty = document.getElementById("threadEmpty");
  const threadActive = document.getElementById("threadActive");
  const threadContactAvatar = document.getElementById("threadContactAvatar");
  const threadContactName = document.getElementById("threadContactName");
  const threadContactRole = document.getElementById("threadContactRole");
  const messageBubbles = document.getElementById("messageBubbles");
  const messageInput = document.getElementById("messageInput");
  const messageSendBtn = document.getElementById("messageSendBtn");

  let activeConversationUserId = null;
  let activeConversationName = "";
  let conversationCounter = 0;

  // Generates a correspondence reference ID for each conversation
  // e.g. CORR-0042 — appears in the thread header and conversation list
  function generateCorrRef() {
    conversationCounter += 1;
    return `CORR-${String(conversationCounter).padStart(4, "0")}`;
  }

  // Formats a timestamp as "Today · 14:47" or "Jun 23 · 14:47"
  function formatMessageTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const datePart = isToday
      ? "Today"
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${datePart} · ${timeStr}`;
  }

  function scrollToLatest() {
    if (messageBubbles) {
      messageBubbles.scrollTop = messageBubbles.scrollHeight;
    }
  }

  // Builds one message bubble from a real Message object
  function renderBubble(message, currentUserId) {
    const isMine =
      message.sender._id === currentUserId ||
      message.sender._id?.toString() === currentUserId;

    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${isMine ? "mine" : "theirs"}`;
    bubble.dataset.messageId = message._id;
    bubble.dataset.createdAt = message.createdAt;

    const p = document.createElement("p");
    p.textContent = message.text;
    bubble.appendChild(p);

    // Meta row: timestamp + "· edited" if applicable
    const metaRow = document.createElement("div");
    metaRow.className = "bubble-meta";

    const timeSpan = document.createElement("span");
    timeSpan.className = "message-time";
    timeSpan.textContent = formatMessageTime(message.createdAt);
    metaRow.appendChild(timeSpan);

    if (message.edited) {
      const editedLabel = document.createElement("span");
      editedLabel.className = "bubble-edited-label";
      editedLabel.textContent = "· edited";
      metaRow.appendChild(editedLabel);
    }

    if (isMine) {
      const receipt = document.createElement("span");
      receipt.className = "bubble-receipt";
      receipt.innerHTML = checkIcon(false, false);
      metaRow.appendChild(receipt);
    }

    bubble.appendChild(metaRow);

    // Action buttons (edit + delete) — only on own messages
    if (isMine) {
      const actions = document.createElement("div");
      actions.className = "bubble-actions";

      // Edit button — only show within 5-minute window
      const ageMs = Date.now() - new Date(message.createdAt).getTime();
      if (ageMs < 5 * 60 * 1000) {
        const editBtn = document.createElement("button");
        editBtn.className = "bubble-action-btn";
        editBtn.title = "Edit message";
        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", () => {
          enterEditMode(bubble, message, p, metaRow, actions);
        });

        actions.appendChild(editBtn);

        // Auto-hide the edit button after the 5-minute window closes
        const remaining = 5 * 60 * 1000 - ageMs;
        setTimeout(() => editBtn.remove(), remaining);
      }

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "bubble-action-btn delete-btn";
      deleteBtn.title = "Delete message";
      deleteBtn.textContent = "×";

      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Delete this message for everyone?")) return;
        try {
          const response = await fetch(`${API_BASE_URL}/messages/${message._id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (response.ok) {
            bubble.remove();
          } else {
            const data = await response.json();
            showToast(data.message || "Could not delete this message.", "error");
          }
        } catch (err) {
          console.error("Delete message failed:", err);
        }
      });

      actions.appendChild(deleteBtn);
      bubble.appendChild(actions);
    }

    return bubble;
  }

  // Switches a bubble into inline edit mode
  function enterEditMode(bubble, message, textEl, metaRow, actionsEl) {
    if (actionsEl) actionsEl.style.display = "none";
    textEl.style.display = "none";
    metaRow.style.display = "none";

    const textarea = document.createElement("textarea");
    textarea.className = "bubble-edit-input";
    textarea.value = message.text;
    textarea.rows = Math.max(2, message.text.split("\n").length);

    const editActions = document.createElement("div");
    editActions.className = "bubble-edit-actions";

    const saveBtn = document.createElement("button");
    saveBtn.className = "bubble-edit-save";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "bubble-edit-cancel";
    cancelBtn.textContent = "Cancel";

    editActions.appendChild(cancelBtn);
    editActions.appendChild(saveBtn);
    bubble.appendChild(textarea);
    bubble.appendChild(editActions);
    textarea.focus();

    cancelBtn.addEventListener("click", () => {
      textarea.remove();
      editActions.remove();
      textEl.style.display = "";
      metaRow.style.display = "";
      if (actionsEl) actionsEl.style.display = "";
    });

    saveBtn.addEventListener("click", async () => {
      const newText = textarea.value.trim();
      if (!newText || newText === message.text) {
        cancelBtn.click();
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        const response = await fetch(`${API_BASE_URL}/messages/${message._id}/edit`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ text: newText }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not save edit.");
        }

        // Update the bubble's text and add "· edited" label if not already there
        textEl.textContent = newText;
        message.text = newText;

        const existingEdited = metaRow.querySelector(".bubble-edited-label");
        if (!existingEdited) {
          const editedLabel = document.createElement("span");
          editedLabel.className = "bubble-edited-label";
          editedLabel.textContent = "· edited";
          metaRow.appendChild(editedLabel);
        }

        textarea.remove();
        editActions.remove();
        textEl.style.display = "";
        metaRow.style.display = "";
        if (actionsEl) actionsEl.style.display = "";
      } catch (err) {
        console.error("Edit message failed:", err);
        showToast(err.message || "Could not save edit.", "error");
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
      }
    });
  }

  // Upgrades the last sent message's receipt to a gold double-check
  // once the recipient has read it (and resets any previous one).
  function updateSeenIndicator(lastMineId) {
    if (!messageBubbles) return;
    messageBubbles.querySelectorAll(".bubble-receipt.seen").forEach((el) => {
      el.classList.remove("seen");
      el.innerHTML = checkIcon(false, false);
    });
    if (!lastMineId) return;
    const lastBubble = messageBubbles.querySelector(`.message-bubble[data-message-id="${lastMineId}"]`);
    if (lastBubble) {
      const receipt = lastBubble.querySelector(".bubble-receipt");
      if (receipt) {
        receipt.classList.add("seen");
        receipt.innerHTML = checkIcon(true, true);
      }
    }
  }

  async function loadMessageThread(userId, userName, corrRef) {
    if (!messageBubbles) return;

    activeConversationUserId = userId;
    activeConversationName = userName;

    if (threadContactAvatar) threadContactAvatar.textContent = getInitials(userName);
    if (threadContactName) threadContactName.textContent = userName;
    if (threadContactRole) threadContactRole.textContent = corrRef || "";

    if (threadEmpty) threadEmpty.style.display = "none";
    if (threadActive) threadActive.classList.remove("hidden");

    messageBubbles.innerHTML = '<p style="font-family:var(--font-mono);font-size:12px;color:var(--slate-soft);padding:20px;text-align:center;">Loading...</p>';

    try {
      const currentUser = getStoredUser();

      const response = await fetch(`${API_BASE_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const messages = await response.json();

      if (!response.ok) throw new Error(messages.message || "Could not load messages.");

      messageBubbles.innerHTML = "";

      if (messages.length === 0) {
        messageBubbles.innerHTML = '<p style="font-family:var(--font-mono);font-size:12px;color:var(--slate-soft);padding:20px;text-align:center;">No messages yet. Start the correspondence.</p>';
      } else {
        let lastDate = null;
        let lastMineMsg = null;

        messages.forEach((msg) => {
          // Insert date separator when the date changes
          const msgDate = new Date(msg.createdAt).toDateString();
          if (msgDate !== lastDate) {
            const sep = document.createElement("div");
            sep.className = "message-date-separator";
            const label = document.createElement("span");
            const isToday = msgDate === new Date().toDateString();
            label.textContent = isToday
              ? "Today"
              : new Date(msg.createdAt).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
            sep.appendChild(label);
            messageBubbles.appendChild(sep);
            lastDate = msgDate;
          }

          const isMine = msg.sender._id?.toString() === currentUser.id || msg.sender._id === currentUser.id;
          if (isMine) lastMineMsg = msg;

          messageBubbles.appendChild(renderBubble(msg, currentUser.id));
        });

        // Double-check only appears once THEY have actually read my last
        // sent message (msg.read is set on the recipient's side).
        if (lastMineMsg && lastMineMsg.read) {
          updateSeenIndicator(lastMineMsg._id);
        }
      }

      scrollToLatest();

      // Mark messages from this user as read
      await fetch(`${API_BASE_URL}/messages/${userId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      // Remove unread dot from conversation list
      const activeItem = conversationList?.querySelector(`.conversation-item[data-user-id="${userId}"]`);
      if (activeItem) {
        const dot = activeItem.querySelector(".unread-dot");
        if (dot) dot.remove();
      }

      refreshMessageBadge();
      startThreadPolling();
    } catch (err) {
      console.error("Load thread failed:", err);
      messageBubbles.innerHTML = '<p style="font-family:var(--font-mono);font-size:12px;color:var(--slate-soft);padding:20px;text-align:center;">Could not load messages.</p>';
    }
  }

  // ===================== NAV BADGES (unread counts) =====================
  const navBadgeMessages = document.getElementById("navBadgeMessages");
  const navBadgeNotifications = document.getElementById("navBadgeNotifications");

  function setNavBadge(el, count) {
    if (!el) return;
    if (count > 0) {
      el.textContent = count > 99 ? "99+" : String(count);
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  }

  async function refreshMessageBadge() {
    if (!navBadgeMessages) return;
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) return;
      const conversations = await response.json();
      const total = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setNavBadge(navBadgeMessages, total);
    } catch (err) {
      // Badge refresh is best-effort — stay silent on failure.
    }
  }

  async function refreshNotifBadge() {
    if (!navBadgeNotifications) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) return;
      const notifications = await response.json();
      const unread = notifications.filter((n) => !n.read).length;
      setNavBadge(navBadgeNotifications, unread);
    } catch (err) {
      // Badge refresh is best-effort — stay silent on failure.
    }
  }

  // Runs app-wide (not just on the Messages/Notifications pages) so the
  // sidebar badges stay current no matter where you're browsing.
  refreshMessageBadge();
  refreshNotifBadge();
  setInterval(() => {
    refreshMessageBadge();
    refreshNotifBadge();
  }, 20000);

  // ===================== LIVE THREAD POLLING =====================
  // Polls the open conversation every few seconds for new messages and
  // for read-receipt / typing-status changes — no page reload needed.
  // (threadPollInterval itself is declared near the top of the file so
  // showPage() can safely call stopThreadPolling() on first load.)

  function stopThreadPolling() {
    if (threadPollInterval) {
      clearInterval(threadPollInterval);
      threadPollInterval = null;
    }
  }

  function startThreadPolling() {
    stopThreadPolling();
    threadPollInterval = setInterval(() => {
      pollActiveThread();
      pollTypingStatus();
    }, 4000);
  }

  async function pollActiveThread() {
    if (!activeConversationUserId || !messageBubbles) return;

    try {
      const currentUser = getStoredUser();
      const response = await fetch(`${API_BASE_URL}/messages/${activeConversationUserId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) return;
      const messages = await response.json();

      const renderedIds = new Set(
        Array.from(messageBubbles.querySelectorAll(".message-bubble")).map((b) => b.dataset.messageId)
      );
      const newOnes = messages.filter((m) => !renderedIds.has(m._id));

      if (newOnes.length > 0) {
        const placeholder = messageBubbles.querySelector("p");
        if (placeholder) placeholder.remove();

        let arrivedFromThem = false;

        newOnes.forEach((msg) => {
          const isMine = msg.sender._id?.toString() === currentUser.id || msg.sender._id === currentUser.id;
          if (!isMine) arrivedFromThem = true;
          const bubble = renderBubble(msg, currentUser.id);
          bubble.classList.add("just-added");
          messageBubbles.appendChild(bubble);
          setTimeout(() => bubble.classList.remove("just-added"), 900);
        });

        scrollToLatest();

        if (arrivedFromThem) {
          await fetch(`${API_BASE_URL}/messages/${activeConversationUserId}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          refreshMessageBadge();

          if (document.hidden) {
            showToast(`New message from ${activeConversationName}`, "info");
          }
        }
      }

      // Recompute the read-receipt state on my last message even when no
      // new message arrived — covers "they just read it" with no reply yet.
      let lastMineMsg = null;
      messages.forEach((m) => {
        const isMine = m.sender._id?.toString() === currentUser.id || m.sender._id === currentUser.id;
        if (isMine) lastMineMsg = m;
      });
      if (lastMineMsg && lastMineMsg.read) {
        updateSeenIndicator(lastMineMsg._id);
      }
    } catch (err) {
      // Silent — this runs on a timer, not worth surfacing transient errors.
    }
  }

  // ===================== TYPING INDICATOR =====================
  // Frontend is fully wired up here. It needs a matching backend endpoint
  // to actually broadcast typing status between two users — see the setup
  // notes for the two small routes to add to routes/messages.js.
  const typingIndicatorEl = document.getElementById("typingIndicator");
  const typingNameEl = document.getElementById("typingName");
  let typingPingCooldown = false;

  async function pingTyping() {
    if (!activeConversationUserId) return;
    try {
      await fetch(`${API_BASE_URL}/messages/${activeConversationUserId}/typing`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      // Endpoint may not exist yet — typing ping fails silently.
    }
  }

  async function pollTypingStatus() {
    if (!activeConversationUserId || !typingIndicatorEl) return;
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${activeConversationUserId}/typing`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) {
        typingIndicatorEl.classList.add("hidden");
        return;
      }
      const data = await response.json();
      if (data.typing) {
        if (typingNameEl) typingNameEl.textContent = `${activeConversationName} is typing`;
        typingIndicatorEl.classList.remove("hidden");
      } else {
        typingIndicatorEl.classList.add("hidden");
      }
    } catch (err) {
      typingIndicatorEl.classList.add("hidden");
    }
  }

  if (messageInput) {
    messageInput.addEventListener("input", () => {
      if (typingPingCooldown) return;
      pingTyping();
      typingPingCooldown = true;
      setTimeout(() => {
        typingPingCooldown = false;
      }, 2500);
    });
  }

  function renderConversationItem(convo, corrRef) {
    const item = document.createElement("div");
    item.className = "conversation-item";
    item.dataset.userId = convo.userId;
    item.dataset.userName = convo.name;
    item.dataset.corrRef = corrRef;

    item.innerHTML = `
      <div class="thread-avatar small"></div>
      <div class="conversation-info">
        <div class="conversation-top">
          <span class="conversation-name"></span>
          <span class="conversation-time"></span>
        </div>
        <div class="conversation-preview"></div>
        <div class="conversation-ref"></div>
      </div>
    `;

    item.querySelector(".thread-avatar").textContent = getInitials(convo.name);
    item.querySelector(".conversation-name").textContent = convo.name;
    item.querySelector(".conversation-time").textContent = formatRelativeTime(convo.lastMessageTime);
    item.querySelector(".conversation-preview").textContent = convo.lastMessage;
    item.querySelector(".conversation-ref").textContent = corrRef;

    if (convo.unreadCount > 0) {
      const dot = document.createElement("span");
      dot.className = "unread-dot";
      item.appendChild(dot);
    }

    item.addEventListener("click", () => {
      conversationList?.querySelectorAll(".conversation-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      loadMessageThread(convo.userId, convo.name, corrRef);
    });

    return item;
  }

  async function loadConversations() {
    if (!conversationList) return;

    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const conversations = await response.json();

      if (!response.ok) throw new Error(conversations.message || "Could not load conversations.");

      if (conversationsLoading) conversationsLoading.remove();

      // Clear any previously-rendered rows/empty-state (but leave the
      // search bar and new-conversation panel, which live in this same
      // container) so reloading doesn't duplicate everything.
      conversationList.querySelectorAll(".conversation-item, .conversation-list-empty").forEach((el) => el.remove());

      if (conversations.length === 0) {
        const empty = document.createElement("p");
        empty.className = "conversation-list-empty";
        empty.style.cssText = "padding:20px;font-family:var(--font-mono);font-size:12px;color:var(--slate-soft);text-align:center;";
        empty.textContent = "No correspondence yet.";
        conversationList.appendChild(empty);
      } else {
        conversations.forEach((convo) => {
          const corrRef = generateCorrRef();
          conversationList.appendChild(renderConversationItem(convo, corrRef));
        });
      }
    } catch (err) {
      console.error("Load conversations failed:", err);
      if (conversationsLoading) conversationsLoading.textContent = "Could not load conversations.";
    }
  }

  async function sendMessage() {
    if (!messageInput || !activeConversationUserId) return;

    const text = messageInput.value.trim();
    if (!text) return;

    messageInput.disabled = true;
    if (messageSendBtn) {
      messageSendBtn.disabled = true;
      messageSendBtn.textContent = "Sending...";
    }

    try {
      const response = await fetch(`${API_BASE_URL}/messages/${activeConversationUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text }),
      });

      const newMessage = await response.json();
      if (!response.ok) throw new Error(newMessage.message || "Could not send message.");

      const currentUser = getStoredUser();

      // Insert a date separator if today wasn't already shown
      const today = new Date().toDateString();
      const lastSep = messageBubbles?.querySelector(".message-date-separator:last-of-type span");
      if (!lastSep || lastSep.textContent !== "Today") {
        const sep = document.createElement("div");
        sep.className = "message-date-separator";
        const label = document.createElement("span");
        label.textContent = "Today";
        sep.appendChild(label);
        messageBubbles?.appendChild(sep);
      }

      // Remove "no messages" placeholder if it's still showing
      const placeholder = messageBubbles?.querySelector("p");
      if (placeholder) placeholder.remove();

      const bubble = renderBubble(newMessage, currentUser.id);
      bubble.classList.add("just-added");
      messageBubbles?.appendChild(bubble);
      scrollToLatest();

      messageInput.value = "";

      // Update the conversation preview in the list, or reload the list
      // entirely if this was a brand-new conversation (no row yet)
      const activeItem = conversationList?.querySelector(`.conversation-item[data-user-id="${activeConversationUserId}"]`);
      if (activeItem) {
        const preview = activeItem.querySelector(".conversation-preview");
        const time = activeItem.querySelector(".conversation-time");
        if (preview) preview.textContent = text;
        if (time) time.textContent = "just now";
      } else {
        loadConversations();
      }

      setTimeout(() => bubble.classList.remove("just-added"), 900);
    } catch (err) {
      console.error("Send message failed:", err);
      showToast(err.message || "Could not send this message.", "error");
    } finally {
      messageInput.disabled = false;
      if (messageSendBtn) {
        messageSendBtn.disabled = false;
        messageSendBtn.textContent = "Send →";
      }
      messageInput.focus();
    }
  }

  if (messageSendBtn) {
    messageSendBtn.addEventListener("click", sendMessage);
    messageSendBtn.addEventListener("mouseenter", () => {
      if (!messageSendBtn.disabled) messageSendBtn.textContent = "Transmit →";
    });
    messageSendBtn.addEventListener("mouseleave", () => {
      if (!messageSendBtn.disabled) messageSendBtn.textContent = "Send →";
    });
  }

  if (messageInput) {
    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  if (conversationSearch) {
    conversationSearch.addEventListener("input", () => {
      const query = conversationSearch.value.trim().toLowerCase();
      conversationList?.querySelectorAll(".conversation-item").forEach((item) => {
        const name = (item.dataset.userName || "").toLowerCase();
        item.classList.toggle("search-hidden", query !== "" && !name.includes(query));
      });
    });
  }

  const messagesNavBtn = document.querySelector('.nav-item[data-page="messages"]');
  if (messagesNavBtn && conversationList) {
    messagesNavBtn.addEventListener("click", () => {
      const alreadyLoaded = conversationList.querySelector(".conversation-item");
      if (!alreadyLoaded) {
        loadConversations();
      }
    });
  }

  // ===================== EVENTS =====================
  const toggleCreateEvent = document.getElementById("toggleCreateEvent");
  const createEventForm = document.getElementById("createEventForm");
  const cancelCreateEvent = document.getElementById("cancelCreateEvent");
  const submitCreateEvent = document.getElementById("submitCreateEvent");
  const newEventTitle = document.getElementById("newEventTitle");
  const newEventType = document.getElementById("newEventType");
  const newEventDesc = document.getElementById("newEventDesc");
  const newEventDate = document.getElementById("newEventDate");
  const newEventLocation = document.getElementById("newEventLocation");
  const newEventLink = document.getElementById("newEventLink");
  const upcomingGrid = document.getElementById("upcomingGrid");
  const pastGrid = document.getElementById("pastGrid");
  const upcomingLoading = document.getElementById("upcomingLoading");
  const pastLoading = document.getElementById("pastLoading");

  function closeCreateEventForm() {
    if (!createEventForm) return;
    createEventForm.classList.add("hidden");
    newEventTitle.value = "";
    newEventDesc.value = "";
    newEventDate.value = "";
    newEventLocation.value = "";
    newEventLink.value = "";
    newEventType.value = "Conference";
  }

  if (toggleCreateEvent && createEventForm) {
    toggleCreateEvent.addEventListener("click", () => {
      if (!requireLoginOrRedirect()) return;
      createEventForm.classList.toggle("hidden");
      if (!createEventForm.classList.contains("hidden")) {
        newEventTitle.focus();
      }
    });
  }

  if (cancelCreateEvent) {
    cancelCreateEvent.addEventListener("click", closeCreateEventForm);
  }

  // Formats a date as "Tue, 15 Sep 2026 · 09:00"
  function formatEventDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " · " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Returns a human countdown string — "In 3 days", "In 2 hours", etc.
  // For past events, returns "Ended X days ago"
  function formatCountdown(isoString) {
    const diffMs = new Date(isoString) - Date.now();
    const isPast = diffMs < 0;
    const abs = Math.abs(diffMs);

    const minutes = Math.floor(abs / 60000);
    const hours = Math.floor(abs / 3600000);
    const days = Math.floor(abs / 86400000);

    if (isPast) {
      if (days > 0) return `Ended ${days}d ago`;
      if (hours > 0) return `Ended ${hours}h ago`;
      return "Just ended";
    }

    if (days > 0) return `In ${days} day${days === 1 ? "" : "s"}`;
    if (hours > 0) return `In ${hours} hour${hours === 1 ? "" : "s"}`;
    if (minutes > 0) return `In ${minutes} min`;
    return "Starting now";
  }

  // Maps event type to a subtle color-coded border on the card top
  function typeToColor(type) {
    const map = {
      Conference: "var(--ink)",
      Seminar: "var(--slate)",
      Workshop: "var(--red)",
      Webinar: "#6B7894",
    };
    return map[type] || "var(--slate)";
  }

  function renderEventCard(event, isPast) {
    const currentUser = getStoredUser();
    const isAttending = currentUser && event.attendees.includes(currentUser.id);

    const card = document.createElement("div");
    card.className = "event-card";
    card.style.borderTopColor = typeToColor(event.type);

    card.innerHTML = `
      <div class="event-card-top">
        <span class="event-type-tag"></span>
        <span class="event-countdown"></span>
      </div>
      <h3 class="event-title"></h3>
      <p class="event-desc"></p>
      <div class="event-meta-row">
        <div class="event-meta-item">
          <span class="event-meta-icon">📅</span>
          <span class="event-date-text"></span>
        </div>
        <div class="event-meta-item">
          <span class="event-meta-icon">📍</span>
          <span class="event-location-text"></span>
        </div>
      </div>
      <div class="event-card-footer">
        <span class="event-organiser"></span>
        <div style="display:flex;align-items:center;gap:10px;">
          ${event.link ? '<a class="event-link" target="_blank" rel="noopener">Info →</a>' : ""}
          <button class="event-attend-btn ${isPast ? "ended" : isAttending ? "attending" : ""}">
            ${isPast ? "Ended" : isAttending ? "✓ Attending" : "Attend"}
          </button>
        </div>
      </div>
    `;

    card.querySelector(".event-type-tag").textContent = event.type;
    card.querySelector(".event-countdown").textContent = formatCountdown(event.date);
    card.querySelector(".event-title").textContent = event.title;
    card.querySelector(".event-desc").textContent = event.description;
    card.querySelector(".event-date-text").textContent = formatEventDate(event.date);
    card.querySelector(".event-location-text").textContent = event.location;
    card.querySelector(".event-organiser").textContent = `By ${event.organiser?.name || "Unknown"}`;

    if (event.link) {
      card.querySelector(".event-link").href = event.link;
    }

    const attendBtn = card.querySelector(".event-attend-btn");

    if (!isPast) {
      attendBtn.addEventListener("click", async () => {
        if (!requireLoginOrRedirect()) return;
        attendBtn.disabled = true;

        try {
          const response = await fetch(`${API_BASE_URL}/events/${event._id}/attend`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${getToken()}` },
          });

          const data = await response.json();

          if (!response.ok) throw new Error(data.message || "Could not update attendance.");

          attendBtn.classList.toggle("attending", data.attending);
          attendBtn.textContent = data.attending ? "✓ Attending" : "Attend";
        } catch (err) {
          console.error("Attend toggle failed:", err);
          showToast(err.message || "Something went wrong.", "error");
        } finally {
          attendBtn.disabled = false;
        }
      });
    }

    return card;
  }

  async function loadEvents() {
    if (!upcomingGrid && !pastGrid) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to load events.");

      // Upcoming
      if (upcomingLoading) upcomingLoading.classList.add("hidden");
      if (upcomingGrid) {
        upcomingGrid.innerHTML = "";
        if (data.upcoming.length === 0) {
          upcomingGrid.innerHTML = '<p class="empty-state">No upcoming events yet — be the first to create one.</p>';
        } else {
          data.upcoming.forEach((event) => {
            upcomingGrid.appendChild(renderEventCard(event, false));
          });
        }
      }

      // Past
      if (pastLoading) pastLoading.classList.add("hidden");
      if (pastGrid) {
        pastGrid.innerHTML = "";
        if (data.past.length === 0) {
          pastGrid.innerHTML = '<p class="empty-state" style="opacity:0.6;">No past events on record.</p>';
        } else {
          data.past.forEach((event) => {
            pastGrid.appendChild(renderEventCard(event, true));
          });
        }
      }
    } catch (err) {
      console.error("Load events failed:", err);
      if (upcomingLoading) upcomingLoading.textContent = "Could not load events. Is the backend running?";
    }
  }

  if (submitCreateEvent) {
    submitCreateEvent.addEventListener("click", async () => {
      if (!requireLoginOrRedirect()) return;

      const title = newEventTitle.value.trim();
      const type = newEventType.value;
      const description = newEventDesc.value.trim();
      const date = newEventDate.value;
      const location = newEventLocation.value.trim();
      const link = newEventLink.value.trim();

      if (!title || !description || !date || !location) {
        newEventTitle.focus();
        return;
      }

      submitCreateEvent.disabled = true;
      submitCreateEvent.textContent = "Filing...";

      try {
        const response = await fetch(`${API_BASE_URL}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ title, type, description, date, location, link }),
        });

        const newEvent = await response.json();

        if (!response.ok) throw new Error(newEvent.message || "Could not create event.");

        const isPast = new Date(newEvent.date) < new Date();
        const card = renderEventCard(newEvent, isPast);
        card.classList.add("just-added");

        const targetGrid = isPast ? pastGrid : upcomingGrid;
        if (targetGrid) {
          // Remove "no events" placeholder if present
          const placeholder = targetGrid.querySelector(".empty-state");
          if (placeholder) placeholder.remove();
          targetGrid.insertBefore(card, targetGrid.firstChild);
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => card.classList.remove("just-added"), 1500);
        }

        closeCreateEventForm();
      } catch (err) {
        console.error("Create event failed:", err);
        showToast(err.message || "Something went wrong creating this event.", "error");
      } finally {
        submitCreateEvent.disabled = false;
        submitCreateEvent.textContent = "File event";
      }
    });
  }

  // Load events when the Events tab is opened
  const eventsNavBtn = document.querySelector('.nav-item[data-page="events"]');
  if (eventsNavBtn && upcomingGrid) {
    eventsNavBtn.addEventListener("click", () => {
      const alreadyLoaded = upcomingGrid.querySelector(".event-card");
      if (!alreadyLoaded) {
        loadEvents();
      }
    });
  }

  // ===================== PROFILE =====================
  const profileLoading = document.getElementById("profileLoading");
  const profileView = document.getElementById("profileView");
  const profileEdit = document.getElementById("profileEdit");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileName = document.getElementById("profileName");
  const profileSubtitle = document.getElementById("profileSubtitle");
  const profileUserId = document.getElementById("profileUserId");
  const profileBio = document.getElementById("profileBio");
  const profileResearchAreas = document.getElementById("profileResearchAreas");
  const profileSkills = document.getElementById("profileSkills");
  const profileBadges = document.getElementById("profileBadges");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const cancelEditProfile = document.getElementById("cancelEditProfile");
  const saveEditProfile = document.getElementById("saveEditProfile");
  const editBio = document.getElementById("editBio");
  const editName = document.getElementById("editName");
  const editRole = document.getElementById("editRole");
  const editInstitution = document.getElementById("editInstitution");
  const editResearchAreas = document.getElementById("editResearchAreas");
  const editSkills = document.getElementById("editSkills");
  const toggleProfilePosts = document.getElementById("toggleProfilePosts");
  const profilePostsList = document.getElementById("profilePostsList");
  const profilePostsLoading = document.getElementById("profilePostsLoading");

  // Renders chips (tag-outline pills) for arrays like skills/researchAreas
  function renderChips(container, items, emptyText) {
    container.innerHTML = "";
    if (!items || items.length === 0) {
      const empty = document.createElement("span");
      empty.className = "meta-text";
      empty.textContent = emptyText;
      container.appendChild(empty);
    } else {
      items.forEach((item) => {
        const chip = document.createElement("span");
        chip.className = "tag tag-outline";
        chip.textContent = item;
        container.appendChild(chip);
      });
    }
  }

  // Populates the view mode with real user data
  function populateProfileView(user) {
    if (profileAvatar) {
      profileAvatar.textContent = getInitials(user.name);
      applyRoleRing(profileAvatar, user.role);
    }
    if (profileName) profileName.textContent = user.name;

    const subtitleParts = [user.role];
    if (user.institution) subtitleParts.push(user.institution);
    if (profileSubtitle) profileSubtitle.textContent = subtitleParts.join(" · ");

    // Show a short version of the user's MongoDB _id as a reference stamp
    if (profileUserId) profileUserId.textContent = `USR-${user._id.slice(-6).toUpperCase()}`;

    if (profileBio) {
      profileBio.textContent = user.bio || "No bio yet — click Edit profile to add one.";
      profileBio.style.opacity = user.bio ? "1" : "0.5";
    }

    renderChips(profileResearchAreas, user.researchAreas, "None listed yet.");
    renderChips(profileSkills, user.skills, "None listed yet.");

    // Badges
    if (profileBadges) {
      profileBadges.innerHTML = "";
      if (!user.badges || user.badges.length === 0) {
        const empty = document.createElement("span");
        empty.className = "meta-text";
        empty.textContent = "No badges yet.";
        profileBadges.appendChild(empty);
      } else {
        user.badges.forEach((badge) => {
          const div = document.createElement("div");
          div.className = "badge";
          div.innerHTML = `<span class="badge-dot"></span>`;
          const label = document.createElement("span");
          label.textContent = badge;
          div.appendChild(label);
          profileBadges.appendChild(div);
        });
      }
    }
  }

  let cachedProfile = null;
  let postsLoaded = false;
  let savedPostsLoaded = false;

  async function loadProfile() {
    if (!profileView) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const user = await response.json();

      if (!response.ok) throw new Error(user.message || "Could not load profile.");

      cachedProfile = user;
      populateProfileView(user);

      if (profileLoading) profileLoading.classList.add("hidden");
      profileView.classList.remove("hidden");
    } catch (err) {
      console.error("Load profile failed:", err);
      if (profileLoading) profileLoading.textContent = "Could not load profile. Is the backend running?";
    }
  }

  // Switch to edit mode, pre-filling fields from cached profile
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      if (!cachedProfile) return;

      if (editName) editName.value = cachedProfile.name || "";
      if (editRole) editRole.value = cachedProfile.role || "Student";
      if (editBio) editBio.value = cachedProfile.bio || "";
      if (editInstitution) editInstitution.value = cachedProfile.institution || "";
      if (editResearchAreas) editResearchAreas.value = (cachedProfile.researchAreas || []).join(", ");
      if (editSkills) editSkills.value = (cachedProfile.skills || []).join(", ");

      profileView.classList.add("hidden");
      profileEdit.classList.remove("hidden");
    });
  }

  // Cancel edit — go back to view mode
  if (cancelEditProfile) {
    cancelEditProfile.addEventListener("click", () => {
      profileEdit.classList.add("hidden");
      profileView.classList.remove("hidden");
    });
  }

  // Save profile changes
  if (saveEditProfile) {
    saveEditProfile.addEventListener("click", async () => {
      const trimmedName = editName ? editName.value.trim() : "";
      if (editName && !trimmedName) {
        showToast("Name cannot be empty.", "error");
        return;
      }

      saveEditProfile.disabled = true;
      saveEditProfile.textContent = "Saving...";

      // Split comma-separated strings into arrays, trimming whitespace
      const skills = editSkills.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const researchAreas = editResearchAreas.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            name: trimmedName,
            role: editRole ? editRole.value : undefined,
            bio: editBio.value.trim(),
            institution: editInstitution.value.trim(),
            skills,
            researchAreas,
          }),
        });

        const updatedUser = await safeJson(response);

        if (!response.ok) throw new Error(updatedUser.message || "Could not save changes.");

        // Update cached profile and repopulate the view
        cachedProfile = updatedUser;
        populateProfileView(updatedUser);

        // Also update the sidebar to reflect any institution change
        const sidebarUserName = document.getElementById("sidebarUserName");
        const sidebarUserRole = document.getElementById("sidebarUserRole");
        const sidebarAvatar = document.getElementById("sidebarAvatar");
        if (sidebarUserName) sidebarUserName.textContent = updatedUser.name;
        if (sidebarUserRole) sidebarUserRole.textContent = updatedUser.role;
        if (sidebarAvatar) {
          sidebarAvatar.textContent = getInitials(updatedUser.name);
          applyRoleRing(sidebarAvatar, updatedUser.role);
        }

        // Update localStorage so other parts of the app reflect the change
        localStorage.setItem("tynwald_user", JSON.stringify({
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        }));

        profileEdit.classList.add("hidden");
        profileView.classList.remove("hidden");
      } catch (err) {
        console.error("Save profile failed:", err);
        showToast(err.message || "Something went wrong saving your profile.", "error");
      } finally {
        saveEditProfile.disabled = false;
        saveEditProfile.textContent = "Save changes";
      }
    });
  }

  // Collapsible posts toggle
  if (toggleProfilePosts && profilePostsList) {
    toggleProfilePosts.addEventListener("click", async () => {
      const isOpen = toggleProfilePosts.classList.contains("open");

      if (isOpen) {
        toggleProfilePosts.classList.remove("open");
        toggleProfilePosts.querySelector("span:first-child").textContent = "Show my posts";
        profilePostsList.classList.add("hidden");
      } else {
        toggleProfilePosts.classList.add("open");
        toggleProfilePosts.querySelector("span:first-child").textContent = "Hide my posts";
        profilePostsList.classList.remove("hidden");

        // Only fetch once
        if (!postsLoaded) {
          postsLoaded = true;
          if (profilePostsLoading) profilePostsLoading.classList.remove("hidden");

          try {
            const response = await fetch(`${API_BASE_URL}/users/me/posts`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            });
            const posts = await response.json();

            if (!response.ok) throw new Error(posts.message || "Could not load posts.");

            if (profilePostsLoading) profilePostsLoading.classList.add("hidden");

            if (posts.length === 0) {
              const empty = document.createElement("p");
              empty.className = "empty-state";
              empty.textContent = "You haven't posted anything yet.";
              profilePostsList.appendChild(empty);
            } else {
              posts.forEach((post) => {
                profilePostsList.appendChild(renderPostCard(post));
              });
            }
          } catch (err) {
            console.error("Load user posts failed:", err);
            if (profilePostsLoading) {
              profilePostsLoading.textContent = "Could not load posts.";
            }
          }
        }
      }
    });
  }

  // Saved posts toggle — mirrors "My posts" above
  const toggleSavedPosts = document.getElementById("toggleSavedPosts");
  const savedPostsList = document.getElementById("savedPostsList");
  const savedPostsLoading = document.getElementById("savedPostsLoading");

  if (toggleSavedPosts && savedPostsList) {
    toggleSavedPosts.addEventListener("click", async () => {
      const isOpen = toggleSavedPosts.classList.contains("open");

      if (isOpen) {
        toggleSavedPosts.classList.remove("open");
        toggleSavedPosts.querySelector("span:first-child").textContent = "Show saved posts";
        savedPostsList.classList.add("hidden");
      } else {
        toggleSavedPosts.classList.add("open");
        toggleSavedPosts.querySelector("span:first-child").textContent = "Hide saved posts";
        savedPostsList.classList.remove("hidden");

        if (!savedPostsLoaded) {
          savedPostsLoaded = true;
          if (savedPostsLoading) savedPostsLoading.classList.remove("hidden");

          try {
            const response = await fetch(`${API_BASE_URL}/users/me/saved-posts`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            });
            const posts = await response.json();

            if (!response.ok) throw new Error(posts.message || "Could not load saved posts.");

            if (savedPostsLoading) savedPostsLoading.classList.add("hidden");

            if (posts.length === 0) {
              const empty = document.createElement("p");
              empty.className = "empty-state";
              empty.textContent = "Nothing saved yet — tap the bookmark icon on any post.";
              savedPostsList.appendChild(empty);
            } else {
              posts.forEach((post) => {
                const card = renderPostCard({ ...post, savedByMe: true });
                savedPostsList.appendChild(card);
              });
            }
          } catch (err) {
            console.error("Load saved posts failed:", err);
            if (savedPostsLoading) {
              savedPostsLoading.textContent = "Could not load saved posts.";
            }
          }
        }
      }
    });
  }

  // Load profile when the Profile tab is opened
  const profileNavBtn = document.querySelector('.nav-item[data-page="profile"]');
  if (profileNavBtn && profileView) {
    profileNavBtn.addEventListener("click", () => {
      if (!cachedProfile) {
        loadProfile();
      }
    });
  }
});