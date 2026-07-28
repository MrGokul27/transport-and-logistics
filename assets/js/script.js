document.addEventListener("DOMContentLoaded", () => {
  // 0. Preloader Initialization
  setupPreloader();

  // 1. Load Common Header and Footer Components
  loadComponent("header-placeholder", "pages/components/header.html", () => {
    highlightActiveLink();
    setupNavbarScroll();
  });

  loadComponent("footer-placeholder", "pages/components/footer.html", () => {
    setupFooterYear();
    setupNewsletterForm();
  });

  // 2. Setup Shipment Tracker Simulator
  setupShipmentTracker();

  // 3. Setup Shipping Quote Estimator
  setupQuoteCalculator();

  // 4. Setup Scroll to Top Action
  setupScrollToTop();

  // 5. Setup Animated Stats Counters
  setupStatsCounters();

  // 6. Setup Redirects for Empty / Hash Links
  setupEmptyLinkRedirects();
});

/**
 * Dynamically fetches and inserts HTML components into placeholders, adjusting relative links.
 */
function loadComponent(elementId, componentPath, callback) {
  const placeholder = document.getElementById(elementId);
  if (!placeholder) return;

  const root = getRootPath();
  const fullPath = root + componentPath;

  fetch(fullPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch component: ${fullPath} (Status: ${response.status})`,
        );
      }
      return response.text();
    })
    .then((html) => {
      placeholder.innerHTML = html;
      adjustComponentPaths(placeholder, root);
      if (callback) callback();
    })
    .catch((err) => {
      console.error("Component loading failed:", err);
      // Fallback for file:// CORS issues
      if (window.location.protocol === "file:") {
        placeholder.innerHTML = `<div class="alert alert-warning text-center m-3 fs-7 py-2">
                    <strong>Local Preview Note:</strong> Loading components dynamically requires a web server (like VS Code Live Server). 
                    Please run this project on a local server to preview header and footer components.
                </div>`;
      }
    });
}

/**
 * Calculates current directory depth relative to the root project directory.
 */
function getRootPath() {
  const path = window.location.pathname;
  // If the path contains '/pages/', it means we are inside the subfolder
  if (path.includes("/pages/")) {
    return "../";
  }
  return "";
}

/**
 * Adjusts image src and anchor href tags in imported header/footers depending on page directory level.
 */
function adjustComponentPaths(container, root) {
  if (!root) return; // Already at root level, no adjustments needed

  // Update hyperlinks
  container.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (
      href &&
      !href.startsWith("http") &&
      !href.startsWith("#") &&
      !href.startsWith("tel:") &&
      !href.startsWith("mailto:")
    ) {
      a.setAttribute("href", root + href);
    }
  });

  // Update images
  container.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("http") && !src.startsWith("data:")) {
      img.setAttribute("src", root + src);
    }
  });
}

/**
 * Identifies the active page name and adds the Bootstrap "active" helper class to the navbar link.
 */
function highlightActiveLink() {
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";

  const navMapping = {
    "index.html": "nav-home",
    "about.html": "nav-about",
    "services.html": "nav-services",
    "work-process.html": "nav-process",
    "team.html": "nav-team",
    "blog.html": "nav-blog",
    "contact.html": "nav-contact",
  };

  const activeId = navMapping[page];
  if (activeId) {
    const activeLink = document.getElementById(activeId);
    if (activeLink) {
      activeLink.classList.add("active");
      activeLink.setAttribute("aria-current", "page");
    }
  }
}

/**
 * Toggles structural navbar styles upon scrolling down.
 */
function setupNavbarScroll() {
  const navbar = document.getElementById("mainNavbar");
  const topBar = document.querySelector(".top-bar");
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 42) {
      navbar.classList.add("scrolled");
      if (topBar) topBar.classList.add("hidden");
    } else {
      navbar.classList.remove("scrolled");
      if (topBar) topBar.classList.remove("hidden");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  // Mobile menu background scroll lock
  const navMenu = document.getElementById("navMenu");
  if (navMenu) {
    navMenu.addEventListener("show.bs.collapse", () => {
      document.body.style.overflow = "hidden";
    });
    navMenu.addEventListener("hide.bs.collapse", () => {
      document.body.style.overflow = "";
    });
  }
}

/**
 * Updates copyright year in the footer dynamically.
 */
function setupFooterYear() {
  const yearSpan = document.getElementById("copyrightYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/**
 * Intercepts footer newsletter subscription and displays success state.
 */
function setupNewsletterForm() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const root = getRootPath();
    window.location.href = root + "pages/404.html";
  });
}

/**
 * Handles shipment tracking inquiries with realistic status outputs.
 */
function setupShipmentTracker() {
  const forms = ["trackerForm", "trackerFormMobile"];

  forms.forEach((formId) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const root = getRootPath();
      window.location.href = root + "pages/404.html";
    });
  });
}

/**
 * Shipping price quote estimator logic.
 */
function setupQuoteCalculator() {
  const form = document.getElementById("quoteCalculatorForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const root = getRootPath();
    window.location.href = root + "pages/404.html";
  });
}

/**
 * Scroll to Top action logic.
 */
function setupScrollToTop() {
  const scrollBtn = document.getElementById("scrollUp");
  if (!scrollBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  });

  scrollBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/**
 * Simulates counting animations for statistics on the homepage.
 */
function setupStatsCounters() {
  const counters = document.querySelectorAll(".counter-value");
  if (counters.length === 0) return;

  const countTo = (counter) => {
    const target = parseInt(counter.getAttribute("data-target")) || 0;
    const suffix = counter.getAttribute("data-suffix") || "";
    let count = 0;
    const duration = 2000; // 2 seconds
    const stepTime = Math.max(Math.floor(duration / target), 15);

    const timer = setInterval(() => {
      count += Math.ceil(target / (duration / stepTime));
      if (count >= target) {
        counter.textContent = target + suffix;
        clearInterval(timer);
      } else {
        counter.textContent = count + suffix;
      }
    }, stepTime);
  };

  // Use IntersectionObserver to animate only when visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countTo(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

/**
 * Global click interceptor that redirects empty links, "#" links, and placeholder javascript links to the 404 page.
 */
function setupEmptyLinkRedirects() {
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    const anchor = e.target.closest("a");
    if (!anchor) return;

    // Skip if it's the scroll-to-top button
    if (anchor.id === "scrollUp") return;

    // Check if the link has href attribute
    const href = anchor.getAttribute("href");

    // Intercept if href is empty, '#', or 'javascript:void(0)'/similar
    const isEmpty = href === null || href === "" || href.trim() === "";
    const isHash = href === "#";
    const isJsVoid =
      href && (href.startsWith("javascript:") || href.startsWith("void(0)"));

    if (isEmpty || isHash || isJsVoid) {
      // Allow Bootstrap collapse/toggle triggers, custom actions, and panel switchers to function without redirect
      if (
        anchor.hasAttribute("data-bs-toggle") ||
        anchor.hasAttribute("data-bs-target") ||
        anchor.classList.contains("dropdown-toggle") ||
        anchor.closest(".carousel-control-prev") ||
        anchor.closest(".carousel-control-next") ||
        anchor.hasAttribute("data-panel") ||
        anchor.hasAttribute("onclick") ||
        anchor.classList.contains("nav-link") ||
        anchor.closest(".sidebar-nav")
      ) {
        return;
      }

      e.preventDefault();
      const root = getRootPath();
      window.location.href = root + "pages/404.html";
    }
  });
}

/**
 * Manages the homepage preloader sequence over approximately 2 seconds.
 * Transitioning progress bar width, active node classes, and status text.
 */
function setupPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const progress = preloader.querySelector(".preloader-route-progress");
  const percentage = preloader.querySelector(".preloader-percentage");
  const statusText = preloader.querySelector(".preloader-status-text");

  const nodes = {
    land: preloader.querySelector(".node-land"),
    sea: preloader.querySelector(".node-sea"),
    air: preloader.querySelector(".node-air"),
  };

  const steps = [
    {
      progress: 30,
      text: "Securing regional land transport...",
      activeNode: "land",
      completedNodes: [],
    },
    {
      progress: 65,
      text: "Coordinating global sea routes...",
      activeNode: "sea",
      completedNodes: ["land"],
    },
    {
      progress: 90,
      text: "Expediting air cargo connections...",
      activeNode: "air",
      completedNodes: ["land", "sea"],
    },
    {
      progress: 100,
      text: "Cargo operations cleared. Dispatched!",
      activeNode: null,
      completedNodes: ["land", "sea", "air"],
    },
  ];

  let currentStep = 0;
  const stepDuration = 400; // Duration of each phase in ms
  const totalDuration = 1600;
  const intervalTime = 20; // Update counter smoothly every 20ms

  let currentPercent = 0;
  let targetPercent = 0;

  // Counter animation interval
  const percentInterval = setInterval(() => {
    if (currentPercent < targetPercent) {
      currentPercent++;
      if (percentage) percentage.textContent = `${currentPercent}%`;
    }
  }, intervalTime);

  // Transition handler
  const runSequence = () => {
    if (currentStep >= steps.length) {
      clearInterval(percentInterval);

      // Sequence finished - perform fade out
      setTimeout(() => {
        preloader.classList.add("fade-out");
        document.body.classList.remove("preloader-active");
      }, 300);
      return;
    }

    const step = steps[currentStep];

    // Update progress bar
    if (progress) progress.style.width = `${step.progress}%`;
    targetPercent = step.progress;

    // Update status text
    if (statusText) {
      statusText.style.opacity = 0;
      setTimeout(() => {
        statusText.textContent = step.text;
        statusText.style.opacity = 1;
      }, 150);
    }

    // Update node states
    Object.keys(nodes).forEach((key) => {
      const node = nodes[key];
      if (!node) return;

      if (key === step.activeNode) {
        node.classList.add("active");
        node.classList.remove("completed");
      } else if (step.completedNodes.includes(key)) {
        node.classList.remove("active");
        node.classList.add("completed");
      } else {
        node.classList.remove("active", "completed");
      }
    });

    currentStep++;
    setTimeout(runSequence, stepDuration);
  };

  // Start sequence
  runSequence();
}
