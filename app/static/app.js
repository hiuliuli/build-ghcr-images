const API_BASE = "/devices";

let deleteTarget = null;

async function fetchDevices() {
    try {
        const res = await fetch(API_BASE + "/");
        const devices = await res.json();
        renderCards(devices);
    } catch (e) {
        toast("加载设备列表失败", "error");
    }
}

function renderCards(devices) {
    const grid = document.getElementById("deviceCards");
    const emptyMsg = document.getElementById("emptyMsg");

    if (devices.length === 0) {
        grid.innerHTML = "";
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";
    grid.innerHTML = devices
        .map(
            (d) => `
        <div class="device-card">
            <h3>${esc(d.device_name)}</h3>
            <div class="info">
                <span class="label">主机</span><span class="value">${esc(d.host)}</span>
                <span class="label">端口</span><span class="value">${d.port}</span>
                <span class="label">MAC</span><span class="value"><code>${esc(d.mac)}</code></span>
            </div>
            <div class="card-actions">
                <button class="btn btn-wake" onclick="wakeDevice('${d.id}', this)">唤醒</button>
                <button class="btn" onclick="editDevice('${d.id}')">编辑</button>
                <button class="btn btn-danger" onclick="confirmDelete('${d.id}', '${esc(d.device_name)}')">删除</button>
            </div>
        </div>`
        )
        .join("");
}

async function wakeDevice(id, btn) {
    btn.disabled = true;
    btn.textContent = "发送中...";
    try {
        const res = await fetch(API_BASE + "/" + id + "/wake", { method: "POST" });
        const data = await res.json();
        toast(data.message || "唤醒包已发送", "success");
    } catch (e) {
        toast("唤醒请求失败", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "唤醒";
    }
}

function openForm() {
    document.getElementById("dialogTitle").textContent = "添加设备";
    document.getElementById("deviceForm").reset();
    document.getElementById("deviceId").value = "";
    document.getElementById("deviceDialog").showModal();
}

function closeDialog() {
    document.getElementById("deviceDialog").close();
}

async function editDevice(id) {
    try {
        const res = await fetch(API_BASE + "/" + id);
        const d = await res.json();
        document.getElementById("dialogTitle").textContent = "编辑设备";
        document.getElementById("deviceId").value = d.id;
        document.getElementById("deviceName").value = d.device_name;
        document.getElementById("host").value = d.host;
        document.getElementById("port").value = d.port;
        document.getElementById("mac").value = d.mac;
        document.getElementById("deviceDialog").showModal();
    } catch (e) {
        toast("获取设备信息失败", "error");
    }
}

async function submitForm(e) {
    e.preventDefault();

    const id = document.getElementById("deviceId").value;
    const payload = {
        device_name: document.getElementById("deviceName").value,
        host: document.getElementById("host").value,
        port: parseInt(document.getElementById("port").value),
        mac: document.getElementById("mac").value,
    };

    const url = id ? API_BASE + "/" + id : API_BASE + "/";
    const method = id ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json();
            toast(err.error || "操作失败", "error");
            return;
        }

        closeDialog();
        fetchDevices();
        toast(id ? "设备已更新" : "设备已添加", "success");
    } catch (e) {
        toast("请求失败", "error");
    }
}

function confirmDelete(id, name) {
    deleteTarget = id;
    document.getElementById("confirmName").textContent = name;
    document.getElementById("confirmDialog").showModal();
}

function closeConfirm() {
    deleteTarget = null;
    document.getElementById("confirmDialog").close();
}

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
    if (!deleteTarget) return;
    try {
        const res = await fetch(API_BASE + "/" + deleteTarget, { method: "DELETE" });
        if (res.ok) {
            toast("设备已删除", "success");
            fetchDevices();
        }
    } catch (e) {
        toast("删除失败", "error");
    } finally {
        closeConfirm();
    }
});

function toast(message, type) {
    const el = document.createElement("div");
    el.className = "toast toast-" + type;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}

function esc(str) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return str.replace(/[&<>"']/g, (c) => map[c]);
}

fetchDevices();
