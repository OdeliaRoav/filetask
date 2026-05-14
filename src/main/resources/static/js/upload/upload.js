var layout;
var grid;
var uploadForm;
var uploadPopupForm;
var contentLayout;
var pagination;
var selectedUserIds = new Set();


const boardManager = () => {
    createLayout();
    createGrid();
    createUploadForm();
    loadFile();
}

const createLayout = () => {
    layout = new dhx.Layout("layout", {
        type: "line",
        rows: [
            {
                css: "tabArea",
                cols: [
                    {
                        id: "sidebar",
                        header: "결과",
                        collapsable: true,
                        width: "370px",
                        resizable: true,
                        align: "center"
                    },
                    {
                        id: "content",
                        css:"contentGrid",
                        header: "Filetask",
                        resizable: true
                    },
                ]
            },
        ]
    });

    layout.getCell("sidebar").attachHTML(`
        <div id="resultArea">
            <div class="result-panel">
                <div class="result-title">처리 결과</div>
                <p class="result-empty">아직 처리 결과가 없습니다.</p>
                <p class="result-help">파일 업로드 또는 삭제 작업 후 결과가 표시됩니다.</p>
            </div>
        </div>
    `);
};

const createUploadForm = () => {
    uploadForm = new dhx.Form(null, {
        css: "upload_form",
        height: 76,
        padding: 0,
        rows: [
            {
                type: "spacer",
                height: "24px"
            },
            {
                cols:[
                    {
                        type: "button",
                        name: "openUploadPopup",
                        text: "업로드",
                        height: 32,
                        width: 96,
                        size: "small",
                        view: "flat",
                        color: "primary"
                    },
                    {
                        type: "spacer",
                        width: "18px"
                    },
                    {
                        type: "combo",
                        name: "combobox",
                        placeholder: "검색 기준",
                        width: "128px",
                        disabled: false,
                        required: false,
                        data: [
                            {id: "id", value: "ID"},
                            {id: "name", value: "NAME"},
                            {id: "level", value: "LEVEL"},
                            {id: "desc", value: "DESCRIPTION"}
                        ]
                    },
                    {
                        type: "spacer",
                        width: "18px"
                    },
                    {
                        type: "input",
                        name: "keyword",
                        placeholder: "검색어 입력",
                        width: "180px"
                    },
                    {
                        type: "spacer",
                        width: "18px"
                    },
                    {
                        type: "button",
                        name: "select",
                        text: "검색",
                        height: 32,
                        width: 60,
                        size: "small",
                        view: "flat",
                        color: "primary"
                    },
                    {
                        type: "spacer",
                        width: "18px"
                    },
                    {
                        type: "button",
                        name: "loadbtn",
                        css: "loadbtn",
                        text: "초기화",
                        height: 32,
                        width: 78,
                        size: "small",
                        view: "flat",
                        color: "primary"
                    },
                    {
                        type: "spacer",
                        width: "18px"
                    },
                    {
                        type: "button",
                        name: "deleteIdBtn",
                        text: "삭제",
                        height: 32,
                        width: 60,
                        size: "small",
                        view: "flat",
                        color: "primary"
                    },
                    {
                        type: "spacer",
                        width: "18px"
                    }
                ]
            }
        ]
    });

    uploadForm.events.on("click", function(name) {
        if(name === "openUploadPopup"){
            openUploadPopup();
        }

        if(name === "loadbtn"){
            //폼 초기화
            resetSearchForm();
            loadFile();
        }

        if(name === "select"){
            searchFile();
        }

        if(name === "deleteIdBtn"){
            deleteById();
        }

    });

    contentLayout.getCell("contentTools").attach(uploadForm);
};

function resetSearchForm() {
    const combo = uploadForm.getItem("combobox");
    if(combo && typeof combo.clear === "function"){
        combo.clear();
    }

    uploadForm.setValue({
        keyword: ""
    });
}

function openUploadPopup() {
    if(document.querySelector(".upload_popup_alert")){
        return;
    }

    const popupFormAreaId = "uploadPopupFormArea";

    dhx.alert({
        header: "파일 업로드",
        text: `<div class="contentToolArea uploadPopupContent"><div id="${popupFormAreaId}"></div></div>`,
        htmlEnable: true,
        buttonsAlignment: "center",
        buttons: ["닫기"],
        css: "upload_popup_alert"
    }).then(function() {
        uploadPopupForm = null;
        loadFile();
    });

    requestAnimationFrame(function() {
        createUploadPopupForm(popupFormAreaId);
    });
}

