var layout;
var loginPlatform;


const init = () => {
    createLayout(); //레이아웃 생성
    form();
}

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
const form = ()=> {
    loginPlatform = new dhx.Form(null, {
        css: "dhx_widget--bg_white dhx_widget--bordered",
        padding: 36,
        width: 420,
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
    loginPlatform.events.on("click", function(name){
        if(name === "signup"){
            signupButton();
        }
    });

    //loginPlatform을 content cell 칸으로 지정한다.
    layout.getCell("content").attach(loginPlatform);
};

const signupButton = () =>{
    const values = loginPlatform.getValue();

    if (!values.id || !values.password || !values.name) {
        noInfo();
        return;
    }

    $.ajax({
        type: "POST",
        url: "/users/signup",
        contentType: "application/json",
        //js나 객체를 JSON으로 변경해서 보냄
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
            signupFail(getErrorMessage(err));
        }
    });
};

function signupSuccess() {
    dhx.alert({
        header: "회원가입 성공",
        text: "로그인해주세요.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

function signupFail(message) {
    dhx.alert({
        header: message,
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

function noInfo() {
    dhx.alert({
        header: "아이디, 비밀번호, 이름을 모두 입력해주세요.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};

function getErrorMessage(err) {
    return err?.responseJSON?.message || err?.responseJSON?.error || "요청 처리 중 오류가 발생했습니다.";
}


