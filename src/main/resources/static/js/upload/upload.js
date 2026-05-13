var layout;
var grid;
var uploadForm;
var uploadPopupForm;
var contentLayout;
var menuDetail;
var rowId;
var colId;
var selectedUserIds = new Set();

// 업로드 화면 초기화 함수
// upload.jsp의 body onload에서 호출되며, 레이아웃, 그리드 영역, 업로드 폼을 순서대로 생성한다.
const boardManager = () => {
    createLayout();
    createGrid();
    createUploadForm();
}

// 전체 화면 레이아웃 생성
// 왼쪽은 처리 결과, 오른쪽은 기능 영역과 DB 조회 그리드로 나눈다.
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
                        header: "User 테이블 전체 등록 데이터",
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

// 업로드, 조회, 검색, 삭제 버튼 폼 생성
// Grid 위에는 파일 업로드 팝업 호출, 검색, 삭제 기능만 배치해 목록을 보면서 바로 조작할 수 있게 한다.
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
                        text: "파일 업로드",
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
                        text: "전체 조회",
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

    // 버튼 이름에 따라 실행할 기능을 분기한다.
    // DHTMLX Form은 버튼 클릭 시 name 값을 넘겨주므로 한 이벤트에서 여러 버튼을 처리한다.
    uploadForm.events.on("click", function(name) {
        if(name === "openUploadPopup"){
            openUploadPopup();
        }

        if(name === "loadbtn"){
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

// 파일 선택 팝업 열기
// simpleVault는 dhx.alert 내부에 별도 폼으로 생성해 Grid 위 기능 영역을 좁게 유지한다.
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

// 팝업 내부 업로드 폼 생성
// 파일 선택, 중복 업로드 체크, 실제 업로드 버튼을 기존 업로드 요청 흐름에 연결한다.
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

    // simpleVault의 파일 목록이 바뀌면 CSS에서 사용할 파일명 표시값도 같이 갱신한다.
    uploadPopupForm.events.on("change", function(name) {
        if(name === "simplevault"){
            updateSimpleVaultFileName();
        }
    });

    initSimpleVaultFileNameSync();
}

// 파일 업로드 요청 처리
// 선택한 파일을 FormData에 담아 /users/upload로 전송하고, 서버 응답은 결과 영역에 표시한다.
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

// simpleVault에서 실제 File 객체 추출
// DHTMLX 내부 값 구조가 달라져도 서버에는 반드시 MultipartFile로 받을 수 있는 File 객체만 전송한다.
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

// simpleVault 기본 UI에 파일명 표시, 삭제 버튼, 파일찾기 버튼을 붙인다.
// DHTMLX가 내부 DOM을 다시 그릴 수 있으므로 MutationObserver로 파일명 표시를 계속 맞춘다.
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

// 선택된 파일명을 label의 data-file-name에 저장한다.
// 실제 화면 문구는 CSS의 content: attr(data-file-name)에서 사용한다.
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

// 업로드 완료 또는 사용자가 삭제 버튼을 눌렀을 때 simpleVault 파일 목록을 비운다.
// DHTMLX 버전에 따라 clear/data.removeAll 지원이 달라서 가능한 메서드를 순서대로 시도한다.
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

// 업로드 결과 표시
// 서버가 내려준 successCount, failCount, failList를 기준으로 중복/전체 성공/일부 실패 화면을 만든다.
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

// 전체 데이터 조회
// 업로드 성공 후 조회 버튼이나 삭제 후 새로고침 용도로 사용하며, 서버의 JSON 응답을 그리드에 반영한다.
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

// 검색 조회
// 콤보박스에서 선택한 검색 기준과 입력한 검색어를 서버로 보내 조건에 맞는 사용자 목록만 조회한다.
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

// 등록일 표시 형식 변환
// 서버에서 받은 regDate 값을 그리드에서 보기 쉬운 문자열로 변환한다.
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

    return `${year}년${month}월${day}일 ${hour}시${minute}분`
}

// 그리드 데이터 렌더링
// 서버 JSON 배열을 DHTMLX Grid가 읽을 수 있는 형태로 매핑한 뒤 기존 데이터를 지우고 다시 넣는다.
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

// 선택 사용자 삭제
// Grid 왼쪽 체크박스로 선택한 ID 목록을 삭제하고, 삭제 후 목록을 다시 조회한다.
const deleteById = () => {
    const ids = Array.from(selectedUserIds);

    if(ids.length === 0){
        dhx.alert({
            header: "삭제할 데이터를 선택하세요",
            buttons: ["ok"],
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
                    buttons: ["ok"]
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

// 그리드와 셀 편집 메뉴 생성
// 오른쪽 content 영역에 기능 폼, 메뉴, Grid를 붙이고 선택한 셀의 스타일 변경/값 삭제 기능을 제공한다.
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
                id:"contentMenu",
                height: 37
            },
            {
                id:"contentGrid"
            }
        ]
    });
    layout.getCell("content").attach(contentLayout);

    menuDetail = new dhx.Menu(null, {
        css:"content_menu dhx_widget--bordered",
        data: dataset
    });

    // 메뉴 클릭 처리
    // 현재 선택된 셀의 rowId, colId를 저장해 스타일 변경이나 셀 값 삭제 요청에 사용한다.
    menuDetail.events.on("click", function(id){
        const cell = grid.selection.getCell();
        if(!cell){
            dhx.alert({
                header:"셀을 먼저 선택하세요",
                buttons: ["ok"],
            })
            return;
        }
        rowId = cell.row.id;
        colId = cell.column.id;

        if(colId === "select"){
            dhx.alert({
                header:"선택 컬럼은 셀 편집 대상이 아닙니다.",
                buttons: ["ok"],
            })
            return;
        }

        if(id == "font-weight-bold"){
            grid.addCellCss(rowId, colId, "cell-bold");
        }

        if(id == "font-style-italic"){
            grid.addCellCss(rowId, colId, "cell-italic");
        }

        if(id == "text-decoration-underline"){
            grid.addCellCss(rowId, colId, "cell-underline");
        }

        if(id == "align-left"){
            grid.addCellCss(rowId, colId, "cell-align-left");
        }

        if(id == "align-right"){
            grid.addCellCss(rowId, colId, "cell-align-right");
        }

        if(id == "align-center"){
            grid.addCellCss(rowId, colId, "cell-align-center");
        }

        if (id === "clear-styles") {
            clearStyle();
            dhx.alert({
                header: "셀 스타일 삭제",
                buttons: ["ok"],
            })
        }

        if(id === "clear-value"){
            clearValue();
        }

        if(id === "clear-all"){
            clearValue(function() {
                clearStyle();
            });
        }
    });

    contentLayout.getCell("contentMenu").attach(menuDetail);

    // 사용자 테이블 데이터를 보여주는 DHTMLX Grid 생성
    // selection을 cell로 설정해 셀 단위 스타일 변경과 셀 값 삭제 기능을 사용할 수 있게 한다.
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
            {id: "id", gravity: 1.2, header:[{text:"ID", align: "center"}]},
            {id: "pwd", gravity: 1.25, header:[{text: "PWD", align: "center"}]},
            {id: "name", gravity: 1.2, header:[{text:"NAME", align: "center"}]},
            {id: "level", gravity: 0.8, header:[{text:"LEVEL", align: "center"}]},
            {id: "desc", gravity: 2.2, header:[{text:"DESC", align: "center"}]},
            {id: "regDate", gravity: 1.45, header:[{text:"REG_DATE", align: "center"}]}
        ],
        height: "100%",
        width: "100%",
        autoWidth: true,
        htmlEnable: true,
        selection: "cell",
        data:[]
    });

    // Grid 왼쪽 체크박스 컬럼 클릭 처리
    // row checkbox는 개별 선택, header checkbox는 현재 Grid에 표시된 모든 row 선택에 사용한다.
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

        e.preventDefault();
        e.stopPropagation();

        setAllRowsSelected(!isAllRowsSelected());
    });

    contentLayout.getCell("contentGrid").attach(grid);
};