function createUploadPopupForm(popupFormAreaId) {
    const popupFormArea = document.getElementById(popupFormAreaId);
    if(!popupFormArea){
        return;
    }

    uploadPopupForm = new dhx.Form(popupFormArea, {
        css: "upload_popup_form",
        height: 176,
        padding: 0,
        rows: [
            {
                type: "simpleVault",
                name:"simplevault",
                label: "파일",
                labelWidth: "80px",
                labelPosition: "top",
                disabled: false,
                required: false,
                $vaultHeight: 130,
                width: "480px",
                css: "simplevault-box"
            },
            {
                css: "button_row",
                cols: [
                    {
                        type: "checkbox",
                        name: "force",
                        text: "중복 업로드 진행",
                        width: "180px"
                    },
                    {
                        type: "spacer"
                    },
                    {
                        type: "button",
                        name: "uploadbtn",
                        text: "업로드",
                        height: 36,
                        width: 96,
                        size: "medium",
                        view: "flat",
                        color: "primary"
                    }
                ]
            }
        ]
    });

    uploadPopupForm.events.on("click", function(name) {
        if(name === "uploadbtn"){
            uploadFile();
        }
    });

    // simpleVault의 파일 목록이 바뀌면 CSS에서 사용하는 파일명 표시값도 같이 갱신한다.
    uploadPopupForm.events.on("change", function(name) {
        if(name === "simplevault"){
            updateSimpleVaultFileName();
        }
    });

    initSimpleVaultFileNameSync();
}

const uploadFile =() =>{
    const formData = new FormData();
    if(!uploadPopupForm){
        showAlert("파일 업로드 창을 다시 열어주세요.");
        return;
    }

    const values = uploadPopupForm.getValue();
    const files = values.simplevault;

    // 파일을 선택하지 않은 경우 서버 요청을 보내지 않고 사용자에게 먼저 알린다.
    if(!files || files.length === 0){
        showAlert("파일을 선택하세요.");
        return;
    }

    const file = getSelectedUploadFile(files);
    if(!file){
        showAlert("파일을 다시 선택하세요.");
        return;
    }

    formData.append("file", file, file.name);

    if(values.force === true){
        formData.append("force", "true");
    }

    // multipart/form-data는 브라우저가 boundary를 직접 만들어야 하므로 processData와 contentType을 false로 둔다.
    $.ajax({
        type: "POST",
        url: "/users/upload",
        data: formData,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function (res) {
            showUploadResult(res);
            if(res.successCount != null){
                clearSimpleVault();
            } else {
                updateSimpleVaultFileName();
            }
        },
        error: function (err) {
            showAlert(getErrorMessage(err));
        }
    });
};

function getSelectedUploadFile(files) {
    const selectedFile = files && files[0];
    if(selectedFile && typeof File !== "undefined" && selectedFile instanceof File){
        return selectedFile;
    }

    if(selectedFile && selectedFile.file && typeof File !== "undefined" && selectedFile.file instanceof File){
        return selectedFile.file;
    }

    const fileInput = document.querySelector(".uploadPopupContent .dhx_simplevault__input");
    if(fileInput && fileInput.files && fileInput.files.length > 0){
        return fileInput.files[0];
    }

    return null;
}

function initSimpleVaultFileNameSync() {
    requestAnimationFrame(function() {
        updateSimpleVaultFileName();

        const simpleVault = document.querySelector(".contentToolArea .dhx_simplevault");
        if(!simpleVault){
            return;
        }

        const simpleVaultLabel = document.querySelector(".contentToolArea .dhx_simplevault__label, .contentToolArea .dhx_simplevault-label");

        if(simpleVaultLabel && !simpleVaultLabel.querySelector(".simplevault-clear-button")){
            const clearButton = document.createElement("button");
            clearButton.type = "button";
            clearButton.className = "simplevault-clear-button";
            clearButton.textContent = "삭제";
            clearButton.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                clearSimpleVault();
            });
            simpleVaultLabel.appendChild(clearButton);
        }

        if(!simpleVault.querySelector(".simplevault-find-button")){
            const findButton = document.createElement("button");
            findButton.type = "button";
            findButton.className = "simplevault-find-button";
            findButton.textContent = "파일찾기";
            findButton.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();

                const label = document.querySelector(".contentToolArea .dhx_simplevault__label, .contentToolArea .dhx_simplevault-label");
                if(label){
                    label.click();
                }
            });
            simpleVault.appendChild(findButton);
        }

        const observer = new MutationObserver(function() {
            updateSimpleVaultFileName();
        });

        observer.observe(simpleVault, {
            childList: true,
            subtree: true,
            characterData: true
        });
    });
}

