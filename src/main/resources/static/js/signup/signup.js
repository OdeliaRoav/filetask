
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
                        header: "회원가입",
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
                label: "id",
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
            console.log("signup");
            signupButton();
        }
    });

    layout.getCell("content").attach(loginPlatform);
};

const signupButton = () =>{
    const values = loginPlatform.getValue();

    if (!values.id || !values.password || !values.name) {
        alert("아이디, 비밀번호, 이름을 모두 입력해주세요.");
        return;
    }

    $.ajax({
        type: "POST",
        url: "/users/signup",
        contentType: "application/json",
        data: JSON.stringify({
            id: values.id,
            pwd: values.password,
            name: values.name
        }),
        success: function(){
            alert("회원가입 성공");
            location.href = "/login";
        },
        error: function(err){
            console.log(err);
            alert(err.responseText || "회원가입 실패");
        }
    });
};

