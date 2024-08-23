document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".verticalCont");
  const sections = document.querySelectorAll(".section");
  let currentIndex = 0;
  let isAnimating = false;

  function scrollToSection(index) {
    if (index >= 0 && index < sections.length && !isAnimating) {
      isAnimating = true;
      container.style.transform = `translateY(-${index * 100}vh)`; 

      sections.forEach((section) => section.classList.remove("active"));

      setTimeout(() => {
        sections[index].classList.add("active");
        isAnimating = false;
      }, 500);

      currentIndex = index;
    }
  }

  window.addEventListener("wheel", (event) => {
    if (!isAnimating) {
      if (event.deltaY > 0) {
        scrollToSection(currentIndex + 1);
      } else if (event.deltaY < 0) {
        scrollToSection(currentIndex - 1);
      }
    }
  });

  window.addEventListener("resize", () => {
    container.style.transform = `translateY(-${currentIndex * 100}vh)`;
  });

  scrollToSection(currentIndex);
});
