// Shared navigation — included on every protected page
(function () {
  if (!api.getToken()) { window.location = '/index.html'; return; }

  const pages = [
    { href: '/dashboard.html',    label: '📊 Dashboard' },
    { href: '/transactions.html', label: '💳 Transactions' },
    { href: '/budgets.html',      label: '🎯 Budgets' },
    { href: '/reports.html',      label: '📈 Reports' },
    { href: '/profile.html',      label: '👤 Profile' },
  ];

  const nav = document.createElement('nav');
  nav.innerHTML = `
    <div class="container">
      <div class="inner">
        <span class="brand">💰 Finance Tracker</span>
        ${pages.map(p =>
          `<a href="${p.href}" class="${location.pathname === p.href ? 'active' : ''}">${p.label}</a>`
        ).join('')}
        <span class="user-info" id="navUser"></span>
        <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
      </div>
    </div>`;
  document.body.prepend(nav);

  // Load user name
  api.get('/auth/me').then(u => {
    document.getElementById('navUser').textContent = u.name;
  }).catch(() => {});

  window.logout = () => {
    api.clearToken();
    window.location = '/index.html';
  };

  // Notification badge
  api.get('/notifications').then(notifs => {
    const unread = notifs.filter(n => !n.is_read).length;
    if (unread > 0) {
      const a = nav.querySelector(`a[href="/dashboard.html"]`);
      if (a) a.innerHTML += ` <span style="background:var(--danger);color:#fff;font-size:11px;padding:1px 5px;border-radius:999px">${unread}</span>`;
    }
  }).catch(() => {});
})();
