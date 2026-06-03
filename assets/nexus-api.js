/**
 * Nexus AI API Client
 * 使用 Meoo Cloud (Supabase) 作为后端
 */

(function () {
  "use strict";

  // Meoo Cloud API 配置
  const API_BASE = "https://dwe2psccef7z.meoo.cloud/sb-api";
  const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc5OTczODE4LCJleHAiOjEzMjkwNjEzODE4fQ.caALNpecwtLlBY752O8D67Xfp8Ou9T_jj0jv2ZXxAHA';

  /* —— Token / user storage —— */
  let _token = localStorage.getItem("nx_token") || "";
  let _user  = null;
  try { _user = JSON.parse(localStorage.getItem("nx_user") || "null"); } catch(e){ _user = null; }

  /* —— Helper: request —— */
  async function _request(path, opts = {}) {
    const url = API_BASE + "/rest/v1" + path;
    const headers = {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      ...(opts.headers || {})
    };
    if (_token) headers["Authorization"] = "Bearer " + _token;

    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || ("HTTP " + res.status));
    }
    // 204 无内容
    if (res.status === 204) return null;
    return res.json();
  }

  /* —— Auth —— */
  async function _authRequest(endpoint, body) {
    const url = API_BASE + "/auth/v1/" + endpoint;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || ("HTTP " + res.status));
    return data;
  }

  /* —— Public API —— */
  const NexusAPI = {
    /* Auth state */
    isLoggedIn() { return !!_token; },
    getToken()   { return _token; },
    getUser()    { return _user; },

    /* Register */
    async register(email, password, fullName) {
      const data = await _authRequest("signup", {
        email,
        password,
        data: { full_name: fullName }
      });
      if (data.session) {
        _token = data.session.access_token;
        _user  = data.user;
        localStorage.setItem("nx_token", _token);
        localStorage.setItem("nx_user", JSON.stringify(_user));
      }
      return { id: data.user.id, email: data.user.email, full_name: fullName, is_active: true };
    },

    /* Login */
    async login(email, password) {
      const data = await _authRequest("token?grant_type=password", { email, password });
      _token = data.access_token;
      _user  = data.user;
      localStorage.setItem("nx_token", _token);
      localStorage.setItem("nx_user", JSON.stringify(_user));
      return {
        access_token: _token,
        token_type: "bearer",
        user: {
          id: _user.id,
          email: _user.email,
          full_name: _user.user_metadata?.full_name || _user.email.split("@")[0]
        }
      };
    },

    /* Logout */
    logout() {
      _token = "";
      _user  = null;
      localStorage.removeItem("nx_token");
      localStorage.removeItem("nx_user");
      localStorage.removeItem("nx_current_case");
    },

    /* Get current user from server */
    async me() {
      if (!_token) return null;
      const data = await _request("/auth/v1/user");
      _user = data;
      localStorage.setItem("nx_user", JSON.stringify(_user));
      return {
        id: _user.id,
        email: _user.email,
        full_name: _user.user_metadata?.full_name || _user.email.split("@")[0],
        is_active: true
      };
    },

    /* —— Cases —— */
    async listCases() {
      return _request("/cases?select=*&order=created_at.desc");
    },

    async getCase(id) {
      const data = await _request(`/cases?id=eq.${id}&select=*`);
      return data && data[0] ? data[0] : null;
    },

    async createCase(payload) {
      // 确保 student_id 是当前用户
      if (!_user) throw new Error("未登录");
      const body = {
        ...payload,
        student_id: _user.id,
        status: payload.status || "pending"
      };
      const data = await _request("/cases", { method: "POST", body: JSON.stringify(body) });
      return data && data[0] ? data[0] : data;
    },

    async updateCase(id, updates) {
      const data = await _request(`/cases?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(updates) });
      return data && data[0] ? data[0] : data;
    },

    async deleteCase(id) {
      return _request(`/cases?id=eq.${id}`, { method: "DELETE" });
    },

    /* —— AI Analysis (Edge Function) —— */
    async analyzeCase(caseId) {
      // 获取案例数据
      const caseData = await this.getCase(caseId);
      if (!caseData) {
        throw new Error("案例不存在");
      }

      // 转换为 background_data 格式调用 case-analysis
      const backgroundData = {
        title: caseData.title,
        background: caseData.background,
        target_schools: caseData.target_schools,
        gpa: caseData.gpa,
        ielts_score: caseData.ielts_score,
        description: caseData.description
      };

      return this.analyzeCaseFull(backgroundData);
    },

    /* —— Full Case Analysis with AI (Edge Function) —— */
    async analyzeCaseFull(backgroundData) {
      // Build background text for AI analysis
      const backgroundText = `
学校：${backgroundData.school || '未填写'}；
GPA：${backgroundData.gpa || '未填写'}；
语言成绩：${backgroundData.language || '未填写'}；
目标方向：${backgroundData.direction || '未填写'}；
目标学校：${backgroundData.target_schools || '未填写'}；
其他背景：${backgroundData.description || '无'}
`.trim();

      const res = await fetch(`${API_BASE}/functions/v1/case-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          background: backgroundText,
          action: 'full'
        })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || ("HTTP " + res.status));
      }

      return result.data;
    },

    /* —— Get Timeline from AI (Edge Function) —— */
    async getTimeline(backgroundData) {
      const backgroundText = `
学校：${backgroundData.school || '未填写'}；
GPA：${backgroundData.gpa || '未填写'}；
语言成绩：${backgroundData.language || '未填写'}；
目标方向：${backgroundData.direction || '未填写'}；
目标学校：${backgroundData.target_schools || '未填写'}；
其他背景：${backgroundData.description || '无'}
`.trim();

      const res = await fetch(`${API_BASE}/functions/v1/case-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          background: backgroundText,
          action: 'timeline'
        })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || ("HTTP " + res.status));
      }

      return result.data.timeline;
    },

    /* —— Advisors —— */
    async listAdvisors(filters = {}) {
      let query = "/advisors?select=*";
      if (filters.specialty) query += "&specialty=ilike.*" + encodeURIComponent(filters.specialty) + "*";
      if (filters.min_rating) query += "&rating=gte." + filters.min_rating;
      if (filters.max_price) query += "&price_per_hour=lte." + filters.max_price;
      return _request(query);
    },

    async getAdvisor(id) {
      const data = await _request(`/advisors?id=eq.${id}&select=*`);
      return data && data[0] ? data[0] : null;
    },

    /* —— UI Helpers —— */
    showToast(msg) {
      const t = document.createElement("div");
      t.className = "nx-toast";
      t.textContent = msg;
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add("show"));
      setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 250); }, 2200);
    },

    showAuthModal(mode) {
      const overlay = document.getElementById("nx-auth-overlay") || _createAuthOverlay();
      overlay.classList.add("open");
      _setAuthMode(mode || "login");
    },

    closeAuthModal() {
      const overlay = document.getElementById("nx-auth-overlay");
      if (overlay) overlay.classList.remove("open");
    },

    animateAiResult(el) {
      if (!el) return;
      const children = Array.from(el.children);
      children.forEach((c, i) => {
        c.style.opacity = "0";
        c.style.transform = "translateY(12px)";
        c.style.transition = "opacity .35s ease, transform .35s ease";
        setTimeout(() => { c.style.opacity = "1"; c.style.transform = "none"; }, i * 90);
      });
    }
  };

  /* —— Auth Modal UI —— */
  function _createAuthOverlay() {
    const div = document.createElement("div");
    div.id = "nx-auth-overlay";
    div.className = "nx-auth-overlay";
    div.innerHTML = `
      <div class="nx-auth-panel" role="dialog" aria-modal="true">
        <div class="nx-auth-head">
          <div class="nx-auth-logo">NX</div>
          <strong id="nx-auth-title">登录</strong>
          <button class="nx-close-btn" onclick="NexusAPI.closeAuthModal()" aria-label="关闭">×</button>
        </div>
        <form id="nx-auth-form" onsubmit="return false;">
          <label class="nx-label">邮箱</label>
          <input class="nx-input" id="nx-auth-email" type="email" placeholder="your@email.com" required />
          <label class="nx-label">密码</label>
          <input class="nx-input" id="nx-auth-password" type="password" placeholder="••••••••" required />
          <label class="nx-label" id="nx-name-label" style="display:none;">姓名（可选）</label>
          <input class="nx-input" id="nx-auth-name" type="text" placeholder="张三" style="display:none;" />
          <div class="nx-auth-error" id="nx-auth-error" style="display:none;"></div>
          <button class="nx-btn-submit" id="nx-auth-submit" type="submit">登录</button>
        </form>
        <div class="nx-switch-text">
          <span id="nx-switch-hint">还没有账号？</span>
          <button class="nx-link-btn" id="nx-switch-btn" onclick="_toggleAuthMode()">立即注册</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    // 点击遮罩关闭
    div.addEventListener("click", (e) => { if (e.target === div) NexusAPI.closeAuthModal(); });

    // 表单提交
    const form = div.querySelector("#nx-auth-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("nx-auth-email").value.trim();
      const password = document.getElementById("nx-auth-password").value;
      const name = document.getElementById("nx-auth-name").value.trim();
      const errEl = document.getElementById("nx-auth-error");
      const btn = document.getElementById("nx-auth-submit");
      errEl.style.display = "none";
      btn.disabled = true;
      btn.textContent = "处理中…";

      try {
        const isReg = document.getElementById("nx-name-label").style.display !== "none";
        if (isReg) {
          await NexusAPI.register(email, password, name || email.split("@")[0]);
          NexusAPI.showToast("注册成功 ✓");
        } else {
          await NexusAPI.login(email, password);
          NexusAPI.showToast("登录成功 ✓");
        }
        NexusAPI.closeAuthModal();
        _updateAuthNav();
        if (window._nxOnAuthSuccess) window._nxOnAuthSuccess();
      } catch (err) {
        errEl.textContent = err.message || "请求失败";
        errEl.style.display = "";
      } finally {
        btn.disabled = false;
        btn.textContent = document.getElementById("nx-name-label").style.display !== "none" ? "注册" : "登录";
      }
    });

    return div;
  }

  function _setAuthMode(mode) {
    const isReg = mode === "register";
    document.getElementById("nx-auth-title").textContent = isReg ? "注册" : "登录";
    document.getElementById("nx-auth-submit").textContent = isReg ? "注册" : "登录";
    document.getElementById("nx-name-label").style.display = isReg ? "" : "none";
    document.getElementById("nx-auth-name").style.display = isReg ? "" : "none";
    document.getElementById("nx-switch-hint").textContent = isReg ? "已有账号？" : "还没有账号？";
    document.getElementById("nx-switch-btn").textContent = isReg ? "立即登录" : "立即注册";
    document.getElementById("nx-auth-error").style.display = "none";
  }

  window._toggleAuthMode = function() {
    const isReg = document.getElementById("nx-name-label").style.display === "none";
    _setAuthMode(isReg ? "register" : "login");
  };

  /* —— Auth Nav Widget —— */
  function _updateAuthNav() {
    const slot = document.getElementById("nx-auth-nav");
    if (!slot) return;
    if (NexusAPI.isLoggedIn() && _user) {
      const name = _user.user_metadata?.full_name || _user.email.split("@")[0];
      slot.innerHTML = `
        <span class="nx-user-greeting">你好，${name}</span>
        <button class="nx-logout-btn" onclick="NexusAPI.logout(); location.reload();">退出</button>
      `;
    } else {
      slot.innerHTML = `<button class="nx-login-btn" onclick="NexusAPI.showAuthModal('login')">登录 / 注册</button>`;
    }
  }

  /* —— Init —— */
  document.addEventListener("DOMContentLoaded", () => {
    _updateAuthNav();
    // 尝试恢复 session
    if (_token && !_user) {
      NexusAPI.me().then(() => _updateAuthNav()).catch(() => {
        NexusAPI.logout();
        _updateAuthNav();
      });
    }
  });

  /* —— Expose —— */
  window.NexusAPI = NexusAPI;
})();
