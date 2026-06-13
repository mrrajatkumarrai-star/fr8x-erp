import { APP_PASSWORD } from "../services/config.js";

export class LockScreen {
  constructor(onUnlocked) {
    this.onUnlocked = onUnlocked;
  }

  checkSession() {
    if (sessionStorage.getItem("freightos_unlocked") === "true") {
      this.onUnlocked();
      return true;
    }
    return false;
  }

  render() {
    if (this.checkSession()) return "";

    const container = document.createElement("div");
    container.className = "lock-wrapper";
    container.id = "lock-screen-gate";

    container.innerHTML = `
      <div class="lock-card">
        <div class="lock-icon"><i class="ti ti-lock"></i></div>
        <h2 style="font-size:20px; font-weight:600; margin-bottom:8px;">FreightOS ERP</h2>
        <p style="font-size:12px; color:rgba(255,255,255,0.6); margin-bottom:24px;">Enter administrative passcode to unlock terminal</p>
        <div style="margin-bottom:16px;">
          <input type="password" id="lock-passcode" placeholder="Passcode" style="width:100%; padding:10px 14px; font-size:14px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:rgba(15,23,42,0.6); color:#fff; text-align:center; outline:none;"/>
        </div>
        <div id="lock-error" style="color:var(--danger); font-size:11px; margin-bottom:12px; display:none; font-weight:500;">Incorrect Passcode</div>
        <button id="lock-submit-btn" class="btn pr" style="width:100%; justify-content:center; padding:10px;">Unlock System</button>
      </div>
    `;

    // Hook up unlock check event
    setTimeout(() => {
      const input = document.getElementById("lock-passcode");
      const btn = document.getElementById("lock-submit-btn");
      const err = document.getElementById("lock-error");

      if (input) {
        input.focus();
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") this.attemptUnlock(input.value, err);
        });
      }

      if (btn) {
        btn.onclick = () => this.attemptUnlock(input.value, err);
      }
    }, 50);

    return container;
  }

  attemptUnlock(val, errEl) {
    if (val === APP_PASSWORD) {
      sessionStorage.setItem("freightos_unlocked", "true");
      document.getElementById("lock-screen-gate")?.remove();
      this.onUnlocked();
    } else {
      errEl.style.display = "block";
      errEl.textContent = "Incorrect Passcode";
      setTimeout(() => { errEl.style.display = "none"; }, 2500);
    }
  }
}
