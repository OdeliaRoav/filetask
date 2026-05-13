var layout;
var loginPlatform;

// 회원가입 화면 초기화
// signup.jsp가 로드될 때 호출되며, 레이아웃을 만든 뒤 회원가입 폼을 content 영역에 붙인다.
const init = () => {
    createLayout(); //레이아웃 생성
    form();
}

// 회원가입 페이지 레이아웃 생성
// 로그인 화면과 같은 구조를 사용하고, content 영역 제목만 회원가입으로 표시한다.
const createLayout = () => {
    layout = new dhx.Layout("layout", {
        type: "line",
        rows: [
            {
                id: "toolbar",
                css: "toolbarArea",
                header: "FileTask",
                collapsable: true,
                height: "60px",
                resizable: true
            },
            {
                css: "tabArea",
                cols: [
                    {
                        id: "sidebar",
                        collapsable: true,
                        width: "300px",
                        resizable: true,
                        align: "center"

                    },
                    {
                        id: "content", //그리드 영역으로
                        css:"contentGrid",
                        header: "회원가입",
                        resizable: true
                    },
                ]
            },
        ]
    });


}

// 회원가입 입력 폼 생성
// 사용자가 입력한 id, password, name 값을 signupButton에서 서버 요청 데이터로 사용한다.
const form = ()=> {
    loginPlatform = new dhx.Form("form", {
        css: "dhx_widget--bg_white dhx_widget--bordered",
        padding: 40,
        rows: [
            {
                type: "input",
                label: "Id",
                placeholder: "ID를 입력해주세요.",
                name: "id"
            },
            {
                type: "input",
                inputType: "password",
                label: "Password",
                placeholder: "********",
                name: "password"
            },
            {
                type: "input",
                inputType: "name",
                label: "name",
                placeholder: "이름을 입력해주세요.",
                name: "name"
            },{
                cols: [
                    {
                        id: "signup",
                        name: "signup",
                        type: "button",
                        text: "회원가입",
                        size: "medium",
                        view: "flat",
                        submit: true,
                        color: "primary"
                    }
                ]
            }
        ]
    });
    // 회원가입 버튼 클릭 이벤트
    // DHTMLX Form 버튼의 name 값으로 어떤 버튼이 눌렸는지 확인한다.
    loginPlatform.events.on("click", function(name){
        if(name === "signup"){
            console.log("signup");
            signupButton();
        }
    });

    //loginPlatform을 content cell 칸으로 지정한다.
    layout.getCell("content").attach(loginPlatform);
};

// 회원가입 요청 처리
// 입력값을 검증한 뒤 /users/signup으로 JSON 요청을 보내고, 성공하면 로그인 페이지로 이동한다.
const signupButton = () =>{
    const values = loginPlatform.getValue();

    // 필수 입력값이 없으면 서버 요청을 보내지 않고 사용자에게 먼저 안내한다.
    if (!values.id || !values.password || !values.name) {
        noInfo();
        return;
    }

    $.ajax({
        type: "POST",
        url: "/users/signup",
        contentType: "application/json",
        // JavaScript 객체를 JSON 문자열로 바꿔 Spring @RequestBody가 받을 수 있게 보낸다.
        data: JSON.stringify({
            id: values.id,
            pwd: values.password,
            name: values.name
        }),
        success: function(){
            signupSuccess();
            setTimeout(function(){
                location.href = "/login";
                },1000)
        },
        error: function(err){
            console.log(err);
            signupFail(getErrorMessage(err));
        }
    });
};

// 회원가입 성공 안내
// 서버 저장이 성공했을 때 보여주고, 이후 로그인 페이지로 이동한다.
function signupSuccess() {
    dhx.alert({
        header: "회원가입 성공",
        text: "로그인해주세요.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

// 회원가입 실패 안내
// 중복 아이디처럼 서버가 알려준 실패 이유가 있으면 그 메시지를 그대로 보여준다.
function signupFail(message) {
    dhx.alert({
        header: message,
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

// 필수값 미입력 안내
// id, password, name 중 하나라도 없으면 회원가입 요청을 막고 입력을 요구한다.
function noInfo() {
    dhx.alert({
        header: "아이디, 비밀번호, 이름을 모두 입력해주세요.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

// 서버 예외 응답 메시지 추출
// GlobalExceptionHandler의 message를 우선 사용하고, 응답 형식이 다르면 기본 문구를 사용한다.
function getErrorMessage(err) {
    return err?.responseJSON?.message || err?.responseJSON?.error || "요청 처리 중 오류가 발생했습니다.";
}


