// analytics.js
(function() {
  var script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', '{"token": "fd52cdf9074c447cb518dbfc83d77308"}');
  document.body.appendChild(script);
})();