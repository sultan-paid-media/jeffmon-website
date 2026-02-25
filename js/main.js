// Navbar scroll effect
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 60) {
    navbar.style.background = "rgba(10,22,40,1)";
  } else {
    navbar.style.background = "rgba(10,22,40,0.95)";
  }
});

