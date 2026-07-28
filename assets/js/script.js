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
  const status = document.getElementById("newsletterStatus");
  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.querySelector("input[type='email']").value;
    status.innerHTML = `<span class="text-success"><i class="fas fa-check-circle me-1"></i> Subscribed successfully!</span>`;
    form.reset();
    setTimeout(() => {
      status.textContent = "We respect your privacy. Unsubscribe anytime.";
    }, 5000);
  });
}

/**
 * Handles shipment tracking inquiries with realistic status outputs.
 */
function setupShipmentTracker() {
  const forms = [
    {
      formId: "trackerForm",
      inputId: "trackingInput",
      resultId: "trackingResult",
    },
    {
      formId: "trackerFormMobile",
      inputId: "trackingInputMobile",
      resultId: "trackingResultMobile",
    },
  ];

  forms.forEach(({ formId, inputId, resultId }) => {
    const form = document.getElementById(formId);
    const resultDiv = document.getElementById(resultId);
    if (!form || !resultDiv) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputEl = document.getElementById(inputId);
      if (!inputEl) return;
      const trackingNum = inputEl.value.trim().toUpperCase();

      if (!trackingNum) return;

      // Display loading state
      resultDiv.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-secondary mb-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted fs-7">Querying international manifest database...</p>
            </div>
        `;

      // Simulate API fetch delay
      setTimeout(() => {
        let statusStep = 1; // Default: Order Received
        let location = "San Francisco Distribution Center, USA";
        let eta = "Oct 12, 2026";
        let statusText = "Shipment Info Received";

        // Conditional responses depending on entered digits
        if (trackingNum.includes("70809") || trackingNum.endsWith("9")) {
          statusStep = 5; // Delivered
          location = "London Gateway Fulfilment, UK";
          eta = "Delivered (Oct 24, 2026)";
          statusText = "Delivered & Signed";
        } else if (trackingNum.includes("45612") || trackingNum.endsWith("2")) {
          statusStep = 4; // Out for Delivery
          location = "London Central Depot, UK";
          eta = "Today, by 6:00 PM";
          statusText = "Out for Delivery";
        } else if (trackingNum.includes("12345") || trackingNum.endsWith("5")) {
          statusStep = 3; // In Transit
          location = "North Atlantic Sea Transit";
          eta = "Oct 28, 2026";
          statusText = "In Sea Transit";
        } else if (trackingNum.includes("98765") || trackingNum.endsWith("0")) {
          statusStep = 2; // Departed Origin
          location = "New York Harbor Hub, USA";
          eta = "Nov 02, 2026";
          statusText = "Cargo Loaded on Vessel";
        }

        // Build Timeline HTML
        const steps = [
          { title: "Received", desc: "Cargo Manifest Registered" },
          { title: "Processed", desc: "Cleared Warehouse Origin" },
          { title: "In Transit", desc: "En Route to Destination Hub" },
          { title: "Out for Delivery", desc: "Dispatched with Local Courier" },
          { title: "Delivered", desc: "Successfully Signed & Closed" },
        ];

        let stepsHtml = "";
        let progressWidth = "0%";
        if (statusStep > 1) {
          progressWidth = `${((statusStep - 1) / (steps.length - 1)) * 100}%`;
        }

        steps.forEach((step, idx) => {
          const currentIdx = idx + 1;
          let stepClass = "";
          let icon = `<i class="fas fa-circle fs-8"></i>`;

          if (currentIdx < statusStep) {
            stepClass = "completed";
            icon = `<i class="fas fa-check fs-8"></i>`;
          } else if (currentIdx === statusStep) {
            stepClass = "active";
            icon = `<i class="fas fa-shipping-fast fs-7"></i>`;
          }

          stepsHtml += `
                      <div class="timeline-step-item ${stepClass}">
                          <div class="timeline-step-dot">${icon}</div>
                          <div class="timeline-step-title mt-1">${step.title}</div>
                          <div class="text-muted fs-8 d-none d-md-block">${step.desc}</div>
                      </div>
                  `;
        });

        resultDiv.innerHTML = `
                  <div class="card bg-white border border-light shadow-sm p-4 mt-3 rounded-3 animate__animated animate__fadeIn">
                      <div class="row align-items-center mb-4">
                          <div class="col-md-6">
                              <span class="badge bg-secondary text-white py-2 px-3 mb-2 fs-8 text-uppercase tracking-wider">Active Timeline</span>
                              <h5 class="fw-bold mb-1 text-primary">Shipment: ${trackingNum}</h5>
                              <p class="text-muted fs-7 mb-0">Current Location: <strong>${location}</strong></p>
                          </div>
                          <div class="col-md-6 text-md-end mt-2 mt-md-0">
                              <span class="fs-8 text-muted d-block">Estimated Arrival:</span>
                              <span class="fw-extrabold text-primary fs-5">${eta}</span>
                          </div>
                      </div>
                      
                      <!-- Horizontal Timeline Container -->
                      <div class="timeline-steps my-4">
                          <div class="timeline-progress-bar" style="width: ${progressWidth};"></div>
                          ${stepsHtml}
                      </div>
                  </div>
              `;
      }, 1200);
    });
  });
}

/**
 * Shipping price quote estimator logic.
 */
function setupQuoteCalculator() {
  const form = document.getElementById("quoteCalculatorForm");
  const resultDiv = document.getElementById("calculatorResult");
  if (!form || !resultDiv) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Grab inputs
    const weight = parseFloat(document.getElementById("calcWeight").value) || 0;
    const length = parseFloat(document.getElementById("calcLength").value) || 0;
    const width = parseFloat(document.getElementById("calcWidth").value) || 0;
    const height = parseFloat(document.getElementById("calcHeight").value) || 0;
    const service = document.getElementById("calcService").value;
    const origin = document.getElementById("calcOrigin").value;
    const destination = document.getElementById("calcDest").value;

    if (weight <= 0 || length <= 0 || width <= 0 || height <= 0) {
      resultDiv.innerHTML = `<div class="alert alert-danger fs-7 py-2">Please enter positive dimensions & weight.</div>`;
      return;
    }

    // Calculate volumetric weight: (L * W * H) / 5000 (standard IATA pricing model)
    const volumetricWeight = (length * width * height) / 5000;
    const chargeableWeight = Math.max(weight, volumetricWeight);

    // Service Multipliers
    let ratePerKg = 2.5; // Road base rate
    let serviceName = "Road Transport";
    let days = "5 - 7 Days";

    if (service === "air") {
      ratePerKg = 6.2;
      serviceName = "Air Freight Standard";
      days = "2 - 3 Days";
    } else if (service === "sea") {
      ratePerKg = 1.8;
      serviceName = "Ocean Container Freight";
      days = "18 - 25 Days";
    } else if (service === "express") {
      ratePerKg = 9.8;
      serviceName = "Next-Day Priority Express";
      days = "1 Day (Guaranteed)";
    }

    // Simple country distance multiplier (mockup)
    let routeMultiplier = 1.0;
    if (origin !== destination) {
      routeMultiplier = 1.45; // International fee
    }

    const subtotal = chargeableWeight * ratePerKg * routeMultiplier;
    const handlingFee = 25.0;
    const fuelSurcharge = subtotal * 0.08;
    const total = subtotal + handlingFee + fuelSurcharge;

    resultDiv.innerHTML = `
            <div class="card bg-light border-0 p-4 mt-3 rounded-3 animate__animated animate__fadeIn">
                <h6 class="fw-bold text-primary mb-3 border-bottom pb-2"><i class="fas fa-receipt me-2 text-accent"></i>Estimate Shipping Cost</h6>
                <div class="d-flex justify-content-between mb-2 fs-7">
                    <span class="text-muted">Selected Service:</span>
                    <strong class="text-primary">${serviceName}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2 fs-7">
                    <span class="text-muted">Transit Schedule:</span>
                    <span class="text-primary fw-semibold"><i class="far fa-calendar-alt me-1"></i> ${days}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 fs-7">
                    <span class="text-muted">Chargeable Cargo Mass:</span>
                    <strong class="text-primary">${chargeableWeight.toFixed(1)} kg <span class="fw-normal text-muted fs-8">(${weight.toFixed(1)} kg physical / ${volumetricWeight.toFixed(1)} kg dim)</span></strong>
                </div>
                <hr class="my-2 border-secondary border-opacity-25">
                <div class="d-flex justify-content-between mb-2 fs-7">
                    <span class="text-muted">Freight Subtotal:</span>
                    <strong class="text-primary">$${subtotal.toFixed(2)}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2 fs-7">
                    <span class="text-muted">Terminal Handling Fee:</span>
                    <strong class="text-primary">$${handlingFee.toFixed(2)}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2 fs-7">
                    <span class="text-muted">Fuel Surcharge (8%):</span>
                    <strong class="text-primary">$${fuelSurcharge.toFixed(2)}</strong>
                </div>
                <hr class="my-2 border-secondary border-opacity-25">
                <div class="d-flex justify-content-between mb-0 align-items-center">
                    <span class="fw-bold text-primary">Estimated Total:</span>
                    <span class="fw-extrabold text-accent fs-4">$${total.toFixed(2)}</span>
                </div>
                <div class="text-muted fs-8 mt-3 text-center">
                    <i class="fas fa-info-circle me-1"></i> Estimates are tentative, subject to spot customs rates.
                </div>
            </div>
        `;
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
      // Allow Bootstrap collapse/toggle triggers to function without redirect
      if (
        anchor.hasAttribute("data-bs-toggle") ||
        anchor.hasAttribute("data-bs-target") ||
        anchor.classList.contains("dropdown-toggle") ||
        anchor.closest(".carousel-control-prev") ||
        anchor.closest(".carousel-control-next")
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
