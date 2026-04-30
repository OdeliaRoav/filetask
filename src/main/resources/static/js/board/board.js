
var layout;
var grid;
var uploadForm;

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
                height: "225px",
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
        height: 150,
        padding: 0,
        cols: [
            {
                type: "simpleVault",
                name:"simplevault",
                label: "파일",
                labelWidth: "150px",
                labelHeight: "150px",
                labelPosition: "left",
                disabled: false,
                required: false,
                css:'test',
                style: 'test'
            },
            {
                type: "checkbox",
                name: "force",
                text: "중복 업로드 진행"
            },
            {
                type: "button",
                name: "uploadbtn",
                text: "업로드",
                height: 40,
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
                size: "medium",
                view: "flat",
                color: "primary"
            }
        ]
    });

    uploadForm.events.on("click", function(event) {
        // console.log("clicked");
        // console.log(id);
        // console.log(event);
        if(event === "uploadbtn"){
            console.log("upload");
            uploadFile();
        }
    });

    uploadForm.events.on("click", function(event){
        if(event === "loadbtn"){
            console.log("load");
            loadFile();
        }
    })

    layout.getCell("toolbar").attach(uploadForm);
};
    /*
    uploadForm.events.on("click", () =>{
        const fileInput = document.getElementById("fileInput");
        const file = fileInput.files;
        const formData = new FormData();
        formData.append("file", file);

        const response = axios.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })

    });
    */



// const createUploadForm = () => {
//     uploadForm = new dhx.Form(null, {
//         padding: 0,
//         rows: [
//             {
//                 type: "text",
//                 inputType: "file",
//                 name: "file",
//                 label: "파일 업로드",
//                 width: "50px",
//                 id: "file"
//             },
//             {
//                 label: '업로드',
//                 type: "button",
//                 text: "업로드",
//                 name: "upload",
//                 id: "upload",
//             }
//         ]
//     });
//
//     uploadForm.events.on("click", function(id,event) {
//         console.log("clicked");
//         console.log(id);
//         console.log(event);
//         if(event == "upload"){
//
//             uploadFile();
//         }
//     });
//
//     layout.getCell("toolbar").attach(uploadForm);
//
//     /*
//     uploadForm.events.on("click", () =>{
//         const fileInput = document.getElementById("fileInput");
//         const file = fileInput.files;
//         const formData = new FormData();
//         formData.append("file", file);
//
//         const response = axios.post('/upload', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             }
//         })
//
//     });
//     */
//
// };


const uploadFile =() =>{
    const formData = new FormData();
    console.log("함수 내부 console", formData);
    const values = uploadForm.getValue();
    const files = values.simplevault;

    console.log(files);

    if(!files || files.length === 0){
        uploadFail();
        return;
    }


    //files[0].file이 존재하면 사용, 없으면 files[0] 사용
    const file = files[0].file || files[0];
    console.log(file);

    if(!file.name.endsWith(".dbfile")){
        wrongFile();
        return;
    }

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
            uploadFail();
        }

    });

};

const showUploadResult = (result) => {
    //document.getElementById() -> 해당하는, 예를 들어 ResultArea니깐 ResultArea가 id인 DOM 요소를 반환함
    const area = document.getElementById("resultArea");

    if(result.successCount == null){
        area.innerHTML = `
        <div id = "result", align = "center">
            <p> ${result.message || "중복 파일"}</p>
            <p> 파일명 : ${result.fileName}</p>
            <p> 남은 시간 : ${result.ttlSeconds}</p>   
        </div>    
        `;
        console.log(result.ttlSeconds);
        return;
    }

    //백틱 사용하면 문자열이랑 변수 사용 가능
    //innerText쓰면 안됨 안에 내용 다 가져와서(코드들) 여기서는 innerHTML이 맞는듯 해당하는 것만 가져오게
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

    //<li> 목록 표시
    //result.failList || [] -> reuslt.failList가 존재하고 배열이면 사용, 형태가 틀릴 경우 [](빈 배열) 사용
    //failList의 각 요소들을 <li>로 받음 즉 "<li>...</li>", "<li>...</li>"
    //.join("") 안쓰면 각 배열에 ','로 구분되서 나옴
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
        },
        error:function(err){
            console.log(err);
            alert("오류가 발생했습니다.");
        }
    });
};


const formatRegDate = (regDate) => {
    if(regDate == "" || regDate == null ){
        return fail;
    }

    const date = new Date(regDate);

    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');
    const hour = String(date.getHours()).padStart(2,'0');
    const minute = String(date.getMinutes()).padStart(2,'0');

    return `${year}년${month}월${day}일 ${hour}시${minute}분`
}

const createGrid =() => {
    grid = new dhx.Grid("grid", {

        columns: [
            {id: "id", align:"center", header:[{text:"ID", align: "center"}]},
            {id: "pwd", align: "center", header:[{text: "PWD", align: "center"}]},
            {id: "name", align: "center", header:[{text:"NAME", align: "center"}]},
            {id: "level", align: "center", header:[{text:"LEVEL", align: "center"}]},
            {id: "desc", align: "center", header:[{text:"DESC", align: "center"}]},
            {id: "regDate", align: "center", header:[{text:"REG_DATE", align: "center"}]}
        ],
        autoWidth: true,


        data:[]
    });

    layout.getCell("content").attach(grid);
}

function uploadFail() {
    dhx.alert({
        header: "파일을 선택하세요.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

function wrongFile() {
    dhx.alert({
        header: ".dbfile만 업로드 가능합니다.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};
