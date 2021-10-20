
window.addEventListener('load', (event) => {
    // console.log('The page has fully loaded');
    fetch('/get-user-data') 
  .then(response => response.json())
  .then(data => {
      console.log(data);
      console.log(document.getElementById('nameLogin'));
      document.getElementById('profile-photo').src = data.picture;
      document.getElementById('user-name-surname').innerHTML = data.name;
      document.getElementById('user-nickname').innerHTML = data.nickname;
      document.getElementById('email').innerHTML = data.email;
  });
});