document.addEventListener('DOMContentLoaded', () => {

    const sbdInput = document.getElementById('sbdInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultContainer = document.getElementById('resultContainer');

    let studentData = [];

    // ===== PARSE CSV =====
    function parseCSV(text) {
        const lines = text.split('\n').filter(l => l.trim());
        const delimiter = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(delimiter).map(h => h.trim());

        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const row = [];
            let current = '';
            let inQuotes = false;

            for (let char of lines[i]) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === delimiter && !inQuotes) {
                    row.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            row.push(current.trim());

            if (row.length === headers.length) {
                const obj = {};
                headers.forEach((h, idx) => {
                    obj[h] = row[idx];
                });
                data.push(obj);
            }
        }

        return data;
    }

    // ===== LOAD DATA =====
    async function loadData() {
        try {
            const res = await fetch('DIEM_THI_TS10.csv');
            const text = await res.text();
            studentData = parseCSV(text);
        } catch (err) {
            resultContainer.innerHTML = '<p style="color:red">Không tải được dữ liệu!</p>';
        }
    }

    // ===== TÌM HỌC SINH =====
    function findStudent(sbd) {
        return studentData.find(s => String(s['SBD']).trim() === sbd);
    }

    // ===== FORMAT ĐIỂM =====
    function getScore(val) {
        if (!val) return 0;
        val = val.replace(',', '.');
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    }

    // ===== HIỂN THỊ KẾT QUẢ =====
  function getField(data, names) {
    const keys = Object.keys(data);
    for (let name of names) {
        const found = keys.find(k => k.trim().toLowerCase() === name.toLowerCase());
        if (found) return data[found];
    }
    return '';
}

function getScore(data, names) {
    let val = getField(data, names);
    if (!val) return 0;
    val = val.toString().replace(',', '.');
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
}

function displayStudent(data) {

    const toan = getScore(data, ['TOÁN', 'Toán']);
    const van = getScore(data, ['VĂN', 'Ngữ văn']);
    const anh = getScore(data, ['ANH', 'Tiếng Anh']);

    const total = toan + van + anh;

    const html = `
    <div class="report-container">

        <div class="report-title">
            KẾT QUẢ TUYỂN SINH VÀO LỚP 10
        </div>

        <table class="info-table">
           <tr>
    <td><strong>SBD</strong></td>
    <td>${getField(data, ['SBD'])}</td>
</tr>
<tr>
    <td><strong>Họ và tên</strong></td>
    <td colspan="3">${getField(data, ['HỌ VÀ TÊN','Họ và tên'])}</td>
</tr>
<tr>
    <td><strong>Ngày sinh</strong></td>
    <td colspan="3">${getField(data, ['NGÀY SINH','Ngày sinh'])}</td>
</tr>

            <tr>
                <td><strong>Trường</strong></td>
                <td colspan="3">${getField(data, ['TRƯỜNG','Trường'])}</td>
            </tr>
            <tr>
                <td><strong>Cơ sở</strong></td>
                <td colspan="3">${getField(data, ['CƠ SỞ','Cơ sở'])}</td>
            </tr>
        </table>

        <table class="score-table">
            <thead>
                <tr>
                    <th>Môn</th>
                    <th>Điểm</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Toán</td>
                    <td>${toan}</td>
                </tr>
                <tr>
                    <td>Ngữ văn</td>
                    <td>${van}</td>
                </tr>
                <tr>
                    <td>Tiếng Anh</td>
                    <td>${anh}</td>
                </tr>
            </tbody>
        </table>

        <div class="total-box">
            TỔNG ĐIỂM: <span>${total}</span>
        </div>

    </div>
    `;

    resultContainer.innerHTML = html;
}
    // ===== SỰ KIỆN CLICK =====
    searchBtn.addEventListener('click', async () => {

        const sbd = sbdInput.value.trim();

        if (!sbd) {
            resultContainer.innerHTML = '<p style="color:red">Vui lòng nhập SBD!</p>';
            return;
        }

        if (studentData.length === 0) {
            await loadData();
        }

        const student = findStudent(sbd);

        if (!student) {
            resultContainer.innerHTML = `<p style="color:orange">Không tìm thấy SBD <strong>${sbd}</strong></p>`;
        } else {
            displayStudent(student);
        }
    });

    // ===== ENTER ĐỂ TRA CỨU =====
    sbdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

});