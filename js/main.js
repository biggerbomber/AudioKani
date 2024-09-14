document.getElementById('api-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const apiKey = document.getElementById('api-key').value;
    const url = 'https://api.wanikani.com/v2/subjects?types=vocabulary';
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Handle the response data here
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle the error here
    });

    window.location.href="lisening.html";
});