
var layout;
var loginForm;

// 로그인 화면 초기화
// login.jsp 로드 시 DHTMLX 레이아웃과 로그인 폼을 만든 뒤 content 영역에 연결
const init = () => {
    createLayout();
    form();
}

// 로그인 페이지 레이아웃 생성
// 실제 입력 UI는 form()에서 만들고, 이 함수는 화면 제목과 content 배치 영역만 담당
const createLayout = () => {
    layout = new dhx.Layout("layout", {
        type: "line",
        rows: [
            {
                id: "content",
                css:"contentGrid",
                header: "로그인",
                resizable: false
            },
        ]
    });


}

// 로그인 입력 폼 생성
// id/pwd 입력값과 버튼 이벤트를 서버 로그인 요청 및 회원가입 화면 이동 흐름에 연결
const form = ()=> {
    loginForm = new dhx.Form(null, {
        css: "dhx_widget--bg_white dhx_widget--bordered",
        padding: 40,
        width: 460,
        rows: [
            {
                type: "input",
                label: "ID",
                placeholder: "ID를 입력해주세요.",
                name: "id"
            },
            {
                type: "input",
                inputType: "password",
                label: "Password",
                placeholder: "********",
                name: "pwd"
            },{
                cols: [
                    {
                        id:"loginBtn",
                        name: "loginBtn",
                        type: "button",
                        text: "로그인",
                        size: "medium",
                        view: "flat",
                        submit: true,
                        color: "primary"
                    },
                    {
                        type: "spacer",
                        width: 24
                    },
                    {
                        id: "signupBtn",
                        name: "signupBtn",
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

    // DHTMLX Form은 클릭된 버튼의 name 값을 넘겨줘서 한 이벤트에서 기능을 전송한다.
    loginForm.events.on("click", function (name) {
        if (name === "loginBtn") {
            loginButton();
        }

        if (name === "signupBtn") {
            signupButton();
        }
    });

    layout.getCell("content").attach(loginForm);
};

const loginButton = () => {
    const data = loginForm.getValue();

    // 필수값이 없으면 서버 요청 전에 사용자에게 입력 누락을 알려 불필요한 API 호출을 막음
    if (!data.id || !data.pwd) {
        loginPwdsShow();
        return;
    }

    $.ajax({
        type: "POST",
        url: "/users/login",
        contentType: "application/json",
        // Spring Controller의 @RequestBody LoginRequest가 받을 수 있도록 JSON 문자열로 전송
        data: JSON.stringify({
            id: data.id,
            pwd: data.pwd
        }),
        success: function () {
            loginSuccess();
            setTimeout(function () {
                location.href = "/upload";
            }, 1000)
        },
        error: function (err) {
            loginFail(getErrorMessage(err));
        }
    });
};

// 회원가입 페이지 이동
const signupButton = () => {
    location.href = "/signup";
};

// 로그인 필수값 미입력 안내
// id와 pwd가 있어야 인증이 가능하기에, 먼저 alert로 값들을 요구한다.
function loginPwdsShow() {
    dhx.alert({
        header: "아이디와 비밀번호를 입력해주세요.",
        text: "아이디와 비밀번호를 입력해야 로그인할 수 있습니다.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    });
}

// 로그인 성공 안내
// 서버 인증이 정상 처리된 뒤 사용자를 업로드 화면으로 이동시키기 전에 짧게 결과를 보여준다.
function loginSuccess() {
    dhx.alert({
        header: "로그인 성공",
        buttonsAlignment: "center",
        buttons: ["ok"]
    });
}

// 로그인 실패 안내
// GlobalExceptionHandler가 내려준 실패 메시지를 그대로 보여 사용자에게 원인을 전달
function loginFail(message) {
    dhx.alert({
        header: message,
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

// 서버 예외 응답 메시지 추출
// 공통 예외 응답의 message를 우선 사용하고, 응답 형식이 다를 경우 기본 문구로 대체
function getErrorMessage(err) {
    return err?.responseJSON?.message || err?.responseJSON?.error || "요청 처리 중 오류가 발생했습니다.";
}