function updateSimpleVaultFileName() {
    const label = document.querySelector(".contentToolArea .dhx_simplevault__label, .contentToolArea .dhx_simplevault-label");
    if(!label || !uploadPopupForm){
        return;
    }

    const values = uploadPopupForm.getValue();
    const files = values.simplevault || [];
    const hasFile = files.length > 0 && files[0].file;
    const displayFileName = hasFile ? files[0].file.name : "첨부파일";
    const simpleVault = document.querySelector(".contentToolArea .dhx_simplevault");

    label.setAttribute("data-file-name", displayFileName);
    if(simpleVault){
        simpleVault.classList.toggle("has-file", !!hasFile);
    }
}

function clearSimpleVault() {
    try {
        if(!uploadPopupForm){
            return;
        }

        const simpleVault = uploadPopupForm.getItem("simplevault");
        if(simpleVault && typeof simpleVault.clear === "function"){
            simpleVault.clear();
        }
        if(simpleVault && simpleVault.data && typeof simpleVault.data.removeAll === "function"){
            simpleVault.data.removeAll();
        }
        uploadPopupForm.setValue({simplevault: []});
    } catch (e) {
        console.log(e);
    }

    updateSimpleVaultFileName();
}

const showUploadResult = (result) => {
    const area = document.getElementById("resultArea");

    // successCount가 없으면 실제 저장 결과가 아니라 중복 업로드 안내 응답으로 판단한다.
    if(result.successCount == null){
        area.innerHTML = `
        <div class="result-panel">
            <div class="result-title">처리 결과</div>
            <div class="result-row"><span>상태</span><strong>확인 필요</strong></div>
            <div class="result-row"><span>파일명</span><strong>${escapeHtml(result.fileName || "-")}</strong></div>
            <div class="result-row"><span>처리 결과</span><strong>${escapeHtml(result.message || "중복 파일입니다.")}</strong></div>
            <div class="result-row"><span>남은 시간</span><strong>${result.ttlSeconds || 0}초</strong></div>
        </div>
        `;
        return;
    }

    // 실패 건수가 0이면 전체 성공 메시지만 간단히 보여준다.
    if(result.failCount == 0 ){
        area.innerHTML = `
        <div class="result-panel">
            <div class="result-title">처리 결과</div>
            <div class="result-row"><span>상태</span><strong>전체 성공</strong></div>
            <div class="result-row"><span>파일명</span><strong>${escapeHtml(result.fileName || "-")}</strong></div>
            <div class="result-row"><span>성공 건수</span><strong>${result.successCount}건</strong></div>
            <div class="result-row"><span>실패 건수</span><strong>${result.failCount}건</strong></div>
        </div>
        `;
        return;
    }

    // 실패 목록은 서버에서 내려온 라인별 실패 정보를 HTML로 안전하게 변환해 표시한다.
    const failListHTML = (result.failList || []).map(fail => `<li>${escapeHtml(fail)}</li>`).join("");

    area.innerHTML = `
        <div class="result-panel">
            <div class="result-title">처리 결과</div>
            <div class="result-row"><span>상태</span><strong>일부 실패</strong></div>
            <div class="result-row"><span>파일명</span><strong>${escapeHtml(result.fileName || "-")}</strong></div>
            <div class="result-row"><span>성공 건수</span><strong>${result.successCount}건</strong></div>
            <div class="result-row"><span>실패 건수</span><strong>${result.failCount}건</strong></div>
            <div class="fail-list">
                <p>실패한 라인</p>
                <ul>${failListHTML}</ul>
            </div>
        </div>
        `;
};

const loadFile = () => {
    $.ajax({
        type: "GET",
        url: "/users",
        success: function(users){
            renderUsers(users);
        },
        error:function(err){
            dhx.alert({
                header: getErrorMessage(err),
                buttonsAlignment: "center",
                buttons: ["ok"]
            });
        }
    });
};

const searchFile = () => {
    const values = uploadForm.getValue();
    const field = values.combobox;
    const keyword = (values.keyword || "").trim();

    // 검색 기준과 검색어가 없으면 의미 있는 조회가 불가능하므로 요청 전에 막는다.
    if(!field || !keyword){
        dhx.alert({
            header: "조회 기준과 검색어를 입력하세요.",
            buttonsAlignment: "center",
            buttons: ["ok"],
        });
        return;
    }

    $.ajax({
        type: "GET",
        url: "/users/search",
        data: {
            field: field,
            keyword: keyword
        },
        success: function(users){
            if(users.length === 0){
                renderUsers([]);
                dhx.alert({
                    header: "조회 결과가 없습니다.",
                    buttonsAlignment: "center",
                    buttons: ["ok"]
                });
                return;
            }

            renderUsers(users);
        },
        error:function(err){
            dhx.alert({
                header: getErrorMessage(err),
                buttonsAlignment: "center",
                buttons: ["ok"]
            });
        }
    });
};

