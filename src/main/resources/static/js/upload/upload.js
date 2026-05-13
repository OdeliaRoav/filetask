var layout;
var grid;
var uploadForm;
var contentLayout;
var menuDetail;
var rowId;
var colId;

const boardManager = () => {
    createLayout();
    createUploadForm();
    createGrid();
}

const createLayout = () => {
    layout = new dhx.Layout("layout", {
        type: "line",
        rows: [
            {
                id: "toolbar",
                css: "toolbarArea",
                header: "FileTask",
                collapsable: true,
                height: "250px",
                resizable: true
            },
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

const createUploadForm = () => {
    uploadForm = new dhx.Form(null, {
        css: "upload_form",
        height: 230,
        padding: 12,
        cols:[
            {
                width: "520px",
                css: "toolbar_section upload_section",
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
            },
            {
                width: "430px",
                css: "toolbar_section search_section",
                rows: [
                    {
                        cols: [
                            {
                                type: "combo",
                                name: "combobox",
                                label: "조회 기준",
                                labelPosition: "top",
                                placeholder: "검색 기준",
                                width: "130px",
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
                                type: "input",
                                name: "keyword",
                                label: "검색어",
                                labelPosition: "top",
                                placeholder: "검색어 입력",
                                width: "230px"
                            }
                        ]
                    },
                    {
                        css: "button_row",
                        cols: [
                            {
                                type: "spacer"
                            },
                            {
                                type: "button",
                                name: "select",
                                text: "검색",
                                height: 36,
                                width: 86,
                                size: "medium",
                                view: "flat",
                                color: "primary"
                            },
                            {
                                type: "button",
                                name: "loadbtn",
                                css: "loadbtn",
                                text: "전체 조회",
                                height: 36,
                                width: 108,
                                size: "medium",
                                view: "flat",
                                color: "primary"
                            }
                        ]
                    }
                ]
            },
            {
                width: "340px",
                css: "toolbar_section delete_section",
                rows: [
                    {
                        cols: [
                            {
                                type: "input",
                                name : "deleted",
                                label: "삭제 ID",
                                labelPosition: "top",
                                placeholder: "삭제할 ID 입력",
                                width: "250px"
                            }
                        ]
                    },
                    {
                        css: "button_row",
                        cols: [
                            {
                                type: "spacer"
                            },
                            {
                                type: "button",
                                name: "deleteIdBtn",
                                text: "삭제",
                                height: 36,
                                width: 86,
                                size: "medium",
                                view: "flat",
                                color: "primary"
                            },
                            {
                                type: "button",
                                name: "deleteAllBtn",
                                css: "danger_action",
                                text: "전체 삭제",
                                height: 36,
                                width: 108,
                                size: "medium",
                                view: "flat",
                                color: "primary"
                            }
                        ]
                    }
                ]
            },
            {
                type: "spacer",
                css: "toolbar_spacer"
            }
        ]
    });

    uploadForm.events.on("click", function(name) {
        if(name === "uploadbtn"){
            uploadFile();
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

        if(name === "deleteAllBtn"){
            deleteAll();
        }
    });

    uploadForm.events.on("change", function(name) {
        if(name === "simplevault"){
            updateSimpleVaultFileName();
        }
    });

    layout.getCell("toolbar").attach(uploadForm);
    initSimpleVaultFileNameSync();
};

const uploadFile =() =>{
    const formData = new FormData();
    const values = uploadForm.getValue();
    const files = values.simplevault;

    if(!files || files.length === 0){
        showAlert("파일을 선택하세요.");
        return;
    }

    const file = files[0].file;
    formData.append("file", file);

    if(values.force === true){
        formData.append("force", "true");
    }

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

function initSimpleVaultFileNameSync() {
    requestAnimationFrame(function() {
        updateSimpleVaultFileName();

        const simpleVault = document.querySelector(".toolbarArea .dhx_simplevault");
        if(!simpleVault){
            return;
        }

        const simpleVaultLabel = document.querySelector(".toolbarArea .dhx_simplevault__label, .toolbarArea .dhx_simplevault-label");

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

                const label = document.querySelector(".toolbarArea .dhx_simplevault__label, .toolbarArea .dhx_simplevault-label");
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
    const label = document.querySelector(".toolbarArea .dhx_simplevault__label, .toolbarArea .dhx_simplevault-label");
    if(!label || !uploadForm){
        return;
    }

    const values = uploadForm.getValue();
    const files = values.simplevault || [];
    const hasFile = files.length > 0 && files[0].file;
    const displayFileName = hasFile ? files[0].file.name : "첨부파일";
    const simpleVault = document.querySelector(".toolbarArea .dhx_simplevault");

    label.setAttribute("data-file-name", displayFileName);
    if(simpleVault){
        simpleVault.classList.toggle("has-file", !!hasFile);
    }
}

function clearSimpleVault() {
    try {
        const simpleVault = uploadForm.getItem("simplevault");
        if(simpleVault && typeof simpleVault.clear === "function"){
            simpleVault.clear();
        }
        if(simpleVault && simpleVault.data && typeof simpleVault.data.removeAll === "function"){
            simpleVault.data.removeAll();
        }
        uploadForm.setValue({simplevault: []});
    } catch (e) {
        console.log(e);
    }

    updateSimpleVaultFileName();
}

const showUploadResult = (result) => {
    const area = document.getElementById("resultArea");

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

    return `${year}년${month}월${day}일 ${hour}시${minute}분`
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

    grid.data.removeAll();
    grid.data.parse(gridData);

    if(gridData.length === 0){
        showEmptyDataResult();
    }
};

const deleteById = () => {
    const values = uploadForm.getValue();
    const id = (values.deleted || "").trim();

    if(!id){
        dhx.alert({
            header: "삭제할 ID를 입력하세요",
            buttons: ["ok"],
        });
        return;
    }

    $.ajax({
        type: "DELETE",
        url: "/users/" + id,
        success: function(){
            dhx.alert({
                header: "삭제되었습니다.",
                buttons: ["ok"],
            });
            loadFile();
            uploadForm.setValue({"deleted": ""});
        },
        error: function(err){
            dhx.alert({
                header:getErrorMessage(err),
                buttons: ["ok"]
            });
        }
    });
};

const deleteAll = () => {
    dhx.confirm({
        header: "전체 삭제",
        text: "전체 고객 데이터를 삭제하시겠습니까?",
        buttons: ["취소", "삭제"],
        buttonsAlignment: "center"
    }).then(function(result) {
        if (!result) {
            return;
        }

        $.ajax({
            type: "DELETE",
            url: "/users",
            contentType: "application/json",
            success: function() {
                dhx.alert({
                    header: "전체 삭제 완료",
                    text: "전체 고객 데이터가 삭제되었습니다.",
                    buttons: ["ok"],
                });
                loadFile();
            },
            error: function(err) {
                dhx.alert({
                    header: getErrorMessage(err),
                    buttons: ["ok"]
                });
            }
        });
    });
};

const createGrid =() => {
    contentLayout = new dhx.Layout(null, {
        type: "none",
        height: "100%",
        width: "100%",
        rows:[
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

    grid = new dhx.Grid(null, {
        columns: [
            {id: "id", width: 160, header:[{text:"ID", align: "center"}]},
            {id: "pwd", width: 180, header:[{text: "PWD", align: "center"}]},
            {id: "name", width: 180, header:[{text:"NAME", align: "center"}]},
            {id: "level", width: 120, header:[{text:"LEVEL", align: "center"}]},
            {id: "desc", width: 320, header:[{text:"DESC", align: "center"}]},
            {id: "regDate", width: 220, header:[{text:"REG_DATE", align: "center"}]}
        ],
        height: "100%",
        width: "100%",
        autoWidth: false,
        selection: "cell",
        data:[]
    });

    contentLayout.getCell("contentGrid").attach(grid);
};

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

function clearStyle(){
    grid.removeCellCss(rowId, colId, "cell-bold");
    grid.removeCellCss(rowId, colId, "cell-italic");
    grid.removeCellCss(rowId, colId, "cell-underline");
    grid.removeCellCss(rowId, colId, "cell-align-left");
    grid.removeCellCss(rowId, colId, "cell-align-center");
    grid.removeCellCss(rowId, colId, "cell-align-right");
}

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
