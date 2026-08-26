const revealItems = document.querySelectorAll("[data-reveal]");

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

for (const item of revealItems) {
  observer.observe(item);
}

const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 16) {
    header.style.boxShadow = "0 14px 40px rgba(0, 0, 0, 0.36)";
  } else {
    header.style.boxShadow = "none";
  }
});