const formatRegDate = (regDate) => {
    if(regDate == "" || regDate == null ){
        return "";
    }

    const date = new Date(regDate);

    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');
    const hour = String(date.getHours()).padStart(2,'0');
    const minute = String(date.getMinutes()).padStart(2,'0');

    return `${year}-${month}-${day} ${hour}:${minute}`;
}

const renderUsers = (users) => {
    const gridData = users.map(user => ({
        id: user.id,
        pwd: user.pwd,
        name: user.name,
        level: user.level,
        desc: user.desc||"",
        regDate : formatRegDate(user.regDate)
    }));

    selectedUserIds.clear();
    grid.data.removeAll();
    grid.data.parse(gridData);

    if(gridData.length === 0){
        showEmptyDataResult();
    }

    updateSelectAllCheckbox();
};

const deleteById = () => {
    const ids = Array.from(selectedUserIds);

    if(ids.length === 0){
        dhx.alert({
            header: "삭제할 데이터를 선택하세요.",
            buttons: ["ok"],
            buttonsAlignment: "center"
        });
        return;
    }

    dhx.confirm({
        header: "데이터 삭제",
        text: "데이터를 삭제하시겠습니까?",
        buttons: ["취소", "삭제"],
        buttonsAlignment: "center"
    }).then(function(result){
        if(!result){
            return;
        }

        const deleteRequests = ids.map(id => $.ajax({
            type: "DELETE",
            url: "/users/" + encodeURIComponent(id)
        }));

        Promise.all(deleteRequests)
            .then(function(){
                selectedUserIds.clear();
                loadFile();

                dhx.alert({
                    header: "데이터가 삭제되었습니다.",
                    buttons: ["ok"],
                    buttonsAlignment : "center"
                });
            })
            .catch(function(err){
                dhx.alert({
                    header: getErrorMessage(err),
                    buttons: ["ok"],
                    buttonsAlignment: "center"
                });
            });
    });
};

// 전체 삭제
// 실수로 전체 데이터를 지우는 상황을 줄이기 위해 확인창을 먼저 띄운 뒤 DELETE 요청을 보낸다.
// const deleteAll = () => {
//     dhx.confirm({
//         header: "전체 삭제",
//         text: "전체 고객 데이터를 삭제하시겠습니까?",
//         buttons: ["취소", "삭제"],
//         buttonsAlignment: "center"
//     }).then(function(result) {
//         if (!result) {
//             return;
//         }
//
//         $.ajax({
//             type: "DELETE",
//             url: "/users",
//             contentType: "application/json",
//             success: function() {
//                 selectedUserIds.clear();
//                 dhx.alert({
//                     header: "전체 삭제 완료",
//                     text: "전체 고객 데이터가 삭제되었습니다.",
//                     buttons: ["ok"],
//                     buttons
//                 });
//                 loadFile();
//             },
//             error: function(err) {
//                 dhx.alert({
//                     header: getErrorMessage(err),
//                     buttons: ["ok"]
//                 });
//             }
//         });
//     });
// };