// Grid row 선택 상태 변경
// 선택 Set을 갱신한 뒤 해당 checkbox와 header checkbox 상태를 화면에 반영한다.
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

// 현재 Grid 데이터 전체 선택/해제
// 조회된 row 기준으로만 선택 상태를 바꾸고 checkbox 화면을 다시 맞춘다.
function setAllRowsSelected(checked) {
    getCurrentGridRows().forEach(row => {
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

// 현재 Grid에 올라온 row 목록 조회
// DHTMLX DataCollection serialize 결과를 기준으로 전체 선택 상태를 판단한다.
function getCurrentGridRows() {
    if(!grid || !grid.data || typeof grid.data.serialize !== "function"){
        return [];
    }

    return grid.data.serialize();
}

// 현재 표시 row가 모두 선택됐는지 확인
// header checkbox의 checked/indeterminate 상태를 계산할 때 사용한다.
function isAllRowsSelected() {
    const rows = getCurrentGridRows();
    return rows.length > 0 && rows.every(row => selectedUserIds.has(row.id));
}

// header 전체 선택 checkbox 상태 갱신
// 일부만 선택된 경우 indeterminate 상태로 보여준다.
function updateSelectAllCheckbox() {
    requestAnimationFrame(function() {
        const headerCheckbox = document.querySelector(".grid-select-all-checkbox");
        if(!headerCheckbox){
            return;
        }

        const rows = getCurrentGridRows();
        const checkedCount = rows.filter(row => selectedUserIds.has(row.id)).length;

        headerCheckbox.checked = rows.length > 0 && checkedCount === rows.length;
        headerCheckbox.indeterminate = checkedCount > 0 && checkedCount < rows.length;
    });
}

// CSS selector에 안전하게 사용할 row id 변환
// CSS.escape 지원이 없는 브라우저에서도 최소한의 특수문자 이스케이프를 수행한다.
function cssEscape(value) {
    if(window.CSS && typeof window.CSS.escape === "function"){
        return window.CSS.escape(value);
    }

    return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

// 공통 알림창
// 단순 안내 메시지는 같은 버튼 구성으로 표시한다.
function showAlert(message) {
    dhx.alert({
        header: message,
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
}

// 서버 예외 응답 메시지 추출
// GlobalExceptionHandler가 내려준 JSON이 있으면 message를 사용하고, 없으면 기본 문구를 사용한다.
function getErrorMessage(err) {
    return err?.responseJSON?.message || err?.responseJSON?.error || "요청 처리 중 오류가 발생했습니다.";
}

// 서버에서 받은 문자열을 결과 영역 HTML에 넣기 전에 이스케이프한다.
// 파일명이나 실패 라인에 HTML 문자가 들어와도 화면 구조가 깨지지 않게 하기 위한 처리이다.
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// 조회 결과가 비어 있을 때 왼쪽 결과 영역에 안내 문구를 표시한다.
// 단순히 그리드만 비우면 사용자가 조회가 끝났는지 알기 어려워 별도 메시지를 둔다.
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

// 선택한 셀의 스타일 제거
// bold, italic, underline, align 관련 CSS 클래스를 모두 제거해 기본 표시로 되돌린다.
function clearStyle(){
    grid.removeCellCss(rowId, colId, "cell-bold");
    grid.removeCellCss(rowId, colId, "cell-italic");
    grid.removeCellCss(rowId, colId, "cell-underline");
    grid.removeCellCss(rowId, colId, "cell-align-left");
    grid.removeCellCss(rowId, colId, "cell-align-center");
    grid.removeCellCss(rowId, colId, "cell-align-right");
}

// 선택한 셀 값 삭제
// 서버에는 rowId와 colId를 보내 DB 값을 비우고, 성공하면 그리드를 다시 조회한다.
function clearValue(onSuccess){
    $.ajax({
        type: "DELETE",
        url: "/users/cell",
        data: {
            rowId: rowId,
            colId: colId
        },
        success: function(){
            loadFile();
            if(onSuccess){
                onSuccess();
            }
            dhx.alert({
                header: "셀 삭제 성공",
                buttons:["ok"]
            })
        },
        error: function(e){
            dhx.alert({
                header: getErrorMessage(e),
                buttons:["ok"]
            })
        }
    })
}

// DHTMLX Menu 데이터
// 메뉴 항목 id는 클릭 이벤트에서 스타일 변경, 값 삭제, 전체 초기화 기능을 구분하는 기준으로 사용한다.
const dataset = [{
    "id": "edit",
    "value": "Edit",
    "hotKey": "ctrl-z",
    "count": 25,
    "countColor": "success",
    "items": [{
            "id": "clear",
            "value": "Clear",
            "icon": "dxi dxi-eraser",
            "items": [{
                "id": "clear-value",
                "value": "Clear value"
            },
                {
                    "id": "clear-styles",
                    "value": "Clear styles"
                },
                {
                    "id": "clear-all",
                    "value": "Clear all"
                }
            ]
        }
    ]},
    {
        "type": "separator"
    },
    {
        "id": "configuration",
        "value": "Format",
        "items": [{
            "id": "font-weight-bold",
            "value": "Bold",
            "icon": "dxi dxi-format-bold"
        },
            {
                "id": "font-style-italic",
                "value": "Italic",
                "icon": "dxi dxi-format-italic"
            },
            {
                "id": "text-decoration-underline",
                "value": "Underline",
                "icon": "dxi dxi-format-underline"
            },
            {
                "type": "separator"
            },
            {
                "id": "align",
                "value": "Align",
                "icon": "dxi dxi-empty",
                "items": [{
                    "id": "align-left",
                    "value": "Left",
                    "icon": "dxi dxi-format-align-left"
                },
                    {
                        "id": "align-center",
                        "value": "Center",
                        "icon": "dxi dxi-format-align-center"
                    },
                    {
                        "id": "align-right",
                        "value": "Right",
                        "icon": "dxi dxi-format-align-right"
                    }
                ]
            }
        ]
    }
];
