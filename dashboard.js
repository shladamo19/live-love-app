
async function getRecommendation() {
  const response = await fetch('https://your-backend-url.com/recommendation');
  const data = await response.json();
  document.getElementById('app').innerText = data.message;
}
getRecommendation();
