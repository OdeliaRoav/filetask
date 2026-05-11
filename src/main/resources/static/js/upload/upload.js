var layout;
var grid;
var uploadForm;
var contentLayout;
var menuDetail;
var rowId;
var colId;

// 화면 초기화 함수
// upload.jsp의 body onload에서 호출되며, 레이아웃, 업로드 폼, 그리드를 순서대로 생성한다.
const boardManager = () => {
    createLayout(); //레이아웃 생성
    createUploadForm(); //버튼 생성
    createGrid(); //그리드 생성
}

// 전체 화면 레이아웃 생성
// 상단은 업로드/검색/삭제 도구 영역, 왼쪽은 업로드 결과, 오른쪽은 DB 조회 그리드로 나눈다.
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
                        css: "contentGrid",
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

// 업로드, 조회, 검색, 삭제 버튼 폼 생성
// 사용자가 자주 쓰는 기능을 상단에 모아 파일 처리 후 바로 조회/검색/삭제할 수 있게 배치한다.
const createUploadForm = () => {
    uploadForm = new dhx.Form("form", {
        css: "upload_form",
        height: 200,
        padding: 20,
        cols: [
                    {
                        type: "simpleVault",
                        name: "simplevault",
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

    // 버튼 이름에 따라 실행할 기능을 분기한다.
    // DHTMLX Form은 버튼 클릭 시 name 값을 넘겨주므로 한 이벤트에서 여러 버튼을 처리한다.
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

// 파일 업로드 요청 처리
// 선택한 파일을 FormData에 담아 /users/upload로 전송하고, 서버 응답은 결과 영역에 표시한다.
const uploadFile =() =>{
    const formData = new FormData();
    const values = uploadForm.getValue();
    const files = values.simplevault;

    console.log("values : ", values);
    console.log("files : ", files);

    // 파일을 선택하지 않은 경우 서버 요청을 보내지 않고 사용자에게 먼저 알린다.
    if(!files || files.length === 0){
        uploadFail();
        return;
    }


    const file = files[0].file;
    console.log("fileName : " + file.name);

    // 과제 조건상 dbfile 확장자만 허용하므로 프론트에서도 1차 검증한다.
    // 서버에서도 같은 검증을 다시 수행하므로 프론트 검증은 사용자 편의 목적이다.
    if(!file.name.endsWith(".dbfile")){
        wrongFile();
        return;
    }

    formData.append("file", file);

    if(values.force == true){
        formData.append("force", "true");
    }

    // JQuery AJAX 업로드 요청
    // multipart/form-data는 브라우저가 직접 boundary를 만들어야 하므로 processData와 contentType을 false로 둔다.
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
            uploadFail();
        }

    });

};

// 업로드 결과 표시
// 서버가 내려준 successCount, failCount, failList를 기준으로 전체 성공/중복/일부 실패 화면을 만든다.
const showUploadResult = (result) => {
    const area = document.getElementById("resultArea");

    // successCount가 없으면 실제 저장 결과가 아니라 중복 업로드 안내 응답으로 판단한다.
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

    // 실패 건수가 0이면 전체 성공 메시지만 간단히 보여준다.
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

    // 실패 목록은 서버에서 "라인 번호 + 실패 이유 + 원본 텍스트" 형태로 내려온다.
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
            console.log(err);
            dhx.alert({
                header: "오류가 발생했습니다.",
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
    console.log(values);
    const field = values.combobox;
    const keyword = values.keyword;

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
            renderUsers(users);

            // uploadForm.setValue({"keyword" : ""});
        },
        error:function(err){
            console.log(err);
            dhx.alert({
                header: "조회 중 오류가 발생했습니다.",
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
        // 날짜 값이 없을 때 정의되지 않은 fail 변수를 반환하면 렌더링이 중단되므로 빈 값으로 표시한다.
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

    grid.data.removeAll(); //기존 삭제하고
    grid.data.parse(gridData); //API 호출해서 받은 JSON을 gridData로 넣기
};



// ID 기준 삭제
// 입력한 ID를 /users/{id} DELETE 요청으로 보내고, 삭제 후 목록을 다시 조회한다.
const deleteById = () => {
    const values = uploadForm.getValue();
    console.log(values);
    const id = values.deleted;
    console.log(values.deleted);

    // 삭제할 ID가 없으면 서버 요청 없이 사용자에게 입력 필요 메시지를 보여준다.
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
            if(err.status === 404){
                dhx.alert({
                    header:"조회되지 않습니다.",
                    buttons: ["ok"]
                });
                return;
            }
            dhx.alert({
                header:"삭제 중 오류가 발생했습니다.",
                buttons: ["ok"]
            });
        }
    });
};

// 전체 삭제
// 현재 DB에 저장된 사용자 데이터를 모두 지운 뒤, 그리드를 다시 조회해 화면을 최신 상태로 맞춘다.
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
                header: "삭제 중 오류가 발생했습니다.",
                buttons: ["ok"]
            });
        }
    });
};




// 그리드와 셀 편집 메뉴 생성
// 오른쪽 content 영역에 메뉴와 Grid를 붙이고, 선택한 셀의 스타일 변경/값 삭제 기능을 제공한다.
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

    // 메뉴 클릭 처리
    // 현재 선택된 셀의 rowId, colId를 저장해 스타일 변경이나 셀 값 삭제 요청에 사용한다.
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

    // 사용자 테이블 데이터를 보여주는 DHTMLX Grid 생성
    // selection을 cell로 설정해 셀 단위 스타일 변경과 셀 값 삭제 기능을 사용할 수 있게 한다.
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

// dhx.menu 적용 전
// columns: [
//     {id: "id", align:"center", header:[{text:"ID", align: "center"}]},
//     {id: "pwd", align: "center", header:[{text: "PWD", align: "center"}]},
//     {id: "name", align: "center", header:[{text:"NAME", align: "center"}]},
//     {id: "level", align: "center", header:[{text:"LEVEL", align: "center"}]},
//     {id: "desc", align: "center", header:[{text:"DESC", align: "center"}]},
//     {id: "regDate", align: "center", header:[{text:"REG_DATE", align: "center"}]}
// ],


function uploadFail() {
    dhx.alert({
        header: "파일을 선택하세요.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
}

// 잘못된 확장자 안내
// 프론트에서 dbfile이 아닌 파일을 선택했을 때 서버 요청 전에 보여주는 메시지이다.
function wrongFile() {
    dhx.alert({
        header: ".dbfile만 업로드 가능합니다.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
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
    return;
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
            console.log(e);
            if(e.status==400){
                dhx.alert({
                    header: "셀 삭제 실패",
                    buttons:["ok"]
                });
                return;
            }

            dhx.alert({
                header: "셀 삭제 중 오류 발생",
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
