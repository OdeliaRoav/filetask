var layout;
var grid;
var uploadForm;
var popupForm;
var mainLayout;
var pagination;
var checkedIds = new Set();


// 업로드 화면 초기화
// upload.jsp 로드 시 레이아웃, Grid, 검색/업로드 도구, 초기 데이터를 순서대로 준비
const boardManager = () => {
    createLayout();
    createGrid();
    createUploadForm();
    loadFile();
}

// 전체 화면 레이아웃 생성
// 왼쪽은 업로드/조회 결과, 오른쪽은 도구 영역과 사용자 데이터 Grid로 나눈다.
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
                <p class="result-help">파일 업로드 후 결과가 표시됩니다.</p>
            </div>
        </div>
    `);
};

// 업로드, 검색, 초기화, 삭제 도구 폼 생성
// Grid를 보면서 바로 조작할 수 있도록 상단 도구 영역에 주요 액션을 한 줄로 배치
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
                        css : "combobox_radius",
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
            // 검색 조건을 지운 뒤 전체 데이터를 다시 불러와 Grid를 기본 상태로 되돌림
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

    mainLayout.getCell("contentTools").attach(uploadForm);
};

// 검색 폼 초기화
// 콤보박스와 검색어 입력값을 모두 비워, 다음 검색을 할 수 있게 세팅
function resetSearchForm() {
    // id, name, level, desc
    const combo = uploadForm.getItem("combobox");
    if(combo && typeof combo.clear === "function"){
        combo.clear();
    }

    uploadForm.setValue({
        keyword: ""
    });
}

// 파일 선택 팝업 열기
function openUploadPopup() {
    if(document.querySelector(".upload_popup_alert")){
        return;
    }

    const popupBoxId = "popupBox";

    dhx.alert({
        header: "파일 업로드",
        text: `<div class="contentToolArea uploadPopupContent"><div id="${popupBoxId}"></div></div>`,
        htmlEnable: true,
        buttonsAlignment: "center",
        buttons: ["닫기"],
        css: "upload_popup_alert"
    }).then(function() {
        popupForm = null;
        loadFile();
    });

    setTimeout(function() {
        createPopupForm(popupBoxId);
    }, 0);
}

// 팝업 내부 업로드 폼 생성
// 파일 선택, 중복 업로드 체크, 업로드 버튼을 실제 /users/upload 요청 흐름에 연결
function createPopupForm(popupBoxId) {
    const popupBox = document.getElementById(popupBoxId);
    if(!popupBox){
        return;
    }

    popupForm = new dhx.Form(popupBox, {
        css: "upload_popup_form",
        height: 220,
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
                $vaultHeight: 138,
                width: "400px",
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

    popupForm.events.on("click", function(name) {
        if(name === "uploadbtn"){
            uploadFile();
        }
    });

    // simpleVault의 파일 목록이 바뀌면 CSS에서 사용하는 파일명 표시값도 같이 갱신
    popupForm.events.on("change", function(name) {
        if(name === "simplevault"){
            initFileName();
        }
    });

    initFileName();
}

// 파일 업로드 요청 처리
// 선택한 File 객체와 force 값을 FormData에 담아 multipart/form-data로 서버에 전송
const uploadFile =() =>{
    const formData = new FormData();
    if(!popupForm){
        showAlert("파일 업로드 창을 다시 열어주세요.");
        return;
    }

    const data = popupForm.getValue();
    const files = data.simplevault;

    // 파일을 선택하지 않은 경우 서버 요청을 보내지 않고 사용자에게 먼저 알린다.
    if(!files || files.length === 0){
        showAlert("파일을 선택하세요.");
        return;
    }

    const file = getUploadFile(files);
    if(!file){
        showAlert("파일을 다시 선택하세요.");
        return;
    }

    formData.append("file", file, file.name);

    if(data.force === true){
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
                clearFile();
                closeUploadPopup();
            } else {
                showAlert("중복 파일입니다.");
                showFileName();
            }
        },
        error: function (err) {
            showAlert(getErrorMessage(err));
        }
    });
};

// 업로드 팝업 닫기
// 중복 확인 응답은 팝업을 유지하고, 실제 업로드가 끝난 경우에만 alert의 닫기 버튼을 눌러 후처리를 실행한다.
function closeUploadPopup() {
    const closeBtn = document.querySelector(".upload_popup_alert .dhx_alert__footer .dhx_button");
    if(closeBtn){
        closeBtn.click();
    }
}

// simpleVault에서 실제 File 객체 추출
// DHTMLX 값 구조가 달라져도 서버에는 MultipartFile로 받을 수 있는 File만 전달한다.
function getUploadFile(files) {
    const firstFile = files && files[0];
    if(firstFile && typeof File !== "undefined" && firstFile instanceof File){
        return firstFile;
    }

    if(firstFile && firstFile.file && typeof File !== "undefined" && firstFile.file instanceof File){
        return firstFile.file;
    }

    const fileInput = document.querySelector(".uploadPopupContent .dhx_simplevault__input");
    if(fileInput && fileInput.files && fileInput.files.length > 0){
        return fileInput.files[0];
    }

    return null;
}

function initFileName() {
    setTimeout(function () {
        const vault = document.querySelector(".contentToolArea .dhx_simplevault");
        const vaultLabel =
            document.querySelector(".contentToolArea .dhx_simplevault__label, .contentToolArea .dhx_simplevault-label");

        if (!vault || !vaultLabel) {
            return;
        }

        showFileName();

        if (!vaultLabel.querySelector(".simplevault-clear-button")) {
            const clearBtn = document.createElement("button");
            clearBtn.type = "button";
            clearBtn.className = "simplevault-clear-button";
            clearBtn.textContent = "삭제";

            clearBtn.addEventListener("mousedown", function (e) {
                //삭제 가능하게
                e.preventDefault();
                //vault안의 라벨은 건드리지 않게
                e.stopPropagation();
            });

            clearBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                clearFile();
            });

            vaultLabel.appendChild(clearBtn);
        }
    }, 100);
}

// 선택된 파일명 표시 갱신
// CSS의 content: attr(data-file-name)에서 사용할 값을 label 속성에 저장한다.
function showFileName() {
    const label = document.querySelector(".contentToolArea .dhx_simplevault__label, .contentToolArea .dhx_simplevault-label");
    if(!label || !popupForm){
        return;
    }

    const data = popupForm.getValue();
    const files = data.simplevault || [];
    const file = getUploadFile(files);
    const hasFile = !!file;
    const fileName = hasFile ? file.name : "첨부파일";
    const vault = document.querySelector(".contentToolArea .dhx_simplevault");

    label.setAttribute("data-file-name", fileName);
    if(vault){
        vault.classList.toggle("has-file", !!hasFile);
    }
}

// simpleVault 파일 목록 초기화
// 업로드 후 선택된 파일 정보를 비워 다음 업로드를 준비한다.
function clearFile() {
    try {
        if(!popupForm){
            return;
        }

        const vault = popupForm.getItem("simplevault");
        if(vault && typeof vault.clear === "function"){
            vault.clear();
        }
        vault.data.removeAll();
        popupForm.setValue({simplevault: []});

        const fileInput = document.querySelector(".uploadPopupContent .dhx_simplevault__input");
        if(fileInput){
            fileInput.value = "";
        }
    } catch {
    }

    initFileName();
}

// 업로드 결과 표시
// 서버 응답의 중복 여부, 성공/실패 건수, 라인별 실패 목록을 왼쪽 결과 영역에 보여준다.
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

    // 실패 목록은 서버에서 내려온 라인별 실패 정보를 HTML로 변환해 표시한다.
    const failHtml = (result.failList || []).map(fail => `<li>${escapeHtml(fail)}</li>`).join("");
    const uploadStatus = result.successCount == 0 ? "전체 실패" : "일부 실패";

    area.innerHTML = `
        <div class="result-panel">
            <div class="result-title">처리 결과</div>
            <div class="result-row"><span>상태</span><strong>${uploadStatus}</strong></div>
            <div class="result-row"><span>파일명</span><strong>${escapeHtml(result.fileName || "-")}</strong></div>
            <div class="result-row"><span>성공 건수</span><strong>${result.successCount}건</strong></div>
            <div class="result-row"><span>실패 건수</span><strong>${result.failCount}건</strong></div>
            <div class="fail-list">
                <p>실패한 라인</p>
                <ul>${failHtml}</ul>
            </div>
        </div>
        `;
};

// 전체 데이터 조회
// 업로드 성공, 삭제 후 새로고침, 초기 진입 시 서버의 사용자 목록을 Grid에 반영한다.
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

// 조건 검색 조회
// 콤보박스의 field와 입력 keyword를 /users/search로 보내 조건에 맞는 사용자만 표시
const searchFile = () => {
    const values = uploadForm.getValue();
    // id, name, level, desc
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

// 등록일 표시 변환
// 서버의 regDate 값을 Grid에서 yyyy-MM-dd HH:mm 형태로 바꾼다.
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

// Grid 데이터 렌더링
// 서버 JSON 배열을 DHTMLX Grid 데이터 구조로 매핑하고 선택 상태를 초기화
const renderUsers = (users) => {
    const gridData = users.map(user => ({
        id: user.id,
        pwd: user.pwd,
        name: user.name,
        level: user.level,
        desc: user.desc||"",
        regDate : formatRegDate(user.regDate)
    }));

    checkedIds.clear();
    grid.data.removeAll();
    grid.data.parse(gridData);

    if(gridData.length === 0){
        showEmptyDataResult();
    }

    updateSelectAllCheckbox();
};

// 선택 사용자 삭제
// Grid 체크박스로 선택한 ID 목록을 삭제 요청으로 보내고, 완료 후 목록을 다시 조회
const deleteById = () => {
    const ids = Array.from(checkedIds);

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
        //userId 공백일 경우를 위해, encodeURIComponent
        const deleteList = ids.map(id =>
            $.ajax({
            type: "DELETE",
            url: "/users/" + encodeURIComponent(id)
        }));

        Promise.all(deleteList)
            .then(function(){
                checkedIds.clear();
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

// Grid 생성
const createGrid =() => {
    mainLayout = new dhx.Layout(null, {
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
    layout.getCell("content").attach(mainLayout);

    grid = new dhx.Grid(null, {
        columns: [
            {
                id: "select",
                width: 44,
                htmlEnable: true,
                sortable: false,
                resizable: false,
                header:[{
                    text: `<input type="checkbox" class="grid-select-all-checkbox">`,
                    align: "center"
                }],
                template: function(value, row) {
                    const checked = checkedIds.has(row.id) ? "checked" : "";
                    return `<input type="checkbox" class="grid-row-checkbox" data-row-id="${escapeHtml(row.id)}" ${checked}>`;
                }
            },
            {id: "id", align: "center", gravity: 1.0, header:[{text:"ID", align: "center"}]},
            {id: "pwd", align: "center", gravity: 1.0, header:[{text: "PWD", align: "center"}]},
            {id: "name", align: "center", gravity: 1.0, header:[{text:"NAME", align: "center"}]},
            {id: "level", align: "center", gravity: 0.5, header:[{text:"LEVEL", align: "center"}]},
            {id: "desc", align: "center", gravity: 2.5, header:[{text:"DESC", align: "center"}]},
            {id: "regDate", align: "center", gravity: 1.5, header:[{text:"REG_DATE", align: "center"}]}
        ],
        height: "100%",
        width: "100%",
        autoWidth: true,
        htmlEnable: true,
        selection: "cell",
        data:[]
    });

    //특정 행 체크박스 선택
    grid.events.on("cellClick", function(row, column, e) {
        if(column.id !== "select"){
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        setRowSelected(row.id, !checkedIds.has(row.id));
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

    mainLayout.getCell("contentGrid").attach(grid);
    bindSelectAllCheckbox();

    pagination = new dhx.Pagination(null, {
        css:"dhx_widget--bordered",
        data:grid.data,
        pageSize:15
    });

    pagination.events.on("change", function() {
        updateSelectAllCheckbox();
    });

    mainLayout.getCell("contentPagination").attach(pagination)


};

// Grid row 선택 상태 변경
// 선택 Set을 갱신한 뒤 현재 화면 checkbox와 header checkbox 상태를 맞춘다.
function setRowSelected(id, checked) {
    if(checked){
        checkedIds.add(id);
    } else {
        checkedIds.delete(id);
    }

    const checkbox = document.querySelector(`.grid-row-checkbox[data-row-id="${cssEscape(id)}"]`);
    if(checkbox){
        checkbox.checked = checked;
    }
    updateSelectAllCheckbox();
}

// 현재 페이지 row 목록 조회
// pagination이 있는 경우 현재 페이지 범위만 계산해 header 전체 선택 기준으로 사용한다.
function getCurrentPageRows(){
    const rows = getCurrentGridRows();

    if(!pagination){
        return rows;
    }

    const pageSize = pagination.config.pageSize || 15;
    //pagination 현재 페이지 숫자를 가져온다.
    const page = pagination.getPage();
    //ex) page = 0, pageSize = 15 -> 0;
    const start = page * pageSize;
    //ex) page = 0, pageSize= 15 ->15
    const end = start + pageSize;

    // 0 ~ 14까지 가져온다.
    return rows.slice(start, end);

}

// 현재 페이지 전체 선택/해제
// 보이는 row 기준으로만 선택 상태를 바꾸고 Grid checkbox 화면을 다시 렌더링한다.
function setAllRowsSelected(checked) {
    getCurrentPageRows().forEach(row => {
        if(checked){
            checkedIds.add(row.id);
        } else {
            checkedIds.delete(row.id);
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

// 현재 Grid 데이터 전체 조회
// DHTMLX DataCollection serialize 결과를 기준으로 선택 상태와 빈 결과 처리를 판단한다.
function getCurrentGridRows() {
    if(!grid || !grid.data || typeof grid.data.serialize !== "function"){
        return [];
    }

    return grid.data.serialize();
}

// 현재 페이지의 모든 row가 선택됐는지 확인
// header checkbox의 checked/indeterminate 상태를 계산할 때 사용한다.
function isAllRowsSelected() {
    const rows = getCurrentPageRows();
    return rows.length > 0 && rows.every(row => checkedIds.has(row.id));
}

// header 전체 선택 checkbox 상태 갱신
// 일부만 선택된 경우 indeterminate 상태로 표시해 선택 범위를 명확히 보여준다.
function updateSelectAllCheckbox() {
    setTimeout(function() {
        const allCheckBox = document.querySelector(".grid-select-all-checkbox");
        if(!allCheckBox){
            return;
        }
        bindSelectAllCheckbox();

        const rows = getCurrentPageRows();
        const checkedCnt = rows.filter(row => checkedIds.has(row.id)).length;

        allCheckBox.checked = rows.length > 0 && checkedCnt === rows.length;
        allCheckBox.indeterminate = checkedCnt > 0 && checkedCnt < rows.length;
    }, 0);
}

// header checkbox 이벤트 바인딩
function bindSelectAllCheckbox() {
    const allCheckBox = document.querySelector(".grid-select-all-checkbox");
    if(!allCheckBox || allCheckBox.dataset.bound === "true"){
        return;
    }

    allCheckBox.dataset.bound = "true";
    allCheckBox.addEventListener("change", function(e) {
        e.preventDefault();
        e.stopPropagation();
        setAllRowsSelected(e.target.checked);
    });
}

// CSS selector에 사용할 row id 변환
function cssEscape(value) {
    if(window.CSS && typeof window.CSS.escape === "function"){
        return window.CSS.escape(value);
    }

    return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

// 공통 알림창
// 단순 안내 메시지를 같은 버튼 구성으로 표시한다.
function showAlert(message) {
    dhx.alert({
        header: message,
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
}

// 서버 예외 응답 메시지 추출
// GlobalExceptionHandler의 message를 우선 사용하고, 없으면 기본 문구로 대체한다.
function getErrorMessage(err) {
    return err?.responseJSON?.message || err?.responseJSON?.error || "요청 처리 중 오류가 발생했습니다.";
}

// HTML 이스케이프
// 파일명이나 실패 라인을 innerHTML에 넣기 전에 변환해 결과 영역 구조가 깨지지 않게 한다.
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// 빈 조회 결과 표시
// Grid만 비우면 사용자가 조회 완료 여부를 알기 어려워 왼쪽 결과 영역에도 안내를 남긴다.
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
