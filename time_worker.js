var i = 0.;
var offset;
var time = 0;


this.onmessage = function(event) {
    if (event.data !== undefined) {
        offset = event.data;
        time += offset / 1000 / 26364;
        postMessage(time);
      }
}