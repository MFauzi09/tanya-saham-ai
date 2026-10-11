(function () {
  var script = document.currentScript;
  var origin = new URL(script.src).origin;
  var color = script.getAttribute("data-color") || "#059669";
  var side = script.getAttribute("data-position") === "bottom-left" ? "left" : "right";
  var open = false;

  var frame = document.createElement("iframe");
  frame.src = origin + "/embed";
  frame.title = "Tanya Saham AI";
  frame.style.cssText =
    "position:fixed;bottom:92px;" + side + ":20px;width:min(380px,calc(100vw - 40px));height:min(560px,calc(100vh - 120px));" +
    "border:0;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.2);z-index:2147483646;display:none;background:#fff;" +
    "transform-origin:bottom " + side + ";transition:transform .2s ease,opacity .2s ease;opacity:0;transform:scale(.9)";

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Buka Tanya Saham AI");
  button.style.cssText =
    "position:fixed;bottom:20px;" + side + ":20px;width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;" +
    "background:" + color + ";color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.25);z-index:2147483647;display:grid;place-items:center";
  button.innerHTML =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  function toggle(next) {
    open = typeof next === "boolean" ? next : !open;
    frame.style.display = "block";
    requestAnimationFrame(function () {
      frame.style.opacity = open ? "1" : "0";
      frame.style.transform = open ? "scale(1)" : "scale(.9)";
    });
    if (!open) setTimeout(function () { if (!open) frame.style.display = "none"; }, 200);
    button.setAttribute("aria-expanded", String(open));
  }

  button.addEventListener("click", function () { toggle(); });
  window.addEventListener("message", function (event) {
    if (event.origin === origin && event.data && event.data.type === "tsa:close") toggle(false);
  });

  document.body.appendChild(frame);
  document.body.appendChild(button);
})();
