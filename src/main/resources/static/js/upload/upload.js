
var layout;
var grid;
var uploadForm;
var contentLayout;
var menuDetail;
var rowId;
var colId;

const boardManager = () => {
    createLayout(); //레이아웃 생성
    createUploadForm(); //버튼 생성
    createGrid(); //그리드 생성
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
                height: "240px",
                resizable: true
            },
            {
                css: "tabArea",
                cols: [
                    {
                        id: "sidebar",
                        header: "결과",
                        collapsable: true,
                        width: "300px",
                        resizable: true,
                        align: "center"

                    },
                    {
                        id: "content", //그리드 영역으로
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
            <p align = "center">업로드 결과가 없습니다.</p>
        </div>
    `);

};

const createUploadForm = () => {
    uploadForm =new dhx.Form("form", {
        css: "upload_form",
        height: 200,
        padding: 20,
        cols:[
                    {
                        type: "simpleVault",
                        name:"simplevault",
                        label: "파일",
                        labelWidth: "80px",
                        labelHeight: "200px",
                        labelPosition: "left",
                        disabled: false,
                        required: false,
                        $vaultHeight: 150,
                        width: "390px"
                    },
                    {
                        width: "210px",
                        rows: [
                    {
                        type: "checkbox",
                        name: "force",
                        text: "중복 업로드 진행",
                        width: "180px"
                    },
                    {
                        cols: [
                    {
                        type: "button",
                        name: "uploadbtn",
                        text: "업로드",
                        height: 40,
                        width: 70,
                        size: "medium",
                        view: "flat",
                        color: "primary"
                    },
                    {
                        type: "button",
                        name: "loadbtn",
                        css: "loadbtn",
                        text: "조회",
                        height: 40,
                        width: 56,
                        size: "medium",
                        view: "flat",
                        color: "primary"
                    },
                        ]
                    }
                        ]
                    },
                    {
                        width: "430px",
                        rows: [
                            {
                                cols: [
                                    {
                                        type: "combo",
                                        name: "combobox",
                                        placeholder: "검색 기준",
                                        width: "120px",
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
                                        placeholder: "검색어 입력",
                                        width: ""
                                    },
                                    {
                                        type: "button",
                                        name: "select",
                                        text: "검색",
                                        height: 40,
                                        width: 56,
                                        size: "medium",
                                        view: "flat",
                                        color: "primary"
                                    },
                                                ]
                            },
                            {
                                cols: [
                                {
                                    type: "input",
                                    name : "deleted",
                                    placeholder: "삭제할 ID 입력",
                                    width: "120px"
                                },
                                {
                                    type: "button",
                                    name: "deleteIdBtn",
                                    text: "삭제 행",
                                    height: 40,
                                    width: 74,
                                    size: "medium",
                                    view: "flat",
                                    color: "primary"
                                },
                                {
                                    type: "button",
                                    name: "deleteAllBtn",
                                    text: "전체 삭제",
                                    height: 40,
                                    width: 86,
                                    size: "medium",
                                    view: "flat",
                                    color: "primary"
                                },
                                ],
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

    layout.getCell("toolbar").attach(uploadForm);

};

const uploadFile =() =>{
    const formData = new FormData();
    const values = uploadForm.getValue();
    const files = values.simplevault;

    console.log("values : ", values);
    console.log("files : ", files);

    if(!files || files.length === 0){
        uploadFail();
        return;
    }

    const file = files[0].file;
    console.log("fileName : " + file.name);

    formData.append("file", file);

    if(values.force == true){
        formData.append("force", "true");
    }

    //JQuery AJAX
    $.ajax({
        type: "POST",
        url: "/users/upload", //계속 /upload로만 보내서 오류 발생 -> /users/upload로 정정
        data: formData,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function (res) {
            console.log("응답", res);
            console.log("파일명", res.fileName);
            showUploadResult(res);

        },
        error: function (err) {
            console.log(err);
            showAlert(getErrorMessage(err));
        }

    });

};

const showUploadResult = (result) => {
    const area = document.getElementById("resultArea");

    if(result.successCount == null){
        area.innerHTML = `
        <div id = "result", align = "center">
            <p> ${result.message}</p>
            <p> 파일명 : ${result.fileName}</p>
            <p> 남은 시간 : ${result.ttlSeconds}</p>   
        </div>    
        `;
        console.log(result.ttlSeconds);
        return;
    }

    if(result.failCount == 0 ){
        area.innerHTML = `
        <div id = "result", align = "center">
            <p>전체 성공</p>
            <p>파일명 : ${result.fileName}</p>
            <p>${result.successCount}건 입력 성공</p>
        </div>
        `;
        return;
    }

    const failListHTML = (result.failList || []).map(fail => `<li>${fail}</li>`).join("");

    area.innerHTML = `
        <div id = "result" align = "center">
            <p>전체/일부 실패</p>
            <p>파일명 : ${result.fileName}</p>
            <p>성공 : ${result.successCount}, 실패 : ${result.failCount}건</p>
         
            <p>실패한 라인</p>
            <ul>${failListHTML}</ul>
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
            console.log(err);
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
    console.log(values);
    const field = values.combobox;
    const keyword = values.keyword;

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
                dhx.alert({
                    header: "조회 결과가 없습니다.",
                    buttonsAlignment: "center",
                    buttons: ["ok"]
                });
                return;
            }

            renderUsers(users);

            // uploadForm.setValue({"keyword" : ""});
        },
        error:function(err){
            console.log(err);
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

    grid.data.removeAll(); //기존 삭제하고
    grid.data.parse(gridData); //API 호출해서 받은 JSON을 gridData로 넣기

};

const deleteById = () => {
    const values = uploadForm.getValue();
    console.log(values);
    const id = values.deleted;
    console.log(values.deleted);

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
            console.log(err);
            //404로 보내는거 확인
                dhx.alert({
                    header:getErrorMessage(err),
                    buttons: ["ok"]
                });
        }
    });
};


