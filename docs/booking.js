
//TODO:
function toggleSideNav() {
  const sideNav = document.getElementById("sideNav");
  sideNav.classList.toggle("open");
}

const endpoint = 'https://script.google.com/macros/s/AKfycbwMWN--sM2cg6mpAcw1IiUhhg558xuyejRghmJ0GnvMcz2WDM-8EDeNprLo-s4XHbGH/exec';

const escapeHTML = function (s) {
  return s.replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
};

function fetchReviews() {
  fetch(endpoint + '?action=getReviews').then(response => response.json()).then(function (data) {
    let reviewsHtml = '';
    data.forEach(function (review) {
      reviewsHtml += `
        <div class="feedback-card">
          <p class="feedback-message">${escapeHTML(review.reviewText)}</p>
          <p class="feedback-author">${escapeHTML(review.name)}</p>
        </div>
      `;
    });
    document.getElementById('reviews-container').innerHTML += reviewsHtml;
  });
}

function fetchTimeslots() {
  fetch(endpoint).then(response => response.json()).then(function (response) {
    console.log(response);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  fetchReviews();
  fetchTimeslots();

  const form = document.getElementById("bookingForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = {
      name: form.name.value,
      email: form.email.value,
      date: form.date.value,
      time: form.time.value
    };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then(function (data) {
      if (data.status === "SUCCESS") {
        alert("Booking successful!");
        form.reset();
      }
    })
    .catch((error) => console.error("Error:", error));
  });
});
