import {
  render,
} from './draw.js'

export function genRequestAnimFunction({root, game, canvas, callback, tick}) {
  var lastTimestamp = 0;
  var needsRender = true;
  var lastPauseState = false;
  
  var requestAnim = function (timestamp) {
    var elapsed = timestamp - (lastTimestamp || timestamp);
    elapsed = elapsed / 1000.0;
    
    // Check if pause state changed
    var pauseStateChanged = (game.pause !== lastPauseState);
    lastPauseState = game.pause;
    
    tick(game, elapsed);
    
    // Only render if game is not paused, or if pause state just changed, or if we need to render
    if (!game.pause || pauseStateChanged || needsRender) {
      render(game, canvas);
      needsRender = false;
    }
    
    lastTimestamp = timestamp;
    callback(requestAnim);
  };
  
  // Expose function to request render (for resize events)
  requestAnim.requestRender = function() {
    needsRender = true;
  };
  
  return requestAnim;
}
