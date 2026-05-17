var layout;
var signupForm;

// 회원가입 화면 초기화
// signup.jsp 로드 시 레이아웃과 입력 폼을 만들고 content 영역에 연결
const init = () => {
    createLayout();
    form();
}

// 회원가입 페이지 레이아웃 생성
// 로그인 화면과 같은 content 구조를 사용하고 제목만 회원가입으로 구분
const createLayout = () => {
    layout = new dhx.Layout("layout", {
        type: "line",
        rows: [
            {
                id: "content",
                css:"contentGrid",
                header: "회원가입",
                resizable: false
            },
        ]
    });


}

// 회원가입 입력 폼 생성
// 사용자가 입력한 id, password, name 값을 /users/signup 요청 데이터로 사용
const form = ()=> {
    signupForm = new dhx.Form(null, {
        css: "dhx_widget--bg_white",
        padding: 40,
        width: 460,
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
    // DHTMLX Form 버튼의 name 값으로 회원가입 실행 여부를 판단
    signupForm.events.on("click", function(name){
        if(name === "signup"){
            signupButton();
        }
    });

    // 생성한 회원가입 폼을 DHTMLX content cell에 붙여 실제 화면에 표시
    layout.getCell("content").attach(signupForm);
};

// 회원가입 요청 처리
// 입력값을 검증한 뒤 JSON 요청을 보내고, 성공하면 로그인 화면으로 이동
const signupButton = () =>{
    const data = signupForm.getValue();

    // 필수값이 누락된 상태에서는 서버 요청을 보내지 않고 사용자에게 입력을 요구
    if (!data.id || !data.password || !data.name) {
        noInfo();
        return;
    }

    $.ajax({
        type: "POST",
        url: "/users/signup",
        contentType: "application/json",
        // Spring Controller의 @RequestBody SignupRequest가 받을 수 있도록 JSON으로 전송
        data: JSON.stringify({
            id: data.id,
            pwd: data.password,
            name: data.name
        }),
        success: function(){
            signupSuccess();
            setTimeout(function(){
                location.href = "/login";
                },1000)
        },
        error: function(err){
            signupFail(getErrorMessage(err));
        }
    });
};

// 회원가입 성공 안내
// 서버 저장이 끝난 뒤 로그인 페이지로 이동하기 전에 완료 상태를 보여준다.
function signupSuccess() {
    dhx.alert({
        header: "회원가입 성공",
        text: "로그인해주세요.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

// 회원가입 실패 안내
// 중복 아이디처럼 서버가 알려준 실패 이유를 화면에 그대로 전달한다.
function signupFail(message) {
    dhx.alert({
        header: message,
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

// 필수값 미입력 안내
// id, password, name 중 하나라도 비어 있으면 회원가입 요청을 막는다.
function noInfo() {
    dhx.alert({
        header: "아이디, 비밀번호, 이름을 모두 입력해주세요.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

// 서버 예외 응답 메시지 추출
// GlobalExceptionHandler의 message를 우선 사용하고, 없으면 기본 오류 문구로 대체한다.
function getErrorMessage(err) {
    return err?.responseJSON?.message || err?.responseJSON?.error || "요청 처리 중 오류가 발생했습니다.";
}


