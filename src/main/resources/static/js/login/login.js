
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

const loginButton = () => {
    const values = loginPlatform.getValue();

    if (!values.id || !values.pwd) {
        loginPwdsShow();
        return;
    }

    $.ajax({
        type: "POST",
        url: "/users/login",
        contentType: "application/json",
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

const signupButton = () => {
    location.href = "/signup";
};


function loginPwdsShow() {
    dhx.alert({
        header: "아이디와 비밀번호를 입력해주세요.",
        text: "아이디와 비밀번호를 입력해야 로그인할 수 있습니다.",
        buttonsAlignment: "center",
        buttons: ["ok"],
    });
}


function loginSuccess() {
    dhx.alert({
        header: "로그인 성공",
        buttonsAlignment: "center",
        buttons: ["ok"]
    });
}

function loginFail() {
    dhx.alert({
        header: "로그인 실패",
        buttonsAlignment: "center",
        buttons: ["ok"],
    })
};



