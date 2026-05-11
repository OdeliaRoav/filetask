
var layout;
var loginPlatform;

// 로그인 화면 초기화
// login.jsp가 로드될 때 호출되며, 화면 레이아웃을 만든 뒤 로그인 폼을 붙인다.
const init = () => {
    createLayout(); //레이아웃 생성
    form();
}

// 로그인 페이지 레이아웃 생성
// 상단에는 제목 영역을 두고, content 영역에는 로그인 폼을 배치한다.
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
                        header: "로그인",
                        resizable: true
                    },
                ]
            },
        ]
    });


}

// 로그인 입력 폼 생성
// 사용자가 입력한 id, pwd 값을 loginButton에서 서버 로그인 요청 데이터로 사용한다.
const form = ()=> {
    loginPlatform = new dhx.Form("form", {
        css: "dhx_widget--bg_white dhx_widget--bordered",
        padding: 40,
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

    // 로그인/회원가입 버튼 클릭 이벤트
    // DHTMLX Form 버튼의 name 값으로 로그인 요청과 회원가입 페이지 이동을 구분한다.
    loginPlatform.events.on("click", function (name) {
        if (name === "loginBtn") {
            loginButton();
        }

        if (name === "signupBtn") {
            signupButton();
        }
    });

    layout.getCell("content").attach(loginPlatform);
};

// 로그인 요청 처리
// 입력값을 검증한 뒤 /users/login으로 JSON 요청을 보내고, 성공하면 업로드 페이지로 이동한다.
const loginButton = () => {
    const values = loginPlatform.getValue();

    // 아이디나 비밀번호가 없으면 서버 요청을 보내지 않고 입력 안내를 먼저 보여준다.
    if (!values.id || !values.pwd) {
        loginPwdsShow();
        return;
    }

    $.ajax({
        type: "POST",
        url: "/users/login",
        contentType: "application/json",
        // JavaScript 객체를 JSON 문자열로 바꿔 Spring @RequestBody가 받을 수 있게 보낸다.
        data: JSON.stringify({
            id: values.id,
            pwd: values.pwd
        }),
        success: function () {
            loginSuccess();
            setTimeout(function(){
                location.href = "/upload";
            }, 1000)
        },
        error: function (err) {
            console.log(err);
            loginFail();
        }
    });
};

// 회원가입 페이지 이동
// 로그인 화면에서 계정이 없는 사용자가 바로 회원가입 화면으로 이동할 때 사용한다.
const signupButton = () => {
    location.href = "/signup";
};


// 로그인 필수값 미입력 안내
// id와 pwd가 모두 있어야 로그인 요청이 의미 있으므로 요청 전에 입력을 요구한다.
function loginPwdsShow() {
    dhx.alert({
        header: "아이디와 비밀번호를 입력해주세요.",
        text: "아이디와 비밀번호를 입력해야 로그인할 수 있습니다.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    });
}


// 로그인 성공 안내
// 서버 인증이 성공했을 때 보여주고, 이후 업로드 페이지로 이동한다.
function loginSuccess() {
    dhx.alert({
        header: "로그인 성공",
        buttonsAlignment: "center",
        buttons: ["ok"]
    });
}

// 로그인 실패 안내
// 아이디 없음, 비밀번호 불일치, 서버 오류 등 로그인 요청이 실패했을 때 보여준다.
function loginFail() {
    dhx.alert({
        header: "로그인 실패",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};



