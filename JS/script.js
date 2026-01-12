const menuBtn = document.querySelector(".menu");
const navList = document.querySelector(".navbar ul");

menuBtn.addEventListener("click", () => {
    navList.style.display = navList.style.display === "flex" ? "none" : "flex";
});