const createGrid =() => {
    contentLayout = new dhx.Layout(null, {
        type: "none",
        height: "100%",
        width: "100%",
        rows:[
            {
                id:"contentTools",
                css: "contentToolArea",
                height: 94
            },
            {
                id:"contentGrid"
            },
            {
                id: "contentPagination",
                height:62
            }
        ]
    });
    layout.getCell("content").attach(contentLayout);

    grid = new dhx.Grid(null, {
        columns: [
            {
                id: "select",
                width: 44,
                htmlEnable: true,
                sortable: false,
                resizable: false,
                header:[{
                    text: `<input type="checkbox" class="grid-select-all-checkbox" aria-label="전체 선택">`,
                    align: "center"
                }],
                template: function(value, row) {
                    const checked = selectedUserIds.has(row.id) ? "checked" : "";
                    return `<input type="checkbox" class="grid-row-checkbox" data-row-id="${escapeHtml(row.id)}" ${checked} aria-label="${escapeHtml(row.id)} 선택">`;
                }
            },
            {id: "id", align: "center", gravity: 1.2, header:[{text:"ID", align: "center"}]},
            {id: "pwd", align: "center", gravity: 1.25, header:[{text: "PWD", align: "center"}]},
            {id: "name", align: "center", gravity: 1.2, header:[{text:"NAME", align: "center"}]},
            {id: "level", align: "center", gravity: 0.8, header:[{text:"LEVEL", align: "center"}]},
            {id: "desc", align: "center", gravity: 2.2, header:[{text:"DESC", align: "center"}]},
            {id: "regDate", align: "center", gravity: 1.45, header:[{text:"REG_DATE", align: "center"}]}
        ],
        height: "100%",
        width: "100%",
        autoWidth: true,
        htmlEnable: true,
        selection: "cell",
        data:[]
    });

    grid.events.on("cellClick", function(row, column, e) {
        if(column.id !== "select"){
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        setRowSelected(row.id, !selectedUserIds.has(row.id));
    });

    grid.events.on("headerCellClick", function(column, rowName, e) {
        if(column.id !== "select"){
            return;
        }
        if(e.target && e.target.classList.contains("grid-select-all-checkbox")){
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        setAllRowsSelected(!isAllRowsSelected());
    });

    contentLayout.getCell("contentGrid").attach(grid);
    bindSelectAllCheckbox();

    pagination = new dhx.Pagination(null, {
        css:"dhx_widget--bordered",
        data:grid.data,
        pageSize:15
    });

    pagination.events.on("change", function() {
        updateSelectAllCheckbox();
    });

    contentLayout.getCell("contentPagination").attach(pagination)


};

function setRowSelected(id, checked) {
    if(checked){
        selectedUserIds.add(id);
    } else {
        selectedUserIds.delete(id);
    }

    const checkbox = document.querySelector(`.grid-row-checkbox[data-row-id="${cssEscape(id)}"]`);
    if(checkbox){
        checkbox.checked = checked;
    }
    updateSelectAllCheckbox();
}

function getCurrentPageRows(){
    const rows = getCurrentGridRows();

    if(!pagination || !pagination.getPage || !pagination.config){
        return rows;
    }

    const pageSize = pagination.config.pageSize || 15;
    const page = pagination.getPage();
    const start = page * pageSize;
    const end = start + pageSize;

    return rows.slice(start, end);

}

function setAllRowsSelected(checked) {
    getCurrentPageRows().forEach(row => {
        if(checked){
            selectedUserIds.add(row.id);
        } else {
            selectedUserIds.delete(row.id);
        }

        if(grid && grid.data && typeof grid.data.update === "function"){
            grid.data.update(row.id, {select: ""});
        }
    });

    document.querySelectorAll(".grid-row-checkbox").forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateSelectAllCheckbox();
}

function getCurrentGridRows() {
    if(!grid || !grid.data || typeof grid.data.serialize !== "function"){
        return [];
    }

    return grid.data.serialize();
}

function isAllRowsSelected() {
    const rows = getCurrentPageRows();
    return rows.length > 0 && rows.every(row => selectedUserIds.has(row.id));
}

function updateSelectAllCheckbox() {
    requestAnimationFrame(function() {
        const headerCheckbox = document.querySelector(".grid-select-all-checkbox");
        if(!headerCheckbox){
            return;
        }
        bindSelectAllCheckbox();

        const rows = getCurrentPageRows();
        const checkedCount = rows.filter(row => selectedUserIds.has(row.id)).length;

        headerCheckbox.checked = rows.length > 0 && checkedCount === rows.length;
        headerCheckbox.indeterminate = checkedCount > 0 && checkedCount < rows.length;
    });
}

function bindSelectAllCheckbox() {
    const headerCheckbox = document.querySelector(".grid-select-all-checkbox");
    if(!headerCheckbox || headerCheckbox.dataset.bound === "true"){
        return;
    }

    headerCheckbox.dataset.bound = "true";
    headerCheckbox.addEventListener("change", function(e) {
        e.preventDefault();
        e.stopPropagation();
        setAllRowsSelected(e.target.checked);
    });
}

function cssEscape(value) {
    if(window.CSS && typeof window.CSS.escape === "function"){
        return window.CSS.escape(value);
    }

    return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function showAlert(message) {
    dhx.alert({
        header: message,
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
}

function getErrorMessage(err) {
    return err?.responseJSON?.message || err?.responseJSON?.error || "요청 처리 중 오류가 발생했습니다.";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showEmptyDataResult() {
    const area = document.getElementById("resultArea");
    area.innerHTML = `
        <div class="result-panel">
            <div class="result-title">조회 결과</div>
            <p class="result-empty">조회된 고객 데이터가 없습니다.</p>
            <p class="result-help">전체 조회 또는 조건 검색으로 고객 데이터를 확인하세요.</p>
        </div>
    `;
}