const deleteAll = () => {
    $.ajax({
        type: "DELETE",
        url: "/users",
        contentType: "application/json",
        success: function(){
            dhx.alert({
                header: "전체 삭제",
                buttons: ["ok"],
            });
            loadFile();
        },
        error: function(err){
            console.log(err);
            dhx.alert({
                header: getErrorMessage(err),
                buttons: ["ok"]
            });
        }
    });
};




const createGrid =() => {
    contentLayout = new dhx.Layout(null, {
        type: "none",
        height: 500,
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

    menuDetail.events.on("click", function(id,e){
        const cell = grid.selection.getCell();
        if(!cell){
            dhx.alert({
                header:"셀을 먼저 선택하세요",
                buttons: ["ok"],
            })
            return;
        }
        console.log(id);
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


        //Grid 메소드 addCellCss() -> row, column 지정해서 css적용
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
            {id: "id", header:[{text:"ID", align: "center"}]},
            {id: "pwd", header:[{text: "PWD", align: "center"}]},
            {id: "name", header:[{text:"NAME", align: "center"}]},
            {id: "level", header:[{text:"LEVEL", align: "center"}]},
            {id: "desc", header:[{text:"DESC", align: "center"}]},
            {id: "regDate", header:[{text:"REG_DATE", align: "center"}]}
        ],
        autoWidth: true,
        selection: "cell",
        data:[]
    });

    contentLayout.getCell("contentGrid").attach(grid);
};


function uploadFail(message = "파일을 선택하세요.") {
    showAlert(message);
}

function showAlert(message) {
    dhx.alert({
        header: message,
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
}

//3개나 대비하는 이유는 서버가 꺼져있을 시 서버로 부터 받을 JSON이 없기 때문에 3번째까지 준비한다. (3번째는 서버 꺼졌을 때 응답 용도로)
// "?" -> 값이 없어도 멈추지 않고 undefined로 넘겨준다.
function getErrorMessage(err) {
    return err?.responseJSON?.message || err?.responseJSON?.error || "요청 처리 중 오류가 발생했습니다.";
}

function clearStyle(){
    grid.removeCellCss(rowId, colId, "cell-bold");
    grid.removeCellCss(rowId, colId, "cell-italic");
    grid.removeCellCss(rowId, colId, "cell-underline");
    grid.removeCellCss(rowId, colId, "cell-align-left");
    grid.removeCellCss(rowId, colId, "cell-align-center");
    grid.removeCellCss(rowId, colId, "cell-align-right");
    return;
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
            console.log(e);
            if(e.status==400){
                dhx.alert({
                    header: getErrorMessage(e),
                    buttons:["ok"]
                });
                return;
            }

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
